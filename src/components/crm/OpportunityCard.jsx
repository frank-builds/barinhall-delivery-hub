/**
 * Sprint D3 — OpportunityCard.
 *
 * Compact card used in the Pipeline view. Click the card title to open the
 * detail page; use the "Move to…" select below the body to change the stage
 * (gated by crm.write).
 *
 * Mirrors the structure of `KanbanBoard.jsx`'s engagement cards: card body
 * is a Link; the move-control is a sibling <select> outside the Link so it
 * doesn't trigger navigation when clicked.
 */
import { Link } from 'react-router-dom';
import { useCRM } from '../../hooks/useCRM.js';
import { Badge } from '../Badge.jsx';
import { PermissionGate } from '../PermissionGate.jsx';
import { CRM_STAGES, stageLabel, stageBadgeTone } from '../../data/crmStages.js';

function formatUSD(n) {
  if (n == null || Number.isNaN(n)) return null;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${n}`;
  }
}

export function OpportunityCard({ opportunity }) {
  const { getAccount, getContact, updateOpportunity } = useCRM();
  const account = opportunity.accountId        ? getAccount(opportunity.accountId)        : null;
  const contact = opportunity.primaryContactId ? getContact(opportunity.primaryContactId) : null;
  const value   = formatUSD(opportunity.expectedValue);

  function handleMove(e) {
    e.stopPropagation();
    const newStage = e.target.value;
    if (!newStage) return;
    updateOpportunity(opportunity.id, { stage: newStage });
    e.target.value = ''; // reset the control so the same option can be chosen again later
  }

  return (
    <div>
      <Link
        to={`/crm/opportunities/${opportunity.id}`}
        className="bh-card bh-card-hover px-3 py-2.5 block"
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-slate-800 leading-snug break-words">
            {opportunity.name || 'Unnamed opportunity'}
          </p>
          <Badge tone={stageBadgeTone(opportunity.stage)} className="flex-shrink-0 text-[10px] py-0">
            {stageLabel(opportunity.stage)}
          </Badge>
        </div>
        {account && (
          <p className="text-xs text-slate-500 truncate">{account.name}</p>
        )}
        {contact && (
          <p className="text-xs text-slate-400 truncate">{contact.name}</p>
        )}
        {value && (
          <p className="text-xs text-slate-700 tabular-nums mt-1">{value}</p>
        )}
      </Link>

      <PermissionGate perm="crm.write">
        <div className="mt-1 px-0.5">
          <select
            value=""
            onChange={handleMove}
            className="w-full text-xs border border-slate-200 rounded-md px-2 py-1 text-slate-400 bg-white hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-300 cursor-pointer"
            aria-label="Move to a different stage"
          >
            <option value="" disabled>Move to…</option>
            {CRM_STAGES
              .filter(s => s.key !== opportunity.stage)
              .map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
          </select>
        </div>
      </PermissionGate>
    </div>
  );
}
