import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEngagements } from '../hooks/useEngagements.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { saveEngagement } from '../lib/engagementsApi.js';
import { EngagementCard } from '../components/EngagementCard.jsx';
import { KanbanBoard } from '../components/KanbanBoard.jsx';
import { SERVICES } from '../data/services.js';
import { effectiveStatus } from '../lib/statusUtils.js';

const LOCAL_KEY      = 'barinhall_engagements';
const VIEW_KEY       = 'barinhall_dashboard_view';
const ALL_STATUSES   = ['Draft', 'Active', 'On Hold', 'Completed'];

// Status-specific accent colours for stat cards
const STAT_ACCENTS = {
  Draft:      'text-slate-700',
  Active:     'text-emerald-600',
  'On Hold':  'text-amber-600',
  Completed:  'text-sky-600',
};

// ── Stat bar ──────────────────────────────────────────────────────────────────
function StatBar({ engagements }) {
  const counts = ALL_STATUSES.map(s => ({
    label: s,
    count: engagements.filter(e => effectiveStatus(e) === s).length,
    accent: STAT_ACCENTS[s] ?? 'text-slate-700',
  }));
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {counts.map(({ label, count, accent }) => (
        <div key={label} className="bh-card px-4 py-3 text-center">
          <p className={`text-2xl font-bold tabular-nums ${accent}`}>{count}</p>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ── View-toggle icon buttons ───────────────────────────────────────────────────
function ViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-1">
      <button
        onClick={() => onChange('grid')}
        title="Grid view"
        className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-card text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <rect x="1" y="1" width="6" height="6" rx="1"/>
          <rect x="9" y="1" width="6" height="6" rx="1"/>
          <rect x="1" y="9" width="6" height="6" rx="1"/>
          <rect x="9" y="9" width="6" height="6" rx="1"/>
        </svg>
      </button>
      <button
        onClick={() => onChange('kanban')}
        title="Kanban view"
        className={`p-1.5 rounded-md transition-colors ${view === 'kanban' ? 'bg-white shadow-card text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <rect x="1"  y="1" width="3" height="14" rx="1"/>
          <rect x="5"  y="1" width="3" height="10" rx="1"/>
          <rect x="9"  y="1" width="3" height="12" rx="1"/>
          <rect x="13" y="1" width="3" height="8"  rx="1"/>
        </svg>
      </button>
    </div>
  );
}

export function Dashboard() {
  const { engagements, loading } = useEngagements();
  const { user } = useAuth();

  // ── Migration state ──
  const [migrating, setMigrating] = useState(false);
  const [migrated,  setMigrated]  = useState(false);

  // ── Filter state ──
  const [query,      setQuery]      = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');

  // ── View preference (grid | kanban), persisted ──
  // Kanban is the intended primary experience; fall back to it when no
  // preference has been stored yet (first load, cleared storage, new device).
  const [view, setView] = useState(() => localStorage.getItem(VIEW_KEY) ?? 'kanban');

  function handleViewChange(v) {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  }

  // ── Migration ──
  const localData = useMemo(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);
  const hasMigratable = Array.isArray(localData) && localData.length > 0 && !migrated;

  async function handleMigrate() {
    if (!user || !localData) return;
    setMigrating(true);
    try {
      await Promise.all(localData.map(eng => saveEngagement(eng, user.id)));
      localStorage.removeItem(LOCAL_KEY);
      setMigrated(true);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Migration failed: ' + err.message);
    } finally {
      setMigrating(false);
    }
  }

  // ── Filtered set ──
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return engagements.filter(e => {
      const matchesQuery = !q || [e.clientName, e.company, e.owner]
        .some(f => f?.toLowerCase().includes(q));
      const matchesStatus  = statusFilter  === 'All' || effectiveStatus(e) === statusFilter;
      const svcKeys = e.serviceTypes ?? (e.serviceType ? [e.serviceType] : []);
      const matchesService = serviceFilter === 'All' || svcKeys.includes(serviceFilter);
      return matchesQuery && matchesStatus && matchesService;
    });
  }, [engagements, query, statusFilter, serviceFilter]);

  const hasActiveFilters = query !== '' || statusFilter !== 'All' || serviceFilter !== 'All';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
        Loading engagements…
      </div>
    );
  }

  return (
    <div>
      {/* ── Migration banner ── */}
      {hasMigratable && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5 flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800">
            You have <strong>{localData.length}</strong> engagement{localData.length !== 1 ? 's' : ''} stored locally.
            Migrate them to the cloud to access them on any device.
          </p>
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="flex-shrink-0 bg-amber-600 text-white text-sm font-medium rounded-lg px-3 py-1.5 hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {migrating ? 'Migrating…' : 'Migrate now'}
          </button>
        </div>
      )}

      {/* ── Page header ── */}
      <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
        <div>
          <h1>Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {engagements.length} engagement{engagements.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/engagements/new" className="bh-btn-primary">
          + New Engagement
        </Link>
      </div>

      {/* ── Stat bar ── */}
      {engagements.length > 0 && <StatBar engagements={engagements} />}

      {/* ── Search / filters / view toggle ── */}
      {engagements.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          {/* Search input */}
          <input
            type="text"
            placeholder="Search by client, company, or owner…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="bh-input flex-1 min-w-[200px] py-1.5"
          />

          {/* Status filter chips */}
          <div className="flex flex-wrap gap-1">
            {['All', ...ALL_STATUSES].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Service dropdown */}
          <select
            value={serviceFilter}
            onChange={e => setServiceFilter(e.target.value)}
            className="bh-input w-auto text-xs py-1.5"
          >
            <option value="All">All services</option>
            {SERVICES.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>

          {/* Clear link */}
          {hasActiveFilters && (
            <button
              onClick={() => { setQuery(''); setStatusFilter('All'); setServiceFilter('All'); }}
              className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
            >
              Clear
            </button>
          )}

          <div className="ml-auto">
            <ViewToggle view={view} onChange={handleViewChange} />
          </div>
        </div>
      )}

      {/* ── Empty states ── */}
      {engagements.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-slate-400 mb-1">No engagements yet</p>
          <Link to="/engagements/new" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
            Create your first engagement →
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-slate-400 mb-2">No engagements match your filters.</p>
          <button
            onClick={() => { setQuery(''); setStatusFilter('All'); setServiceFilter('All'); }}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard engagements={filtered} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(e => (
            <EngagementCard key={e.id} engagement={e} />
          ))}
        </div>
      )}
    </div>
  );
}
