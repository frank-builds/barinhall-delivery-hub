import { useState, useRef } from 'react';
import { useEngagements } from '../hooks/useEngagements.js';
import { generateWeeklyDigest, computeDigestData } from '../lib/digestGenerator.js';
import { generateAllReminders } from '../lib/reminderGenerator.js';
import { getFormDefs } from '../data/formDefinitions.js';
import { exportElementToPdf, makePdfFilename } from '../lib/exportPdf.js';

function fmtDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ icon, title, count, danger = false }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && <span role="img" aria-hidden>{icon}</span>}
      <h2 className={danger ? 'text-red-800' : undefined}>{title}</h2>
      {count != null && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          danger ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-500'
        }`}>
          {count}
        </span>
      )}
    </div>
  );
}

function WorkflowProgressBar({ pct }) {
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 tabular-nums w-8 text-right flex-shrink-0">{pct}%</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const SUMMARY_CONFIG = [
  { key: 'active',    label: 'Active',    accent: 'text-emerald-600' },
  { key: 'draft',     label: 'Draft',     accent: 'text-slate-500'   },
  { key: 'onHold',    label: 'On Hold',   accent: 'text-amber-600'   },
  { key: 'completed', label: 'Completed', accent: 'text-sky-600'     },
];

export function DigestPage() {
  const { engagements, loading } = useEngagements();
  const [copied,   setCopied]   = useState(false);
  const [pdfBusy,  setPdfBusy]  = useState(false);
  const [pdfError, setPdfError] = useState('');
  // Ref covers the full exportable content area (action buttons are excluded via data-html2canvas-ignore)
  const exportRef = useRef(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  const d = computeDigestData(engagements);

  const reminders = engagements
    .filter(e => e.status === 'Active')
    .flatMap(eng => generateAllReminders(eng, getFormDefs(eng.serviceType)));

  function handleCopy() {
    navigator.clipboard.writeText(generateWeeklyDigest(engagements));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadPdf() {
    setPdfBusy(true);
    setPdfError('');
    try {
      await exportElementToPdf(
        exportRef.current,
        makePdfFilename('Weekly Digest'),
      );
    } catch (err) {
      console.error('PDF export failed:', err);
      setPdfError('PDF export failed — please try again.');
      setTimeout(() => setPdfError(''), 5000);
    } finally {
      setPdfBusy(false);
    }
  }

  const weekOf = new Date(d.asOf).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const hasAlerts =
    d.staleActive.length > 0 ||
    d.openHighRisks.length > 0 ||
    d.recentNotes.length > 0 ||
    d.recentOutputs.length > 0;

  return (
    <div ref={exportRef} className="max-w-3xl space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1>Weekly Digest</h1>
          <p className="text-sm text-slate-500 mt-1">
            Week of {weekOf} · {engagements.length} engagement{engagements.length !== 1 ? 's' : ''}
          </p>
        </div>
        {/* data-html2canvas-ignore excludes these buttons from PDF capture */}
        <div className="flex items-center gap-2 flex-wrap" data-html2canvas-ignore="true">
          <button onClick={handleCopy} className="bh-btn-secondary">
            {copied ? (
              <><span className="text-emerald-600">✓</span> Copied</>
            ) : (
              'Copy markdown'
            )}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfBusy}
            className="bh-btn-secondary disabled:opacity-50 disabled:cursor-wait"
          >
            {pdfBusy ? 'Generating…' : '↓ Download PDF'}
          </button>
          {pdfError && (
            <span className="text-xs text-red-600">{pdfError}</span>
          )}
        </div>
      </div>

      {/* ── Engagement Summary ── */}
      <section>
        <p className="bh-section-label mb-3">Engagement Summary</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUMMARY_CONFIG.map(({ key, label, accent }) => (
            <div key={key} className="bh-card px-4 py-3 text-center">
              <p className={`text-2xl font-bold tabular-nums ${accent}`}>{d[key].length}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Active Engagements ── */}
      {d.workflowRows.length > 0 && (
        <section>
          <SectionHeader title="Active Engagements" count={d.workflowRows.length} />
          <div className="bh-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-2.5 bh-section-label">Client</th>
                  <th className="text-left px-4 py-2.5 bh-section-label hidden sm:table-cell">Company</th>
                  <th className="text-left px-4 py-2.5 bh-section-label">Progress</th>
                </tr>
              </thead>
              <tbody>
                {d.workflowRows.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-slate-50 last:border-0 ${i % 2 === 1 ? 'bg-slate-50/40' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{row.company}</td>
                    <td className="px-4 py-3">
                      <WorkflowProgressBar pct={row.pct} />
                      <p className="text-xs text-slate-400 mt-1">{row.done}/{row.total} steps</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Stale Engagements ── */}
      {d.staleActive.length > 0 && (
        <section>
          <SectionHeader icon="⚠️" title="Stale Engagements" count={d.staleActive.length} />
          <div className="space-y-2">
            {d.staleActive.map((eng, i) => (
              <div
                key={i}
                className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-900">{eng.clientName}</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {eng.company}
                    <span className="mx-1.5 opacity-50">·</span>
                    Last activity: {eng.lastActivity ? fmtDate(eng.lastActivity) : 'none recorded'}
                  </p>
                </div>
                <span className="flex-shrink-0 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 mt-0.5">
                  No activity 7+ days
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Open High / Critical Risks ── */}
      {d.openHighRisks.length > 0 && (
        <section>
          <SectionHeader icon="🔴" title="Open High / Critical Risks" count={d.openHighRisks.length} danger />
          <div className="space-y-2">
            {d.openHighRisks.map((r, i) => (
              <div key={i} className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                <span className={`flex-shrink-0 mt-0.5 text-xs font-bold px-2 py-0.5 rounded ${
                  r.severity === 'Critical'
                    ? 'bg-red-200 text-red-800'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {r.severity}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-900">{r.title}</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    {r.engagementName}
                    <span className="mx-1 opacity-50">·</span>
                    {r.company}
                    <span className="mx-1 opacity-50">·</span>
                    Owner: {r.owner || '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Recent Notes ── */}
      {d.recentNotes.length > 0 && (
        <section>
          <SectionHeader title="Recent Notes" count={d.recentNotes.length} />
          <div className="bh-card divide-y divide-slate-100">
            {d.recentNotes.map((n, i) => (
              <div key={i} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-800">{n.engagementName}</span>
                  <span className="text-xs text-slate-400 flex-shrink-0">{fmtDate(n.date)}</span>
                </div>
                <p className="text-sm text-slate-600 leading-snug line-clamp-2">
                  {n.content.length > 140 ? n.content.slice(0, 140) + '…' : n.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Recent Outputs ── */}
      {d.recentOutputs.length > 0 && (
        <section>
          <SectionHeader title="Recent Outputs" count={d.recentOutputs.length} />
          <div className="bh-card divide-y divide-slate-100">
            {d.recentOutputs.map((o, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800">{o.engagementName}</span>
                  <code className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                    {o.filename}
                  </code>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{fmtDate(o.generatedAt)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Empty state ── */}
      {!hasAlerts && (
        <div className="bh-card px-6 py-10 text-center">
          <p className="text-slate-400 text-sm">No recent activity or alerts this week.</p>
        </div>
      )}

      {/* ── Active Reminders ── */}
      {reminders.length > 0 && (
        <section>
          <SectionHeader title="Active Reminders" count={reminders.length} />
          <div className="space-y-2">
            {reminders.map((r, i) => {
              const wrapperColor = {
                'stale-engagement': 'bg-amber-50 border-amber-200',
                'open-risk':        'bg-red-50 border-red-200',
                'missing-forms':    'bg-sky-50 border-sky-200',
              }[r.type] ?? 'bg-slate-50 border-slate-200';
              const chipColor = {
                'stale-engagement': 'bg-amber-100 text-amber-700',
                'open-risk':        'bg-red-100 text-red-700',
                'missing-forms':    'bg-sky-100 text-sky-700',
              }[r.type] ?? 'bg-slate-100 text-slate-600';
              const typeLabel = {
                'stale-engagement': 'Stale',
                'open-risk':        r.severity ? `${r.severity} Risk` : 'Risk',
                'missing-forms':    'Missing Forms',
              }[r.type] ?? r.type;
              return (
                <div
                  key={i}
                  className={`border rounded-xl px-4 py-3 flex items-start gap-3 ${wrapperColor}`}
                >
                  <span className={`mt-0.5 flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${chipColor}`}>
                    {typeLabel}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{r.subject}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{r.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {reminders.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-2">No active reminders.</p>
      )}

    </div>
  );
}
