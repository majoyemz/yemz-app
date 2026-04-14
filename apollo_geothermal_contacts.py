"""
Apollo.io Contact Fetcher — Swedish Geothermal Equipment Manufacturers
Reads a list of company names from an Excel file, queries Apollo.io for
up to 5 senior contacts per company, enriches each person, and writes
the results to apollo_contacts_output.xlsx.
"""

import sys
import time
import requests
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

# ── Configuration ─────────────────────────────────────────────────────────────
API_KEY = "AQ-JughbK6q6NAGChDI4OA"

# Update this path if running on Windows; leave as-is to pass via CLI arg.
INPUT_FILE = r"C:\Users\majoo\Downloads\260327_Swedish Geothermal Equipment Manufacturers.xlsx"
OUTPUT_FILE = "apollo_contacts_output.xlsx"

MAX_COMPANIES = 25          # only process the first N companies
MAX_CONTACTS  = 5           # max contacts per company
RATE_DELAY    = 0.6         # seconds between Apollo calls

SEARCH_URL  = "https://api.apollo.io/api/v1/mixed_people/search"
ENRICH_URL  = "https://api.apollo.io/api/v1/people/match"

SENIORITIES = ["c_suite", "vp", "director", "manager"]
TITLES = [
    "CFO", "COO", "CTO", "CEO",
    "VP Finance", "VP Sales", "VP Operations",
    "Director Finance", "Director Sales", "Director Operations",
    "Sales Manager", "Finance Manager", "Operations Manager",
    "Head of Finance", "Head of Sales", "Head of Operations",
]

