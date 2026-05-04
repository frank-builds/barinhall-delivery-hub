// EngagementArtifacts — shows all saved artifacts for an engagement and
// lets the user open/edit them in the correct builder modal.
//
// Data lives at engagement.artifactData[storageKey] — a free-form object
// whose shape varies by artifact type. Each entry has a `savedAt` ISO string.
//
// The component:
//   1. Reads engagement.artifactData and derives label + component type for
//      every saved key — first from ARTIFACT_META (full known-key lookup),
//      then from the saved data shape as a fallback.
//   2. Renders a sorted list with icon, label, and saved date.
//   3. Opens ArtifactViewerModal on click — which re-uses the existing builders
//      verbatim, so editing from here works identically to editing from a step.

import { useState }              from 'react';
import { useEngagements }        from '../../hooks/useEngagements.js';
import { SowBuilder }            from './SowBuilder.jsx';
import { EmailDraftEditor }      from './EmailDraftEditor.jsx';
import { StakeholderMapBuilder } from './StakeholderMapBuilder.jsx';
import { ChecklistBuilder }      from './ChecklistBuilder.jsx';
import { AgendaBuilder }         from './AgendaBuilder.jsx';
import { ScoringForm }           from './ScoringForm.jsx';
import { ActionTracker }         from './ActionTracker.jsx';
import { StructuredDocument }    from './StructuredDocument.jsx';

// ── Comprehensive label + component map for every known storageKey ─────────────
// component values must match the routing in BuilderRouter (ArtifactLauncher).

