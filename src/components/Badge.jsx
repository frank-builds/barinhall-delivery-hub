// Badge — single shared pill component for categorisation, status, and labels.
//
// Replaces the inline category/complexity/maturity badge spans previously
// scattered across UseCaseLibrary, UseCasePicker, EngagementDetail, and
// individual artifact builders.
//
// Variants (precedence, highest first):
//   category="Sales & Marketing"        → use case category colour (8 colours)
//   complexity="Low|Medium|High"        → readiness complexity colour (3 colours)
//   maturity="Exploring|Developing|Advanced" → maturity colour (3 colours)
//   tone="brand|success|warning|danger|neutral|muted" → generic colour token
//
// Usage:
//   <Badge category={uc.category}>{uc.category}</Badge>
//   <Badge complexity={uc.complexity}>{uc.complexity}</Badge>
//   <Badge tone="success">Saved</Badge>
//   <Badge tone="danger">Critical</Badge>
//   <Badge>Default neutral</Badge>
//
// `className` is concatenated last so callers can override sizing or spacing.

import {
  CATEGORY_BADGE_CLASSES,
  COMPLEXITY_BADGE_CLASSES,
} from '../data/useCaseLibrary.js';

const MATURITY_CLASSES = {
  Exploring:  'bg-slate-100 text-slate-600 border-slate-200',
  Developing: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  Advanced:   'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const TONE_CLASSES = {
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  muted:   'bg-slate-50 text-slate-500 border-slate-200',
  brand:   'bg-indigo-50 text-indigo-700 border-indigo-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger:  'bg-red-50 text-red-700 border-red-200',
};

const FALLBACK = TONE_CLASSES.neutral;

export function Badge({
  children,
  tone = 'neutral',
  category,
  complexity,
  maturity,
  className = '',
}) {
  let cls;
  if      (category)   cls = CATEGORY_BADGE_CLASSES[category]     ?? FALLBACK;
  else if (complexity) cls = COMPLEXITY_BADGE_CLASSES[complexity] ?? FALLBACK;
  else if (maturity)   cls = MATURITY_CLASSES[maturity]           ?? FALLBACK;
  else                 cls = TONE_CLASSES[tone]                   ?? FALLBACK;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls} ${className}`}>
      {children}
    </span>
  );
}
