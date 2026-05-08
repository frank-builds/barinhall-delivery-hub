/**
 * Sprint D2 — /crm/accounts — read-only list view.
 */
import { Link } from 'react-router-dom';
import { useCRM } from '../../hooks/useCRM.js';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function AccountsList() {
  const { accounts, loading, getContactsForAccount, getOpportunitiesForAccount } = useCRM();

  if (loading) {
    return <p className="text-sm text-slate-400 py-10 text-center">Loading accounts…</p>;
  }

  if (accounts.length === 0) {
    return (
      <div className="bh-card px-5 py-10 text-center">
        <p className="text-sm text-slate-400">No accounts yet.</p>
        <p className="text-xs text-slate-400 mt-1">
          Demo records can be loaded via the seed snippet in{' '}
          <code className="font-mono text-xs">0002_crm_lite.sql</code>. Create / edit lands in D3.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">
          Accounts
          <span className="ml-2 text-sm font-normal text-slate-400 tabular-nums">
            {accounts.length}
          </span>
        </h2>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Name</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Industry</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">HQ</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Contacts</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Opportunities</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Updated</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(a => {
              const contactCount     = getContactsForAccount(a.id).length;
              const opportunityCount = getOpportunitiesForAccount(a.id).length;
              return (
                <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <Link to={`/crm/accounts/${a.id}`} className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
                      {a.name || <span className="italic text-slate-400">Unnamed account</span>}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {a.industry || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {a.hqLocation || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-sm tabular-nums text-slate-700">{contactCount}</td>
                  <td className="px-4 py-3 text-center text-sm tabular-nums text-slate-700">{opportunityCount}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDate(a.updatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
