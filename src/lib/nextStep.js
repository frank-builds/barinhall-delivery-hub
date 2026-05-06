// nextStep — explicit, ordered rule set for the EngagementDetail "Next step" banner.
//
// Pure function over engagement state. Returns a single recommended action that
// should be the consultant's most useful next move. The rules are intentionally
// explicit and ordered (first-match-wins) so the recommendation is always
// explainable and predictable. No black-box scoring.
//
// Inputs read from engagement:
//   workflow                 — array of { id, label, done }
//   forms                    — { [formKey]: { [field]: value } }
//   templateStatuses         — { [formKey]: 'Not Started' | 'In Progress' | 'Complete' }
//   artifactData             — { [key]: { ... } }
//   outputs                  — array of { documentType, generatedAt, ... }
//   candidateUseCases        — array of use-case IDs from the library
//   deliverablesReady        — boolean (set by OutputCenter)
//   serviceTypes / serviceType — used to look up applicable form definitions
//
// Returns: { tone, message, actionLabel, actionTo } | null
//   tone        — 'info' | 'success' | 'warning' — drives banner colour
//   message     — short sentence, consultant-facing
//   actionLabel — call-to-action text (e.g. "Open Output Center →")
//   actionTo    — react-router destination for <Link to=...>
//   null        — no recommendation (extremely rare; banner hides)

import { getFormDefs } from '../data/formDefinitions.js';
import { effectiveStatus } from './statusUtils.js';

const FORM_NOT_STARTED  = 'Not Started';
const FORM_IN_PROGRESS  = 'In Progress';
const FORM_COMPLETE     = 'Complete';

function getServiceKeys(engagement) {
  return engagement.serviceTypes
    ?? (engagement.serviceType ? [engagement.serviceType] : []);
}

function getApplicableForms(engagement) {
  return getServiceKeys(engagement).flatMap(k => getFormDefs(k));
}

function statusOf(engagement, formKey) {
  return engagement.templateStatuses?.[formKey] ?? FORM_NOT_STARTED;
}

/** Returns true if any artifact has been saved on the engagement. */
function hasAnyArtifact(engagement) {
  const data = engagement.artifactData ?? {};
  return Object.keys(data).length > 0;
}

/** Returns true if any output has been generated (regardless of doc type). */
function hasAnyOutput(engagement) {
  return (engagement.outputs ?? []).length > 0;
}

export function computeNextStep(engagement) {
  if (!engagement) return null;

  const status        = effectiveStatus(engagement);
  const formDefs      = getApplicableForms(engagement);
  const firstForm     = formDefs[0] ?? null;

  const startedForms  = formDefs.filter(f => statusOf(engagement, f.key) === FORM_IN_PROGRESS);
  const completeForms = formDefs.filter(f => statusOf(engagement, f.key) === FORM_COMPLETE);
  const anyFormStarted  = startedForms.length > 0;
  const anyFormComplete = completeForms.length > 0;

  // ── Rule 1: Engagement marked completed ───────────────────────────────────
  if (status === 'Completed') {
    return {
      tone: 'success',
      message: 'Engagement complete. All deliverables are archived.',
      actionLabel: null,
      actionTo: null,
    };
  }

  // ── Rule 2: Deliverables flagged ready, but engagement still active ───────
  if (engagement.deliverablesReady) {
    return {
      tone: 'success',
      message: 'Deliverables marked ready for client review. When the review is complete, move this engagement to Completed.',
      actionLabel: 'Open Output Center →',
      actionTo: `/engagements/${engagement.id}/outputs`,
    };
  }

  // ── Rule 3: Status overridden On Hold ─────────────────────────────────────
  if (status === 'On Hold') {
    return {
      tone: 'warning',
      message: 'Engagement is on hold. Resume by changing the status when work picks back up.',
      actionLabel: null,
      actionTo: null,
    };
  }

  // ── Rule 4: Outputs generated → review next ───────────────────────────────
  // At least one output exists in the Output Center — either time to review
  // or to mark deliverables ready.
  if (hasAnyOutput(engagement)) {
    return {
      tone: 'info',
      message: 'Initial deliverables are generated. Review them in the Output Center, then mark them ready for the client.',
      actionLabel: 'Open Output Center →',
      actionTo: `/engagements/${engagement.id}/outputs`,
    };
  }

  // ── Rule 5: Forms complete but no outputs ─────────────────────────────────
  if (anyFormComplete) {
    return {
      tone: 'info',
      message: 'Discovery is complete. Generate the initial deliverables in the Output Center.',
      actionLabel: 'Open Output Center →',
      actionTo: `/engagements/${engagement.id}/outputs`,
    };
  }

  // ── Rule 6: Form started but none complete → continue ─────────────────────
  if (anyFormStarted) {
    const target = startedForms[0];
    return {
      tone: 'info',
      message: `Continue ${target.label} — finish discovery so you can generate deliverables.`,
      actionLabel: `Continue ${target.label} →`,
      actionTo: `/engagements/${engagement.id}/forms/${target.key}`,
    };
  }

  // ── Rule 7: Saved artifacts but no forms started — uncommon path ──────────
  if (hasAnyArtifact(engagement)) {
    return {
      tone: 'info',
      message: 'Saved artifacts exist for this engagement. Open the Output Center when you\'re ready to generate client deliverables.',
      actionLabel: 'Open Output Center →',
      actionTo: `/engagements/${engagement.id}/outputs`,
    };
  }

  // ── Rule 8: Candidate use cases attached but no forms started ─────────────
  if ((engagement.candidateUseCases ?? []).length > 0 && firstForm) {
    return {
      tone: 'info',
      message: `${engagement.candidateUseCases.length} candidate use case${engagement.candidateUseCases.length !== 1 ? 's' : ''} attached. Begin discovery by opening ${firstForm.label} — you can import the candidates inside.`,
      actionLabel: `Open ${firstForm.label} →`,
      actionTo: `/engagements/${engagement.id}/forms/${firstForm.key}`,
    };
  }

  // ── Rule 9: Default for new/draft engagement with forms available ─────────
  if (firstForm) {
    return {
      tone: 'info',
      message: `Begin discovery by opening ${firstForm.label}.`,
      actionLabel: `Open ${firstForm.label} →`,
      actionTo: `/engagements/${engagement.id}/forms/${firstForm.key}`,
    };
  }

  // ── Rule 10: No forms defined for this service — fallback ─────────────────
  return {
    tone: 'info',
    message: 'Set up the engagement workflow checklist or generate initial artifacts to begin.',
    actionLabel: null,
    actionTo: null,
  };
}
