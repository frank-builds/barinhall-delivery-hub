/**
 * Sprint D4 — transparent, rule-based lead scoring.
 *
 * Score is a derived 0–100 number computed from explicit rules below. NOT
 * stored in the DB — recomputed on every render so tuning the rules requires
 * only a code change, no migration.
 *
 * Rules are intentionally simple and auditable. Edit the constants below to
 * adjust weighting; the test plan covers visual verification through the
 * seeded demo data.
 *
 * Buckets and tiers
 * -----------------
 * Source (max 40)        : referral 40, partner 35, inbound 30, event 25,
 *                          outbound 15, other 10, unknown 5
 * Manual fit (max 30)    : hot 30, warm 15, cold 0
 * Company size (max 20)  : enterprise 20, mid-market 15, smb 10, startup 5
 * Data completeness (15) : +5 each for email, company, industry
 *
 * Total is capped at 100. Tier:
 *   ≥ 70 → 'hot'
 *   40–69 → 'warm'
 *   < 40 → 'cold'
 */

const SOURCE_WEIGHTS = {
  referral: 40,
  partner:  35,
  inbound:  30,
  event:    25,
  outbound: 15,
  other:    10,
};

const FIT_WEIGHTS = {
  hot:  30,
  warm: 15,
  cold: 0,
};

const COMPANY_SIZE_WEIGHTS = {
  enterprise:   20,
  'mid-market': 15,
  smb:          10,
  startup:      5,
};

/**
 * Returns a 0–100 score for the lead.
 * @param {object} lead
 * @returns {number}
 */
export function computeLeadScore(lead) {
  if (!lead) return 0;

  let score = 0;

  // Source quality
  score += SOURCE_WEIGHTS[lead.source] ?? 5;

  // Manual fit rating
  score += FIT_WEIGHTS[lead.fitRating] ?? 0;

  // Company size signal
  score += COMPANY_SIZE_WEIGHTS[lead.companySize] ?? 0;

  // Data completeness
  if (lead.email    && String(lead.email).trim())    score += 5;
  if (lead.company  && String(lead.company).trim())  score += 5;
  if (lead.industry && String(lead.industry).trim()) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Maps a numeric score to a tier label.
 * @param {number} score
 * @returns {'hot' | 'warm' | 'cold'}
 */
export function tierForScore(score) {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}

/** Tone for the existing Badge component */
export function tierBadgeTone(tier) {
  switch (tier) {
    case 'hot':  return 'success';
    case 'warm': return 'warning';
    case 'cold':
    default:     return 'muted';
  }
}

/**
 * Convenience: returns { score, tier } in one call. Used by the score badge
 * and the LeadDetail breakdown panel.
 */
export function scoreLead(lead) {
  const score = computeLeadScore(lead);
  return { score, tier: tierForScore(score) };
}

/**
 * Itemised breakdown for the lead detail page so users understand WHY a lead
 * is hot/warm/cold. Returns an array of { label, points }.
 */
export function scoreBreakdown(lead) {
  if (!lead) return [];

  const items = [];

  items.push({
    label: `Source: ${lead.source ?? '—'}`,
    points: SOURCE_WEIGHTS[lead.source] ?? 5,
  });

  if (lead.fitRating) {
    items.push({
      label: `Fit rating: ${lead.fitRating}`,
      points: FIT_WEIGHTS[lead.fitRating] ?? 0,
    });
  }

  if (lead.companySize) {
    items.push({
      label: `Company size: ${lead.companySize}`,
      points: COMPANY_SIZE_WEIGHTS[lead.companySize] ?? 0,
    });
  }

  const dataPts =
    (lead.email    && String(lead.email).trim()    ? 5 : 0) +
    (lead.company  && String(lead.company).trim()  ? 5 : 0) +
    (lead.industry && String(lead.industry).trim() ? 5 : 0);
  if (dataPts > 0) {
    items.push({ label: 'Data completeness', points: dataPts });
  }

  return items;
}
