// UseCaseImportBanner — thin integration between the Use Case Library and the
// AI Readiness "Use Case Prioritization" form.
//
// The form has 3 fixed slots: uc1_*, uc2_*, uc3_*. This banner:
//   1. Reads engagement.candidateUseCases (from the library picker).
//   2. Reports how many slots are filled, empty, and already imported.
//   3. Lets the consultant import remaining candidates into empty slots.
//
// Rules:
//   - Each slot tracks its origin in `ucN_libraryId` (a hidden form field).
//   - Already-filled slots whose libraryId matches an attached candidate are
//     reported as "already imported" — never overwritten.
//   - Already-filled slots without a libraryId are treated as manual entries
//     and never overwritten.
//   - On Import: walk attached candidates; for each that is not already
//     imported, find the next empty slot and write title → ucN_name,
//     painPoint → ucN_problem, suggestedNextStep → ucN_notes, plus the
//     library ID so the link is preserved.
//
// Visual import indicator: the banner lists the filled slots with badges
// showing which ones came from the library.
//
// Props:
//   engagement   the current engagement (must have candidateUseCases set)
//   formState    current form values (uc1_name, uc1_problem, … uc3_notes)
//   onImport     called with a partial form-state object that should be
//                merged into the existing form state via setFormState

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { USE_CASES } from '../data/useCaseLibrary.js';
import { Badge } from './Badge.jsx';

const SLOT_INDICES = [1, 2, 3];
const TOTAL_SLOTS  = SLOT_INDICES.length;

/** Field keys per slot. */
function slotKeys(i) {
  return {
    name:      `uc${i}_name`,
    problem:   `uc${i}_problem`,
    notes:     `uc${i}_notes`,
    libraryId: `uc${i}_libraryId`,
  };
}

/**
 * Compute the integration state.
 * Returns:
 *   slots[] — per-slot { index, name, libraryId, libraryTitle, isEmpty, isLinked }
 *   linkedIds — Set of library IDs already linked to a slot
 *   importable[] — candidate UCs not yet linked to any slot (in order)
 *   emptySlotIndices — slot numbers that are blank (no name)
 */
function analyse(engagement, formState) {
  const candidates = (engagement.candidateUseCases ?? [])
    .map(id => USE_CASES.find(uc => uc.id === id))
    .filter(Boolean);

  const slots = SLOT_INDICES.map(i => {
    const k = slotKeys(i);
    const name      = (formState[k.name]      ?? '').trim();
    const libraryId = (formState[k.libraryId] ?? '').trim();
    const libraryUc = libraryId
      ? USE_CASES.find(uc => uc.id === libraryId)
      : null;
    return {
      index:        i,
      name,
      libraryId,
      libraryTitle: libraryUc?.title ?? null,
      isEmpty:      name === '',
      isLinked:     !!libraryId,
    };
  });

  const linkedIds       = new Set(slots.map(s => s.libraryId).filter(Boolean));
  const importable      = candidates.filter(uc => !linkedIds.has(uc.id));
  const emptySlotIndices = slots.filter(s => s.isEmpty).map(s => s.index);

  return { candidates, slots, linkedIds, importable, emptySlotIndices };
}

/**
 * Build the partial form-state update for an import action.
 * Walks importable candidates and pairs them with empty slots.
 */
function buildImportPlan({ importable, emptySlotIndices }) {
  const plan = {};
  const pairs = [];
  for (let i = 0; i < importable.length && i < emptySlotIndices.length; i++) {
    const uc       = importable[i];
    const slot     = emptySlotIndices[i];
    const k        = slotKeys(slot);
    plan[k.name]      = uc.title;
    plan[k.problem]   = uc.painPoint || uc.summary || '';
    plan[k.notes]     = uc.suggestedNextStep || uc.notes || '';
    plan[k.libraryId] = uc.id;
    pairs.push({ slot, uc });
  }
  return { plan, pairs };
}

export function UseCaseImportBanner({ engagement, formState, onImport }) {
  const analysis = useMemo(
    () => analyse(engagement, formState),
    [engagement, formState],
  );
  const { candidates, slots, importable, emptySlotIndices } = analysis;

  // ── No candidates attached at all ─────────────────────────────────────────
  if (candidates.length === 0) {
    return (
      <div className="bh-card px-4 py-3 mb-5 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
            Use Case Library
          </p>
          <p className="text-sm text-slate-600">
            No candidate use cases attached to this engagement yet. Browse the library to attach candidates,
            then return here to import them into the prioritization slots.
          </p>
        </div>
        <Link
          to="/library"
          className="flex-shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Open Library →
        </Link>
      </div>
    );
  }

  // ── Compute the import plan for the action button ────────────────────────
  const { plan, pairs } = buildImportPlan({ importable, emptySlotIndices });
  const willImportCount = pairs.length;

  function handleImport() {
    if (willImportCount === 0) return;
    onImport(plan);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const linkedSlotCount = slots.filter(s => s.isLinked).length;
  const summaryParts = [
    `${candidates.length} candidate${candidates.length !== 1 ? 's' : ''} attached`,
    `${linkedSlotCount}/${TOTAL_SLOTS} slot${linkedSlotCount !== 1 ? 's' : ''} linked`,
  ];

  return (
    <div className="border border-indigo-200 bg-indigo-50/60 rounded-xl px-4 py-3.5 mb-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-0.5">
            Use Case Library
          </p>
          <p className="text-sm text-indigo-900">
            {summaryParts.join(' · ')}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/library"
            className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Browse Library →
          </Link>
          <button
            type="button"
            onClick={handleImport}
            disabled={willImportCount === 0}
            className="bh-btn-primary py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              willImportCount === 0
                ? (importable.length === 0
                    ? 'All attached candidates are already imported'
                    : 'No empty slots — clear a slot or remove a candidate')
                : `Import ${willImportCount} candidate${willImportCount !== 1 ? 's' : ''}`
            }
          >
            {willImportCount > 0
              ? `Import ${willImportCount} candidate${willImportCount !== 1 ? 's' : ''}`
              : 'Nothing to import'}
          </button>
        </div>
      </div>

      {/* Per-slot summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {slots.map(slot => (
          <div
            key={slot.index}
            className="bg-white border border-indigo-100 rounded-lg px-3 py-2 text-xs"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-semibold text-slate-700">Slot #{slot.index}</span>
              {slot.isLinked && <Badge tone="brand" className="text-[10px]">Library</Badge>}
              {!slot.isLinked && !slot.isEmpty && <Badge tone="muted" className="text-[10px]">Manual</Badge>}
            </div>
            {slot.isEmpty
              ? <p className="text-slate-400 italic">Empty</p>
              : <p className="text-slate-700 truncate" title={slot.name}>{slot.name}</p>}
          </div>
        ))}
      </div>

      {/* Skip-warning when there are more candidates than empty slots */}
      {importable.length > willImportCount && (
        <p className="text-[11px] text-indigo-600 mt-2.5 leading-snug">
          {importable.length - willImportCount} candidate{importable.length - willImportCount !== 1 ? 's' : ''} won&apos;t fit —
          this form has {TOTAL_SLOTS} fixed slots. Clear an existing slot to make room.
        </p>
      )}
    </div>
  );
}
