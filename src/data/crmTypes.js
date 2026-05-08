/**
 * Sprint D2 — CRM-lite domain typedefs.
 *
 * The codebase is plain JS, so these are JSDoc only. They document the shape
 * stored in the JSONB `data` column of each table. Repos read/write these
 * shapes directly.
 *
 * IDs are uuid strings created with `crypto.randomUUID()` on the client.
 * Timestamps are ISO 8601 strings.
 *
 * The DB row carries `id`, `user_id`, FK columns, and `created_at` /
 * `updated_at` separately; the `data` column holds the rest of the object.
 */

// ── Account ────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Account
 * @property {string}  id            uuid (matches DB row id)
 * @property {string}  name          Company / account name (required)
 * @property {string=} industry      Free-text industry label
 * @property {string=} website       URL string (no validation in D2)
 * @property {string=} hqLocation    Free-text city / region
 * @property {string=} sizeBand      e.g. "Startup", "SMB", "Mid-market", "Enterprise"
 * @property {string=} notes         Free-text scratchpad (NOT the activity log — that's D3)
 * @property {string}  createdAt     ISO timestamp (set by client on create)
 * @property {string}  updatedAt     ISO timestamp (set by client on every save)
 */

// ── Contact ────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Contact
 * @property {string}  id            uuid (matches DB row id)
 * @property {string}  name          Full name (required)
 * @property {string=} email         Email address (no validation in D2)
 * @property {string=} phone         Free-text phone number
 * @property {string=} title         Job title at the linked account
 * @property {string=} accountId     uuid of linked Account (mirrors DB column for client-side lookups; nullable)
 * @property {string=} notes         Free-text scratchpad
 * @property {string}  createdAt     ISO timestamp
 * @property {string}  updatedAt     ISO timestamp
 */

// ── Opportunity ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Opportunity
 * @property {string}  id                uuid (matches DB row id)
 * @property {string}  name              Deal name / title (required)
 * @property {string}  accountId         uuid of linked Account (REQUIRED — mirrors DB column)
 * @property {string=} primaryContactId  uuid of linked Contact (optional)
 * @property {string}  stage             one of CRM_STAGE_KEYS (defaults to DEFAULT_STAGE on create)
 * @property {number=} expectedValue     USD; integer dollars (no currency formatting in D2)
 * @property {string=} expectedCloseDate ISO date (YYYY-MM-DD) — optional
 * @property {string=} owner             Free-text owner name (D3 may upgrade to user_id)
 * @property {string=} source            Free-text lead source (D3 may promote to typed enum)
 * @property {string=} notes             Free-text scratchpad
 * @property {string}  createdAt         ISO timestamp
 * @property {string}  updatedAt         ISO timestamp
 */

// ── Empty-record factories (used by seed data + future D3 create flows) ────

/** @returns {Account} */
export function emptyAccount(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id:        overrides.id ?? (typeof crypto !== 'undefined' ? crypto.randomUUID() : ''),
    name:      '',
    industry:  '',
    website:   '',
    hqLocation:'',
    sizeBand:  '',
    notes:     '',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/** @returns {Contact} */
export function emptyContact(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id:        overrides.id ?? (typeof crypto !== 'undefined' ? crypto.randomUUID() : ''),
    name:      '',
    email:     '',
    phone:     '',
    title:     '',
    accountId: null,
    notes:     '',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/** @returns {Opportunity} */
export function emptyOpportunity(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id:                overrides.id ?? (typeof crypto !== 'undefined' ? crypto.randomUUID() : ''),
    name:              '',
    accountId:         '',
    primaryContactId:  null,
    stage:             'inbound',
    expectedValue:     null,
    expectedCloseDate: '',
    owner:             '',
    source:            '',
    notes:             '',
    createdAt:         now,
    updatedAt:         now,
    ...overrides,
  };
}

// ── Lead (D4) ──────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Lead
 * @property {string}   id                       uuid
 * @property {string}   name                     person's name (required)
 * @property {string=}  email                    case-insensitive dedup key
 * @property {string=}  company                  free-text company name
 * @property {string=}  title                    job title at the company
 * @property {string=}  phone
 * @property {string}   source                   one of CRM_LEAD_SOURCES (default 'inbound')
 * @property {string}   status                   one of CRM_LEAD_STATUSES (default 'new')
 * @property {string=}  fitRating                'hot' | 'warm' | 'cold' | ''
 * @property {string=}  industry                 free-text
 * @property {string=}  companySize              '' | 'startup' | 'smb' | 'mid-market' | 'enterprise'
 * @property {string[]=} tags                    free-text segmentation
 * @property {string=}  notes                    short summary (separate from notesLog)
 * @property {Array<{id:string, date:string, author:string, content:string}>=} notesLog
 * @property {string|null=} promotedToOpportunityId  reserved for D5; D4 always null
 * @property {string=}  createdBy                user.email at create time
 * @property {string}   createdAt                ISO
 * @property {string}   updatedAt                ISO
 */

/** @returns {Lead} */
export function emptyLead(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id:                      overrides.id ?? (typeof crypto !== 'undefined' ? crypto.randomUUID() : ''),
    name:                    '',
    email:                   '',
    company:                 '',
    title:                   '',
    phone:                   '',
    source:                  'inbound',
    status:                  'new',
    fitRating:               '',
    industry:                '',
    companySize:             '',
    tags:                    [],
    notes:                   '',
    notesLog:                [],
    promotedToOpportunityId: null,
    createdBy:               '',
    createdAt:               now,
    updatedAt:               now,
    ...overrides,
  };
}
