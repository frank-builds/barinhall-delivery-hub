/**
 * Sprint D2 — CRM-lite pipeline stage enum.
 *
 * Defined in code now; D3 will wire the kanban board, stage transitions, and
 * (optionally) promote `data->>'stage'` to a typed column with a CHECK
 * constraint. Until then this is the canonical source of truth for stage keys.
 *
 * Stage groups follow the natural pipeline phases so D3 can render them as
 * column groups in a board view if helpful.
 */

export const CRM_STAGES = [
  // ── Top of funnel ──────────────────────────────────────────────────────
  { key: 'inbound',               label: 'Inbound',               group: 'Top of funnel' },
  { key: 'qualified',             label: 'Qualified',             group: 'Top of funnel' },

  // ── Discovery ──────────────────────────────────────────────────────────
  { key: 'discovery_scheduled',   label: 'Discovery scheduled',   group: 'Discovery' },
  { key: 'discovery_completed',   label: 'Discovery completed',   group: 'Discovery' },

  // ── Proposal ───────────────────────────────────────────────────────────
  { key: 'proposal_in_progress',  label: 'Proposal in progress',  group: 'Proposal' },
  { key: 'proposal_sent',         label: 'Proposal sent',         group: 'Proposal' },

  // ── Closing ────────────────────────────────────────────────────────────
  { key: 'negotiation',           label: 'Negotiation',           group: 'Closing' },
  { key: 'closed_won',            label: 'Closed — Won',          group: 'Closing' },
  { key: 'closed_lost',           label: 'Closed — Lost',         group: 'Closing' },
];

/** All stage keys, in the canonical pipeline order */
export const CRM_STAGE_KEYS = CRM_STAGES.map(s => s.key);

/** Default stage assigned to newly created opportunities (and seed data) */
export const DEFAULT_STAGE = 'inbound';

/** Returns true if `stage` is one of the recognised stage keys */
export function isKnownStage(stage) {
  return CRM_STAGE_KEYS.includes(stage);
}

/** Returns the display label for a stage key, or the key itself if unknown */
export function stageLabel(stage) {
  return CRM_STAGES.find(s => s.key === stage)?.label ?? stage ?? '—';
}

/** Returns the group name for a stage key, or '' if unknown */
export function stageGroup(stage) {
  return CRM_STAGES.find(s => s.key === stage)?.group ?? '';
}

/**
 * Tone for use with the existing Badge component.
 * Conservative palette — D3 may re-theme when the kanban board lands.
 */
export function stageBadgeTone(stage) {
  switch (stage) {
    case 'closed_won':            return 'success';
    case 'closed_lost':           return 'neutral';
    case 'negotiation':
    case 'proposal_sent':         return 'warning';
    case 'proposal_in_progress':
    case 'discovery_completed':
    case 'discovery_scheduled':   return 'brand';
    case 'qualified':
    case 'inbound':
    default:                      return 'neutral';
  }
}
