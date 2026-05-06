// engagementProgress — journey-stage progress heuristic for Dashboard cards
// and any other surface that wants a single "where is this engagement?" signal.
//
// Returns a percentage AND a stage label so callers can show a bar plus a
// human-readable phase name. Bands are deliberately wide and the heuristic
// is approximate — the goal is at-a-glance orientation, not precision.
//
// Stage map:
//   0–25%   created          — engagement created, no discovery work yet
//   25–50%  discovery        — at least one form started or completed
//   50–75%  building         — at least one artifact saved or output generated
//   75–100% delivery / done  — deliverables marked ready, or status Completed

import { effectiveStatus } from './statusUtils.js';

const STAGE_LABELS = {
  created:    'Just created',
  discovery:  'Discovery in progress',
  building:   'Building deliverables',
  delivery:   'Ready for review',
  complete:   'Complete',
};

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

export function computeEngagementProgress(engagement) {
  if (!engagement) return { pct: 0, stage: 'created', label: STAGE_LABELS.created };

  const status = effectiveStatus(engagement);

  // ── Stage 4: Complete ────────────────────────────────────────────────────
  if (status === 'Completed') {
    return { pct: 100, stage: 'complete', label: STAGE_LABELS.complete };
  }

  // ── Stage 4: Deliverables ready ──────────────────────────────────────────
  if (engagement.deliverablesReady) {
    return { pct: 88, stage: 'delivery', label: STAGE_LABELS.delivery };
  }

  // ── Stage 3: Building (artifacts saved or outputs generated) ─────────────
  const artifactCount = Object.keys(engagement.artifactData ?? {}).length;
  const outputCount   = (engagement.outputs ?? []).length;
  if (artifactCount > 0 || outputCount > 0) {
    // Scale within 50–75 by how many concrete deliverables have been
    // produced. Cap at 4 contributing items to avoid runaway growth.
    const score = clamp(artifactCount + outputCount, 1, 4);
    const pct   = 50 + Math.round((score / 4) * 25);
    return { pct, stage: 'building', label: STAGE_LABELS.building };
  }

  // ── Stage 2: Discovery (any form started or completed) ───────────────────
  const formStatuses = Object.values(engagement.templateStatuses ?? {});
  const startedForms  = formStatuses.filter(s => s === 'In Progress' || s === 'Complete').length;
  const completeForms = formStatuses.filter(s => s === 'Complete').length;

  if (startedForms > 0) {
    if (formStatuses.length > 0) {
      // Scale within 25–50 by completion ratio across known forms.
      const completeRatio = completeForms / formStatuses.length;
      const pct = 25 + Math.round(completeRatio * 25);
      return { pct, stage: 'discovery', label: STAGE_LABELS.discovery };
    }
    return { pct: 35, stage: 'discovery', label: STAGE_LABELS.discovery };
  }

  // ── Stage 1: Created (workflow steps may have been ticked off) ───────────
  // Cap at 25% even if many workflow steps are done — until forms are
  // started, the engagement is still in setup.
  const wf    = engagement.workflow ?? [];
  const total = wf.length;
  if (total > 0) {
    const done = wf.filter(s => s.done).length;
    const pct  = Math.round((done / total) * 25);
    return { pct, stage: 'created', label: STAGE_LABELS.created };
  }

  return { pct: 0, stage: 'created', label: STAGE_LABELS.created };
}
