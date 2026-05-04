// Uses the .bh-badge base class (index.css) + per-status Tailwind color utilities.
const STATUS_STYLES = {
  'Not Started': 'bg-slate-100  text-slate-500  border-slate-200',
  'In Progress': 'bg-amber-50   text-amber-700  border-amber-200',
  'Complete':    'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function TemplateBadge({ status }) {
  return (
    <span className={`bh-badge ${STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-400 border-slate-200'}`}>
      {status}
    </span>
  );
}
