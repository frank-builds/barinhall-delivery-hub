import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge.jsx';
import { SERVICES } from '../data/services.js';
import { effectiveStatus } from '../lib/statusUtils.js';
import { computeEngagementProgress } from '../lib/engagementProgress.js';

// Stage-specific bar colour. Cards use journey-stage progress (created →
// discovery → building → ready → complete), not raw workflow-step ratio.
const STAGE_BAR_COLOR = {
  created:   'bg-slate-400',
  discovery: 'bg-indigo-500',
  building:  'bg-violet-500',
  delivery:  'bg-emerald-500',
  complete:  'bg-emerald-600',
};

export function EngagementCard({ engagement }) {
  const svcKeys = engagement.serviceTypes ?? (engagement.serviceType ? [engagement.serviceType] : []);
  const serviceLabel = svcKeys
    .map(k => SERVICES.find(s => s.key === k)?.label ?? k)
    .join(', ');

  const { pct, stage, label } = computeEngagementProgress(engagement);
  const barColor = STAGE_BAR_COLOR[stage] ?? STAGE_BAR_COLOR.discovery;

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

      {/* Journey-stage progress (Sprint B) */}
      <div>
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-500 truncate">{label}</span>
          <span className="text-slate-500 tabular-nums font-medium flex-shrink-0 ml-2">{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
