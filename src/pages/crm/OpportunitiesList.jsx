/**
 * Sprint D2 — /crm/opportunities — read-only list view.
 *
 * No board view in D2. The list shows stage as a badge and links to detail.
 */
import { Link } from 'react-router-dom';
import { useCRM } from '../../hooks/useCRM.js';
import { Badge } from '../../components/Badge.jsx';
import { stageLabel, stageBadgeTone } from '../../data/crmStages.js';

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

  if (loading) {
    return <p className="text-sm text-slate-400 py-10 text-center">Loading opportunities…</p>;
  }

  if (opportunities.length === 0) {
    return (
      <div className="bh-card px-5 py-10 text-center">
        <p className="text-sm text-slate-400">No opportunities yet.</p>
        <p className="text-xs text-slate-400 mt-1">
          Demo records can be loaded via the seed snippet in{' '}
          <code className="font-mono text-xs">0002_crm_lite.sql</code>. Create / edit and pipeline workflow land in D3.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-slate-800">
        Opportunities
        <span className="ml-2 text-sm font-normal text-slate-400 tabular-nums">
          {opportunities.length}
        </span>
      </h2>

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
    </div>
  );
}
