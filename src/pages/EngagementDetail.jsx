import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEngagements } from '../hooks/useEngagements.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { WorkflowChecklist } from '../components/WorkflowChecklist.jsx';
import { TemplateBadge } from '../components/TemplateBadge.jsx';
import { NotesLog } from '../components/NotesLog.jsx';
import { DecisionsLog } from '../components/DecisionsLog.jsx';
import { RisksLog } from '../components/RisksLog.jsx';
import { AttachmentsPanel } from '../components/AttachmentsPanel.jsx';
import { EngagementArtifacts } from '../components/artifacts/EngagementArtifacts.jsx';
import { Badge } from '../components/Badge.jsx';
import { NextStepBanner } from '../components/NextStepBanner.jsx';
import { SERVICES } from '../data/services.js';
import { getFormDefs, TEMPLATE_STATUSES } from '../data/formDefinitions.js';
import { computeStatus, effectiveStatus } from '../lib/statusUtils.js';
import { USE_CASES } from '../data/useCaseLibrary.js';
import { UseCasePicker } from '../components/UseCasePicker.jsx';

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="bh-section-label">{label}</p>
      <p className="text-sm text-slate-800 mt-0.5">{value}</p>
    </div>
  );
}

const STATUS_OPTIONS = ['Draft', 'Active', 'On Hold', 'Completed'];

function StatusControl({ engagement, onChange }) {
  const isAuto    = engagement.statusOverride == null;
  const computed  = computeStatus(engagement.workflow);
  const selectVal = isAuto ? 'auto' : engagement.statusOverride;

  return (
    <div>
      <p className="bh-section-label mb-1">Status</p>
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={selectVal}
          onChange={e => onChange(e.target.value === 'auto' ? null : e.target.value)}
          className="bh-input text-sm py-1 w-auto"
        >
          <option value="auto">Auto</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {isAuto && (
          <span className="text-xs text-slate-400">→ {computed}</span>
        )}
      </div>
    </div>
  );
}

