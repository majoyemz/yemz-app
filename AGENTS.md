# AGENTS.md — Yemz Platform Master Context

> This file is the authoritative context document for the Yemz internal platform.
> Claude Code and all AI agents must read this file at the start of every session.
> It defines the project, the architecture, all sub-agents, and all integration specs.
> Do not override any rule in this file without explicit instruction from Majo (CEO).

---

## 1. What We Are Building

**Yemz** is a premium city discovery app — "The city, edited." Users find, create, and share
curated urban experiences. The platform is cinematic, editorial, and aesthetic. Think Monocle
meets Google Maps meets Letterboxd.

This repository contains the **Yemz internal AI platform**: a Next.js web portal where the
5-person human team interacts with a Claude-powered multi-agent system to develop the product,
the business, the brand, and all operations — with full integrations to Google Drive, Slack,
an image generation canvas, and a bug/test tracker.

---

## 2. Tech Stack

| Layer              | Choice                                      |
|--------------------|---------------------------------------------|
| Web portal         | Next.js 14 (App Router)                     |
| Styling            | Tailwind CSS                                |
| Auth               | Clerk                                       |
| AI backbone        | Anthropic API (`claude-sonnet-4-5-20251022`)|
| MCP — Drive        | Google Drive MCP server                     |
| MCP — Slack        | Slack MCP server                            |
| Image generation   | OpenAI DALL-E 3 (via OpenAI API)            |
| Database           | Supabase (PostgreSQL)                       |
| Hosting            | Vercel (auto-deploy from GitHub `main`)     |
| Version control    | GitHub (private repo: `yemz-platform`)      |

---

## 3. Multi-Device Access Rules

- All code lives on GitHub. Always `git pull` before starting any session on a new device.
- Claude Code is installed locally on each device — it reads this file on every session start.
- Never store API keys locally without `.env.local`. The `.env.local` file is in `.gitignore`.
- All secrets live in Vercel environment variables for production and in `.env.local` for dev.
- Required `.env.local` keys (never commit these):

```
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_DRIVE_MCP_TOKEN=
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- When switching devices: `git pull`, copy `.env.local` from secure storage (1Password or
  equivalent), run `npm install`, run `npm run dev`. Claude Code picks up full context
  automatically via this file.

---

## 4. Human Team

| Person   | Role                   | Primary Domains                                       |
|----------|------------------------|-------------------------------------------------------|
| Majo     | CEO + Dev lead         | Product development, bug triage, cross-team support   |
| Nicolás  | Growth & Revenue       | Partner strategy, restaurant/lugar onboarding, deals  |
| Andrea   | Legal                  | Contracts, compliance, IP, T&Cs, privacy              |
| Pati     | Brand & Marketing      | Visual identity, copy, narrative, positioning         |
| Ale      | Industry Expert        | Restaurant operations, app UX insight, field feedback |

---

## 5. Portal Structure

**Single unified dashboard** — all team members see the same layout. No role-specific routing.
Tabs are visible to all. Auth via Clerk (team members only, invite-based).

### Tab Structure

```
/ (Dashboard home)
  Overview: recent agent activity, pending approvals, open bugs
  Quick-action buttons to each agent

/growth        — Growth & Partner Agent
/legal         — Legal Agent
/brand         — Brand & Creative Agent
/industry      — Industry Insights Agent
/dev           — Dev & Product Agent
/canvas        — Image Generation Canvas
/drive         — Google Drive Browser + Agent
/tracker       — Bug & Test Tracker
/approvals     — Approval Queue (all pending items)
/slack         — Slack Activity Log
```

### Layout Component Spec

- Left sidebar: Yemz logo, nav links to all tabs, logged-in user name + avatar
- Main area: tab content — agent chat interface + output panels
- Right panel (collapsible): Drive context panel showing files loaded into current agent session
- Top bar: global search, notification bell (approval count badge), dark mode toggle

---

## 6. Orchestrator — Master Claude Agent

**File:** `lib/agents/orchestrator.ts`

The orchestrator is the root Claude instance. Every user message from the portal hits the
orchestrator first. It decides whether to handle the request itself or route to a sub-agent.

### Orchestrator System Prompt (inject at runtime)

```
You are the central orchestrator for the Yemz internal platform.

ABOUT YEMZ:
Yemz is a premium city discovery app — "The city, edited." Users find, create, and share
curated urban experiences. The platform is cinematic, editorial, and aesthetic. The rating
system uses GEMS (◆), never stars. Gems are rated 0–5, displayed as 4.2, shown as ◆◆◆◆◇.
Gem shape: SVG diamond polygon. Color: coral #E86C52. Never use gold or yellow.

VOCABULARY — STRICTLY ENFORCED:
- Say: gems, item, Restaurante, Lugar, Plan, Experience, Post, Concierge, Miners
- Never say: stars, venue, spot, restaurant (in data context), itinerary, review, AI assistant

THE TEAM:
- Majo: CEO + Dev lead — product decisions, bugs, development
- Nicolás: Growth & Revenue — partner deals, restaurant onboarding
- Andrea: Legal — contracts, compliance, privacy
- Pati: Brand — visual identity, copy, narrative
- Ale: Industry Expert — restaurant ops insights, app feedback

