#!/usr/bin/env python3
"""
Clean and prepare the Yemz Bubble export CSV for Supabase import.

Usage:
    python3 clean_export.py <input_file> <output_file>

Example:
    python3 clean_export.py export_All-Items_2026-04-22_01-28-58.csv items_clean.csv

What it fixes:
  - Mojibake encoding  (UTF-8 read as Latin-1 → restored to proper UTF-8)
  - Protocol-relative URLs   (//cdn.bubble.io/... → https://cdn.bubble.io/...)
  - Markdown-wrapped URLs    ([text](url) → plain url)
  - Comma-separated list fields → PostgreSQL text[] literal  {val1,"val two"}
  - 7-value time fields (Mon–Sun)  → same array format
  - Date fields  (12/7/2025 20:51 → 2025-12-07T20:51:00+00:00)
  - Column names → snake_case, ready to match 002_items_table.sql
"""

import csv
import io
import re
import sys
from datetime import datetime


# ── Column name mapping ────────────────────────────────────────────────────────

COLUMN_MAP = {
    "Address":       "address",
    "amenities":     "amenities",
    "category":      "category",
    "closing time":  "closing_time",
    "cost":          "cost",
    "cover_image":   "cover_image",
    "description":   "description",
    "geometry_lat":  "lat",
    "geometry_lng":  "lng",
    "google maps url": "google_maps_url",
    "google_place_id": "google_place_id",
    "image_gallery": "image_gallery",
    "name":          "name",
    "neighborhood":  "neighborhood",
    "opening time":  "opening_time",
    "opening_days":  "opening_days",
    "ot_url":        "ot_url",
    "phone number":  "phone_number",
    "rating":        "rating",
    "review status": "review_status",
    "Tags":          "tags",
    "Type":          "type",
    "website":       "website",
    "Yemz value":    "yemz_value",
    "Creation Date": "created_at",
    "Modified Date": "updated_at",
    "Slug":          "slug",
    "Creator":       "creator",
    "unique id":     "bubble_id",
}

# Columns whose values are comma-separated lists → text[]
ARRAY_COLS = {"amenities", "Tags", "image_gallery", "opening_days"}

# Columns with exactly 7 comma-separated time values (Mon–Sun) → text[]
TIME_ARRAY_COLS = {"closing time", "opening time"}

# Columns whose values are URLs (may be protocol-relative or markdown-wrapped)
URL_COLS = {"cover_image", "website", "google maps url", "google_place_id", "ot_url"}

# Columns whose values are dates in Bubble's m/d/yyyy H:MM format
DATE_COLS = {"Creation Date", "Modified Date"}


# ── Value transformers ─────────────────────────────────────────────────────────

def fix_encoding(text: str) -> str:
    """
    Restore characters garbled by UTF-8-as-Latin-1 double-encoding.
    'Ã©' → 'é', 'Ã³' → 'ó', etc.
    """
    if not text:
        return text
    try:
        return text.encode("latin-1").decode("utf-8")
    except (UnicodeDecodeError, UnicodeEncodeError):
        return text


def fix_url(value: str) -> str:
    """
    1. Strip markdown link wrappers:  [text](url)  or  //[text](url)
    2. Add https: to protocol-relative URLs that start with //
    """
    if not value:
        return value
    v = value.strip()

    # Extract URL from markdown  [label](url)  — the real URL is in parens
    md = re.search(r'\(([^)]+)\)', v)
    if md:
        v = md.group(1).strip()

    if v.startswith("//"):
        v = "https:" + v

    return v


def pg_array(items: list) -> str:
    """
    Build a PostgreSQL text-array literal from a Python list.
    Items that contain spaces, commas, or double-quotes are wrapped in "…".
    """
    parts = []
    for item in items:
        item = item.strip()
        if not item:
            continue
        needs_quotes = any(c in item for c in (' ', ',', '"', '{', '}', '\\'))
        if needs_quotes:
            item = item.replace('\\', '\\\\').replace('"', '\\"')
            parts.append(f'"{item}"')
        else:
            parts.append(item)
    return "{" + ",".join(parts) + "}"


