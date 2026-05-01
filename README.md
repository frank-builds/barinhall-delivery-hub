# Barinhall Delivery Hub

Internal client engagement and delivery management tool for Barinhall LLC.

---

## Phase 3 Features (current)

- **Supabase auth** — email/password sign-in and sign-up; session persists across devices
- **Cloud storage** — all engagement data stored in Supabase Postgres (JSONB) with Row Level Security
- **Multi-device access** — any device signed into the same account sees the same data in real time
- **localStorage migration** — one-click banner on Dashboard to migrate existing local data to the cloud
- **Netlify deployment** — `netlify.toml` configured for SPA routing; deploy directly from repo
- **Auto-seed** — new accounts receive the 3 sample engagements on first sign-in (once per account)

## Phase 2B Features

- **Notes log** — per-engagement log of freeform notes with author and date; create and edit
- **Decision log** — per-engagement log of decisions with rationale and owner; create and edit
- **Risk/blocker register** — per-engagement register with severity (Low/Medium/High/Critical), status (Open/Monitoring/Resolved), and owner; create and edit
- **Seeded operational records** — all 3 seed engagements include sample notes, decisions, and risks/blockers

## Phase 2A Features

- **Structured service forms** — each service type has dedicated form groups for all key inputs
- **Form data persistence** — form responses save to the engagement record in localStorage
- **Template status tracking** — each form can be marked Not Started / In Progress / Complete
- **Markdown preview** — generated markdown document from saved form data, with copy button

## Phase 1 Features

- **Dashboard** — active engagements as cards with status badge, service, owner, start date, and workflow progress bar
- **New Engagement Form** — 9-field form with validation
- **Default Workflow Generation** — service type drives auto-generated workflow checklist
- **Engagement Detail** — full record with workflow checklist, forms, and operational logs
- **Template Library** — expandable read-only cards showing all 6 service workflows
- **Local Storage** — all data persists in `localStorage` under key `barinhall_engagements`

---

## Services & Forms

| Service | Forms |
|---|---|
| AI Readiness Assessment | Intake Questionnaire, Scoring Worksheet, Use Case Prioritization |
| AI Strategy & Roadmap Workshop | Stakeholder Alignment, KPI Worksheet, Roadmap Inputs |
| 30-Day AI Pilot | Pilot Charter, Success Metrics, Requirements, Risk Log |
| AI Governance & Risk Review | Governance Questionnaire, Findings, Remediation Items |
| AI Team Training Session | Training Needs Assessment, Participant Notes, Action Plan |
| Managed AI Ops – Monthly | Monthly Review Notes, Issue Log, Optimization Backlog, Recommendation Log |

---

## Prerequisites

- Node.js 18+
- npm 9+
- Supabase project (free tier works)

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run `supabase/schema.sql` to create the `engagements` table and RLS policy
3. Copy your project URL and anon key from **Settings → API**

## Environment Variables

```bash
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

## Install & Run

```bash
npm install
npm run dev
```

App runs at http://localhost:5173

## Build for Production

```bash
npm run build
npm run preview
```

## Deploy to Netlify

1. Push the repo to GitHub
2. Connect the repo in Netlify; build command and publish dir are pre-configured in `netlify.toml`
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in Netlify → Site settings → Environment variables

---

## Data Storage

All data is stored in Supabase Postgres in the `engagements` table as JSONB. Each user's rows are isolated by Row Level Security.

**To reset to seed data:** delete all rows for your user in the Supabase table editor, then clear the `barinhall_seeded_<userId>` key from localStorage, and reload.

**Migrating from localStorage:** if you have local data from Phase 2B, a migration banner will appear on the Dashboard. Click "Migrate now" to copy all local engagements to Supabase and clear the local key.

---

## Routes

| Route | Page |
|---|---|
| `/` | Dashboard |
| `/engagements/new` | New Engagement Form |
| `/engagements/:id` | Engagement Detail |
| `/engagements/:id/forms/:formKey` | Structured Form Entry |
| `/engagements/:id/preview/:formKey` | Markdown Preview |
| `/templates` | Template Library |

---

## Engagement Detail Sections (top to bottom)

1. Header (client name, company, status badge)
2. Field grid (service, owner, start date, status, contact, email)
3. Target Outcome
4. Notes (Phase 1 plain-text field from creation form)
5. Workflow Checklist
6. Forms & Templates
7. Notes Log
8. Decisions Log
9. Risks & Blockers Register

---

## Project Structure

```
supabase/
  schema.sql                 — CREATE TABLE + RLS policy (run once in Supabase SQL Editor)
src/
  lib/
    supabase.js              — Supabase client singleton
    engagementsApi.js        — fetchEngagements / saveEngagement / deleteEngagement
  contexts/
    AuthContext.jsx           — user, loading, signIn, signUp, signOut
    EngagementsContext.jsx    — shared engagement state + all CRUD, backed by Supabase
  data/
    services.js             — service type keys and labels
    workflows.js            — default step definitions per service
    formDefinitions.js      — structured form field definitions for all 6 services
    templateMappings.js     — markdown generators per form key
    seed.js                 — 3 sample engagements with forms, notes, decisions, risks
  hooks/
    useLocalStorage.js        — generic localStorage read/write hook
    useEngagements.js         — all CRUD operations for engagements and sub-records
  components/
    Layout.jsx                — page wrapper with nav
    NavBar.jsx                — top navigation
    EngagementCard.jsx        — dashboard card
    StatusBadge.jsx           — engagement status pill
    TemplateBadge.jsx         — form/template status pill
    WorkflowChecklist.jsx     — interactive step checklist
    ServiceWorkflowCard.jsx   — read-only template card
    FormFieldInput.jsx        — renders text / textarea / select form fields
    NotesLog.jsx              — notes log section with inline create/edit
    DecisionsLog.jsx          — decisions log section with inline create/edit
    RisksLog.jsx              — risks/blockers register with inline create/edit
  pages/
    Dashboard.jsx             — /
    NewEngagement.jsx         — /engagements/new
    EngagementDetail.jsx      — /engagements/:id
    FormPage.jsx              — /engagements/:id/forms/:formKey
    PreviewPage.jsx           — /engagements/:id/preview/:formKey
    Templates.jsx             — /templates
    NotFound.jsx              — *
    LoginPage.jsx             — /login (email/password sign-in + sign-up)
```

---

## Known Limitations

- No delete for notes, decisions, or risks (out of scope per Phase 2B spec)
- No edit of top-level engagement fields after creation
- Navigating away from an unsaved structured form loses in-progress changes
- Notes, decisions, and risks are append-only and sorted by creation order (no reordering)
- Markdown preview renders raw text, not styled HTML
- No search or filter on Dashboard
- No document export or download
