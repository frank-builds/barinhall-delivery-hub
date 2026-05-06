import { useState } from 'react';
import { DEFAULT_WORKFLOWS } from '../data/workflows.js';
import PLAYBOOKS from '../data/playbooks.json';
import { PlaybookStepDetail } from './PlaybookStepDetail.jsx';

// ── Rich step row (playbook available) ───────────────────────────────────────
function PlaybookStepRow({ step, index }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="border border-slate-100 rounded-md overflow-hidden">
      {/* Step header — always visible */}
      <button
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
          {index + 1}
        </span>
        <span className="flex-1 text-sm font-medium text-slate-800">{step.title}</span>
        <span className="flex-shrink-0 flex items-center gap-2 text-xs text-slate-400">
          {step.duration && <span>{step.duration}</span>}
          <span>{open ? '▲' : '▼'}</span>
        </span>
      </button>

      {/* Expanded detail card */}
      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 bg-white">
          <PlaybookStepDetail step={step} />
        </div>
      )}
    </li>
  );
}

// ── Simple step row (no playbook) ─────────────────────────────────────────────
function SimpleStepRow({ label, index }) {
  return (
    <li className="flex items-center gap-3 py-2 text-sm text-slate-600">
      <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium">
        {index + 1}
      </span>
      {label}
    </li>
  );
}

// ── Service accordion ─────────────────────────────────────────────────────────
export function ServiceWorkflowCard({ service }) {
  const [open, setOpen] = useState(false);

  const playbook = PLAYBOOKS[service.key]; // null = not yet defined
  const stepCount = playbook
    ? playbook.length
    : (DEFAULT_WORKFLOWS[service.key]?.length ?? 0);

  return (
    <div className="border border-slate-200 rounded-lg bg-white">
      {/* Service header */}
      <button
        className="w-full flex justify-between items-center px-5 py-4 text-left hover:bg-slate-50 rounded-lg transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{service.label}</span>
          {playbook && (
            <span className="text-[10px] font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">
              Playbook
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">
          {stepCount} steps {open ? '▲' : '▼'}
        </span>
      </button>

      {/* Expanded step list */}
      {open && (
        <div className="px-5 pb-4 border-t border-slate-100">
          {playbook ? (
            // Rich playbook steps — each individually expandable
            <ul className="space-y-2 pt-3">
              {playbook.map((step, i) => (
                <PlaybookStepRow key={i} step={step} index={i} />
              ))}
            </ul>
          ) : (
            // Simple step list — fallback for services without playbook content
            <>
              <ul className="space-y-0 divide-y divide-slate-50 pt-1">
                {(DEFAULT_WORKFLOWS[service.key] ?? []).map((label, i) => (
                  <SimpleStepRow key={i} label={label} index={i} />
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-400 italic">
                Detailed playbook content for this service is coming in a future update.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
