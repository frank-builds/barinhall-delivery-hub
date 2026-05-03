# Barinhall Delivery Hub — Integration Guide

This directory documents the automation integration contracts, sample payloads, and setup notes for connecting Barinhall Delivery Hub to external automation tools.

All integration assets in Phase 5 are **design-and-assets only** — they document intent, define contracts, and provide importable templates. No live production integrations are wired by default.

---

## Overview

The app produces four automation event types:

| Event | Trigger | n8n Workflow |
|---|---|---|
| `engagement.created` | New engagement created | `n8n/new-engagement-created.json` |
| `engagement.stale` | Daily schedule: active engagements with no activity in 7+ days | `n8n/stale-task-reminder.json` |
| `engagement.output_generated` | Output document generated in Output Center | `n8n/document-export-ready.json` |
| `digest.weekly` | Weekly schedule: Monday 09:00 | `n8n/weekly-founder-summary.json` |

---

## Directory Structure

```
docs/integrations/
  README.md                          ← this file
  contracts/
    engagement-schema.json           ← JSON Schema for the full engagement object
    webhook-events.json              ← Event definitions, trigger conditions, payload shapes
  sample-payloads/
    new-engagement-created.json      ← Example POST body for engagement.created
    stale-task-reminder.json         ← Example payload for engagement.stale
    document-export-ready.json       ← Example payload for engagement.output_generated
    weekly-founder-summary.json      ← Example payload for digest.weekly
n8n/
  new-engagement-created.json        ← Importable n8n workflow
  stale-task-reminder.json           ← Importable n8n workflow
  document-export-ready.json         ← Importable n8n workflow
  weekly-founder-summary.json        ← Importable n8n workflow
src/lib/
  digestGenerator.js                 ← Pure function: generates weekly digest markdown
  reminderGenerator.js               ← Pure functions: stale / risk / missing-form reminders
src/pages/
  DigestPage.jsx                     ← In-app digest preview at /digest
```

---

## Importing n8n Workflows

1. Open your n8n instance
2. Go to **Workflows → Import from file**
3. Select any `.json` file from the `n8n/` directory
4. Configure credentials (see per-workflow setup notes below)
5. Activate the workflow when ready

All workflows import with `active: false` — they will not run until you explicitly activate them.

---

## Workflow Details

### 1. New Engagement Created (`n8n/new-engagement-created.json`)

**Intent:** Notify the team when a new engagement is created.

**Trigger:** HTTP webhook (POST). You wire this by calling the n8n webhook URL from the app's `addEngagement` handler.

**Flow:**
```
Webhook → Format Notification (Code) → Send Slack Message
```

**Setup:**
1. Activate the workflow in n8n and copy the webhook URL
2. In `src/contexts/EngagementsContext.jsx`, add a fire-and-forget `fetch(webhookUrl, { method: 'POST', body: JSON.stringify(payload) })` call inside `addEngagement` after the engagement is created
3. Configure Slack OAuth2 credentials (or swap the Slack node for Email)
4. Set the Slack channel in the Send Slack Message node

**Payload:** See `sample-payloads/new-engagement-created.json`

---

### 2. Stale Task Reminder (`n8n/stale-task-reminder.json`)

**Intent:** Alert the founder when active engagements have had no notes or output activity in 7+ days.

**Trigger:** Scheduled daily at 08:00. n8n fetches all engagements from Supabase via REST API and applies the staleness logic inline.

**Flow:**
```
Schedule Trigger → Fetch Engagements (HTTP Request) → Filter Stale (Code) → Any Reminders? → Send Slack Message
                                                                                             → No-op (skip)
```

**Setup:**
1. In n8n, go to **Settings → Variables** and add:
   - `SUPABASE_URL` — your Supabase project URL (e.g. `https://xxxx.supabase.co`)
   - `SUPABASE_ANON_KEY` — your Supabase anon key
2. Configure Slack OAuth2 credentials on the Send Reminder node
3. Adjust `STALE_DAYS` constant in the Filter Stale Engagements code node if needed (default: 7)
4. Change the Slack channel from `#barinhall-ops` to your preferred channel

