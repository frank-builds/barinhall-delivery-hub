// ActionTracker — action items / next steps tracker.
// Items: description, owner, dueDate, status, notes.
// Starts empty; saved to engagement.artifactData[storageKey].

import { useState } from 'react';

const STATUS_OPTIONS = ['Open', 'In Progress', 'Done', 'Blocked'];

const STATUS_COLORS = {
  'Open':        'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Done':        'bg-green-100 text-green-700',
  'Blocked':     'bg-red-100 text-red-700',
};

const INPUT = 'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full';
const BTN   = 'text-xs px-3 py-1.5 rounded-md font-medium transition-colors';

function makeItem() {
  return { id: crypto.randomUUID(), description: '', owner: '', dueDate: '', status: 'Open', notes: '' };
}

function ItemRow({ item, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  function set(field, val) { onUpdate(item.id, field, val); }

  return (
    <div className={`border rounded-lg bg-white overflow-hidden ${item.status === 'Done' ? 'border-green-100' : 'border-gray-200'}`}>
      <div className="flex items-start gap-2 px-3 py-2.5">
        {/* Status dot */}
        <button
          type="button"
          onClick={() => {
            const idx = STATUS_OPTIONS.indexOf(item.status);
            set('status', STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length]);
          }}
          className={`flex-shrink-0 mt-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full cursor-pointer ${STATUS_COLORS[item.status]}`}
          title="Click to cycle status"
        >
          {item.status}
        </button>

        {/* Description */}
        <input
          value={item.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Action item description..."
          className={`flex-1 text-sm text-gray-800 border-none outline-none bg-transparent ${item.status === 'Done' ? 'line-through text-gray-400' : ''}`}
        />

        {/* Expand / delete */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button type="button" onClick={() => setExpanded(e => !e)}
            className="text-gray-300 hover:text-gray-500 text-xs">
            {expanded ? '▲' : '▼'}
          </button>
          <button type="button" onClick={() => onDelete(item.id)}
            className="text-gray-200 hover:text-red-400 text-xs ml-1">
            ✕
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-50 grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-1">Owner</label>
            <input value={item.owner} onChange={e => set('owner', e.target.value)} placeholder="Name" className="border border-gray-200 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-1">Due date</label>
            <input type="date" value={item.dueDate} onChange={e => set('dueDate', e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-1">Notes</label>
            <input value={item.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional context..." className="border border-gray-200 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-1">Status</label>
            <div className="flex gap-1 flex-wrap">
              {STATUS_OPTIONS.map(s => (
                <button key={s} type="button" onClick={() => set('status', s)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors ${item.status === s ? STATUS_COLORS[s] : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ActionTracker({ storageKey, engagement, onSave, onClose }) {
  const saved  = engagement?.artifactData?.[storageKey];
  const [items,   setItems]   = useState(() => saved?.items ?? []);
  const [isSaved, setIsSaved] = useState(!!saved);

  function addItem() {
    setItems(prev => [...prev, makeItem()]);
    setIsSaved(false);
  }
  function updateItem(id, field, val) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
    setIsSaved(false);
  }
  function deleteItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
    setIsSaved(false);
  }
  function handleSave() {
    onSave(storageKey, { items });
    setIsSaved(true);
  }

  const open    = items.filter(i => i.status === 'Open').length;
  const inProg  = items.filter(i => i.status === 'In Progress').length;
  const done    = items.filter(i => i.status === 'Done').length;
  const blocked = items.filter(i => i.status === 'Blocked').length;

  return (
    <div>
      {/* Summary strip */}
      {items.length > 0 && (
        <div className="flex gap-3 mb-4 text-xs">
          {[['Open', open, STATUS_COLORS['Open']], ['In Progress', inProg, STATUS_COLORS['In Progress']], ['Done', done, STATUS_COLORS['Done']], ['Blocked', blocked, STATUS_COLORS['Blocked']]].map(([label, count, cls]) =>
            count > 0 ? (
              <span key={label} className={`px-2 py-0.5 rounded-full font-semibold ${cls}`}>
                {count} {label}
              </span>
            ) : null
          )}
        </div>
      )}

      {/* Items */}
      <div className="space-y-2 mb-3">
        {items.map(item => (
          <ItemRow key={item.id} item={item} onUpdate={updateItem} onDelete={deleteItem} />
        ))}
      </div>

      {items.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-lg py-8 text-center text-sm text-gray-400 mb-3">
          <p>📋</p>
          <p className="mt-1">No action items yet — add one to get started</p>
        </div>
      )}

      <button type="button" onClick={addItem}
        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
        + Add action item
      </button>

      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 flex-wrap">
        {engagement && (
          <button type="button" onClick={handleSave}
            className={`${BTN} bg-indigo-600 text-white hover:bg-indigo-700`}>
            {isSaved ? '✓ Saved' : 'Save to engagement'}
          </button>
        )}
        <button type="button" onClick={onClose}
          className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline">
          Close
        </button>
      </div>
    </div>
  );
}
