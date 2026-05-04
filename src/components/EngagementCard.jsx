import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge.jsx';
import { SERVICES } from '../data/services.js';
import { effectiveStatus } from '../lib/statusUtils.js';

export function EngagementCard({ engagement }) {
  const svcKeys = engagement.serviceTypes ?? (engagement.serviceType ? [engagement.serviceType] : []);
  const serviceLabel = svcKeys
    .map(k => SERVICES.find(s => s.key === k)?.label ?? k)
    .join(', ');
  const done = engagement.workflow.filter(s => s.done).length;
  const total = engagement.workflow.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link
      to={`/engagements/${engagement.id}`}
      className="bh-card bh-card-hover block p-5 rounded-xl"
    >
      {/* Client name + company + status */}
      <div className="flex justify-between items-start gap-2 mb-1">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 truncate">{engagement.clientName}</p>
          <p className="text-sm text-slate-500 truncate">{engagement.company}</p>
        </div>
        <StatusBadge status={effectiveStatus(engagement)} />
      </div>

      {/* Service type */}
      <p className="text-xs font-medium text-indigo-600 mt-2.5 mb-3 truncate">
        {serviceLabel || <span className="text-slate-400">—</span>}
      </p>

      {/* Meta row */}
      <div className="flex justify-between text-xs text-slate-400 mb-4">
        <span>{engagement.owner}</span>
        <span>{engagement.startDate}</span>
      </div>

      {/* Workflow progress */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Progress</span>
          <span className="tabular-nums font-medium">{done}/{total}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
