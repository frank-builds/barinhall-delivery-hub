/**
 * Sprint D2 — /crm/opportunities/:id — read-only detail page.
 *
 * Stage is rendered as a Badge only. Stage transitions and edit forms
 * arrive in Sprint D3.
 */
import { Link, useParams } from 'react-router-dom';
import { useCRM } from '../../hooks/useCRM.js';
import { Badge } from '../../components/Badge.jsx';
import { stageLabel, stageBadgeTone } from '../../data/crmStages.js';

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
  const { getOpportunity, getAccount, getContact, loading } = useCRM();

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
        <Badge tone={stageBadgeTone(opportunity.stage)} className="flex-shrink-0">
          {stageLabel(opportunity.stage)}
        </Badge>
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

      {/* ── Notes ── */}
      {opportunity.notes && (
        <section className="mb-4">
          <p className="bh-section-label mb-2">Notes</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{opportunity.notes}</p>
        </section>
      )}

      <p className="text-xs text-slate-400 mt-8">
        Stage transitions, notes/activity, and edit flows arrive in Sprint D3.
      </p>
    </div>
  );
}
