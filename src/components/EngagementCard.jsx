import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge.jsx';
import { SERVICES } from '../data/services.js';
import { effectiveStatus } from '../lib/statusUtils.js';

export function EngagementCard({ engagement }) {
  const service = SERVICES.find(s => s.key === engagement.serviceType);
  const done = engagement.workflow.filter(s => s.done).length;
  const total = engagement.workflow.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link
      to={`/engagements/${engagement.id}`}
      className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex justify-between items-start mb-1">
        <div>
          <p className="font-semibold text-gray-900">{engagement.clientName}</p>
          <p className="text-sm text-gray-500">{engagement.company}</p>
        </div>
        <StatusBadge status={effectiveStatus(engagement)} />
      </div>

      <p className="text-sm text-indigo-600 mt-2 mb-3">{service?.label ?? engagement.serviceType}</p>

      <div className="flex justify-between text-xs text-gray-400 mb-3">
        <span>Owner: {engagement.owner}</span>
        <span>{engagement.startDate}</span>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Workflow progress</span>
          <span>{done}/{total} steps</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
