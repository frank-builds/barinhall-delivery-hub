/**
 * Sprint D2 + D3 — /crm/accounts/:id — detail page with Edit + create flows.
 *
 * Layout mirrors `EngagementDetail.jsx`: breadcrumb → header → field grid
 * → linked sections (contacts + opportunities). D3 adds an Edit modal on the
 * header and "+ New …" buttons in the linked sections (gated by crm.write).
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCRM } from '../../hooks/useCRM.js';
import { Badge } from '../../components/Badge.jsx';
import { stageLabel, stageBadgeTone } from '../../data/crmStages.js';
import { PermissionGate } from '../../components/PermissionGate.jsx';
import { AccountFormModal } from '../../components/crm/AccountFormModal.jsx';
import { ContactFormModal } from '../../components/crm/ContactFormModal.jsx';
import { OpportunityFormModal } from '../../components/crm/OpportunityFormModal.jsx';

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="bh-section-label">{label}</p>
      <p className="text-sm text-slate-800 mt-0.5 break-words">
        {value || <span className="text-slate-300">—</span>}
      </p>
    </div>
  );
}

export function AccountDetail() {
  const { id } = useParams();
  const { getAccount, getContactsForAccount, getOpportunitiesForAccount, loading } = useCRM();
  const [showEdit,             setShowEdit]             = useState(false);
  const [showAddContact,       setShowAddContact]       = useState(false);
  const [showAddOpportunity,   setShowAddOpportunity]   = useState(false);

  if (loading) {
    return <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>;
  }

  const account = getAccount(id);

  if (!account) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-3">Account not found.</p>
        <Link to="/crm/accounts" className="text-indigo-600 hover:text-indigo-800 text-sm">
          ← Back to Accounts
        </Link>
      </div>
    );
  }

  const contacts      = getContactsForAccount(id);
  const opportunities = getOpportunitiesForAccount(id);

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <Link to="/crm/accounts" className="text-sm text-slate-400 hover:text-slate-600">
          ← Accounts
        </Link>
      </div>

      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-6 gap-4">
        <div className="min-w-0">
          <h1 className="break-words">{account.name || 'Unnamed account'}</h1>
          <p className="text-slate-500 text-sm">{account.industry || 'Industry not set'}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {account.sizeBand && <Badge tone="brand">{account.sizeBand}</Badge>}
          <PermissionGate perm="crm.write">
            <button onClick={() => setShowEdit(true)} className="bh-btn-secondary text-xs py-1 px-3">
              Edit
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* ── Field grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-8">
        <DetailRow label="Industry"   value={account.industry} />
        <DetailRow label="HQ"         value={account.hqLocation} />
        <DetailRow label="Size band"  value={account.sizeBand} />
        <DetailRow
          label="Website"
          value={account.website ? (
            <a href={account.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800">
              {account.website}
            </a>
          ) : ''}
        />
      </div>

      {/* ── Notes ── */}
      {account.notes && (
        <section className="mb-8">
          <p className="bh-section-label mb-2">Notes</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{account.notes}</p>
        </section>
      )}

      {/* ── Linked contacts ── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">
            Contacts
            <span className="ml-2 text-sm font-normal text-slate-400 tabular-nums">{contacts.length}</span>
          </h2>
          <PermissionGate perm="crm.write">
            <button
              onClick={() => setShowAddContact(true)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              + New contact
            </button>
          </PermissionGate>
        </div>
        {contacts.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No contacts linked to this account.</p>
        ) : (
          <div className="space-y-2">
            {contacts.map(c => (
              <Link
                key={c.id}
                to={`/crm/contacts/${c.id}`}
                className="bh-card bh-card-hover px-4 py-3 flex items-center justify-between gap-3 block"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {c.title ? c.title : ''}
                    {c.title && c.email ? ' · ' : ''}
                    {c.email}
                  </p>
                </div>
                <span className="text-slate-300 text-sm flex-shrink-0">→</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Linked opportunities ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">
            Opportunities
            <span className="ml-2 text-sm font-normal text-slate-400 tabular-nums">{opportunities.length}</span>
          </h2>
          <PermissionGate perm="crm.write">
            <button
              onClick={() => setShowAddOpportunity(true)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              + New opportunity
            </button>
          </PermissionGate>
        </div>
        {opportunities.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No opportunities linked to this account.</p>
        ) : (
          <div className="space-y-2">
            {opportunities.map(o => (
              <Link
                key={o.id}
                to={`/crm/opportunities/${o.id}`}
                className="bh-card bh-card-hover px-4 py-3 flex items-center justify-between gap-3 block"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{o.name}</p>
                  <p className="text-xs text-slate-500">
                    {o.owner ? `Owner: ${o.owner}` : 'Owner not set'}
                  </p>
                </div>
                <Badge tone={stageBadgeTone(o.stage)} className="flex-shrink-0">
                  {stageLabel(o.stage)}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Modals ── */}
      <AccountFormModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        account={account}
      />
      <ContactFormModal
        open={showAddContact}
        onClose={() => setShowAddContact(false)}
        defaultAccountId={account.id}
      />
      <OpportunityFormModal
        open={showAddOpportunity}
        onClose={() => setShowAddOpportunity(false)}
        defaultAccountId={account.id}
      />
    </div>
  );
}
