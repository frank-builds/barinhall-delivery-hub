// NextStepBanner — surfaces the recommended next action for an engagement.
//
// Pure presentation. Calls computeNextStep(engagement) from lib/nextStep.js
// and renders a small inline banner with a primary action link.
//
// The component returns null if computeNextStep returns null, so callers can
// safely render <NextStepBanner engagement={...} /> without conditional gates.

import { Link } from 'react-router-dom';
import { computeNextStep } from '../lib/nextStep.js';

const TONE_STYLES = {
  info: {
    container: 'bg-indigo-50 border-indigo-200',
    label:     'text-indigo-600',
    body:      'text-indigo-900',
    link:      'text-indigo-700 hover:text-indigo-900',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200',
    label:     'text-emerald-600',
    body:      'text-emerald-900',
    link:      'text-emerald-700 hover:text-emerald-900',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    label:     'text-amber-600',
    body:      'text-amber-900',
    link:      'text-amber-700 hover:text-amber-900',
  },
};

export function NextStepBanner({ engagement }) {
  const step = computeNextStep(engagement);
  if (!step) return null;

  const styles = TONE_STYLES[step.tone] ?? TONE_STYLES.info;

  return (
    <div
      className={`border rounded-xl px-4 py-3 mb-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 ${styles.container}`}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${styles.label} mb-0.5`}>
          Next step
        </p>
        <p className={`text-sm leading-snug ${styles.body}`}>{step.message}</p>
      </div>

      {step.actionTo && step.actionLabel && (
        <Link
          to={step.actionTo}
          className={`flex-shrink-0 text-sm font-semibold whitespace-nowrap transition-colors ${styles.link}`}
        >
          {step.actionLabel}
        </Link>
      )}
    </div>
  );
}
