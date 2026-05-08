/**
 * Sprint D4 — CRM-lite lead statuses enum.
 *
 * Lifecycle states for a lead. Most leads will move new → qualified → promoted,
 * but disqualified is the terminal state for leads that don't fit. The
 * `promoted` state is reserved for D5's Lead → Opportunity hand-off; D4 never
 * sets it.
 */

export const CRM_LEAD_STATUSES = [
  { key: 'new',          label: 'New'          },
  { key: 'qualified',    label: 'Qualified'    },
  { key: 'disqualified', label: 'Disqualified' },
  { key: 'promoted',     label: 'Promoted'     }, // reserved for D5
];

export const CRM_LEAD_STATUS_KEYS = CRM_LEAD_STATUSES.map(s => s.key);

export const DEFAULT_LEAD_STATUS = 'new';

export function isKnownStatus(status) {
  return CRM_LEAD_STATUS_KEYS.includes(status);
}

export function statusLabel(status) {
  return CRM_LEAD_STATUSES.find(s => s.key === status)?.label ?? status ?? '—';
}

/** Tone for the existing Badge component */
export function statusBadgeTone(status) {
  switch (status) {
    case 'qualified':    return 'success';
    case 'promoted':     return 'brand';
    case 'disqualified': return 'muted';
    case 'new':
    default:             return 'neutral';
  }
}