YOUR ROLE:
- Read the user's message carefully
- Decide which sub-agent(s) are needed
- If the task is simple and cross-domain, handle it yourself
- If it requires specialist depth, route to the correct sub-agent with full context
- Always inject relevant Google Drive documents into the sub-agent call before answering
- For tasks requiring external action (sending emails, finalizing contracts, publishing assets),
  send to the approvals queue instead of executing directly
- Respond in a concise, direct, editorial tone — no filler, no corporate language

ROUTING LOGIC:
- Partner deals, revenue, outreach → growth_agent
- Contracts, legal clauses, compliance → legal_agent
- Brand copy, visual direction, marketing → brand_agent
- Restaurant insights, UX from field → industry_agent
- Features, bugs, code, architecture → dev_agent
- Image/design generation → canvas_agent
- Drive search/retrieval → drive_agent
- Bug logging/test status → tracker_agent
- Cross-domain or strategic → handle directly
```

---

## 7. Sub-Agents

Each sub-agent is a Claude instance with a specialized system prompt. All sub-agents share
the base Yemz vocabulary rules and have access to their scoped Drive folder via MCP.

See individual agent files in `lib/agents/` for full system prompts:

- `growth-agent.ts` — Growth & Revenue (Section 7.1)
- `legal-agent.ts` — Legal (Section 7.2)
- `brand-agent.ts` — Brand & Creative (Section 7.3)
- `industry-agent.ts` — Industry Insights (Section 7.4)
- `dev-agent.ts` — Dev & Product (Section 7.5)
- `canvas-agent.ts` — Canvas / Image Generation (Section 7.6)
- `drive-agent.ts` — Google Drive (Section 7.7)
- `tracker-agent.ts` — Bug & Test Tracker (Section 7.8)

---

## 8. Google Drive Integration

**File:** `lib/integrations/drive.ts`

Use the Google Drive MCP server. Configure the MCP URL in environment variables.
The Drive agent and all sub-agents access Drive via MCP tool calls in the Claude API request.

---

## 9. Slack Integration

**File:** `lib/integrations/slack.ts`

Channels used by the platform:

| Channel         | Purpose                                              |
|-----------------|------------------------------------------------------|
| `#agent-log`    | All agent completions with summary + output link     |
| `#approvals`    | Approval requests with approve/reject buttons        |
| `#dev-alerts`   | Bug alerts from Tracker agent (P0s, P1 thresholds)  |
| `#growth`       | Partner outreach approvals and deal updates          |
| `#brand`        | Asset generation completions, campaign approvals     |

---

## 10. Approval Workflows

**Supabase table:** `approvals` (see `supabase/migrations/001_initial_schema.sql`)

**Approval rules by agent:**

| Agent          | Requires approval for                                     |
|----------------|-----------------------------------------------------------|
| Growth bot     | All outreach emails, deal terms, partner communications   |
| Legal bot      | All contract drafts, T&C changes, compliance filings      |
| Brand bot      | Campaign launches, public-facing copy, social content     |
| Canvas agent   | Any asset going into official brand library               |
| Dev bot        | Database schema changes, API breaking changes             |
| Industry bot   | Research published to shared folder                       |

Tasks not requiring approval: internal summaries, code suggestions, analysis, Drive searches.

---

## 11. Bug & Test Tracker

**Supabase tables:** `bugs`, `test_cases` (see `supabase/migrations/001_initial_schema.sql`)

**Portal page:** `/tracker`

---

## 12. Folder & File Conventions

```
yemz-platform/
  app/
    (portal)/          — authenticated portal routes
      dashboard/
      growth/
      legal/
      brand/
      industry/
      dev/
      canvas/
      drive/
      tracker/
      approvals/
      slack/
    api/
      orchestrator/    — main agent API route
      canvas/          — image generation route
      slack/           — webhook handler
      approvals/       — approval CRUD
      tracker/         — bug/test CRUD
  lib/
    agents/
      orchestrator.ts
      router.ts
      growth-agent.ts
      legal-agent.ts
      brand-agent.ts
      industry-agent.ts
      dev-agent.ts
      canvas-agent.ts
      drive-agent.ts
      tracker-agent.ts
      types.ts
      index.ts
    integrations/
      drive.ts
      slack.ts
      tracker.ts
    prompts/
      base-context.ts
      vocabulary.ts
  components/
    portal/
      Sidebar.tsx
      AgentChat.tsx
      DrivePanel.tsx
      ApprovalCard.tsx
      BugCard.tsx
      GemRating.tsx
  supabase/
    migrations/
  AGENTS.md
  .env.local           — never commit
  .env.example          — committed with blank values
```

---

## 13. Development Rules

1. Never use the word "stars" anywhere in the codebase — variables, comments, UI copy.
   Use `gems`, `gemRating`, `gemScore`, `gemCount`. ESLint rule enforces this.
2. The gem SVG polygon path is canonical — do not approximate with a star shape.
3. All agent outputs that perform external actions must go through the approvals queue.
4. Every new feature gets a test case entry in the tracker before the PR is merged.
5. `main` branch is always deployable. Feature work goes in `feature/[name]` branches.
6. Commit messages follow: `[agent|portal|api|db|fix|docs]: short description`
7. This file (AGENTS.md) is updated whenever the agent architecture changes.
   Claude Code should suggest updates to this file when relevant.

---

*Last updated: by Majo. All agents must treat this document as canonical.*
