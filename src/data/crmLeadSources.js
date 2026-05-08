/**
 * Sprint D4 — CRM-lite lead sources enum.
 *
 * Controlled vocabulary for where leads come from. Drives the scoring model
 * (referrals score higher than cold lists) and the source filter on the
 * leads list.
 */

export const CRM_LEAD_SOURCES = [
  { key: 'inbound',  label: 'Inbound'  },
  { key: 'referral', label: 'Referral' },
  { key: 'partner',  label: 'Partner'  },
  { key: 'event',    label: 'Event'    },
  { key: 'outbound', label: 'Outbound' },
  { key: 'other',    label: 'Other'    },
];

export const CRM_LEAD_SOURCE_KEYS = CRM_LEAD_SOURCES.map(s => s.key);

export const DEFAULT_LEAD_SOURCE = 'inbound';

export function isKnownSource(source) {
  return CRM_LEAD_SOURCE_KEYS.includes(source);
}

export function sourceLabel(source) {
  return CRM_LEAD_SOURCES.find(s => s.key === source)?.label ?? source ?? '—';
}

/**
 * Best-effort coercion from a free-text CSV cell to a canonical source key.
 * Returns 'other' for anything unrecognised so import never fails on source.
 */
export function coerceSource(raw) {
  if (raw == null) return DEFAULT_LEAD_SOURCE;
  const v = String(raw).trim().toLowerCase().replace(/[\s_-]+/g, '');
  for (const s of CRM_LEAD_SOURCES) {
    if (v === s.key.replace(/[\s_-]+/g, '')) return s.key;
    if (v === s.label.toLowerCase().replace(/[\s_-]+/g, '')) return s.key;
  }
  return 'other';
}
