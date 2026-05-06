import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEngagements } from '../hooks/useEngagements.js';
import { getFormDef } from '../data/formDefinitions.js';
import { FormFieldInput } from '../components/FormFieldInput.jsx';
import { TemplateBadge } from '../components/TemplateBadge.jsx';
import { UseCaseImportBanner } from '../components/UseCaseImportBanner.jsx';
import { TEMPLATE_STATUSES } from '../data/formDefinitions.js';
import {
  SCORING_CATEGORIES,
  computeCategoryScore,
  computeUseCaseScore,
  getScoreBand,
  formatScoreDisplay,
} from '../lib/readinessScoring.js';

// ── Derived value computation ─────────────────────────────────────────────────
// Returns { display: string, summary: string } so FormFieldInput can render
// both the numeric score line and the plain-language band interpretation.

function computeDerivedValue(field, formState) {
  let result;
  if (field.categoryKey) {
    const cat = SCORING_CATEGORIES.find(c => c.key === field.categoryKey);
    if (!cat) return { display: '', summary: '' };
    result = computeCategoryScore(formState, cat.subKeys);
  } else if (field.ucIndex != null) {
    result = computeUseCaseScore(formState, field.ucIndex);
  } else {
    return { display: '', summary: '' };
  }

  if (!result.score) return { display: '', summary: '' };

  const band = getScoreBand(result.score);
  return {
    display: formatScoreDisplay(result),
    summary: band?.summary ?? '',
  };
}

export function FormPage() {
  const { id, formKey } = useParams();
  const navigate = useNavigate();
  const { getEngagement, updateFormData, updateTemplateStatus } = useEngagements();
  const engagement = getEngagement(id);

  const formDef = engagement
    ? (engagement.serviceTypes ?? (engagement.serviceType ? [engagement.serviceType] : []))
        .map(k => getFormDef(k, formKey))
        .find(Boolean) ?? null
    : null;

  const [formState, setFormState] = useState(() => {
    return engagement?.forms?.[formKey] ?? {};
  });

  useEffect(() => {
    setFormState(engagement?.forms?.[formKey] ?? {});
  }, [id, formKey]);

  const [saved, setSaved] = useState(false);
  const [facilitatorMode, setFacilitatorMode] = useState(false);

  if (!engagement) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-3">Engagement not found.</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm">← Dashboard</Link>
      </div>
    );
  }

  if (!formDef) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-3">Form not found for this service.</p>
        <Link to={`/engagements/${id}`} className="text-indigo-600 hover:underline text-sm">← Back to engagement</Link>
      </div>
    );
  }

  const status = engagement.templateStatuses?.[formKey] ?? 'Not Started';

  function handleFieldChange(key, value) {
    setFormState(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    updateFormData(id, formKey, formState);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleStatusChange(e) {
    updateTemplateStatus(id, formKey, e.target.value);
  }

  /**
   * Merge a partial form-state update from the UseCaseImportBanner.
   * We persist immediately so the import is never lost if the user closes
   * the page without clicking Save. The merge uses the current formState
   * snapshot from the click closure (not a setState updater) to keep side
   * effects out of the reducer path.
   */
  function handleImportFromLibrary(partialUpdate) {
    const next = { ...formState, ...partialUpdate };
    setFormState(next);
    updateFormData(id, formKey, next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // The Use Case Library import banner is only shown for the AI Readiness
  // "Use Case Prioritization" form. Add other formKey matches here if more
  // forms ever capture a user-defined list of use cases.
  const showLibraryImport = formKey === 'use-cases';

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
        <Link to="/" className="hover:text-slate-600">Dashboard</Link>
        <span>/</span>
        <Link to={`/engagements/${id}`} className="hover:text-slate-600">{engagement.clientName}</Link>
        <span>/</span>
        <span className="text-slate-600">{formDef.label}</span>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1>{formDef.label}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{engagement.clientName} · {engagement.company}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => setFacilitatorMode(m => !m)}
            className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
              facilitatorMode
                ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            {facilitatorMode ? 'Facilitator mode on' : 'Facilitator mode'}
          </button>
          <TemplateBadge status={status} />
          <select
            value={status}
            onChange={handleStatusChange}
            className="bh-input text-xs py-1 w-auto"
          >
            {TEMPLATE_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Library import banner (Sprint B) ── */}
      {showLibraryImport && (
        <UseCaseImportBanner
          engagement={engagement}
          formState={formState}
          onImport={handleImportFromLibrary}
        />
      )}

      <div className="space-y-5">
        {formDef.fields.map((field, idx) => {

          // Section header — no label wrapper, no input
          if (field.type === 'section') {
            return (
              <FormFieldInput
                key={`_section_${idx}`}
                field={field}
                value=""
                onChange={() => {}}
                facilitatorMode={facilitatorMode}
              />
            );
          }

          // Derived score — computed value, no user input
          if (field.type === 'derived') {
            return (
              <div key={`_derived_${idx}`}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {field.label}
                </label>
                <FormFieldInput
                  field={field}
                  value={computeDerivedValue(field, formState)}
                  onChange={() => {}}
                  facilitatorMode={facilitatorMode}
                />
              </div>
            );
          }

          // Standard input field
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {field.label}
              </label>
              <FormFieldInput
                field={field}
                value={formState[field.key] ?? ''}
                onChange={handleFieldChange}
                facilitatorMode={facilitatorMode}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
        <button onClick={handleSave} className="bh-btn-primary">
          Save
        </button>
        {saved && (
          <span className="text-sm text-emerald-600 font-medium">Saved</span>
        )}
        <Link
          to={`/engagements/${id}/preview/${formKey}`}
          className="text-sm text-slate-500 hover:text-indigo-600 ml-auto"
        >
          Preview →
        </Link>
      </div>
    </div>
  );
}
