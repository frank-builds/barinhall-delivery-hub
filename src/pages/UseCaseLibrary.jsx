import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEngagements } from '../hooks/useEngagements.js';
import {
  USE_CASES,
  USE_CASE_CATEGORIES,
  COMPLEXITY_LEVELS,
  TIME_TO_VALUE_OPTIONS,
  MATURITY_LEVELS,
  CATEGORY_BADGE_CLASSES,
  COMPLEXITY_BADGE_CLASSES,
} from '../data/useCaseLibrary.js';
import { SERVICES } from '../data/services.js';
import { effectiveStatus } from '../lib/statusUtils.js';

// ── Visual design maps ────────────────────────────────────────────────────────

const MATURITY_COLORS = {
  Exploring:  'bg-slate-100 text-slate-600 border-slate-200',
  Developing: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  Advanced:   'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function CategoryBadge({ category }) {
  const cls = CATEGORY_BADGE_CLASSES[category] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  return <span className={`bh-badge ${cls}`}>{category}</span>;
}

function ComplexityChip({ complexity }) {
  const cls = COMPLEXITY_BADGE_CLASSES[complexity] ?? 'bg-slate-100 text-slate-500 border-slate-200';
  return <span className={`bh-badge ${cls}`}>{complexity}</span>;
}

function MaturityChip({ level }) {
  const cls = MATURITY_COLORS[level] ?? 'bg-slate-100 text-slate-500 border-slate-200';
  return <span className={`bh-badge ${cls}`}>{level}</span>;
}

// ── Use case card (grid / compact list mode) ──────────────────────────────────