// ── Inline service-type editor ────────────────────────────────────────────────
function ServiceTypeEditor({ svcKeys, onSave }) {
  const [editing,  setEditing]  = useState(false);
  const [selected, setSelected] = useState([]);

  function open() {
    setSelected(svcKeys);
    setEditing(true);
  }

  function toggle(key) {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  function handleSave() {
    if (selected.length === 0) return;
    onSave(selected);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="bh-section-label">
            Service{svcKeys.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={open}
            className="text-xs text-slate-400 hover:text-indigo-600 underline leading-none"
          >
            Edit
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {svcKeys.length > 0
            ? svcKeys.map(k => (
                <Badge key={k} tone="brand">
                  {SERVICES.find(s => s.key === k)?.label ?? k}
                </Badge>
              ))
            : <span className="text-sm text-slate-400">—</span>
          }
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-full">
      <p className="bh-section-label mb-2">Service(s)</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {SERVICES.map(s => {
          const on = selected.includes(s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggle(s.key)}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                on
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={selected.length === 0}
          className="bh-btn-primary py-1.5 text-xs"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs text-slate-500 hover:text-slate-700 underline"
        >
          Cancel
        </button>
        {selected.length === 0 && (
          <span className="text-xs text-red-500">Select at least one</span>
        )}
      </div>
    </div>
  );
}

export function EngagementDetail() {
  const { id } = useParams();
  const {
    getEngagement,
    updateWorkflowStep,
    updateTemplateStatus,
    updateEngagementFields,
    setStatusOverride,
    addNote, updateNote,
    addDecision, updateDecision,
    addRisk, updateRisk,
    addAttachment,
    removeAttachment,
    addCandidateUseCase,
    removeCandidateUseCase,
  } = useEngagements();

  const [pickerOpen, setPickerOpen] = useState(false);

  const engagement = getEngagement(id);

  if (!engagement) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-3">Engagement not found.</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm">← Back to Dashboard</Link>
      </div>
    );
  }

  const svcKeys  = engagement.serviceTypes ?? (engagement.serviceType ? [engagement.serviceType] : []);
  const formDefs = svcKeys.flatMap(k => getFormDefs(k));

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-600">← Dashboard</Link>
      </div>

      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1>{engagement.clientName}</h1>
          <p className="text-slate-500">{engagement.company}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={effectiveStatus(engagement)} />
          {engagement.deliverablesReady && (
            <Badge tone="success" className="text-[10px]">✓ Deliverables ready</Badge>
          )}
        </div>
      </div>

      {/* ── Next-step banner (Sprint B) ── */}
      <NextStepBanner engagement={engagement} />

      {/* ── Working area ── */}
      {(() => {
        const completedFormCount = formDefs.filter(
          f => (engagement.templateStatuses?.[f.key] ?? 'Not Started') === 'Complete'
        ).length;
        const startedFormCount = formDefs.filter(
          f => (engagement.templateStatuses?.[f.key] ?? 'Not Started') !== 'Not Started'
        ).length;
        const outputCount = (engagement.outputs ?? []).length;
        const isReady     = !!engagement.deliverablesReady;

        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">

            {/* Forms */}
            {formDefs.length > 0 && (
              <Link
                to={`/engagements/${engagement.id}/forms/${formDefs[0].key}`}
                className="bh-card bh-card-hover px-3.5 py-3 flex items-center gap-2.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 mb-0.5">Forms &amp; Templates</p>
                  <p className="text-xs text-slate-400">
                    {completedFormCount}/{formDefs.length} complete
                    {startedFormCount > completedFormCount && (
                      <span className="ml-1.5 text-indigo-500">· {startedFormCount - completedFormCount} in progress</span>
                    )}
                  </p>
                </div>
                <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}

            {/* Output Center */}
            <Link
              to={`/engagements/${engagement.id}/outputs`}
              className="bh-card bh-card-hover px-3.5 py-3 flex items-center gap-2.5"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 mb-0.5">Output Center</p>
                <p className={`text-xs ${
                  isReady
                    ? 'text-emerald-600 font-medium'
                    : outputCount > 0 ? 'text-indigo-500' : 'text-slate-400'
                }`}>
                  {isReady
                    ? '✓ Ready for review'
                    : outputCount > 0
                      ? `${outputCount} output${outputCount !== 1 ? 's' : ''} generated`
                      : 'No outputs yet'}
                </p>
              </div>
              <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Playbooks / Templates */}
            <Link
              to="/templates"
              className="bh-card bh-card-hover px-3.5 py-3 flex items-center gap-2.5"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 mb-0.5">Playbooks</p>
                <p className="text-xs text-slate-400">
                  {svcKeys.length > 0
                    ? svcKeys.map(k => SERVICES.find(s => s.key === k)?.label ?? k).join(', ')
                    : 'Browse delivery playbooks'}
                </p>
              </div>
              <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        );
      })()}

      {/* ── Field grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-8">
        <ServiceTypeEditor
          svcKeys={svcKeys}
          onSave={newKeys => updateEngagementFields(engagement.id, { serviceTypes: newKeys })}
        />
        <DetailRow label="Owner"           value={engagement.owner} />
        <DetailRow label="Start Date"      value={engagement.startDate} />
        <StatusControl
          engagement={engagement}
          onChange={override => setStatusOverride(engagement.id, override)}
        />
        <DetailRow label="Primary Contact" value={engagement.primaryContact} />
        <DetailRow label="Email"           value={engagement.email} />
      </div>

      {/* ── Target outcome ── */}
      <section className="mb-8">
        <p className="bh-section-label mb-2">Target Outcome</p>
        <p className="text-sm text-slate-700">{engagement.targetOutcome}</p>
      </section>

      {/* ── Engagement notes (Phase 1 plain-text field) ── */}
      {engagement.notes && (
        <section className="mb-8">
          <p className="bh-section-label mb-2">Notes</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{engagement.notes}</p>
        </section>
      )}

      {/* ── Workflow checklist (Phase 1) ── */}
      <section className="bh-card p-5 mb-6">
        <WorkflowChecklist
          engagementId={engagement.id}
          steps={engagement.workflow}
          onToggle={(stepId, done) => updateWorkflowStep(engagement.id, stepId, done)}
        />
      </section>

      {/* ── Forms & Templates (Phase 2A) ── */}
      {formDefs.length > 0 && (
        <section className="mb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">Forms & Templates</h2>
            <Link
              to={`/engagements/${engagement.id}/outputs`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              Output Center →
            </Link>
          </div>
          <div className="space-y-2">
            {formDefs.map(form => {
              const status = engagement.templateStatuses?.[form.key] ?? 'Not Started';
              return (
                <div
                  key={form.key}
                  className="bh-card px-4 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-medium text-slate-800 truncate">{form.label}</span>
                    <TemplateBadge status={status} />
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <select
                      value={status}
                      onChange={e => updateTemplateStatus(engagement.id, form.key, e.target.value)}
                      className="bh-input text-xs py-1 w-auto"
                    >
                      {TEMPLATE_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <Link
                      to={`/engagements/${engagement.id}/forms/${form.key}`}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/engagements/${engagement.id}/preview/${form.key}`}
                      className="text-sm text-slate-400 hover:text-slate-600"
                    >
                      Preview
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Saved Artifacts (Phase 10 / 10b) ── */}
      <EngagementArtifacts engagement={engagement} />

      {/* ── Candidate Use Cases ── */}
      {(() => {
        const linked = (engagement.candidateUseCases ?? [])
          .map(id => USE_CASES.find(uc => uc.id === id))
          .filter(Boolean);
        const addedIds = new Set(engagement.candidateUseCases ?? []);

        return (
          <>
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-800">
                  Candidate Use Cases
                  {linked.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-slate-400 tabular-nums">
                      {linked.length}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600
                               hover:text-indigo-800 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add from Library
                  </button>
                  {linked.length > 0 && (
                    <Link
                      to="/library"
                      className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Browse →
                    </Link>
                  )}
                </div>
              </div>

              {linked.length === 0 ? (
                /* Empty state */
                <div className="border border-dashed border-slate-200 rounded-lg px-5 py-6 text-center bg-white">
                  <p className="text-sm text-slate-400 mb-2">
                    No use cases added yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Browse the library to add candidates →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {linked.map(uc => (
                    <div
                      key={uc.id}
                      className="bh-card px-4 py-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge category={uc.category}>{uc.category}</Badge>
                          <Badge complexity={uc.complexity}>{uc.complexity}</Badge>
                          <span className="text-xs text-slate-400">{uc.timeToValue}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">{uc.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
                          {uc.suggestedNextStep}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 pt-0.5">
                        <Link
                          to="/library"
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeCandidateUseCase(engagement.id, uc.id)}
                          className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                          aria-label={`Remove ${uc.title}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Picker modal — rendered outside the section flow so it doesn't affect layout */}
            {pickerOpen && (
              <UseCasePicker
                engagementName={engagement.clientName}
                addedIds={addedIds}
                onAdd={useCaseId => addCandidateUseCase(engagement.id, useCaseId)}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </>
        );
      })()}

      {/* ── Notes log (Phase 2B) ── */}
      <NotesLog
        entries={engagement.notesLog ?? []}
        defaultOwner={engagement.owner}
        onAdd={fields => addNote(engagement.id, fields)}
        onUpdate={(noteId, fields) => updateNote(engagement.id, noteId, fields)}
      />

      {/* ── Decisions log (Phase 2B) ── */}
      <DecisionsLog
        entries={engagement.decisionsLog ?? []}
        defaultOwner={engagement.owner}
        onAdd={fields => addDecision(engagement.id, fields)}
        onUpdate={(decisionId, fields) => updateDecision(engagement.id, decisionId, fields)}
      />

      {/* ── Risks / blockers register (Phase 2B) ── */}
      <RisksLog
        entries={engagement.risksLog ?? []}
        defaultOwner={engagement.owner}
        onAdd={fields => addRisk(engagement.id, fields)}
        onUpdate={(riskId, fields) => updateRisk(engagement.id, riskId, fields)}
      />

      {/* ── Attachments (Phase 9 / 9b) ── */}
      <AttachmentsPanel
        engagementId={engagement.id}
        attachments={engagement.attachments ?? []}
        defaultOwner={engagement.owner}
        onAdd={att => addAttachment(engagement.id, att)}
        onRemove={attId => removeAttachment(engagement.id, attId)}
      />
    </div>
  );
}
