import { useState } from 'react';

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const INPUT = 'w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

export function NotesLog({ entries, defaultOwner, onAdd, onUpdate, readOnly = false }) {
  const [showAdd, setShowAdd]   = useState(false);
  const [addDraft, setAddDraft] = useState({ author: defaultOwner, content: '' });
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  function openAdd() {
    setEditingId(null);
    setAddDraft({ author: defaultOwner, content: '' });
    setShowAdd(true);
  }

  function handleAdd() {
    if (!addDraft.content.trim()) return;
    onAdd({ author: addDraft.author || defaultOwner, content: addDraft.content.trim() });
    setShowAdd(false);
    setAddDraft({ author: defaultOwner, content: '' });
  }

  function openEdit(entry) {
    setShowAdd(false);
    setEditingId(entry.id);
    setEditDraft({ author: entry.author, content: entry.content });
  }

  function handleUpdate() {
    if (!editDraft.content.trim()) return;
    onUpdate(editingId, { author: editDraft.author, content: editDraft.content.trim() });
    setEditingId(null);
    setEditDraft({});
  }

  return (
    <section className="mt-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-slate-800">Notes {entries.length > 0 && <span className="text-slate-400 font-normal text-sm">({entries.length})</span>}</h2>
        {!showAdd && !readOnly && (
          <button
            onClick={openAdd}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Add Note
          </button>
        )}
      </div>

      {showAdd && (
        <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50 mb-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Author</label>
            <input
              type="text"
              value={addDraft.author}
              onChange={e => setAddDraft(d => ({ ...d, author: e.target.value }))}
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Note <span className="text-red-400">*</span></label>
            <textarea
              rows={3}
              value={addDraft.content}
              onChange={e => setAddDraft(d => ({ ...d, content: e.target.value }))}
              placeholder="Enter note..."
              className={INPUT}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bh-btn-primary py-1.5">Save</button>
            <button onClick={() => setShowAdd(false)} className="border border-slate-300 text-slate-600 px-4 py-1.5 rounded text-sm hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      )}

      {entries.length === 0 && !showAdd && (
        <p className="text-sm text-slate-400 italic">No notes yet.</p>
      )}

      <div className="space-y-2">
        {entries.map(entry => (
          <div key={entry.id} className="border border-slate-200 rounded-lg bg-white">
            {editingId === entry.id ? (
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Author</label>
                  <input
                    type="text"
                    value={editDraft.author}
                    onChange={e => setEditDraft(d => ({ ...d, author: e.target.value }))}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Note <span className="text-red-400">*</span></label>
                  <textarea
                    rows={3}
                    value={editDraft.content}
                    onChange={e => setEditDraft(d => ({ ...d, content: e.target.value }))}
                    className={INPUT}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleUpdate} className="bh-btn-primary py-1.5">Save</button>
                  <button onClick={() => setEditingId(null)} className="border border-slate-300 text-slate-600 px-4 py-1.5 rounded text-sm hover:bg-slate-50">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap flex-1">{entry.content}</p>
                  {!readOnly && (
                    <button
                      onClick={() => openEdit(entry)}
                      className="text-xs text-slate-400 hover:text-indigo-600 flex-shrink-0 mt-0.5"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">{fmt(entry.date)} · {entry.author}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
