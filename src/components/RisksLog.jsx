import { useState } from 'react';

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const INPUT    = 'w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const SELECT   = INPUT;

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES   = ['Open', 'Monitoring', 'Resolved'];

const SEVERITY_STYLES = {
  Low:      'bg-slate-100 text-slate-600',
  Medium:   'bg-yellow-100 text-yellow-700',
  High:     'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

const STATUS_STYLES = {
  Open:       'bg-red-50 text-red-700',
  Monitoring: 'bg-yellow-50 text-yellow-700',
  Resolved:   'bg-green-50 text-green-700',
};

function Pill({ text, styles }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[text] ?? 'bg-slate-100 text-slate-600'}`}>
      {text}
    </span>
  );
}

const EMPTY = { title: '', description: '', severity: 'Medium', status: 'Open', owner: '' };

function RiskForm({ draft, onChange, onSave, onCancel, variant }) {
  const wrapClass = variant === 'add'
    ? 'border border-indigo-200 rounded-lg p-4 bg-indigo-50 mb-3 space-y-3'
    : 'p-4 space-y-3';
  return (
    <div className={wrapClass}>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Title <span className="text-red-400">*</span></label>
        <input
          type="text"
          value={draft.title}
          onChange={e => onChange('title', e.target.value)}
          placeholder="Brief risk or blocker title"
          className={INPUT}
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
        <textarea
          rows={2}
          value={draft.description}
          onChange={e => onChange('description', e.target.value)}
          placeholder="What is the risk or blocker?"
          className={INPUT}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Severity</label>
          <select value={draft.severity} onChange={e => onChange('severity', e.target.value)} className={SELECT}>
            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
          <select value={draft.status} onChange={e => onChange('status', e.target.value)} className={SELECT}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
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
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} className="bh-btn-primary py-1.5">Save</button>
        <button onClick={onCancel} className="border border-slate-300 text-slate-600 px-4 py-1.5 rounded text-sm hover:bg-slate-50">Cancel</button>
      </div>
    </div>
  );
}

export function RisksLog({ entries, defaultOwner, onAdd, onUpdate }) {
  const [showAdd, setShowAdd]     = useState(false);
  const [addDraft, setAddDraft]   = useState({ ...EMPTY, owner: defaultOwner });
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  function handleAddChange(key, val) { setAddDraft(d => ({ ...d, [key]: val })); }
  function handleEditChange(key, val) { setEditDraft(d => ({ ...d, [key]: val })); }

  function handleAdd() {
    if (!addDraft.title.trim()) return;
    onAdd({
      title:       addDraft.title.trim(),
      description: addDraft.description.trim(),
      severity:    addDraft.severity,
      status:      addDraft.status,
      owner:       addDraft.owner || defaultOwner,
    });
    setShowAdd(false);
    setAddDraft({ ...EMPTY, owner: defaultOwner });
  }

  function openEdit(entry) {
    setShowAdd(false);
    setEditingId(entry.id);
    setEditDraft({ title: entry.title, description: entry.description, severity: entry.severity, status: entry.status, owner: entry.owner });
  }

  function handleUpdate() {
    if (!editDraft.title.trim()) return;
    onUpdate(editingId, {
      title:       editDraft.title.trim(),
      description: editDraft.description.trim(),
      severity:    editDraft.severity,
      status:      editDraft.status,
      owner:       editDraft.owner,
    });
    setEditingId(null);
    setEditDraft({});
  }

  return (
    <section className="mt-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-slate-800">Risks & Blockers {entries.length > 0 && <span className="text-slate-400 font-normal text-sm">({entries.length})</span>}</h2>
        {!showAdd && (
          <button
            onClick={() => { setEditingId(null); setAddDraft({ ...EMPTY, owner: defaultOwner }); setShowAdd(true); }}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Add Risk
          </button>
        )}
      </div>

      {showAdd && (
        <RiskForm
          draft={addDraft}
          onChange={handleAddChange}
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
          variant="add"
        />
      )}

      {entries.length === 0 && !showAdd && (
        <p className="text-sm text-slate-400 italic">No risks or blockers logged yet.</p>
      )}

      <div className="space-y-2">
        {entries.map(entry => (
          <div key={entry.id} className="border border-slate-200 rounded-lg bg-white">
            {editingId === entry.id ? (
              <RiskForm
                draft={editDraft}
                onChange={handleEditChange}
                onSave={handleUpdate}
                onCancel={() => setEditingId(null)}
                variant="edit"
              />
            ) : (
              <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2 flex-wrap flex-1">
                    <p className="text-sm font-medium text-slate-800">{entry.title}</p>
                    <Pill text={entry.severity} styles={SEVERITY_STYLES} />
                    <Pill text={entry.status}   styles={STATUS_STYLES} />
                  </div>
                  <button
                    onClick={() => openEdit(entry)}
                    className="text-xs text-slate-400 hover:text-indigo-600 flex-shrink-0 mt-0.5"
                  >
                    Edit
                  </button>
                </div>
                {entry.description && (
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{entry.description}</p>
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
