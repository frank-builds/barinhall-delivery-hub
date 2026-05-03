import { EngagementCard } from './EngagementCard.jsx';
import { effectiveStatus } from '../lib/statusUtils.js';

const COLUMNS = [
  { status: 'Draft',     color: 'bg-gray-100  border-gray-200',  label: 'Draft'     },
  { status: 'Active',    color: 'bg-green-50  border-green-200', label: 'Active'    },
  { status: 'On Hold',   color: 'bg-yellow-50 border-yellow-200',label: 'On Hold'   },
  { status: 'Completed', color: 'bg-blue-50   border-blue-200',  label: 'Completed' },
];

export function KanbanBoard({ engagements }) {
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
                <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                <span className="text-xs text-gray-400 font-medium">{cards.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {cards.map(e => (
                  <EngagementCard key={e.id} engagement={e} />
                ))}
                {cards.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">No engagements</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
