const BASE = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

export function FormFieldInput({ field, value, onChange }) {
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
