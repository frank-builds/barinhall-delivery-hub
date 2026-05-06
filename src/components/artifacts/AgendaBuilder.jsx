// AgendaBuilder — meeting/workshop agenda with topics, durations, owners, notes.
// Pre-seeded from AGENDA_TEMPLATES[storageKey].
// Saved to engagement.artifactData[storageKey].

import { useState } from 'react';

// ── Template registry ─────────────────────────────────────────────────────────

export const AGENDA_TEMPLATES = {
  workshopAgenda: {
    title: 'AI Strategy & Roadmap Workshop',
    items: [
      { topic: 'Welcome & introductions',           duration: '10 min', owner: 'Facilitator', notes: '' },
      { topic: 'Workshop objectives and ground rules', duration: '5 min',  owner: 'Facilitator', notes: '' },
      { topic: 'Current state — where are we today?', duration: '30 min', owner: 'Facilitator', notes: 'SWOT / landscape mapping exercise' },
      { topic: '☕ Break',                           duration: '10 min', owner: '',            notes: '' },
      { topic: 'Future vision — where do we want to be?', duration: '30 min', owner: 'Facilitator', notes: 'Visioning exercise with sticky notes' },
      { topic: 'Use case generation — brainstorm',  duration: '25 min', owner: 'Facilitator', notes: 'Silent brainstorm then share-out' },
      { topic: '🍽 Lunch / break',                  duration: '30 min', owner: '',            notes: '' },
      { topic: 'Use case dot voting & prioritisation', duration: '20 min', owner: 'Facilitator', notes: 'Impact × feasibility grid' },
      { topic: 'Horizon planning — roadmap sketch', duration: '30 min', owner: 'Facilitator', notes: '0–6 months, 6–18 months, 18 months+' },
      { topic: 'Resource and capability gaps',       duration: '15 min', owner: 'Facilitator', notes: '' },
      { topic: 'Next steps and owners',             duration: '10 min', owner: 'Lead Consultant', notes: '' },
      { topic: 'Close & thanks',                    duration: '5 min',  owner: 'Facilitator', notes: '' },
    ],
  },
  reviewSessionAgenda: {
    title: 'Roadmap Draft Review Session',
    items: [
      { topic: 'Opening — purpose of today\'s review', duration: '5 min',  owner: 'Consultant', notes: '' },
      { topic: 'Roadmap walkthrough — Horizon 1',    duration: '20 min', owner: 'Consultant', notes: 'Invite questions and reactions' },
      { topic: 'Roadmap walkthrough — Horizons 2 & 3', duration: '15 min', owner: 'Consultant', notes: '' },
      { topic: 'Open discussion & feedback',         duration: '20 min', owner: 'Client sponsor', notes: '' },
      { topic: 'Agreed changes and action items',    duration: '10 min', owner: 'Consultant', notes: '' },
      { topic: 'Next steps and delivery timeline',   duration: '5 min',  owner: 'Consultant', notes: '' },
    ],
  },
  debriefAgenda: {
    title: 'AI Readiness Assessment Debrief',
    items: [
      { topic: 'Welcome & purpose of today',         duration: '5 min',  owner: 'Consultant', notes: '' },
      { topic: 'Overall readiness score and band',   duration: '10 min', owner: 'Consultant', notes: 'High-level headline before diving in' },
      { topic: 'Category-by-category findings',      duration: '20 min', owner: 'Consultant', notes: 'Walk each of the 7 categories with evidence' },
      { topic: 'Top use case hypotheses',            duration: '15 min', owner: 'Consultant', notes: 'Effort × impact overview' },
      { topic: 'Recommended next steps',             duration: '10 min', owner: 'Consultant', notes: '' },
      { topic: 'Q&A and client reactions',           duration: '15 min', owner: 'Client sponsor', notes: '' },
      { topic: 'Handoff and follow-up actions',      duration: '10 min', owner: 'Consultant', notes: '' },
    ],
  },
  midPilotReviewAgenda: {
    title: 'Mid-Pilot Review',
    items: [
      { topic: 'Pilot status overview',              duration: '10 min', owner: 'Consultant', notes: '' },
      { topic: 'Metrics vs. success criteria (so far)', duration: '15 min', owner: 'Consultant', notes: '' },
      { topic: 'Issues and blockers',                duration: '10 min', owner: 'Team', notes: '' },
      { topic: 'Required adjustments',               duration: '15 min', owner: 'Consultant + Client', notes: '' },
      { topic: 'Revised timeline if needed',         duration: '10 min', owner: 'Consultant', notes: '' },
      { topic: 'Next steps and owners',              duration: '5 min',  owner: 'Consultant', notes: '' },
    ],
  },
  governanceBriefingAgenda: {
    title: 'AI Governance Findings Briefing',
    items: [
      { topic: 'Scope reminder and objectives',      duration: '5 min',  owner: 'Consultant', notes: '' },
      { topic: 'AI inventory and current-state findings', duration: '15 min', owner: 'Consultant', notes: '' },
      { topic: 'Risk and control gap analysis',      duration: '20 min', owner: 'Consultant', notes: '' },
      { topic: 'Policy and standards gaps',          duration: '10 min', owner: 'Consultant', notes: '' },
      { topic: 'Recommendations and remediation plan', duration: '20 min', owner: 'Consultant', notes: '' },
      { topic: 'Questions and alignment',            duration: '15 min', owner: 'Client', notes: '' },
      { topic: 'Governance programme next steps',    duration: '10 min', owner: 'Consultant', notes: '' },
    ],
  },
  sessionAgenda: {
    title: 'AI Training Session',
    items: [
      { topic: 'Welcome and introductions',          duration: '10 min', owner: 'Trainer', notes: '' },
      { topic: 'Learning objectives for today',      duration: '5 min',  owner: 'Trainer', notes: '' },
      { topic: 'Module 1: Foundations',              duration: '30 min', owner: 'Trainer', notes: 'Lecture + discussion' },
      { topic: '☕ Break',                           duration: '10 min', owner: '',         notes: '' },
      { topic: 'Module 2: Hands-on exercise',        duration: '30 min', owner: 'Trainer', notes: 'Group exercise or lab' },
      { topic: 'Module 3: Use case application',     duration: '25 min', owner: 'Trainer', notes: 'Apply learnings to real examples' },
      { topic: 'Q&A and recap',                      duration: '10 min', owner: 'Trainer', notes: '' },
      { topic: 'Next steps and resources',           duration: '5 min',  owner: 'Trainer', notes: '' },
    ],
  },
  monthlyCheckInAgenda: {
    title: 'Monthly AI Ops Check-In',
    items: [
      { topic: 'Previous month recap',               duration: '10 min', owner: 'Consultant', notes: '' },
      { topic: 'System health and monitoring review', duration: '10 min', owner: 'Consultant', notes: '' },
      { topic: 'Incidents and resolutions',          duration: '10 min', owner: 'Consultant', notes: '' },
      { topic: 'Performance metrics and insights',   duration: '15 min', owner: 'Consultant', notes: '' },
      { topic: 'Backlog and next month priorities',  duration: '15 min', owner: 'Consultant + Client', notes: '' },
      { topic: 'Action items and owners',            duration: '5 min',  owner: 'Both', notes: '' },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeItem(topic = '', duration = '', owner = '', notes = '') {
  return { id: crypto.randomUUID(), topic, duration, owner, notes };
}

function seedAgenda(storageKey) {
  const template = AGENDA_TEMPLATES[storageKey];
  if (!template) return { title: '', items: [] };
  return {
    title: template.title,
    items: template.items.map(item => ({ id: crypto.randomUUID(), ...item })),
  };
}

const TH = 'text-left text-[10px] font-bold uppercase tracking-wide text-slate-400 pb-1';
const TD_INPUT = 'border border-slate-200 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-400';

// ── Main component ────────────────────────────────────────────────────────────

export function AgendaBuilder({ storageKey, engagement, onSave, onClose }) {
  const saved   = engagement?.artifactData?.[storageKey];
  const seeded  = saved ?? seedAgenda(storageKey);

  const [title, setTitle]   = useState(seeded.title);
  const [items, setItems]   = useState(seeded.items ?? []);
  const [isSaved, setIsSaved] = useState(!!saved);

  const totalMin = items.reduce((sum, i) => {
    const n = parseInt(i.duration, 10);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  function update(id, field, val) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
    setIsSaved(false);
  }
  function add()       { setItems(prev => [...prev, makeItem()]); setIsSaved(false); }
  function remove(id)  { setItems(prev => prev.filter(i => i.id !== id)); setIsSaved(false); }
  function moveUp(idx) {
    if (idx === 0) return;
    const next = [...items];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setItems(next); setIsSaved(false);
  }
  function moveDown(idx) {
    if (idx === items.length - 1) return;
    const next = [...items];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setItems(next); setIsSaved(false);
  }

  function handleSave() {
    onSave(storageKey, { title, items });
    setIsSaved(true);
  }

  return (
    <div>
      {/* Title */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-600 block mb-1">Agenda title</label>
        <input
          value={title}
          onChange={e => { setTitle(e.target.value); setIsSaved(false); }}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Agenda table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate" style={{ borderSpacing: '0 4px' }}>
          <thead>
            <tr>
              <th className={`${TH} w-6`}></th>
              <th className={`${TH} min-w-[200px]`}>Topic</th>
              <th className={`${TH} w-24`}>Duration</th>
              <th className={`${TH} w-32`}>Owner</th>
              <th className={`${TH} min-w-[140px]`}>Notes</th>
              <th className={`${TH} w-8`}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td className="align-top pt-1">
                  <div className="flex flex-col gap-0.5">
                    <button type="button" onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="text-slate-300 hover:text-slate-500 disabled:opacity-20 text-[10px] leading-none">▲</button>
                    <button type="button" onClick={() => moveDown(idx)}
                      disabled={idx === items.length - 1}
                      className="text-slate-300 hover:text-slate-500 disabled:opacity-20 text-[10px] leading-none">▼</button>
                  </div>
                </td>
                <td><input value={item.topic} onChange={e => update(item.id, 'topic', e.target.value)} className={TD_INPUT} /></td>
                <td><input value={item.duration} onChange={e => update(item.id, 'duration', e.target.value)} placeholder="15 min" className={TD_INPUT} /></td>
                <td><input value={item.owner} onChange={e => update(item.id, 'owner', e.target.value)} className={TD_INPUT} /></td>
                <td><input value={item.notes} onChange={e => update(item.id, 'notes', e.target.value)} className={TD_INPUT} /></td>
                <td className="align-top pt-1">
                  <button type="button" onClick={() => remove(item.id)}
                    className="text-slate-200 hover:text-red-400 text-xs">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={add}
        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium mt-2">
        + Add agenda item
      </button>

      {totalMin > 0 && (
        <p className="text-xs text-slate-400 mt-2">
          Total: {totalMin} min ({Math.floor(totalMin / 60)}h {totalMin % 60}m)
        </p>
      )}

      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 flex-wrap">
        {engagement && (
          <button type="button" onClick={handleSave}
            className="text-xs px-3 py-1.5 rounded-md font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
            {isSaved ? '✓ Saved' : 'Save to engagement'}
          </button>
        )}
        <button type="button" onClick={onClose}
          className="ml-auto text-xs text-slate-400 hover:text-slate-600 underline">
          Close
        </button>
      </div>
    </div>
  );
}
