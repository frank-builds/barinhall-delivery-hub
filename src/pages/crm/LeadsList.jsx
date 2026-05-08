/**
 * Sprint D4 — /crm/leads — list view with filters, create, and import.
 *
 * Filter pattern mirrors the Dashboard exactly: search input + chip filter
 * (source) + select filters (status, fit, tier) + Clear link. All filtering
 * is client-side; the leads array stays small enough for JS filter to feel
 * instant.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCRM } from '../../hooks/useCRM.js';
import { PermissionGate } from '../../components/PermissionGate.jsx';
import { Badge } from '../../components/Badge.jsx';
import { LeadFormModal }   from '../../components/crm/LeadFormModal.jsx';
import { LeadImportModal } from '../../components/crm/LeadImportModal.jsx';
import { LeadScoreBadge }  from '../../components/crm/LeadScoreBadge.jsx';
import { CRM_LEAD_SOURCES, sourceLabel } from '../../data/crmLeadSources.js';
import { CRM_LEAD_STATUSES, statusLabel, statusBadgeTone } from '../../data/crmLeadStatuses.js';
import { scoreLead } from '../../data/crmLeadScoring.js';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const FIT_OPTIONS  = ['All', 'hot', 'warm', 'cold'];
const TIER_OPTIONS = ['All', 'hot', 'warm', 'cold'];

export function LeadsList() {
  const { leads, loading } = useCRM();

  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const [query,        setQuery]        = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fitFilter,    setFitFilter]    = useState('All');
  const [tierFilter,   setTierFilter]   = useState('All');

  const hasActiveFilters =
    query !== '' ||
    sourceFilter !== 'All' ||
    statusFilter !== 'All' ||
    fitFilter !== 'All' ||
    tierFilter !== 'All';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter(l => {
      if (q) {
        const hay = [l.name, l.email, l.company, l.industry]
          .filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (sourceFilter !== 'All' && l.source     !== sourceFilter) return false;
      if (statusFilter !== 'All' && l.status     !== statusFilter) return false;
      if (fitFilter    !== 'All' && l.fitRating  !== fitFilter)    return false;
      if (tierFilter   !== 'All') {
        const { tier } = scoreLead(l);
        if (tier !== tierFilter) return false;
      }
      return true;
    });
  }, [leads, query, sourceFilter, statusFilter, fitFilter, tierFilter]);

  function clearFilters() {
    setQuery('');
    setSourceFilter('All');
    setStatusFilter('All');
    setFitFilter('All');
    setTierFilter('All');
  }

  if (loading) {
    return <p className="text-sm text-slate-400 py-10 text-center">Loading leads…</p>;
  }

  // ── Empty state ──
  if (leads.length === 0) {
    return (
      <>
        <div className="bh-card px-5 py-10 text-center">
          <p className="text-sm text-slate-400 mb-3">No leads yet.</p>
          <PermissionGate
            perm="crm.write"
            fallback={
              <p className="text-xs text-slate-400">
                Demo records can be loaded via the seed snippet in{' '}
                <code className="font-mono text-xs">0003_crm_leads.sql</code>.
              </p>
            }
          >
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setShowCreate(true)} className="bh-btn-primary text-sm">
                + New lead
              </button>
              <button onClick={() => setShowImport(true)} className="bh-btn-secondary text-sm">
                Import leads
              </button>
            </div>
          </PermissionGate>
        </div>
        <LeadFormModal   open={showCreate} onClose={() => setShowCreate(false)} />
        <LeadImportModal open={showImport} onClose={() => setShowImport(false)} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">
          Leads
          <span className="ml-2 text-sm font-normal text-slate-400 tabular-nums">
            {leads.length}
          </span>
          {hasActiveFilters && filtered.length !== leads.length && (
            <span className="ml-2 text-xs font-normal text-slate-400">
              ({filtered.length} matching)
            </span>
          )}
        </h2>
        <PermissionGate perm="crm.write">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImport(true)} className="bh-btn-secondary text-sm">
              Import
            </button>
            <button onClick={() => setShowCreate(true)} className="bh-btn-primary text-sm">
              + New lead
            </button>
          </div>
        </PermissionGate>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search by name, email, company…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="bh-input flex-1 min-w-[200px] py-1.5"
        />
        <div className="flex flex-wrap gap-1">
          {['All', ...CRM_LEAD_SOURCES.map(s => s.key)].map(s => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                sourceFilter === s
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {s === 'All' ? 'All sources' : sourceLabel(s)}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bh-input w-auto text-xs py-1.5"
          aria-label="Filter by status"
        >
          <option value="All">All statuses</option>
          {CRM_LEAD_STATUSES.map(s => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <select
          value={fitFilter}
          onChange={e => setFitFilter(e.target.value)}
          className="bh-input w-auto text-xs py-1.5"
          aria-label="Filter by fit rating"
        >
          {FIT_OPTIONS.map(f => (
            <option key={f} value={f}>{f === 'All' ? 'All fits' : f}</option>
          ))}
        </select>
        <select
          value={tierFilter}
          onChange={e => setTierFilter(e.target.value)}
          className="bh-input w-auto text-xs py-1.5"
          aria-label="Filter by score tier"
        >
          {TIER_OPTIONS.map(t => (
            <option key={t} value={t}>{t === 'All' ? 'All tiers' : `${t} tier`}</option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-slate-400 mb-2">No leads match your filters.</p>
          <button onClick={clearFilters} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Company</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Source</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Fit</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Score</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <Link to={`/crm/leads/${lead.id}`} className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
                      {lead.name || <span className="italic text-slate-400">Unnamed lead</span>}
                    </Link>
                    {lead.email && (
                      <p className="text-xs text-slate-500 truncate">{lead.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {lead.company || <span className="text-slate-300">—</span>}
                    {lead.title && (
                      <p className="text-xs text-slate-400">{lead.title}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm">{sourceLabel(lead.source)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusBadgeTone(lead.status)}>{statusLabel(lead.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {lead.fitRating || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <LeadScoreBadge lead={lead} />
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {formatDate(lead.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modals ── */}
      <LeadFormModal   open={showCreate} onClose={() => setShowCreate(false)} />
      <LeadImportModal open={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
}
