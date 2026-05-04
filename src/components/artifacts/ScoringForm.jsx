// ScoringForm — weighted assessment scoring worksheet.
// Pre-seeded from SCORING_TEMPLATES[storageKey].
// Computes a weighted total score.
// Saved to engagement.artifactData[storageKey].

import { useState } from 'react';

// ── Template registry ─────────────────────────────────────────────────────────

export const SCORING_TEMPLATES = {
  readinessScoring: {
    title:    'AI Readiness Scoring',
    maxScore: 5,
    criteria: [
      { name: 'Data availability & quality',        weight: 20, score: null, evidence: '', notes: '' },
      { name: 'Technology infrastructure',           weight: 15, score: null, evidence: '', notes: '' },
      { name: 'AI / ML capability & talent',         weight: 15, score: null, evidence: '', notes: '' },
      { name: 'Leadership & sponsorship',            weight: 15, score: null, evidence: '', notes: '' },
      { name: 'Process definition & standardisation', weight: 15, score: null, evidence: '', notes: '' },
      { name: 'Governance, risk & compliance',       weight: 10, score: null, evidence: '', notes: '' },
      { name: 'Culture & change readiness',          weight: 10, score: null, evidence: '', notes: '' },
    ],
  },
  initiativeScorer: {
    title:    'Strategic Initiative Prioritisation',
    maxScore: 5,
    criteria: [
      { name: 'Strategic alignment',                weight: 25, score: null, evidence: '', notes: '' },
      { name: 'Expected business impact',            weight: 25, score: null, evidence: '', notes: '' },
      { name: 'Technical feasibility',               weight: 20, score: null, evidence: '', notes: '' },
      { name: 'Resource requirements (inverse)',     weight: 15, score: null, evidence: '', notes: 'Higher = lower cost / effort' },
      { name: 'Time-to-value',                       weight: 15, score: null, evidence: '', notes: 'Higher = faster ROI' },
    ],
  },
  successCriteriaForm: {
    title:    'Pilot Success Criteria Definition',
    maxScore: null,  // Not scored — this is a definition form
    criteria: [
      { name: 'Primary KPI (must-achieve)',          weight: null, score: null, evidence: 'Target value:', notes: 'e.g. Reduce processing time by 30%' },
      { name: 'Secondary KPI 1',                     weight: null, score: null, evidence: 'Target value:', notes: '' },
      { name: 'Secondary KPI 2',                     weight: null, score: null, evidence: 'Target value:', notes: '' },
      { name: 'User adoption metric',                weight: null, score: null, evidence: 'Target:', notes: 'e.g. 80% of target users active within 2 weeks' },
      { name: 'Data quality gate',                   weight: null, score: null, evidence: 'Threshold:', notes: 'e.g. < 2% error rate on output' },
      { name: 'Go / No-go threshold',                weight: null, score: null, evidence: 'Condition:', notes: 'e.g. Primary KPI met AND at least 1 secondary KPI met' },
    ],
  },
  pilotResultsForm: {
    title:    'Pilot Results vs. Success Criteria',
    maxScore: null,
    criteria: [
      { name: 'Primary KPI achievement',             weight: null, score: null, evidence: 'Actual result:', notes: '' },
      { name: 'Secondary KPI 1 achievement',         weight: null, score: null, evidence: 'Actual result:', notes: '' },
      { name: 'Secondary KPI 2 achievement',         weight: null, score: null, evidence: 'Actual result:', notes: '' },
      { name: 'User adoption',                       weight: null, score: null, evidence: 'Actual adoption:', notes: '' },
      { name: 'Data quality observed',               weight: null, score: null, evidence: 'Error rate:', notes: '' },
      { name: 'Unexpected issues or risks',          weight: null, score: null, evidence: 'Description:', notes: '' },
      { name: 'Go / No-go recommendation',           weight: null, score: null, evidence: 'Decision:', notes: 'GO / NO-GO / CONDITIONAL GO' },
    ],
  },
  riskAssessmentForm: {
    title:    'AI Risk & Control Assessment',
    maxScore: 5,
    criteria: [
      { name: 'Data privacy & PII handling risk',    weight: 20, score: null, evidence: '', notes: '' },
      { name: 'Model bias & fairness risk',          weight: 15, score: null, evidence: '', notes: '' },
      { name: 'Explainability & auditability',       weight: 15, score: null, evidence: '', notes: '' },
      { name: 'Security & adversarial risk',         weight: 15, score: null, evidence: '', notes: '' },
      { name: 'Regulatory / legal compliance',       weight: 15, score: null, evidence: '', notes: '' },
      { name: 'Operational dependency & fragility',  weight: 10, score: null, evidence: '', notes: '' },
      { name: 'Reputational risk',                   weight: 10, score: null, evidence: '', notes: '' },
    ],
  },
  trainingNeedsForm: {
    title:    'Training Needs Assessment',
    maxScore: 5,
    criteria: [
      { name: 'Current AI / ML literacy level',      weight: 20, score: null, evidence: '', notes: '5 = Advanced practitioners present' },
      { name: 'Data literacy and analytics basics',   weight: 15, score: null, evidence: '', notes: '' },
      { name: 'Familiarity with AI tools used',       weight: 15, score: null, evidence: '', notes: '' },
      { name: 'Change management readiness',          weight: 15, score: null, evidence: '', notes: '' },
      { name: 'Executive sponsorship strength',       weight: 15, score: null, evidence: '', notes: '' },
      { name: 'Previous training experience',         weight: 10, score: null, evidence: '', notes: '' },
      { name: 'Time availability for learning',       weight: 10, score: null, evidence: '', notes: '' },
    ],
  },
  backlogScorer: {
    title:    'Backlog Item Priority Scoring',
    maxScore: 5,
    criteria: [
      { name: 'Business value',                      weight: 30, score: null, evidence: '', notes: '' },
      { name: 'Technical urgency',                   weight: 20, score: null, evidence: '', notes: '' },
      { name: 'Client impact if unaddressed',        weight: 25, score: null, evidence: '', notes: '' },
      { name: 'Effort (inverse — lower = easier)',   weight: 25, score: null, evidence: '', notes: '' },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const SCORE_OPTIONS = [null, 1, 2, 3, 4, 5];

function computeWeightedScore(criteria, maxScore) {
  const scoreable = criteria.filter(c => c.score !== null && c.weight !== null);
  if (!scoreable.length) return null;
  const totalWeight = scoreable.reduce((s, c) => s + c.weight, 0);
  if (!totalWeight) return null;
  const weighted = scoreable.reduce((s, c) => s + (c.score / maxScore) * c.weight, 0);
  return ((weighted / totalWeight) * 100).toFixed(1);
}

const INPUT = 'border border-gray-200 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-400';

// ── Main component ────────────────────────────────────────────────────────────

export function ScoringForm({ storageKey, engagement, onSave, onClose }) {
  const saved     = engagement?.artifactData?.[storageKey];
  const template  = SCORING_TEMPLATES[storageKey] ?? { title: storageKey, maxScore: 5, criteria: [] };

  const [title,    setTitle]    = useState(saved?.title    ?? template.title);
  const [criteria, setCriteria] = useState(() =>
    saved?.criteria ?? template.criteria.map(c => ({ id: crypto.randomUUID(), ...c }))
  );
  const [isSaved, setIsSaved]   = useState(!!saved);

  const isWeighted   = template.maxScore !== null;
  const weightedPct  = isWeighted ? computeWeightedScore(criteria, template.maxScore) : null;
  const scored       = criteria.filter(c => c.score !== null).length;

  function update(id, field, val) {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));
    setIsSaved(false);
  }

  function handleSave() {
    onSave(storageKey, { title, criteria });
    setIsSaved(true);
  }

  return (
    <div>
      <div className="mb-4">
        <input value={title} onChange={e => { setTitle(e.target.value); setIsSaved(false); }}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>

      {/* Score summary strip */}
      {isWeighted && (
        <div className="mb-4 flex items-center gap-4 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          <span>{scored} / {criteria.length} criteria scored</span>
          {weightedPct !== null && (
            <span className="font-semibold text-indigo-700">
              Weighted score: {weightedPct}%
            </span>
          )}
        </div>
      )}

      {/* Criteria rows */}
      <div className="space-y-3">
        {criteria.map(c => (
          <div key={c.id} className="border border-gray-100 rounded-lg p-3 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 mb-1">{c.name}</p>
                {c.notes && (
                  <p className="text-[11px] text-gray-400 italic mb-2">{c.notes}</p>
                )}
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Evidence / target field */}
                  <input
                    value={c.evidence}
                    onChange={e => update(c.id, 'evidence', e.target.value)}
                    placeholder={c.evidence || 'Evidence / target value'}
                    className={`${INPUT} max-w-xs`}
                  />
                </div>
              </div>
              {/* Score picker */}
              <div className="flex-shrink-0 text-right">
                {isWeighted && c.weight !== null && (
                  <p className="text-[10px] text-gray-400 mb-1">Weight: {c.weight}%</p>
                )}
                <div className="flex gap-1">
                  {SCORE_OPTIONS.map(s => (
                    <button
                      key={s ?? 'null'}
                      type="button"
                      onClick={() => update(c.id, 'score', c.score === s ? null : s)}
                      className={`w-6 h-6 rounded text-xs font-medium border transition-colors ${
                        c.score === s && s !== null
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : s === null
                          ? 'border-gray-200 text-gray-300 text-[10px]'
                          : 'border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
                      }`}
                    >
                      {s === null ? '–' : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 flex-wrap">
        {engagement && (
          <button type="button" onClick={handleSave}
            className="text-xs px-3 py-1.5 rounded-md font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
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
