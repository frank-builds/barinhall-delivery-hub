// ── UseCasePicker ─────────────────────────────────────────────────────────────
//
// Reusable modal for browsing and adding library use cases to any context that
// maintains a list of candidateUseCases.
//
// Props
//   open            boolean         — render the modal when true
//   engagementName  string          — displayed in the modal subtitle
//   addedIds        Set<string>     — use case IDs already attached (for dupe prevention)
//   onAdd           (id) => void    — called immediately when user clicks Add
//   onClose         () => void      — called when user closes the modal
//
// Reuse notes
//   Pass any addedIds set and any onAdd handler — the component has no knowledge
//   of engagements or context. Can be reused in prioritisation forms, discovery
//   sheets, or anywhere else that needs to attach use cases to a record.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  USE_CASES,
  USE_CASE_CATEGORIES,
} from '../data/useCaseLibrary.js';
import { Modal } from './Modal.jsx';
import { Badge } from './Badge.jsx';

// ── Row component ─────────────────────────────────────────────────────────────

function PickerRow({ uc, alreadyAdded, onAdd }) {
  return (
    <div
      className={`flex items-start gap-4 px-5 py-3 border-b border-slate-100 last:border-0 transition-colors ${
        alreadyAdded ? 'bg-slate-50/60' : 'bg-white hover:bg-slate-50/70'
      }`}
    >
      {/* Text block */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <Badge category={uc.category}>{uc.category}</Badge>
          <Badge complexity={uc.complexity}>{uc.complexity}</Badge>
          <span className="text-[11px] text-slate-400">{uc.timeToValue}</span>
        </div>
        <p className={`text-sm font-medium leading-snug ${alreadyAdded ? 'text-slate-400' : 'text-slate-800'}`}>
          {uc.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{uc.summary}</p>
      </div>

      {/* Action */}
      <div className="flex-shrink-0 pt-0.5">
        {alreadyAdded ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Added
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onAdd(uc.id)}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600
                       border border-indigo-200 bg-indigo-50 hover:bg-indigo-100
                       px-2.5 py-1 rounded-md transition-colors"
          >
            + Add
          </button>
        )}
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function UseCasePicker({ open = true, engagementName, addedIds, onAdd, onClose }) {
  const [query,          setQuery]          = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const searchRef = useRef(null);

  // Focus the search input when the modal opens
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return USE_CASES.filter(uc => {
      if (filterCategory && uc.category !== filterCategory) return false;
      if (!q) return true;
      return (
        uc.title.toLowerCase().includes(q)     ||
        uc.summary.toLowerCase().includes(q)   ||
        uc.painPoint.toLowerCase().includes(q) ||
        uc.category.toLowerCase().includes(q)  ||
        uc.industryTags.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [query, filterCategory]);

  const addedCount = addedIds.size;

  const description = (
    <>
      {engagementName
        ? <>Browsing library for <span className="font-medium text-slate-700">{engagementName}</span></>
        : 'Browse and add from the library'}
      {addedCount > 0 && (
        <span className="ml-2 text-emerald-600 font-medium">
          · {addedCount} attached
        </span>
      )}
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Use Cases"
      description={description}
      maxWidth="max-w-2xl"
    >
      {/* Search + category filter row */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search use cases…"
              className="bh-input pl-8 text-sm py-1.5"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bh-input text-xs py-1.5 w-auto flex-shrink-0"
          >
            <option value="">All categories</option>
            {USE_CASE_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          {filtered.length} of {USE_CASES.length} use cases
          {(query || filterCategory) ? ' · filters active' : ''}
        </p>
      </div>

      {/* Scrollable list — capped height so the modal stays usable on small screens */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: '50vh' }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <p className="text-sm text-slate-400 mb-2">No use cases match your search.</p>
            <button
              type="button"
              onClick={() => { setQuery(''); setFilterCategory(''); }}
              className="text-xs text-indigo-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map(uc => (
            <PickerRow
              key={uc.id}
              uc={uc}
              alreadyAdded={addedIds.has(uc.id)}
              onAdd={onAdd}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 flex-shrink-0 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {addedIds.size > 0
            ? `${addedIds.size} use case${addedIds.size !== 1 ? 's' : ''} attached to this engagement`
            : 'No use cases attached yet'}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="bh-btn-primary py-1.5 text-xs"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
