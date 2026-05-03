const BASE = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

// ── Facilitator guidance block ────────────────────────────────────────────────
// Rendered below any field that carries facilitator metadata when
// facilitatorMode is active. Uses amber styling to clearly distinguish
// internal guidance from the respondent-facing form.

function FacilitatorGuidance({ field }) {
  const { facilitatorNote, askScript, probeExamples, scoringGuidance } = field;
  if (!facilitatorNote && !askScript && !probeExamples && !scoringGuidance) return null;
  return (
    <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs space-y-2">
      {facilitatorNote && (
        <div>
          <span className="font-semibold text-amber-800 uppercase tracking-wide text-[10px]">Facilitator note</span>
          <p className="text-amber-700 mt-0.5">{facilitatorNote}</p>
        </div>
      )}
      {askScript && (
        <div>
          <span className="font-semibold text-amber-800 uppercase tracking-wide text-[10px]">Ask</span>
          <p className="text-amber-700 mt-0.5 italic">"{askScript}"</p>
        </div>
      )}
      {probeExamples && probeExamples.length > 0 && (
        <div>
          <span className="font-semibold text-amber-800 uppercase tracking-wide text-[10px]">Follow-up probes</span>
          <ul className="text-amber-700 mt-0.5 space-y-0.5 list-disc list-inside">
            {probeExamples.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}
      {scoringGuidance && (
        <div>
          <span className="font-semibold text-amber-800 uppercase tracking-wide text-[10px]">Scoring guidance</span>
          <p className="text-amber-700 mt-0.5">{scoringGuidance}</p>
        </div>
      )}
    </div>
  );
}

export function FormFieldInput({ field, value, onChange, facilitatorMode = false }) {

  // ── Section header — visual separator, no input ───────────────────────────
  if (field.type === 'section') {
    return (
      <div className="pt-6 pb-1">
        <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
          {field.label}
        </h3>
        {field.description && (
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{field.description}</p>
        )}
        <div className="mt-2 border-b border-gray-100" />
        {facilitatorMode && field.facilitatorNote && (
          <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs">
            <span className="font-semibold text-amber-800 uppercase tracking-wide text-[10px]">Facilitator note</span>
            <p className="text-amber-700 mt-0.5">{field.facilitatorNote}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Derived score — computed read-only display, no input ──────────────────
  if (field.type === 'derived') {
    // value is { display: string, summary: string } when answered, '' when not
    const display = typeof value === 'object' ? value.display : value;
    const summary = typeof value === 'object' ? value.summary : '';
    const subtitle = field.ucIndex != null
      ? 'weighted prioritization score'
      : 'derived from sub-questions above';

    if (!display) {
      return (
        <div className="rounded-md border border-dashed border-gray-200 px-3 py-2 text-sm text-gray-400 italic">
          Answer the sub-questions above to see the derived score
        </div>
      );
    }
    return (
      <div className="rounded-md bg-indigo-50 border border-indigo-200 px-3 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-indigo-800">{display}</span>
          <span className="text-xs text-gray-400">· {subtitle}</span>
        </div>
        {summary && (
          <p className="text-xs text-indigo-600 mt-1 italic">{summary}</p>
        )}
      </div>
    );
  }

  // ── Shared: help text + facilitator guidance wrapper ─────────────────────
  // Rendered below the input for all standard field types.
  const helpAndGuidance = (
    <>
      {field.helpText && (
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{field.helpText}</p>
      )}
      {facilitatorMode && <FacilitatorGuidance field={field} />}
    </>
  );

  // ── Textarea ──────────────────────────────────────────────────────────────
  if (field.type === 'textarea') {
    return (
      <div>
        <textarea
          rows={4}
          value={value}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={field.placeholder ?? ''}
          className={BASE}
        />
        {helpAndGuidance}
      </div>
    );
  }

  // ── Select ────────────────────────────────────────────────────────────────
  if (field.type === 'select') {
    return (
      <div>
        <select
          value={value}
          onChange={e => onChange(field.key, e.target.value)}
          className={BASE}
        >
          <option value="">Select…</option>
          {field.options.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        {helpAndGuidance}
      </div>
    );
  }

  // ── Text (default) ────────────────────────────────────────────────────────
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(field.key, e.target.value)}
        placeholder={field.placeholder ?? ''}
        className={BASE}
      />
      {helpAndGuidance}
    </div>
  );
}
