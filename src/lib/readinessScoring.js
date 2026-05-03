/**
 * Scoring utilities for the AI Readiness Assessment.
 * Pure functions — no side effects, no framework imports.
 * Used by FormPage (live derived displays) and outputGenerators (document generation).
 */

// ── Category definitions ──────────────────────────────────────────────────────

export const SCORING_CATEGORIES = [
  {
    key: 'dataAvailability',
    label: 'Data Availability',
    subKeys: ['da_capture', 'da_access', 'da_history'],
    description: 'Evaluates whether the required data is captured digitally, accessible, and has sufficient history.',
  },
  {
    key: 'dataQuality',
    label: 'Data Quality',
    subKeys: ['dq_consistency', 'dq_completeness', 'dq_freshness'],
    description: 'Evaluates the reliability, completeness, and timeliness of available data.',
  },
  {
    key: 'technicalInfrastructure',
    label: 'Technical Infrastructure',
    subKeys: ['ti_cloud', 'ti_api', 'ti_it'],
    description: 'Evaluates cloud readiness, system integration capability, and internal IT capacity.',
  },
  {
    key: 'teamAdoptionReadiness',
    label: 'Team Adoption Readiness',
    subKeys: ['ta_leadership', 'ta_staff', 'ta_change'],
    description: 'Evaluates executive sponsorship, staff openness, and change management capability.',
  },
  {
    key: 'processMaturity',
    label: 'Business Process Maturity',
    subKeys: ['pm_documented', 'pm_consistent', 'pm_measured'],
    description: 'Evaluates whether target processes are documented, consistently executed, and measured.',
  },
  {
    key: 'businessValuePotential',
    label: 'Business Value Potential',
    subKeys: ['bv_urgency', 'bv_scale', 'bv_roi'],
    description: 'Evaluates the urgency, breadth of impact, and clarity of the ROI case.',
  },
  {
    key: 'riskGovernance',
    label: 'Risk & Governance Readiness',
    subKeys: ['rg_compliance', 'rg_privacy', 'rg_oversight'],
    description: 'Evaluates compliance barriers, data governance posture, and AI oversight capability.',
  },
];

// ── Use case evaluation criteria ──────────────────────────────────────────────

export const USE_CASE_CRITERIA = [
  { key: 'impact',       label: 'Business Impact Potential' },
  { key: 'dataReady',    label: 'Data & Process Readiness'  },
  { key: 'timeToValue',  label: 'Time to Value'             },
  { key: 'feasibility',  label: 'Technical Feasibility'     },
  { key: 'adoptionEase', label: 'Adoption Ease'             },
];

/**
 * Weights for use case prioritization scoring.
 * Must sum to 1.0. Impact and feasibility carry the most decision weight;
 * adoption ease is the softest signal.
 * When only a subset of criteria are answered, weights are renormalized
 * to the answered set so partial scores remain meaningful.
 */
export const USE_CASE_WEIGHTS = {
  impact:       0.30,
  feasibility:  0.25,
  dataReady:    0.20,
  timeToValue:  0.15,
  adoptionEase: 0.10,
};

// ── Score bands ───────────────────────────────────────────────────────────────

export const SCORE_BANDS = [
  { min: 4.0, label: 'Strong',   summary: 'Well positioned for AI adoption in this dimension.'                  },
  { min: 3.5, label: 'Good',     summary: 'Established foundation with manageable gaps.'                        },
  { min: 3.0, label: 'Moderate', summary: 'Developing capability; targeted improvements recommended.'           },
  { min: 2.0, label: 'Low',      summary: 'Significant gaps present; foundational work needed before AI.'       },
  { min: 1.0, label: 'Very Low', summary: 'Critical gap; this dimension must be addressed as a prerequisite.'   },
];

// ── Core helpers ──────────────────────────────────────────────────────────────

/**
 * Extracts the integer score (1–5) from an option label like "3 – Partially / developing".
 * Returns null if the string cannot be parsed or is out of range.
 */
export function parseScore(optionValue) {
  if (!optionValue) return null;
  const n = parseInt(optionValue, 10);
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : null;
}

/**
 * Computes the average score for a set of sub-question keys.
 * Denominator = number of answered questions (not total), so partial forms
 * show accurate per-answered-question averages.
 * Returns { score: string | null, answeredCount, totalCount }.
 */
export function computeCategoryScore(formData, subKeys) {
  const scores = subKeys
    .map(k => parseScore(formData?.[k]))
    .filter(n => n !== null);

  if (scores.length === 0) {
    return { score: null, answeredCount: 0, totalCount: subKeys.length };
  }

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return {
    score: avg.toFixed(1),
    answeredCount: scores.length,
    totalCount: subKeys.length,
  };
}

/**
 * Computes the weighted prioritization score for use case at ucIndex (1 | 2 | 3).
 * Weights are defined in USE_CASE_WEIGHTS. When only a subset of criteria
 * are answered the weights are renormalized to the answered subset, so a
 * partially filled form still shows an accurate per-answered-question average.
 * Returns { score: string | null, answeredCount, totalCount }.
 */
export function computeUseCaseScore(formData, ucIndex) {
  const answered = [];
  let totalWeight = 0;

  for (const criterion of USE_CASE_CRITERIA) {
    const key = `uc${ucIndex}_${criterion.key}`;
    const score = parseScore(formData?.[key]);
    if (score !== null) {
      const weight = USE_CASE_WEIGHTS[criterion.key] ?? 0;
      answered.push({ score, weight });
      totalWeight += weight;
    }
  }

  if (answered.length === 0) {
    return { score: null, answeredCount: 0, totalCount: USE_CASE_CRITERIA.length };
  }

  const weightedSum = answered.reduce(
    (sum, { score, weight }) => sum + score * (weight / totalWeight),
    0
  );

  return {
    score: weightedSum.toFixed(1),
    answeredCount: answered.length,
    totalCount: USE_CASE_CRITERIA.length,
  };
}

/**
 * Computes the overall composite readiness score across all 7 categories.
 * Each category score is first computed (answered-only average); then those
 * category scores are averaged together.
 * Returns { score: string | null, scoredCategories, totalCategories }.
 */
export function computeOverallScore(formData) {
  const catScores = SCORING_CATEGORIES
    .map(cat => computeCategoryScore(formData, cat.subKeys).score)
    .filter(s => s !== null)
    .map(s => parseFloat(s));

  if (catScores.length === 0) {
    return { score: null, scoredCategories: 0, totalCategories: SCORING_CATEGORIES.length };
  }

  const avg = catScores.reduce((a, b) => a + b, 0) / catScores.length;
  return {
    score: avg.toFixed(1),
    scoredCategories: catScores.length,
    totalCategories: SCORING_CATEGORIES.length,
  };
}

/**
 * Returns the score band object for a numeric score string (e.g. "3.4").
 * Returns null if the score cannot be parsed.
 */
export function getScoreBand(scoreStr) {
  const n = parseFloat(scoreStr);
  if (!Number.isFinite(n)) return null;
  // SCORE_BANDS are ordered highest-first
  for (const band of SCORE_BANDS) {
    if (n >= band.min) return band;
  }
  return SCORE_BANDS[SCORE_BANDS.length - 1];
}

/**
 * Formats a computed category score result as a human-readable label for UI display.
 * e.g. "3.4 / 5.0 — Moderate  (3/3 answered)"
 */
export function formatScoreDisplay(result) {
  if (!result.score) return '';
  const band = getScoreBand(result.score);
  const bandStr = band ? `— ${band.label}` : '';
  return `${result.score} / 5.0 ${bandStr}  (${result.answeredCount}/${result.totalCount} answered)`;
}