const ARTIFACT_META = {
  // ── Legacy Phase 10 (no component field) ────────────────────────────────────
  sow:                       { label: 'Statement of Work',              component: 'sow',           icon: '🔨' },
  stakeholderMap:            { label: 'Stakeholder Map',                component: 'stakeholderMap', icon: '📋' },

  // ── Email drafts ─────────────────────────────────────────────���───────────────
  preCallEmail:              { label: 'Pre-call Email',                  component: 'emailDraft',    icon: '✉️' },
  dataRequestEmail:          { label: 'Data Request Email',              component: 'emailDraft',    icon: '✉️' },
  debriefFollowUpEmail:      { label: 'Debrief Follow-up Email',         component: 'emailDraft',    icon: '✉️' },
  workshopPrepEmail:         { label: 'Workshop Prep Email',             component: 'emailDraft',    icon: '✉️' },
  participantInviteEmail:    { label: 'Participant Invite Email',         component: 'emailDraft',    icon: '✉️' },
  reviewSessionEmail:        { label: 'Review Session Email',            component: 'emailDraft',    icon: '✉️' },
  pilotKickoffEmail:         { label: 'Pilot Kickoff Email',             component: 'emailDraft',    icon: '✉️' },
  midPilotEmail:             { label: 'Mid-Pilot Check-in Email',        component: 'emailDraft',    icon: '✉️' },
  pilotDeliveryEmail:        { label: 'Pilot Delivery Email',            component: 'emailDraft',    icon: '✉️' },
  scopeConfirmEmail:         { label: 'Scope Confirmation Email',        component: 'emailDraft',    icon: '✉️' },
  governanceDeliveryEmail:   { label: 'Governance Delivery Email',       component: 'emailDraft',    icon: '✉️' },
  trainingIntakeEmail:       { label: 'Training Intake Email',           component: 'emailDraft',    icon: '✉️' },
  postTrainingEmail:         { label: 'Post-training Email',             component: 'emailDraft',    icon: '✉️' },
  monthlyCheckInEmail:       { label: 'Monthly Check-in Email',          component: 'emailDraft',    icon: '✉️' },
  monthlyReportEmail:        { label: 'Monthly Report Email',            component: 'emailDraft',    icon: '✉️' },
  deliveryEmail:             { label: 'Delivery Email',                  component: 'emailDraft',    icon: '✉️' },

  // ── Checklists ───────────────────────────────────────────────────────────────
  dataCollectionChecklist:   { label: 'Data Collection Checklist',       component: 'checklist',     icon: '✅' },
  internalQaChecklist:       { label: 'Internal QA Checklist',           component: 'checklist',     icon: '✅' },
  workshopPrepChecklist:     { label: 'Workshop Prep Checklist',         component: 'checklist',     icon: '✅' },
  accessSetupChecklist:      { label: 'Access Setup Checklist',          component: 'checklist',     icon: '✅' },
  onboardingChecklist:       { label: 'Onboarding Checklist',            component: 'checklist',     icon: '✅' },
  buildProgressChecklist:    { label: 'Build Progress Checklist',        component: 'checklist',     icon: '✅' },
  monitoringChecklist:       { label: 'Monitoring Checklist',            component: 'checklist',     icon: '✅' },
  wrapUpChecklist:           { label: 'Wrap-up Checklist',               component: 'checklist',     icon: '✅' },
  policyReviewChecklist:     { label: 'Policy Review Checklist',         component: 'checklist',     icon: '✅' },
  aiInventoryChecklist:      { label: 'AI Inventory Checklist',          component: 'checklist',     icon: '✅' },
  handoffChecklist:          { label: 'Handoff Checklist',               component: 'checklist',     icon: '✅' },
  logisticsChecklist:        { label: 'Logistics Checklist',             component: 'checklist',     icon: '✅' },
  moduleChecklist:           { label: 'Module Feedback Checklist',       component: 'checklist',     icon: '✅' },
  postTrainingChecklist:     { label: 'Post-training Checklist',         component: 'checklist',     icon: '✅' },
  attendanceChecklist:       { label: 'Attendance & Notes',              component: 'checklist',     icon: '✅' },

  // ── Agendas ──────────────────────────────────────────────────────────────────
  workshopAgenda:            { label: 'AI Strategy Workshop Agenda',     component: 'agenda',        icon: '📅' },
  reviewSessionAgenda:       { label: 'Roadmap Review Agenda',           component: 'agenda',        icon: '📅' },
  debriefAgenda:             { label: 'Assessment Debrief Agenda',       component: 'agenda',        icon: '📅' },
  midPilotReviewAgenda:      { label: 'Mid-Pilot Review Agenda',         component: 'agenda',        icon: '📅' },
  governanceBriefingAgenda:  { label: 'Governance Briefing Agenda',      component: 'agenda',        icon: '📅' },
  sessionAgenda:             { label: 'Training Session Agenda',         component: 'agenda',        icon: '📅' },
  monthlyCheckInAgenda:      { label: 'Monthly Check-in Agenda',         component: 'agenda',        icon: '📅' },

  // ── Scoring forms ────────────────────────────────────────────────────────────
  readinessScoring:          { label: 'AI Readiness Scoring',            component: 'scoring',       icon: '📊' },
  initiativeScorer:          { label: 'Initiative Prioritisation',       component: 'scoring',       icon: '📊' },
  successCriteriaForm:       { label: 'Pilot Success Criteria',          component: 'scoring',       icon: '📊' },
  pilotResultsForm:          { label: 'Pilot Results vs. Criteria',      component: 'scoring',       icon: '📊' },
  riskAssessmentForm:        { label: 'AI Risk Assessment',              component: 'scoring',       icon: '📊' },
  trainingNeedsForm:         { label: 'Training Needs Assessment',       component: 'scoring',       icon: '📊' },
  backlogScorer:             { label: 'Backlog Priority Scoring',        component: 'scoring',       icon: '📊' },

  // ── Structured documents ─────────────────────────────────────────────────────
  dataQualityMemo:           { label: 'Data Quality Memo',               component: 'document',      icon: '📄' },
  scoringNotes:              { label: 'Scoring Notes',                   component: 'document',      icon: '📄' },
  assessmentReport:          { label: 'Assessment Report',               component: 'document',      icon: '📄' },
  workshopNotes:             { label: 'Workshop Notes',                  component: 'document',      icon: '📄' },
  themeMatrix:               { label: 'Theme Matrix',                    component: 'document',      icon: '📄' },
  roadmapBuilder:            { label: 'Roadmap Document',                component: 'document',      icon: '📄' },
  pilotSow:                  { label: 'Pilot SOW',                       component: 'document',      icon: '📄' },
  technicalSetupNotes:       { label: 'Technical Setup Notes',           component: 'document',      icon: '📄' },
  recommendationBuilder:     { label: 'Recommendation Document',         component: 'document',      icon: '📄' },
  governanceScopeDoc:        { label: 'Governance Scope Document',       component: 'document',      icon: '📄' },
  inventoryNotes:            { label: 'AI Inventory Notes',              component: 'document',      icon: '📄' },
  policyGapNotes:            { label: 'Policy Gap Notes',                component: 'document',      icon: '📄' },
  governanceRecommendations: { label: 'Governance Recommendations',      component: 'document',      icon: '📄' },
  audienceAnalysisNotes:     { label: 'Audience Analysis Notes',         component: 'document',      icon: '📄' },
  curriculumOutline:         { label: 'Curriculum Outline',              component: 'document',      icon: '📄' },
  deliveryNotes:             { label: 'Delivery Notes',                  component: 'document',      icon: '📄' },
  planningNotes:             { label: 'Planning Notes',                  component: 'document',      icon: '📄' },
  tuningNotes:               { label: 'Tuning Notes',                    component: 'document',      icon: '📄' },
  metricsNotes:              { label: 'Metrics & Insights Notes',        component: 'document',      icon: '📄' },
  retrospectiveNotes:        { label: 'Retrospective Notes',             component: 'document',      icon: '📄' },
  preworkMaterials:          { label: 'Pre-work Materials',              component: 'document',      icon: '📄' },
  configurationNotes:        { label: 'Configuration Notes',             component: 'document',      icon: '📄' },

  // ── Action trackers (open-ended keys, no template registry) ──────────────��──
  reviewActions:             { label: 'Review Action Items',             component: 'actionTracker', icon: '🗂️' },
  debriefActions:            { label: 'Debrief Action Items',            component: 'actionTracker', icon: '🗂️' },
  workshopActions:           { label: 'Workshop Action Items',           component: 'actionTracker', icon: '🗂️' },
  reviewFeedbackActions:     { label: 'Review Feedback Actions',         component: 'actionTracker', icon: '🗂️' },
  strategyNextSteps:         { label: 'Strategy Next Steps',             component: 'actionTracker', icon: '🗂️' },
  pilotIssues:               { label: 'Pilot Issue Log',                 component: 'actionTracker', icon: '🗂️' },
  pilotNextSteps:            { label: 'Pilot Next Steps',                component: 'actionTracker', icon: '🗂️' },
  remediationActions:        { label: 'Remediation Action Items',        component: 'actionTracker', icon: '🗂️' },
  trainingActions:           { label: 'Training Action Items',           component: 'actionTracker', icon: '🗂️' },
  monthlyWorkPlan:           { label: 'Monthly Work Plan',               component: 'actionTracker', icon: '🗂️' },
  incidentLog:               { label: 'Incident Log',                    component: 'actionTracker', icon: '🗂️' },
  backlogItems:              { label: 'Backlog Items',                   component: 'actionTracker', icon: '🗂️' },
};

