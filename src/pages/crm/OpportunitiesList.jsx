/**
 * Sprint D2 + D3 — /crm/opportunities — list view with create entry-point.
 *
 * The pipeline (kanban) view lives at /crm/pipeline. This page stays a tabular
 * browser optimised for sorting/scanning across all stages at once.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCRM } from '../../hooks/useCRM.js';
import { Badge } from '../../components/Badge.jsx';
import { stageLabel, stageBadgeTone } from '../../data/crmStages.js';
import { PermissionGate } from '../../components/PermissionGate.jsx';
import { OpportunityFormModal } from '../../components/crm/OpportunityFormModal.jsx';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

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

export function OpportunitiesList() {
  const { opportunities, loading, getAccount, getContact } = useCRM();
  const [showCreate, setShowCreate] = useState(false);

  if (loading) {
    return <p className="text-sm text-slate-400 py-10 text-center">Loading opportunities…</p>;
  }

  if (opportunities.length === 0) {
    return (
      <>
        <div className="bh-card px-5 py-10 text-center">
          <p className="text-sm text-slate-400 mb-2">No opportunities yet.</p>
          <PermissionGate
            perm="crm.write"
            fallback={
              <p className="text-xs text-slate-400">
                Demo records can be loaded via the seed snippet in{' '}
                <code className="font-mono text-xs">0002_crm_lite.sql</code>.
              </p>
            }
          >
            <button onClick={() => setShowCreate(true)} className="bh-btn-primary text-sm">
              + New opportunity
            </button>
          </PermissionGate>
        </div>
        <OpportunityFormModal open={showCreate} onClose={() => setShowCreate(false)} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">
          Opportunities
          <span className="ml-2 text-sm font-normal text-slate-400 tabular-nums">
            {opportunities.length}
          </span>
        </h2>
        <PermissionGate perm="crm.write">
          <button onClick={() => setShowCreate(true)} className="bh-btn-primary text-sm">
            + New opportunity
          </button>
        </PermissionGate>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Name</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Account</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Primary contact</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Stage</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Value</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Owner</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Updated</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map(o => {
              const account = o.accountId ? getAccount(o.accountId) : null;
              const contact = o.primaryContactId ? getContact(o.primaryContactId) : null;
              const value   = formatUSD(o.expectedValue);
              return (
                <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <Link to={`/crm/opportunities/${o.id}`} className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
                      {o.name || <span className="italic text-slate-400">Unnamed opportunity</span>}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {account ? (
                      <Link to={`/crm/accounts/${account.id}`} className="text-indigo-600 hover:text-indigo-800">
                        {account.name}
                      </Link>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {contact ? (
                      <Link to={`/crm/contacts/${contact.id}`} className="text-slate-600 hover:text-slate-900">
                        {contact.name}
                      </Link>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={stageBadgeTone(o.stage)}>{stageLabel(o.stage)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700 text-sm">
                    {value ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {o.owner || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDate(o.updatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <OpportunityFormModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
