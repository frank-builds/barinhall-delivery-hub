import { useState } from 'react';
import { DEFAULT_WORKFLOWS } from '../data/workflows.js';

export function ServiceWorkflowCard({ service }) {
  const [open, setOpen] = useState(false);
  const steps = DEFAULT_WORKFLOWS[service.key] ?? [];

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <button
        className="w-full flex justify-between items-center px-5 py-4 text-left hover:bg-gray-50 rounded-lg"
        onClick={() => setOpen(o => !o)}
      >
        <span className="font-semibold text-gray-900">{service.label}</span>
        <span className="text-xs text-gray-400">
          {steps.length} steps {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <ul className="px-5 pb-4 space-y-2 border-t border-gray-100">
          {steps.map((label, i) => (
            <li key={i} className="flex items-center gap-3 pt-2 text-sm text-gray-600">
              <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium">
                {i + 1}
              </span>
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
