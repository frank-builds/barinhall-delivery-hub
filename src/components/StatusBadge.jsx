// Uses the .bh-badge base class (index.css) + per-status Tailwind color utilities.
const STATUS_STYLES = {
  Draft:      'bg-slate-100  text-slate-600   border-slate-200',
  Active:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  'On Hold':  'bg-amber-50   text-amber-700   border-amber-200',
  Completed:  'bg-sky-50     text-sky-700     border-sky-200',
};

export function StatusBadge({ status }) {
  return (
    <span className={`bh-badge ${STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
      {status}
    </span>
  );
}
