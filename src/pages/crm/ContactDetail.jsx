/**
 * Sprint D2 + D3 — /crm/contacts/:id — detail page with Edit modal.
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCRM } from '../../hooks/useCRM.js';
import { Badge } from '../../components/Badge.jsx';
import { stageLabel, stageBadgeTone } from '../../data/crmStages.js';
import { PermissionGate } from '../../components/PermissionGate.jsx';
import { ContactFormModal } from '../../components/crm/ContactFormModal.jsx';

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

export function ContactDetail() {
  const { id } = useParams();
  const { getContact, getAccount, getOpportunitiesForContact, loading } = useCRM();
  const [showEdit, setShowEdit] = useState(false);

  if (loading) {
    return <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>;
  }

  const contact = getContact(id);

  if (!contact) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-3">Contact not found.</p>
        <Link to="/crm/contacts" className="text-indigo-600 hover:text-indigo-800 text-sm">
          ← Back to Contacts
        </Link>
      </div>
    );
  }

  const account       = contact.accountId ? getAccount(contact.accountId) : null;
  const opportunities = getOpportunitiesForContact(id);

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <Link to="/crm/contacts" className="text-sm text-slate-400 hover:text-slate-600">
          ← Contacts
        </Link>
      </div>

      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-6 gap-4">
        <div className="min-w-0">
          <h1 className="break-words">{contact.name || 'Unnamed contact'}</h1>
          <p className="text-slate-500 text-sm">{contact.title || 'Title not set'}</p>
        </div>
        <PermissionGate perm="crm.write">
          <button onClick={() => setShowEdit(true)} className="bh-btn-secondary text-xs py-1 px-3 flex-shrink-0">
            Edit
          </button>
        </PermissionGate>
      </div>

      {/* ── Field grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-8">
        <DetailRow
          label="Email"
          value={contact.email ? (
            <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:text-indigo-800">
              {contact.email}
            </a>
          ) : ''}
        />
        <DetailRow label="Phone" value={contact.phone} />
        <DetailRow label="Title" value={contact.title} />
        <div>
          <p className="bh-section-label">Account</p>
          {account ? (
            <Link to={`/crm/accounts/${account.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 mt-0.5 block">
              {account.name}
            </Link>
          ) : (
            <p className="text-sm text-slate-300 mt-0.5">—</p>
          )}
        </div>
      </div>

      {/* ── Notes ── */}
      {contact.notes && (
        <section className="mb-8">
          <p className="bh-section-label mb-2">Notes</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{contact.notes}</p>
        </section>
      )}

      {/* ── Opportunities involving this contact ── */}
      <section>
        <h2 className="font-semibold text-slate-800 mb-3">
          Opportunities
          <span className="ml-2 text-sm font-normal text-slate-400 tabular-nums">{opportunities.length}</span>
        </h2>
        {opportunities.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            No opportunities list this contact as the primary contact.
          </p>
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

      {/* ── Edit modal ── */}
      <ContactFormModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        contact={contact}
      />
    </div>
  );
}
