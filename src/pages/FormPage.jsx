import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEngagements } from '../hooks/useEngagements.js';
import { getFormDef } from '../data/formDefinitions.js';
import { FormFieldInput } from '../components/FormFieldInput.jsx';
import { TemplateBadge } from '../components/TemplateBadge.jsx';
import { TEMPLATE_STATUSES } from '../data/formDefinitions.js';
import {
  SCORING_CATEGORIES,
  computeCategoryScore,
  computeUseCaseScore,
  getScoreBand,
  formatScoreDisplay,
} from '../lib/readinessScoring.js';

// ── Derived value computation ─────────────────────────────────────────────────

function computeDerivedValue(field, formState) {
  if (field.categoryKey) {
    const cat = SCORING_CATEGORIES.find(c => c.key === field.categoryKey);
    if (!cat) return '';
    return formatScoreDisplay(computeCategoryScore(formState, cat.subKeys));
  }
  if (field.ucIndex != null) {
    return formatScoreDisplay(computeUseCaseScore(formState, field.ucIndex));
  }
  return '';
}

export function FormPage() {
  const { id, formKey } = useParams();
  const navigate = useNavigate();
  const { getEngagement, updateFormData, updateTemplateStatus } = useEngagements();
  const engagement = getEngagement(id);

  const formDef = engagement ? getFormDef(engagement.serviceType, formKey) : null;

  const [formState, setFormState] = useState(() => {
    return engagement?.forms?.[formKey] ?? {};
  });

  useEffect(() => {
    setFormState(engagement?.forms?.[formKey] ?? {});
  }, [id, formKey]);

  const [saved, setSaved] = useState(false);

  if (!engagement) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-3">Engagement not found.</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm">← Dashboard</Link>
      </div>
    );
  }

  if (!formDef) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-3">Form not found for this service.</p>
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

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
        <Link to="/" className="hover:text-gray-600">Dashboard</Link>
        <span>/</span>
        <Link to={`/engagements/${id}`} className="hover:text-gray-600">{engagement.clientName}</Link>
        <span>/</span>
        <span className="text-gray-600">{formDef.label}</span>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{formDef.label}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{engagement.clientName} · {engagement.company}</p>
        </div>
        <div className="flex items-center gap-2">
          <TemplateBadge status={status} />
          <select
            value={status}
            onChange={handleStatusChange}
            className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          >
            {TEMPLATE_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

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
              />
            );
          }

          // Derived score — computed value, no user input
          if (field.type === 'derived') {
            return (
              <div key={`_derived_${idx}`}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <FormFieldInput
                  field={field}
                  value={computeDerivedValue(field, formState)}
                  onChange={() => {}}
                />
              </div>
            );
          }

          // Standard input field
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <FormFieldInput
                field={field}
                value={formState[field.key] ?? ''}
                onChange={handleFieldChange}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={handleSave}
          className="bg-indigo-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Save
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">Saved</span>
        )}
        <Link
          to={`/engagements/${id}/preview/${formKey}`}
          className="text-sm text-gray-500 hover:text-indigo-600 ml-auto"
        >
          Preview →
        </Link>
      </div>
    </div>
  );
}