// ── Type-labels for the badge shown on each card ──────────────────────────────

const TYPE_LABELS = {
  sow:           { label: 'Document',   cls: 'bg-orange-50 text-orange-600 border-orange-200' },
  stakeholderMap:{ label: 'Form',       cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  emailDraft:    { label: 'Email',      cls: 'bg-sky-50 text-sky-600 border-sky-200' },
  checklist:     { label: 'Checklist',  cls: 'bg-green-50 text-green-600 border-green-200' },
  agenda:        { label: 'Agenda',     cls: 'bg-purple-50 text-purple-600 border-purple-200' },
  scoring:       { label: 'Scoring',    cls: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  document:      { label: 'Document',   cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  actionTracker: { label: 'Tracker',    cls: 'bg-rose-50 text-rose-600 border-rose-200' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert camelCase / PascalCase key to a human-readable string. */
function humanize(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

/**
 * Derive display meta from the saved data shape when the key is not in
 * ARTIFACT_META. Acts as a last-resort fallback for unknown/future artifact types.
 */
function detectFromData(key, data) {
  if (!data || typeof data !== 'object') {
    return { label: humanize(key), component: null, icon: '🛠️' };
  }
  if (data.htmlPreview !== undefined || data.fields?.scope !== undefined) {
    return { label: 'Statement of Work', component: 'sow', icon: '🔨' };
  }
  if (data.subject !== undefined && data.body !== undefined) {
    return { label: humanize(key), component: 'emailDraft', icon: '✉️' };
  }
  if (data.stakeholders !== undefined) {
    return { label: 'Stakeholder Map', component: 'stakeholderMap', icon: '📋' };
  }
  if (data.criteria !== undefined) {
    return { label: data.title ?? humanize(key), component: 'scoring', icon: '📊' };
  }
  if (data.sections !== undefined) {
    return { label: data.title ?? humanize(key), component: 'document', icon: '📄' };
  }
  if (Array.isArray(data.items)) {
    const first = data.items[0];
    if (!first) return { label: data.title ?? humanize(key), component: 'checklist', icon: '✅' };
    if (first.topic !== undefined) return { label: data.title ?? humanize(key), component: 'agenda', icon: '📅' };
    if (first.checked !== undefined) return { label: humanize(key), component: 'checklist', icon: '✅' };
    if (['Open', 'In Progress', 'Done', 'Blocked'].includes(first.status)) {
      return { label: humanize(key), component: 'actionTracker', icon: '🗂️' };
    }
  }
  return { label: humanize(key), component: null, icon: '🛠️' };
}

function getArtifactMeta(key, data) {
  return ARTIFACT_META[key] ?? detectFromData(key, data);
}

function formatSavedAt(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return null;
  }
}

// ── Viewer modal ──────────────────────────────────────────────────────────────
// Re-uses the exact same builder components as ArtifactLauncher. The builders
// read engagement.artifactData[storageKey] themselves on mount, so they will
// show the saved content automatically.

function ArtifactViewerModal({ storageKey, component, label, engagement, onClose }) {
  const { updateArtifactData } = useEngagements();

  function onSave(key, data) {
    updateArtifactData(engagement.id, key, {
      ...data,
      savedAt: new Date().toISOString(),
    });
  }

  function renderBuilder() {
    // Legacy Phase 10 routes (no component field — route by templateKey)
    if (component === 'sow' || storageKey === 'sow') {
      return <SowBuilder engagement={engagement} onSave={onSave} onClose={onClose} />;
    }
    if (component === 'stakeholderMap' || storageKey === 'stakeholderMap') {
      return <StakeholderMapBuilder engagement={engagement} onSave={onSave} onClose={onClose} />;
    }

    // Phase 10b component routes
    if (component === 'emailDraft') {
      // Guard: EmailDraftEditor crashes if the key has no matching TEMPLATES entry.
      // For unknown email types we fall back to a simple read-only display.
      try {
        return (
          <EmailDraftEditor
            type={storageKey}
            engagement={engagement}
            onSave={onSave}
            onClose={onClose}
          />
        );
      } catch {
        // fallback handled below
      }
    }
    if (component === 'checklist') {
      return (
        <ChecklistBuilder
          storageKey={storageKey}
          engagement={engagement}
          onSave={onSave}
          onClose={onClose}
        />
      );
    }
    if (component === 'agenda') {
      return (
        <AgendaBuilder
          storageKey={storageKey}
          engagement={engagement}
          onSave={onSave}
          onClose={onClose}
        />
      );
    }
    if (component === 'scoring') {
      return (
        <ScoringForm
          storageKey={storageKey}
          engagement={engagement}
          onSave={onSave}
          onClose={onClose}
        />
      );
    }
    if (component === 'actionTracker') {
      return (
        <ActionTracker
          storageKey={storageKey}
          engagement={engagement}
          onSave={onSave}
          onClose={onClose}
        />
      );
    }
    if (component === 'document') {
      return (
        <StructuredDocument
          storageKey={storageKey}
          engagement={engagement}
          onSave={onSave}
          onClose={onClose}
        />
      );
    }

    // Unknown / unimplemented artifact type
    return (
      <div className="py-10 text-center text-sm text-gray-400 italic">
        No viewer available for <strong>{storageKey}</strong> yet.
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-start justify-center overflow-y-auto py-8 px-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col">

        {/* Modal header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">{label}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {engagement.clientName} · {engagement.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-700 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Builder content */}
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: '72vh' }}>
          {renderBuilder()}
        </div>
      </div>
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

/**
 * Renders the "Saved Artifacts" section inside EngagementDetail.
 * Returns null when no artifacts have been saved yet.
 *
 * @param {{ engagement: object }} props
 */
export function EngagementArtifacts({ engagement }) {
  const [openKey, setOpenKey] = useState(null);

  const artifactData = engagement.artifactData ?? {};
  const keys = Object.keys(artifactData);

  if (keys.length === 0) return null;

  // Build display items — combine key, data, and derived meta
  const items = keys
    .map(key => {
      const data = artifactData[key];
      const meta = getArtifactMeta(key, data);
      return { key, data, ...meta };
    })
    // Sort: most recently saved first
    .sort((a, b) => {
      const aDate = a.data?.savedAt ?? '';
      const bDate = b.data?.savedAt ?? '';
      return bDate.localeCompare(aDate);
    });

  const openItem = openKey ? items.find(i => i.key === openKey) : null;

  return (
    <>
      <section className="border border-violet-200 rounded-lg bg-violet-50 p-5 mb-6">

        {/* Section header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-violet-500">
            Saved Artifacts
          </h2>
          <span className="text-[11px] font-semibold text-violet-400 bg-violet-100 rounded-full px-2 py-0.5">
            {items.length}
          </span>
        </div>

        {/* Artifact list */}
        <div className="space-y-2">
          {items.map(item => {
            const typeMeta = TYPE_LABELS[item.component] ?? { label: 'Artifact', cls: 'bg-gray-100 text-gray-500 border-gray-200' };
            const savedDate = formatSavedAt(item.data?.savedAt);

            return (
              <div
                key={item.key}
                className="flex items-center justify-between bg-white border border-violet-100 rounded-lg px-4 py-2.5 gap-3"
              >
                {/* Left: icon + label + date */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex-shrink-0 text-base">{item.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.label}</p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${typeMeta.cls}`}>
                        {typeMeta.label}
                      </span>
                    </div>
                    {savedDate && (
                      <p className="text-[11px] text-gray-400 mt-0.5">Saved {savedDate}</p>
                    )}
                  </div>
                </div>

                {/* Right: Open button */}
                <button
                  type="button"
                  onClick={() => setOpenKey(item.key)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-violet-200 bg-white text-violet-700 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-colors font-medium"
                >
                  Open
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Viewer modal — mounts only when an artifact is open */}
      {openItem && (
        <ArtifactViewerModal
          key={openItem.key}           // remount when switching artifacts
          storageKey={openItem.key}
          component={openItem.component}
          label={openItem.label}
          engagement={engagement}
          onClose={() => setOpenKey(null)}
        />
      )}
    </>
  );
}
