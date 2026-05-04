// Weekly founder digest generator.
// computeDigestData  — structured data object (used by DigestPage.jsx for rich rendering)
// generateWeeklyDigest — markdown string (used by "Copy markdown" button + n8n workflow)

import { effectiveStatus } from './statusUtils.js';

const STALE_DAYS  = 7;
const RECENT_DAYS = 7;

function msSince(isoString) {
  if (!isoString) return Infinity;
  return Date.now() - new Date(isoString).getTime();
}

function isRecent(isoString) {
  return msSince(isoString) < RECENT_DAYS * 86_400_000;
}

function isStale(isoString) {
  return msSince(isoString) > STALE_DAYS * 86_400_000;
}

function fmtDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// Returns the ISO string of the most recent logged activity (notes or outputs).
export function lastActivityDate(engagement) {
  const lastNote   = engagement.notesLog?.slice(-1)[0]?.date;
  const lastOutput = engagement.outputs?.slice(-1)[0]?.generatedAt;
  return [lastNote, lastOutput].filter(Boolean).sort().slice(-1)[0] ?? null;
}

// ── Structured data ───────────────────────────────────────────────────────────
// Returns all digest data as typed JS objects — consumed by DigestPage.jsx
// for rich HTML rendering. generateWeeklyDigest calls this internally.
export function computeDigestData(engagements, asOf = new Date().toISOString()) {
  const active    = engagements.filter(e => effectiveStatus(e) === 'Active');
  const draft     = engagements.filter(e => effectiveStatus(e) === 'Draft');
  const onHold    = engagements.filter(e => effectiveStatus(e) === 'On Hold');
  const completed = engagements.filter(e => effectiveStatus(e) === 'Completed');

  // Stale active engagements — include pre-computed lastActivity for rendering
  const staleActive = active
    .filter(eng => isStale(lastActivityDate(eng)))
    .map(eng => ({ ...eng, lastActivity: lastActivityDate(eng) }));

  // Open High / Critical risks across active engagements
  const openHighRisks = active.flatMap(eng =>
    (eng.risksLog ?? [])
      .filter(r => r.status === 'Open' && (r.severity === 'High' || r.severity === 'Critical'))
      .map(r => ({ ...r, engagementName: eng.clientName, company: eng.company }))
  );

  // Recent notes (last 7 days, newest first, capped at 5)
  const recentNotes = active.flatMap(eng =>
    (eng.notesLog ?? [])
      .filter(n => isRecent(n.date))
      .map(n => ({ ...n, engagementName: eng.clientName }))
  ).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  // Recent outputs (last 7 days)
  const recentOutputs = engagements.flatMap(eng =>
    (eng.outputs ?? [])
      .filter(o => isRecent(o.generatedAt))
      .map(o => ({ ...o, engagementName: eng.clientName }))
  ).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));

  // Workflow progress for active engagements
  const workflowRows = active.map(eng => {
    const total = eng.workflow?.length ?? 0;
    const done  = eng.workflow?.filter(s => s.done).length ?? 0;
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
    return { name: eng.clientName, company: eng.company, serviceType: eng.serviceType, done, total, pct };
  });

  return {
    active, draft, onHold, completed,
    staleActive, openHighRisks,
    recentNotes, recentOutputs,
    workflowRows,
    asOf,
  };
}

// ── Markdown string ───────────────────────────────────────────────────────────
// Kept for clipboard export and external integrations (n8n workflow).
export function generateWeeklyDigest(engagements, asOf = new Date().toISOString()) {
  const {
    active, draft, onHold, completed,
    staleActive, openHighRisks,
    recentNotes, recentOutputs,
    workflowRows,
  } = computeDigestData(engagements, asOf);

  const lines = [];
  const weekOf = new Date(asOf).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  lines.push('# Weekly Founder Digest');
  lines.push('');
  lines.push(`**Week of:** ${weekOf}`);
  lines.push(`**Generated:** ${fmtDate(asOf)}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // ── Summary counts ──
  lines.push('## Engagement Summary');
  lines.push('');
  lines.push('| Status | Count |');
  lines.push('|---|---|');
  lines.push(`| Active | ${active.length} |`);
  lines.push(`| Draft | ${draft.length} |`);
  lines.push(`| On Hold | ${onHold.length} |`);
  lines.push(`| Completed | ${completed.length} |`);
  lines.push(`| **Total** | **${engagements.length}** |`);
  lines.push('');

  // ── Active engagement workflow progress ──
  if (workflowRows.length > 0) {
    lines.push('## Active Engagements');
    lines.push('');
    lines.push('| Client | Company | Workflow Progress |');
    lines.push('|---|---|---|');
    workflowRows.forEach(e => {
      lines.push(`| ${e.name} | ${e.company} | ${e.done}/${e.total} steps (${e.pct}%) |`);
    });
    lines.push('');
  }

  // ── Stale alerts ──
  if (staleActive.length > 0) {
    lines.push('## ⚠️ Stale Engagements (no activity in 7+ days)');
    lines.push('');
    staleActive.forEach(eng => {
      lines.push(`- **${eng.clientName}** (${eng.company}) — last activity: ${eng.lastActivity ? fmtDate(eng.lastActivity) : 'none recorded'}`);
    });
    lines.push('');
  }

  // ── Open high/critical risks ──
  if (openHighRisks.length > 0) {
    lines.push('## 🔴 Open High / Critical Risks');
    lines.push('');
    openHighRisks.forEach(r => {
      lines.push(`- **[${r.severity}]** ${r.title}`);
      lines.push(`  _${r.engagementName} · ${r.company}_ · Owner: ${r.owner}`);
    });
    lines.push('');
  }

  // ── Recent notes ──
  if (recentNotes.length > 0) {
    lines.push('## Recent Notes (last 7 days)');
    lines.push('');
    recentNotes.forEach(n => {
      const preview = n.content.length > 140 ? n.content.slice(0, 140) + '…' : n.content;
      lines.push(`- **${n.engagementName}** (${fmtDate(n.date)}): ${preview}`);
    });
    lines.push('');
  }

  // ── Recent outputs ──
  if (recentOutputs.length > 0) {
    lines.push('## Recent Outputs Generated');
    lines.push('');
    recentOutputs.forEach(o => {
      lines.push(`- **${o.engagementName}**: \`${o.filename}\` (${fmtDate(o.generatedAt)})`);
    });
    lines.push('');
  }

  if (staleActive.length === 0 && openHighRisks.length === 0 && recentNotes.length === 0 && recentOutputs.length === 0) {
    lines.push('_No recent activity or alerts this week._');
    lines.push('');
  }

  lines.push('---');
  lines.push('*Generated by Barinhall Delivery Hub*');

  return lines.join('\n');
}
