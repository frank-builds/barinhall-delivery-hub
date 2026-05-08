/**
 * Sprint D2 — /crm/contacts — read-only list view.
 */
import { Link } from 'react-router-dom';
import { useCRM } from '../../hooks/useCRM.js';

export function ContactsList() {
  const { contacts, loading, getAccount } = useCRM();

  if (loading) {
    return <p className="text-sm text-slate-400 py-10 text-center">Loading contacts…</p>;
  }

  if (contacts.length === 0) {
    return (
      <div className="bh-card px-5 py-10 text-center">
        <p className="text-sm text-slate-400">No contacts yet.</p>
        <p className="text-xs text-slate-400 mt-1">
          Demo records can be loaded via the seed snippet in{' '}
          <code className="font-mono text-xs">0002_crm_lite.sql</code>. Create / edit lands in D3.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-slate-800">
        Contacts
        <span className="ml-2 text-sm font-normal text-slate-400 tabular-nums">
          {contacts.length}
        </span>
      </h2>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Name</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Title</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Account</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Email</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Phone</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(c => {
              const account = c.accountId ? getAccount(c.accountId) : null;
              return (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <Link to={`/crm/contacts/${c.id}`} className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
                      {c.name || <span className="italic text-slate-400">Unnamed contact</span>}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {c.title || <span className="text-slate-300">—</span>}
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
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {c.email ? (
                      <a href={`mailto:${c.email}`} className="hover:text-slate-900">{c.email}</a>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {c.phone || <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
