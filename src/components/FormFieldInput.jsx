const BASE = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

export function FormFieldInput({ field, value, onChange }) {

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
      </div>
    );
  }

  // ── Derived score — computed read-only display, no input ──────────────────
  if (field.type === 'derived') {
    if (!value) {
      return (
        <div className="rounded-md border border-dashed border-gray-200 px-3 py-2 text-sm text-gray-400 italic">
          Answer the sub-questions above to see the derived score
        </div>
      );
    }
    return (
      <div className="rounded-md bg-indigo-50 border border-indigo-200 px-3 py-2 flex items-center gap-2">
        <span className="text-sm font-semibold text-indigo-800">{value}</span>
        <span className="text-xs text-gray-400">· derived from sub-questions above</span>
      </div>
    );
  }

  // ── Textarea ──────────────────────────────────────────────────────────────
  if (field.type === 'textarea') {
    return (
      <textarea
        rows={4}
        value={value}
        onChange={e => onChange(field.key, e.target.value)}
        placeholder={field.placeholder ?? ''}
        className={BASE}
      />
    );
  }

  // ── Select ────────────────────────────────────────────────────────────────
  if (field.type === 'select') {
    return (
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
    );
  }

  // ── Text (default) ────────────────────────────────────────────────────────
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(field.key, e.target.value)}
      placeholder={field.placeholder ?? ''}
      className={BASE}
    />
  );
}
