import { useState } from 'react';
import { useEngagements } from '../hooks/useEngagements.js';
import { generateWeeklyDigest } from '../lib/digestGenerator.js';
import { generateAllReminders } from '../lib/reminderGenerator.js';
import { getFormDefs } from '../data/formDefinitions.js';

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function DigestPage() {
  const { engagements, loading } = useEngagements();
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  const digest = generateWeeklyDigest(engagements);

  // Collect all reminders across all active engagements
  const reminders = engagements
    .filter(e => e.status === 'Active')
    .flatMap(eng => generateAllReminders(eng, getFormDefs(eng.serviceType)));

  function handleCopy() {
    navigator.clipboard.writeText(digest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Digest</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generated from {engagements.length} engagement{engagements.length !== 1 ? 's' : ''} as of {formatDate(new Date().toISOString())}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="text-sm bg-white border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors"
        >
          {copied ? 'Copied ✓' : 'Copy markdown'}
        </button>
      </div>

      {/* ── Digest preview ── */}
      <div className="border border-gray-200 rounded-lg bg-white p-5 mb-6">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
          {digest}
        </pre>
      </div>

      {/* ── Active reminders panel ── */}
      {reminders.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">
            Active Reminders ({reminders.length})
          </h2>
          <div className="space-y-2">
            {reminders.map((r, i) => {
              const badgeColor = {
                'stale-engagement': 'bg-amber-100 text-amber-700',
                'open-risk':        'bg-red-100 text-red-700',
                'missing-forms':    'bg-blue-100 text-blue-700',
              }[r.type] ?? 'bg-gray-100 text-gray-600';

              const typeLabel = {
                'stale-engagement': 'Stale',
                'open-risk':        r.severity ? `${r.severity} Risk` : 'Risk',
                'missing-forms':    'Missing Forms',
              }[r.type] ?? r.type;

              return (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg px-4 py-3 bg-white flex items-start gap-3"
                >
                  <span className={`mt-0.5 flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {typeLabel}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{r.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {reminders.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No active reminders.</p>
      )}
    </div>
  );
}
