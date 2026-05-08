/**
 * Sprint D2 — /crm — module overview page.
 *
 * Shows three counts and three quick-link cards. No actions.
 * D3 will replace / supplement this with pipeline summaries.
 */
import { Link } from 'react-router-dom';
import { useCRM } from '../../hooks/useCRM.js';
import { CRM_STAGES, stageLabel } from '../../data/crmStages.js';

function StatCard({ count, label, href }) {
  return (
    <Link to={href} className="bh-card bh-card-hover px-4 py-3 text-center block">
      <p className="text-2xl font-bold tabular-nums text-slate-700">{count}</p>
      <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
    </Link>
  );
}

function NavCard({ to, title, description }) {
  return (
    <Link to={to} className="bh-card bh-card-hover px-4 py-4 block group">
      <p className="text-sm font-semibold text-slate-800 mb-0.5 group-hover:text-indigo-700 transition-colors">
        {title} <span className="text-slate-300 ml-0.5">→</span>
      </p>
      <p className="text-xs text-slate-500">{description}</p>
    </Link>
  );
}

export function CRMOverview() {
  const { accounts, contacts, opportunities, loading, schemaMissing } = useCRM();

  if (loading) {
    return <p className="text-sm text-slate-400 py-10 text-center">Loading CRM data…</p>;
  }

  const isEmpty = accounts.length === 0 && contacts.length === 0 && opportunities.length === 0;

  // ── Stage breakdown for opportunities ──
  // Render the stages defined in code so the layout is stable even when no
  // opportunities are present yet.
  const opportunitiesByStage = CRM_STAGES.map(s => ({
    ...s,
    count: opportunities.filter(o => o.stage === s.key).length,
  }));

  return (
    <div className="space-y-8">
      {/* ── Counts strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard count={accounts.length}      label="Accounts"      href="/crm/accounts" />
        <StatCard count={contacts.length}      label="Contacts"      href="/crm/contacts" />
        <StatCard count={opportunities.length} label="Opportunities" href="/crm/opportunities" />
      </div>

      {/* ── Empty-state hint ── */}
      {isEmpty && !schemaMissing && (
        <div className="bh-card px-5 py-6 text-center">
          <p className="text-sm text-slate-500 mb-2">No CRM records yet.</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Apply the demo-seed snippet at the bottom of{' '}
            <code className="font-mono text-xs bg-slate-100 px-1 rounded">supabase/migrations/0002_crm_lite.sql</code>{' '}
            to populate sample accounts, contacts, and opportunities.
            Create / edit flows arrive in Sprint D3.
          </p>
        </div>
      )}

      {/* ── Module sections ── */}
      <section>
        <h2 className="font-semibold text-slate-800 mb-4">Sections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NavCard
            to="/crm/accounts"
            title="Accounts"
            description="Companies in the pipeline."
          />
          <NavCard
            to="/crm/contacts"
            title="Contacts"
            description="People associated with accounts."
          />
          <NavCard
            to="/crm/opportunities"
            title="Opportunities"
            description="Active and historical deals."
          />
        </div>
      </section>

      {/* ── Pipeline stage breakdown (read-only) ── */}
      {opportunities.length > 0 && (
        <section>
          <h2 className="font-semibold text-slate-800 mb-1">Pipeline distribution</h2>
          <p className="text-xs text-slate-400 mb-4">
            Opportunities by stage. Stage transitions arrive in Sprint D3.
          </p>
          <div className="bh-card divide-y divide-slate-100">
            {opportunitiesByStage.map(s => (
              <div key={s.key} className="flex items-center justify-between px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700">{stageLabel(s.key)}</p>
                  <p className="text-xs text-slate-400">{s.group}</p>
                </div>
                <span className="text-sm tabular-nums text-slate-500">{s.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