function UseCaseCard({ uc, compact = false, selected = false, onClick }) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
          selected
            ? 'bg-indigo-50 border-indigo-300'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <p className={`text-sm font-medium leading-snug mb-1 ${selected ? 'text-indigo-900' : 'text-slate-800'}`}>
          {uc.title}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <CategoryBadge category={uc.category} />
          <ComplexityChip complexity={uc.complexity} />
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="bh-card bh-card-hover w-full text-left px-4 py-4 flex flex-col gap-2.5 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <CategoryBadge category={uc.category} />
        <ComplexityChip complexity={uc.complexity} />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 leading-snug">{uc.title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{uc.summary}</p>
      <div className="flex items-center gap-2 flex-wrap pt-0.5">
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
          {uc.timeToValue}
        </span>
        <span className="text-slate-200">·</span>
        <MaturityChip level={uc.maturityLevel} />
      </div>
    </button>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="bh-section-label mb-1.5">{children}</p>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Chip({ label, muted = false }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      muted
        ? 'bg-slate-50 text-slate-500 border-slate-200'
        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
    }`}>
      {label}
    </span>
  );
}

function StatBlock({ label, value, colorClass = 'text-slate-800' }) {
  return (
    <div className="text-center px-4 py-3 rounded-lg bg-slate-50 border border-slate-100 flex-1">
      <p className={`text-sm font-semibold ${colorClass}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function UseCaseDetail({ uc, engagements, onAddToEngagement }) {
  const [selectedEngId, setSelectedEngId] = useState('');
  const [addSuccess,    setAddSuccess]    = useState('');
  const [addError,      setAddError]      = useState('');

  const activeEngagements = engagements.filter(
    e => effectiveStatus(e) === 'Active' || effectiveStatus(e) === 'Draft'
  );

  const alreadyLinked = engagements
    .filter(e => (e.candidateUseCases ?? []).includes(uc.id))
    .map(e => e.clientName);

  function handleAdd() {
    if (!selectedEngId) {
      setAddError('Please select an engagement.');
      return;
    }
    const eng = engagements.find(e => e.id === selectedEngId);
    if (!eng) return;

    if ((eng.candidateUseCases ?? []).includes(uc.id)) {
      setAddError(`Already added to ${eng.clientName}.`);
      return;
    }

    onAddToEngagement(selectedEngId, uc.id);
    setAddSuccess(`Added to ${eng.clientName}`);
    setAddError('');
    setSelectedEngId('');
    setTimeout(() => setAddSuccess(''), 4000);
  }

  const serviceLabels = uc.recommendedServices
    .map(k => SERVICES.find(s => s.key === k)?.label ?? k);

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-2.5">
          <CategoryBadge category={uc.category} />
          <ComplexityChip complexity={uc.complexity} />
          <MaturityChip level={uc.maturityLevel} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 leading-snug mb-2">{uc.title}</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{uc.summary}</p>
      </div>

      {/* ── Stats row ── */}
      <div className="flex gap-2">
        <StatBlock label="Complexity"   value={uc.complexity}   colorClass={
          uc.complexity === 'Low' ? 'text-emerald-700' :
          uc.complexity === 'High' ? 'text-red-700' : 'text-amber-700'
        } />
        <StatBlock label="Time to Value" value={uc.timeToValue} colorClass="text-slate-800" />
        <StatBlock label="Maturity"      value={uc.maturityLevel} colorClass={
          uc.maturityLevel === 'Advanced' ? 'text-emerald-700' :
          uc.maturityLevel === 'Developing' ? 'text-indigo-700' : 'text-slate-600'
        } />
      </div>

      {/* ── Business problem ── */}
      <div>
        <SectionLabel>Business Problem</SectionLabel>
        <p className="text-sm text-slate-700 leading-relaxed">{uc.painPoint}</p>
      </div>

      {/* ── Workflow improved ── */}
      <div>
        <SectionLabel>Workflow / Process Improved</SectionLabel>
        <p className="text-sm text-slate-700">{uc.workflowImproved}</p>
      </div>

      {/* ── Expected outcomes ── */}
      <div>
        <SectionLabel>Expected Outcomes</SectionLabel>
        <BulletList items={uc.expectedOutcomes} />
      </div>

      {/* ── Data ── */}
      <div>
        <SectionLabel>Data Sources Required</SectionLabel>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {uc.dataSourcesRequired.map(ds => (
            <Chip key={ds} label={ds} muted />
          ))}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-medium text-slate-600">Data readiness: </span>
          {uc.dataReadiness}
        </p>
      </div>

      {/* ── Risk ── */}
      <div>
        <SectionLabel>Risks & Governance Considerations</SectionLabel>
        <p className="text-sm text-slate-700 leading-relaxed">{uc.riskConsiderations}</p>
      </div>

      {/* ── Industry tags ── */}
      <div>
        <SectionLabel>Relevant Industries</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {uc.industryTags.map(t => (
            <Chip key={t} label={t} muted />
          ))}
        </div>
      </div>

      {/* ── Barinhall services ── */}
      <div>
        <SectionLabel>Recommended Barinhall Services</SectionLabel>
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {serviceLabels.map(lbl => (
            <Chip key={lbl} label={lbl} />
          ))}
        </div>
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-600">Suggested next step: </span>
          {uc.suggestedNextStep}
        </p>
      </div>

      {/* ── Consultant notes ── */}
      <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
        <SectionLabel>Consultant Notes</SectionLabel>
        <p className="text-sm text-amber-900 leading-relaxed">{uc.notes}</p>
      </div>

      {/* ── Add to engagement ── */}
      <div className="border-t border-slate-100 pt-5">
        <SectionLabel>Add to Engagement</SectionLabel>

        {alreadyLinked.length > 0 && (
          <p className="text-xs text-indigo-600 mb-2">
            ✓ Already added to: {alreadyLinked.join(', ')}
          </p>
        )}

        {activeEngagements.length === 0 ? (
          <p className="text-xs text-slate-400">
            No active or draft engagements.{' '}
            <Link to="/engagements/new" className="text-indigo-600 hover:underline">
              Create one →
            </Link>
          </p>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedEngId}
              onChange={e => { setSelectedEngId(e.target.value); setAddError(''); }}
              className="bh-input flex-1 min-w-0 text-xs py-1.5"
            >
              <option value="">Select engagement…</option>
              {activeEngagements.map(e => (
                <option key={e.id} value={e.id}>
                  {e.clientName}{e.company ? ` · ${e.company}` : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              className="bh-btn-primary py-1.5 text-xs flex-shrink-0"
            >
              Add
            </button>
          </div>
        )}

        {addError   && <p className="text-xs text-red-500 mt-1.5">{addError}</p>}
        {addSuccess && (
          <p className="text-xs text-emerald-600 mt-1.5 font-medium">✓ {addSuccess}</p>
        )}
      </div>

    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function UseCaseLibrary() {
  const { engagements, updateEngagementFields } = useEngagements();

  const [query,             setQuery]             = useState('');
  const [filterCategory,    setFilterCategory]    = useState('');
  const [filterComplexity,  setFilterComplexity]  = useState('');
  const [filterTimeToValue, setFilterTimeToValue] = useState('');
  const [filterMaturity,    setFilterMaturity]    = useState('');
  const [selectedId,        setSelectedId]        = useState(null);

  function addCandidateUseCase(engagementId, useCaseId) {
    const eng = engagements.find(e => e.id === engagementId);
    if (!eng) return;
    const existing = eng.candidateUseCases ?? [];
    if (existing.includes(useCaseId)) return;
    updateEngagementFields(engagementId, {
      candidateUseCases: [...existing, useCaseId],
    });
  }

  const hasFilters =
    query || filterCategory || filterComplexity || filterTimeToValue || filterMaturity;

  function clearFilters() {
    setQuery('');
    setFilterCategory('');
    setFilterComplexity('');
    setFilterTimeToValue('');
    setFilterMaturity('');
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return USE_CASES.filter(uc => {
      if (filterCategory    && uc.category      !== filterCategory)    return false;
      if (filterComplexity  && uc.complexity    !== filterComplexity)  return false;
      if (filterTimeToValue && uc.timeToValue   !== filterTimeToValue) return false;
      if (filterMaturity    && uc.maturityLevel !== filterMaturity)    return false;
      if (!q) return true;
      return (
        uc.title.toLowerCase().includes(q)          ||
        uc.summary.toLowerCase().includes(q)        ||
        uc.painPoint.toLowerCase().includes(q)      ||
        uc.category.toLowerCase().includes(q)       ||
        uc.industryTags.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [query, filterCategory, filterComplexity, filterTimeToValue, filterMaturity]);

  const selectedUc = selectedId ? USE_CASES.find(uc => uc.id === selectedId) : null;
  const detailOpen = !!selectedUc;

  return (
    <div>

      {/* ── Page header ── */}
      <div className="mb-6">
        <h1>Solutions Use Case Library</h1>
        <p className="text-sm text-slate-500 mt-1">
          {USE_CASES.length} use cases across {USE_CASE_CATEGORIES.length} business functions ·{' '}
          Browse, filter, and connect to client engagements
        </p>
      </div>

      {/* ── Search + filters ── */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by keyword, problem, or industry…"
            className="bh-input pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bh-input text-xs py-1.5 w-auto"
        >
          <option value="">All categories</option>
          {USE_CASE_CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filterComplexity}
          onChange={e => setFilterComplexity(e.target.value)}
          className="bh-input text-xs py-1.5 w-auto"
        >
          <option value="">Any complexity</option>
          {COMPLEXITY_LEVELS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filterTimeToValue}
          onChange={e => setFilterTimeToValue(e.target.value)}
          className="bh-input text-xs py-1.5 w-auto"
        >
          <option value="">Any time-to-value</option>
          {TIME_TO_VALUE_OPTIONS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={filterMaturity}
          onChange={e => setFilterMaturity(e.target.value)}
          className="bh-input text-xs py-1.5 w-auto"
        >
          <option value="">Any maturity level</option>
          {MATURITY_LEVELS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="bh-btn-ghost text-xs py-1.5"
          >
            Clear filters ×
          </button>
        )}
      </div>

      {/* ── Result count ── */}
      <p className="text-xs text-slate-400 mb-4">
        Showing {filtered.length} of {USE_CASES.length} use cases
        {hasFilters ? ' · filters active' : ''}
      </p>

      {/* ── Content area: grid or split ── */}
      {filtered.length === 0 ? (
        <div className="bh-card px-6 py-12 text-center">
          <p className="text-slate-400 text-sm mb-2">No use cases match your filters.</p>
          <button type="button" onClick={clearFilters} className="bh-btn-ghost text-xs">
            Clear filters
          </button>
        </div>
      ) : detailOpen ? (
        /* ── Split view: compact list + detail panel ── */
        <div className="flex gap-4 items-start">

          {/* Left: compact card list */}
          <div className="w-64 flex-shrink-0 space-y-1.5">
            {filtered.map(uc => (
              <UseCaseCard
                key={uc.id}
                uc={uc}
                compact
                selected={uc.id === selectedId}
                onClick={() => setSelectedId(uc.id)}
              />
            ))}
          </div>

          {/* Right: detail panel */}
          <div className="flex-1 min-w-0">
            <div className="bh-card px-6 py-6">
              <div className="flex items-center justify-between mb-5">
                <p className="bh-section-label">Use Case Detail</p>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="bh-btn-ghost text-xs py-1"
                  aria-label="Close detail panel"
                >
                  ✕ Close
                </button>
              </div>
              <UseCaseDetail
                key={selectedId}
                uc={selectedUc}
                engagements={engagements}
                onAddToEngagement={addCandidateUseCase}
              />
            </div>
          </div>

        </div>
      ) : (
        /* ── Grid view ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(uc => (
            <UseCaseCard
              key={uc.id}
              uc={uc}
              onClick={() => setSelectedId(uc.id)}
            />
          ))}
        </div>
      )}

    </div>
  );
}
