/**
 * Sprint D2 + D3 — /crm/opportunities/:id — detail page.
 *
 * D3 additions:
 *   - Edit button (gated by crm.write) opens OpportunityFormModal in edit mode.
 *   - StageControl: badge + (gated) <select> for changing stage in place.
 *   - NotesLog: append-only opportunity activity, reusing the engagement
 *     NotesLog component with `readOnly={!can('crm.write')}`.
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useAuthz } from '../../hooks/useAuthz.js';
import { useCRM } from '../../hooks/useCRM.js';
import { Badge } from '../../components/Badge.jsx';
import { CRM_STAGES, stageLabel, stageBadgeTone } from '../../data/crmStages.js';
import { PermissionGate } from '../../components/PermissionGate.jsx';
import { NotesLog } from '../../components/NotesLog.jsx';
import { OpportunityFormModal } from '../../components/crm/OpportunityFormModal.jsx';

/**
 * Inline stage control: shows the current stage as a Badge, plus a <select>
 * gated by crm.write so users without the permission see only the badge.
 * Mirrors the StatusControl pattern on EngagementDetail.
 */
function StageControl({ opportunity, onChange }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <Badge tone={stageBadgeTone(opportunity.stage)} className="flex-shrink-0">
        {stageLabel(opportunity.stage)}
      </Badge>
      <PermissionGate perm="crm.write">
        <select
          value={opportunity.stage}
          onChange={e => onChange(e.target.value)}
          className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-300 cursor-pointer"
          aria-label="Change stage"
        >
          {CRM_STAGES.map(s => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </PermissionGate>
    </div>
  );
}

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

function formatDate(iso) {
  if (!iso) return '';
  // expectedCloseDate is a date-only string (YYYY-MM-DD); avoid timezone shift
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function OpportunityDetail() {
  const { id } = useParams();
  const {
    getOpportunity, getAccount, getContact,
    updateOpportunity, addOpportunityNote, updateOpportunityNote,
    loading,
  } = useCRM();
  const { user } = useAuth();
  const { can } = useAuthz();
  const [showEdit, setShowEdit] = useState(false);

  if (loading) {
    return <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>;
  }

  const opportunity = getOpportunity(id);

  if (!opportunity) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-3">Opportunity not found.</p>
        <Link to="/crm/opportunities" className="text-indigo-600 hover:text-indigo-800 text-sm">
          ← Back to Opportunities
        </Link>
      </div>
    );
  }

  const account = opportunity.accountId        ? getAccount(opportunity.accountId)        : null;
  const contact = opportunity.primaryContactId ? getContact(opportunity.primaryContactId) : null;
  const value   = formatUSD(opportunity.expectedValue);
  const closeDt = formatDate(opportunity.expectedCloseDate);

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <Link to="/crm/opportunities" className="text-sm text-slate-400 hover:text-slate-600">
          ← Opportunities
        </Link>
      </div>

      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-6 gap-4">
        <div className="min-w-0">
          <h1 className="break-words">{opportunity.name || 'Unnamed opportunity'}</h1>
          {account ? (
            <p className="text-slate-500 text-sm">
              <Link to={`/crm/accounts/${account.id}`} className="hover:text-slate-800">
                {account.name}
              </Link>
            </p>
          ) : (
            <p className="text-slate-400 text-sm italic">No account linked</p>
          )}
        </div>
        <div className="flex items-start gap-3 flex-shrink-0">
          <StageControl
            opportunity={opportunity}
            onChange={newStage => updateOpportunity(opportunity.id, { stage: newStage })}
          />
          <PermissionGate perm="crm.write">
            <button onClick={() => setShowEdit(true)} className="bh-btn-secondary text-xs py-1 px-3">
              Edit
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* ── Field grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-8">
        <DetailRow label="Owner"           value={opportunity.owner} />
        <DetailRow label="Source"          value={opportunity.source} />
        <DetailRow label="Expected value"  value={value} />
        <DetailRow label="Expected close"  value={closeDt} />
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
        <div>
          <p className="bh-section-label">Primary contact</p>
          {contact ? (
            <Link to={`/crm/contacts/${contact.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 mt-0.5 block">
              {contact.name}
            </Link>
          ) : (
            <p className="text-sm text-slate-300 mt-0.5">—</p>
          )}
        </div>
      </div>

      {/* ── Summary notes (from the form) ── */}
      {opportunity.notes && (
        <section className="mb-4">
          <p className="bh-section-label mb-2">Summary</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{opportunity.notes}</p>
        </section>
      )}

      {/* ── Activity notes log ── */}
      <NotesLog
        entries={opportunity.notesLog ?? []}
        defaultOwner={user?.email ?? ''}
        onAdd={fields => addOpportunityNote(opportunity.id, fields)}
        onUpdate={(noteId, fields) => updateOpportunityNote(opportunity.id, noteId, fields)}
        readOnly={!can('crm.write')}
      />

      {/* ── Edit modal ── */}
      <OpportunityFormModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        opportunity={opportunity}
      />
    </div>
  );
}