def parse_list(value: str):
    """Comma-separated text → PostgreSQL array literal, or empty string."""
    if not value or not value.strip():
        return ""
    items = [i.strip() for i in value.split(",") if i.strip()]
    return pg_array(items) if items else ""


def parse_time_list(value: str):
    """
    7-value comma-separated time string (Mon–Sun) → PostgreSQL array literal.
    Values like 'Closed' are kept as-is.
    """
    if not value or not value.strip():
        return ""
    items = [i.strip() for i in value.split(",")]
    # Pad or trim to exactly 7
    items = (items + [""] * 7)[:7]
    return pg_array(items)


def parse_date(value: str) -> str:
    """Convert  '12/7/2025 20:51'  →  '2025-12-07T20:51:00+00:00'."""
    if not value or not value.strip():
        return ""
    for fmt in ("%m/%d/%Y %H:%M", "%m/%d/%Y"):
        try:
            dt = datetime.strptime(value.strip(), fmt)
            return dt.strftime("%Y-%m-%dT%H:%M:%S+00:00")
        except ValueError:
            continue
    return value.strip()


# ── Core row cleaner ───────────────────────────────────────────────────────────

def clean_row(row: dict, headers: list) -> dict:
    out = {}
    for orig_col in headers:
        raw = row.get(orig_col, "") or ""
        clean_col = COLUMN_MAP.get(orig_col, orig_col.lower().replace(" ", "_"))

        value = fix_encoding(raw)  # repair any UTF-8-as-Latin-1 mojibake

        if orig_col in URL_COLS:
            value = fix_url(value)
        elif orig_col in ARRAY_COLS:
            value = parse_list(value)
        elif orig_col in TIME_ARRAY_COLS:
            value = parse_time_list(value)
        elif orig_col in DATE_COLS:
            value = parse_date(value)
        else:
            value = value.strip()

        out[clean_col] = value
    return out


# ── File I/O ───────────────────────────────────────────────────────────────────

def load_file(path: str):
    """
    Read entire file as raw bytes, then decode with the right encoding.
    - Try UTF-8 first (strict). If the file is valid UTF-8 (even with BOM),
      mojibake like 'Ã©' is already in the text and fix_encoding() will fix it.
    - If UTF-8 fails, decode as windows-1252 so single-byte accented chars
      like é (0xE9) become real Unicode; fix_encoding() repairs any remaining
      mojibake from there.
    Returns (text, encoding_name).
    """
    with open(path, "rb") as f:
        raw = f.read()
    try:
        text = raw.decode("utf-8-sig")
        return text, "utf-8"
    except UnicodeDecodeError:
        text = raw.decode("windows-1252", errors="replace")
        return text, "windows-1252"


def main(input_path: str, output_path: str):
    text, enc = load_file(input_path)
    print(f"Detected encoding: {enc}")

    # Detect delimiter from the first line
    first_line = text.split("\n")[0]
    delim = "\t" if first_line.count("\t") > first_line.count(",") else ","
    delim_name = "TAB" if delim == "\t" else "COMMA"
    print(f"Detected delimiter: {delim_name}")

    reader = csv.DictReader(io.StringIO(text), delimiter=delim)
    headers = reader.fieldnames or []
    rows = list(reader)

    print(f"Columns found ({len(headers)}): {headers}")
    print(f"Rows found: {len(rows)}")

    clean_headers = [
        COLUMN_MAP.get(h, h.lower().replace(" ", "_"))
        for h in headers
    ]

    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:  # BOM → Excel opens as UTF-8
        writer = csv.DictWriter(f, fieldnames=clean_headers, quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        for row in rows:
            writer.writerow(clean_row(row, headers))

    print(f"✓ Cleaned CSV written to: {output_path}")
    print(f"  {len(rows)} rows  ×  {len(clean_headers)} columns")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(f"Usage: python3 {sys.argv[0]} <input.csv> <output_clean.csv>")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