COLUMNS = [
    "Company", "First Name", "Last Name", "Title",
    "Seniority", "Department", "Email", "LinkedIn URL", "Phone",
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def read_companies(filepath: str) -> list[str]:
    """Return a list of company names from the 'Name' column."""
    wb = openpyxl.load_workbook(filepath, read_only=True, data_only=True)
    ws = wb.active
    headers = [str(c.value).strip() if c.value else "" for c in next(ws.iter_rows(min_row=1, max_row=1))]
    try:
        name_idx = headers.index("Name")
    except ValueError:
        # Case-insensitive fallback
        lower = [h.lower() for h in headers]
        name_idx = lower.index("name")
    companies = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        val = row[name_idx]
        if val and str(val).strip():
            companies.append(str(val).strip())
    wb.close()
    return companies


def search_people(company: str) -> list[dict] | None:
    """Search Apollo for people at *company*. Returns list or None on error."""
    payload = {
        "api_key": API_KEY,
        "q_keywords": company,
        "person_locations": ["Sweden"],
        "person_seniorities": SENIORITIES,
        "person_titles": TITLES,
        "per_page": MAX_CONTACTS,
        "page": 1,
    }
    try:
        r = requests.post(SEARCH_URL, json=payload, timeout=30)
        r.raise_for_status()
        return r.json().get("people", [])
    except requests.HTTPError as e:
        print(f"  HTTP {e.response.status_code} — {e.response.text[:120]}")
        return None
    except Exception as e:
        print(f"  Error: {e}")
        return None


def enrich_person(person_id: str) -> dict:
    """Fetch full details (including email) for one person."""
    payload = {"api_key": API_KEY, "id": person_id}
    try:
        r = requests.post(ENRICH_URL, json=payload, timeout=30)
        r.raise_for_status()
        return r.json().get("person") or {}
    except Exception:
        return {}


def first_phone(person: dict) -> str:
    phones = person.get("phone_numbers") or []
    if phones:
        return phones[0].get("sanitized_number") or phones[0].get("raw_number") or ""
    return ""


def make_contact_row(company: str, raw: dict, enriched: dict) -> dict:
    src = enriched if enriched else raw
    return {
        "Company":      company,
        "First Name":   src.get("first_name") or raw.get("first_name") or "",
        "Last Name":    src.get("last_name")  or raw.get("last_name")  or "",
        "Title":        src.get("title")      or raw.get("title")      or "",
        "Seniority":    src.get("seniority")  or raw.get("seniority")  or "",
        "Department":   src.get("department") or raw.get("department") or "",
        "Email":        src.get("email")      or raw.get("email")      or "",
        "LinkedIn URL": src.get("linkedin_url") or raw.get("linkedin_url") or "",
        "Phone":        first_phone(enriched) or first_phone(raw),
    }


# ── Output ────────────────────────────────────────────────────────────────────

def write_excel(contacts: list[dict], output_path: str) -> None:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Contacts"

    header_font  = Font(bold=True, color="FFFFFF")
    header_fill  = PatternFill(start_color="2E75B6", end_color="2E75B6", fill_type="solid")
    center_align = Alignment(horizontal="center", vertical="center")

    for col_idx, col_name in enumerate(COLUMNS, start=1):
        cell = ws.cell(row=1, column=col_idx, value=col_name)
        cell.font      = header_font
        cell.fill      = header_fill
        cell.alignment = center_align

    for row_idx, contact in enumerate(contacts, start=2):
        for col_idx, col_name in enumerate(COLUMNS, start=1):
            ws.cell(row=row_idx, column=col_idx, value=contact.get(col_name, ""))

    # Auto-fit column widths
    for col_idx, col_name in enumerate(COLUMNS, start=1):
        col_letter = get_column_letter(col_idx)
        max_len = len(col_name)
        for row in ws.iter_rows(min_row=2, min_col=col_idx, max_col=col_idx, values_only=True):
            val = str(row[0]) if row[0] else ""
            max_len = max(max_len, len(val))
        ws.column_dimensions[col_letter].width = min(max_len + 3, 55)

    ws.freeze_panes = "A2"
    wb.save(output_path)


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    input_path = sys.argv[1] if len(sys.argv) > 1 else INPUT_FILE

    print(f"Reading: {input_path}")
    try:
        companies = read_companies(input_path)
    except FileNotFoundError:
        print(f"\nERROR: File not found → {input_path}")
        print("Usage: python apollo_geothermal_contacts.py [path/to/file.xlsx]")
        sys.exit(1)

    total_in_file = len(companies)
    companies = companies[:MAX_COMPANIES]
    print(f"Loaded {total_in_file} companies — processing first {len(companies)}\n")

    all_contacts:        list[dict] = []
    zero_result_cos:     list[str]  = []
    error_cos:           list[str]  = []

    for idx, company in enumerate(companies, start=1):
        print(f"[{idx}/{len(companies)}] {company}", end=" → ", flush=True)

        people = search_people(company)
        time.sleep(RATE_DELAY)

        if people is None:
            error_cos.append(company)
            print("ERROR (skipped)")
            continue

        if not people:
            zero_result_cos.append(company)
            print("0 contacts found")
            continue

        rows = []
        for person in people[:MAX_CONTACTS]:
            pid = person.get("id")
            enriched: dict = {}
            if pid:
                enriched = enrich_person(pid)
                time.sleep(RATE_DELAY)
            rows.append(make_contact_row(company, person, enriched))

        all_contacts.extend(rows)
        print(f"{len(rows)} contact(s) found")

    # Write output even if some companies failed
    write_excel(all_contacts, OUTPUT_FILE)
    print(f"\nSaved → {OUTPUT_FILE}  ({len(all_contacts)} rows)")

    # Summary
    print("\n══ SUMMARY ═════════════════════════════")
    print(f"  Companies searched : {len(companies)}")
    print(f"  Total contacts     : {len(all_contacts)}")
    print(f"  Zero results       : {len(zero_result_cos)}")
    if zero_result_cos:
        for c in zero_result_cos:
            print(f"    • {c}")
    print(f"  Errors (skipped)   : {len(error_cos)}")
    if error_cos:
        for c in error_cos:
            print(f"    • {c}")
    print("═════════════════════════════════════════")


if __name__ == "__main__":
    main()
