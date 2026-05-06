import { useState } from 'react';

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const INPUT = 'w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

const EMPTY = { decision: '', rationale: '', owner: '' };

function DecisionForm({ draft, onChange, onSave, onCancel, variant }) {
  const wrapClass = variant === 'add'
    ? 'border border-indigo-200 rounded-lg p-4 bg-indigo-50 mb-3 space-y-3'
    : 'p-4 space-y-3';
  return (
    <div className={wrapClass}>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Decision <span className="text-red-400">*</span></label>
        <textarea
          rows={2}
          value={draft.decision}
          onChange={e => onChange('decision', e.target.value)}
          placeholder="What was decided?"
          className={INPUT}
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Rationale</label>
        <textarea
          rows={2}
          value={draft.rationale}
          onChange={e => onChange('rationale', e.target.value)}
          placeholder="Why was this decision made?"
          className={INPUT}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Owner</label>
        <input
          type="text"
          value={draft.owner}
          onChange={e => onChange('owner', e.target.value)}
          className={INPUT}
        />
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} className="bh-btn-primary py-1.5">Save</button>
        <button onClick={onCancel} className="border border-slate-300 text-slate-600 px-4 py-1.5 rounded text-sm hover:bg-slate-50">Cancel</button>
      </div>
    </div>
  );
}

export function DecisionsLog({ entries, defaultOwner, onAdd, onUpdate }) {
  const [showAdd, setShowAdd]     = useState(false);
  const [addDraft, setAddDraft]   = useState({ ...EMPTY, owner: defaultOwner });
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  function handleAddChange(key, val) { setAddDraft(d => ({ ...d, [key]: val })); }
  function handleEditChange(key, val) { setEditDraft(d => ({ ...d, [key]: val })); }

  function handleAdd() {
    if (!addDraft.decision.trim()) return;
    onAdd({ decision: addDraft.decision.trim(), rationale: addDraft.rationale.trim(), owner: addDraft.owner || defaultOwner });
    setShowAdd(false);
    setAddDraft({ ...EMPTY, owner: defaultOwner });
  }

  function openEdit(entry) {
    setShowAdd(false);
    setEditingId(entry.id);
    setEditDraft({ decision: entry.decision, rationale: entry.rationale, owner: entry.owner });
  }

  function handleUpdate() {
    if (!editDraft.decision.trim()) return;
    onUpdate(editingId, { decision: editDraft.decision.trim(), rationale: editDraft.rationale.trim(), owner: editDraft.owner });
    setEditingId(null);
    setEditDraft({});
  }

  return (
    <section className="mt-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-slate-800">Decisions {entries.length > 0 && <span className="text-slate-400 font-normal text-sm">({entries.length})</span>}</h2>
        {!showAdd && (
          <button
            onClick={() => { setEditingId(null); setAddDraft({ ...EMPTY, owner: defaultOwner }); setShowAdd(true); }}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Add Decision
          </button>
        )}
      </div>

      {showAdd && (
        <DecisionForm
          draft={addDraft}
          onChange={handleAddChange}
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
          variant="add"
        />
      )}

      {entries.length === 0 && !showAdd && (
        <p className="text-sm text-slate-400 italic">No decisions logged yet.</p>
      )}

      <div className="space-y-2">
        {entries.map(entry => (
          <div key={entry.id} className="border border-slate-200 rounded-lg bg-white">
            {editingId === entry.id ? (
              <DecisionForm
                draft={editDraft}
                onChange={handleEditChange}
                onSave={handleUpdate}
                onCancel={() => setEditingId(null)}
                variant="edit"
              />
            ) : (
              <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm font-medium text-slate-800 flex-1">{entry.decision}</p>
                  <button
                    onClick={() => openEdit(entry)}
                    className="text-xs text-slate-400 hover:text-indigo-600 flex-shrink-0 mt-0.5"
                  >
                    Edit
                  </button>
                </div>
                {entry.rationale && (
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{entry.rationale}</p>
                )}
                <p className="text-xs text-slate-400 mt-2">{fmt(entry.date)} · {entry.owner}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
