import { EngagementCard } from './EngagementCard.jsx';
import { effectiveStatus } from '../lib/statusUtils.js';
import { useEngagements } from '../hooks/useEngagements.js';

const COLUMNS = [
  { status: 'Draft',     color: 'bg-slate-100  border-slate-200',  label: 'Draft'     },
  { status: 'Active',    color: 'bg-green-50  border-green-200', label: 'Active'    },
  { status: 'On Hold',   color: 'bg-yellow-50 border-yellow-200',label: 'On Hold'   },
  { status: 'Completed', color: 'bg-blue-50   border-blue-200',  label: 'Completed' },
];

const ALL_STATUSES = COLUMNS.map(c => c.status);

export function KanbanBoard({ engagements }) {
  const { setStatusOverride } = useEngagements();

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-4 min-w-max">
        {COLUMNS.map(col => {
          const cards = engagements.filter(e => effectiveStatus(e) === col.status);
          return (
            <div
              key={col.status}
              className={`flex flex-col w-72 rounded-lg border ${col.color} p-3`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-sm font-semibold text-slate-700">{col.label}</span>
                <span className="text-xs text-slate-400 font-medium">{cards.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {cards.map(e => (
                  // Wrapper groups the card + move control without nesting inside the <Link>
                  <div key={e.id}>
                    <EngagementCard engagement={e} />
                    <div className="mt-1 px-0.5">
                      <select
                        value=""
                        onChange={ev => {
                          ev.stopPropagation();
                          setStatusOverride(e.id, ev.target.value);
                        }}
                        className="w-full text-xs border border-slate-200 rounded-md px-2 py-1 text-slate-400 bg-white hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-300 cursor-pointer"
                      >
                        <option value="" disabled>Move to…</option>
                        {ALL_STATUSES.filter(s => s !== col.status).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {cards.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">No engagements</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