**Note on Supabase auth:** The HTTP Request node uses the anon key in the `apikey` and `Authorization` headers. This is the Supabase REST API pattern. Row Level Security applies — the key must match a user with access, or you should use the `service_role` key in a secure n8n environment variable for admin-level access.

**Payload:** See `sample-payloads/stale-task-reminder.json`

---

### 3. Document Export Ready (`n8n/document-export-ready.json`)

**Intent:** Notify when a document is generated in the Output Center.

**Trigger:** HTTP webhook (POST). You wire this in `src/pages/OutputCenter.jsx` inside `handleGenerate()`.

**Flow:**
```
Webhook → Format Notification (Code) → Send Slack Message
```

**Setup:**
1. Activate the workflow and copy the webhook URL
2. In `OutputCenter.jsx`, add a fire-and-forget POST to the webhook URL after `saveOutput()` succeeds
3. Configure Slack credentials and channel

**Payload:** See `sample-payloads/document-export-ready.json`

---

### 4. Weekly Founder Summary (`n8n/weekly-founder-summary.json`)

**Intent:** Deliver a weekly markdown digest of all engagement activity to the founder's email every Monday morning.

**Trigger:** Scheduled every Monday at 09:00.

**Flow:**
```
Schedule Trigger → Fetch Engagements (HTTP) → Generate Digest (Code) → Send Email
```

**Setup:**
1. Add Supabase env vars (see Stale Task Reminder setup)
2. Add to n8n environment variables:
   - `FOUNDER_EMAIL` — recipient email address
   - `SENDER_EMAIL` — from address (must be verified in your SMTP provider)
3. Configure SMTP credentials on the Send Digest Email node
4. The digest logic mirrors `src/lib/digestGenerator.js` exactly

**Payload:** See `sample-payloads/weekly-founder-summary.json`

---

## In-App Digest Preview

Navigate to `/digest` in the app to preview the weekly digest generated from your current live engagement data. The digest uses the same logic as the n8n weekly summary workflow.

The Digest page also surfaces active reminders — stale engagements, open High/Critical risks, and missing required forms — using `src/lib/reminderGenerator.js`.

---

## Engagement Data Contract

The full JSON Schema for the engagement object is at `contracts/engagement-schema.json`. Key points:

- **Storage:** Each engagement is a single JSONB blob in the `engagements` table (`data` column) in Supabase
- **ID:** Client-generated UUID via `crypto.randomUUID()`. Stable across create and update operations
- **Forms:** Flat `{ [formKey]: { [fieldKey]: string } }` structure. Keys are defined in `src/data/formDefinitions.js`
- **Outputs:** Metadata only — `[{ id, documentType, filename, generatedAt }]`. Document content is always regenerated from form data
- **Logs:** `notesLog`, `decisionsLog`, `risksLog` are append-only arrays (no delete in Phase 1–4)

---

## Assumptions

- n8n is self-hosted or cloud-hosted with access to environment variables
- Supabase REST API is accessible from your n8n instance
- Slack/SMTP credentials are managed in n8n's credential store
- Webhook events for `engagement.created` and `engagement.output_generated` require manual wiring in the app source (fire-and-forget fetch calls) — they are not wired by default in Phase 5
- The `SUPABASE_ANON_KEY` has sufficient RLS access to read engagement rows. For production, use the `service_role` key stored as a secret n8n variable, not the anon key

---

## Sample Payloads

All sample payloads are in `sample-payloads/` and use the seeded engagement data (Maria Torres, James Okafor, Sandra Lee) so field names and values match the live app schema exactly.

| File | Event |
|---|---|
| `new-engagement-created.json` | New engagement for Alex Rivera / Southwest Manufacturing Co |
| `stale-task-reminder.json` | Stale reminder for James Okafor (Desert Southwest Dental) — 17 days inactive |
| `document-export-ready.json` | Executive Summary generated for Maria Torres |
| `weekly-founder-summary.json` | Full digest for the week of May 4, 2026 |
