// StakeholderMapBuilder — structured stakeholder influence/interest register.
//
// Supports add / edit / delete of stakeholders with name, role, department,
// influence, interest, and notes.  Data is stored as a flat array on the
// engagement so a future influence-interest matrix visualization can consume it
// without a schema change.

import { useState } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────

const LEVELS  = ['Low', 'Medium', 'High'];
const INPUT   = 'border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 w-full';
const BTN     = 'text-xs px-3 py-1.5 rounded-md font-medium transition-colors';

const EMPTY_STAKEHOLDER = {
  name:       '',
  role:       '',
  department: '',
  influence:  'Medium',
  interest:   'Medium',
  notes:      '',
};

function levelBadge(level) {
  const colors = {
    Low:    'bg-gray-100 text-gray-500',
    Medium: 'bg-amber-100 text-amber-700',
    High:   'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors[level] ?? colors.Medium}`}>
      {level}
    </span>
  );
}

// ── Inline form for add / edit ────────────────────────────────────────────────

function StakeholderForm({ initial, onSave, onCancel, saveLabel = 'Save' }) {
  const [draft, setDraft] = useState(initial);
  const set = (field, value) => setDraft(prev => ({ ...prev, [field]: value }));

  return (
    <div className="border border-indigo-200 rounded-lg bg-indigo-50 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Name *</label>
          <input
            value={draft.name}
            onChange={e => set('name', e.target.value)}
            autoFocus
            placeholder="Full name"
            className={INPUT}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Role / Title</label>
          <input
            value={draft.role}
            onChange={e => set('role', e.target.value)}
            placeholder="e.g. VP Engineering"
            className={INPUT}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Department</label>
          <input
            value={draft.department}
            onChange={e => set('department', e.target.value)}
            placeholder="e.g. Data & Analytics"
            className={INPUT}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Notes</label>
          <input
            value={draft.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Champion, budget owner, potential blocker…"
            className={INPUT}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Influence</label>
          <select
            value={draft.influence}
            onChange={e => set('influence', e.target.value)}
            className={INPUT}
          >
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Interest</label>
          <select
            value={draft.interest}
            onChange={e => set('interest', e.target.value)}
            className={INPUT}
          >
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={!draft.name.trim()}
          onClick={() => onSave(draft)}
          className={`${BTN} bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40`}
        >
          {saveLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`${BTN} border border-gray-300 text-gray-600 hover:bg-gray-50`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Stakeholder row ───────────────────────────────────────────────────────────

function StakeholderRow({ stakeholder, onEdit, onDelete }) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">{stakeholder.name}</span>
            {stakeholder.role && (
              <span className="text-xs text-gray-500">{stakeholder.role}</span>
            )}
            {stakeholder.department && (
              <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {stakeholder.department}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-[11px] text-gray-400">
              Influence: {levelBadge(stakeholder.influence)}
            </span>
            <span className="text-[11px] text-gray-400">
              Interest: {levelBadge(stakeholder.interest)}
            </span>
            {stakeholder.notes && (
              <span className="text-[11px] text-gray-500 italic">
                {stakeholder.notes}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="text-xs text-gray-400 hover:text-indigo-600"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-xs text-gray-300 hover:text-red-500"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {object|null} engagement
 * @param {function}    onSave    - (key, { stakeholders }) => void
 * @param {function}    onClose
 */
export function StakeholderMapBuilder({ engagement, onSave, onClose }) {
  const saved = engagement?.artifactData?.stakeholderMap?.stakeholders;

  const [stakeholders, setStakeholders] = useState(() => saved ?? []);
  const [showAdd,      setShowAdd]      = useState(false);
  const [editingId,    setEditingId]    = useState(null);
  const [isSaved,      setIsSaved]      = useState(!!saved);

  function addStakeholder(draft) {
    setStakeholders(prev => [...prev, { ...draft, id: crypto.randomUUID() }]);
    setShowAdd(false);
    setIsSaved(false);
  }

  function updateStakeholder(id, draft) {
    setStakeholders(prev => prev.map(s => s.id === id ? { ...s, ...draft } : s));
    setEditingId(null);
    setIsSaved(false);
  }

  function deleteStakeholder(id) {
    setStakeholders(prev => prev.filter(s => s.id !== id));
    setIsSaved(false);
  }

  function handleSave() {
    onSave('stakeholderMap', { stakeholders });
    setIsSaved(true);
  }

  const hasStakeholders = stakeholders.length > 0;

  return (
    <div>
      {/* Header strip */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500">
          {hasStakeholders
            ? `${stakeholders.length} stakeholder${stakeholders.length !== 1 ? 's' : ''} · Click a name to edit`
            : 'No stakeholders added yet'}
        </p>
        {!showAdd && (
          <button
            type="button"
            onClick={() => { setEditingId(null); setShowAdd(true); }}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Add stakeholder
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-4">
          <StakeholderForm
            initial={EMPTY_STAKEHOLDER}
            onSave={addStakeholder}
            onCancel={() => setShowAdd(false)}
            saveLabel="Add"
          />
        </div>
      )}

      {/* Stakeholder list */}
      {!hasStakeholders && !showAdd && (
        <div className="border-2 border-dashed border-gray-200 rounded-lg py-8 text-center text-sm text-gray-400">
          <p>👥</p>
          <p className="mt-1">Add stakeholders to build the influence/interest map</p>
        </div>
      )}

      <div className="space-y-2">
        {stakeholders.map(s => (
          editingId === s.id ? (
            <StakeholderForm
              key={s.id}
              initial={s}
              onSave={draft => updateStakeholder(s.id, draft)}
              onCancel={() => setEditingId(null)}
              saveLabel="Update"
            />
          ) : (
            <StakeholderRow
              key={s.id}
              stakeholder={s}
              onEdit={() => { setShowAdd(false); setEditingId(s.id); }}
              onDelete={() => deleteStakeholder(s.id)}
            />
          )
        ))}
      </div>

      {/* Legend */}
      {hasStakeholders && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
            Influence / Interest legend
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
            <span>High influence + High interest → <strong>Manage closely</strong></span>
            <span>High influence + Low interest → <strong>Keep satisfied</strong></span>
            <span>Low influence + High interest → <strong>Keep informed</strong></span>
            <span>Low influence + Low interest → <strong>Monitor</strong></span>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 flex-wrap">
        {engagement && (
          <button
            type="button"
            disabled={!hasStakeholders}
            onClick={handleSave}
            className="text-xs px-3 py-1.5 rounded-md font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            {isSaved ? '✓ Saved' : `Save ${stakeholders.length} stakeholder${stakeholders.length !== 1 ? 's' : ''}`}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}
