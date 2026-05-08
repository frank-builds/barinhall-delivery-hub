/**
 * Sprint D4 — /crm/leads/:id — lead detail page.
 *
 * Sections:
 *   - Header: name, company, score badge, Edit (gated)
 *   - Duplicate banner (if email matches another lead/contact)
 *   - Field grid (email, phone, title, source, status, fit, industry, size, tags, createdBy)
 *   - Score breakdown (transparent: shows each rule's contribution)
 *   - Summary notes (form-level, separate from activity log)
 *   - Activity NotesLog (gated by crm.write via readOnly prop)
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useAuthz } from '../../hooks/useAuthz.js';
import { useCRM } from '../../hooks/useCRM.js';
import { Badge } from '../../components/Badge.jsx';
import { PermissionGate } from '../../components/PermissionGate.jsx';
import { NotesLog } from '../../components/NotesLog.jsx';
import { LeadFormModal }      from '../../components/crm/LeadFormModal.jsx';
import { LeadScoreBadge }     from '../../components/crm/LeadScoreBadge.jsx';
import { LeadDuplicateBanner } from '../../components/crm/LeadDuplicateBanner.jsx';
import { sourceLabel }       from '../../data/crmLeadSources.js';
import { statusLabel, statusBadgeTone } from '../../data/crmLeadStatuses.js';
import { scoreLead, scoreBreakdown }    from '../../data/crmLeadScoring.js';

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="bh-section-label">{label}</p>
      <p className="text-sm text-slate-800 mt-0.5 break-words">
        {value || <span className="text-slate-300">—</span>}
      </p>
    </div>
  );
}

export function LeadDetail() {
  const { id } = useParams();
  const {
    getLead,
    updateLead,
    addLeadNote,
    updateLeadNote,
    loading,
  } = useCRM();
  const { user } = useAuth();
  const { can } = useAuthz();
  const [showEdit, setShowEdit] = useState(false);

  if (loading) {
    return <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>;
  }

  const lead = getLead(id);

  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-3">Lead not found.</p>
        <Link to="/crm/leads" className="text-indigo-600 hover:text-indigo-800 text-sm">
          ← Back to Leads
        </Link>
      </div>
    );
  }

  const { score } = scoreLead(lead);
  const breakdown = scoreBreakdown(lead);

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <Link to="/crm/leads" className="text-sm text-slate-400 hover:text-slate-600">
          ← Leads
        </Link>
      </div>

      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-6 gap-4">
        <div className="min-w-0">
          <h1 className="break-words">{lead.name || 'Unnamed lead'}</h1>
          <p className="text-slate-500 text-sm">
            {lead.title ? `${lead.title}` : ''}
            {lead.title && lead.company ? ' · ' : ''}
            {lead.company || (!lead.title && 'Company not set')}
          </p>
        </div>
        <div className="flex items-start gap-3 flex-shrink-0">
          <div className="flex flex-col items-end gap-1">
            <LeadScoreBadge lead={lead} />
            <Badge tone={statusBadgeTone(lead.status)} className="text-[10px] py-0">
              {statusLabel(lead.status)}
            </Badge>
          </div>
          <PermissionGate perm="crm.write">
            <button onClick={() => setShowEdit(true)} className="bh-btn-secondary text-xs py-1 px-3">
              Edit
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* ── Duplicate banner ── */}
      <LeadDuplicateBanner lead={lead} />

      {/* ── Status quick-update for crm.write ── */}
      <PermissionGate perm="crm.write">
        <div className="mb-6 flex items-center gap-3 text-sm">
          <span className="bh-section-label">Move to status</span>
          <select
            className="bh-input w-auto text-xs py-1"
            value={lead.status}
            onChange={e => updateLead(lead.id, { status: e.target.value })}
          >
            <option value="new">New</option>
            <option value="qualified">Qualified</option>
            <option value="disqualified">Disqualified</option>
          </select>
          <span className="text-xs text-slate-400">
            Promotion to opportunity arrives in Sprint D5.
          </span>
        </div>
      </PermissionGate>

      {/* ── Field grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-8">
        <DetailRow
          label="Email"
          value={lead.email ? (
            <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:text-indigo-800">
              {lead.email}
            </a>
          ) : ''}
        />
        <DetailRow label="Phone"        value={lead.phone} />
        <DetailRow label="Company"      value={lead.company} />
        <DetailRow label="Title"        value={lead.title} />
        <DetailRow label="Source"       value={sourceLabel(lead.source)} />
        <DetailRow label="Industry"     value={lead.industry} />
        <DetailRow label="Company size" value={lead.companySize} />
        <DetailRow label="Fit rating"   value={lead.fitRating} />
        <DetailRow label="Created by"   value={lead.createdBy} />
        <div>
          <p className="bh-section-label">Tags</p>
          <div className="mt-0.5 flex flex-wrap gap-1.5">
            {Array.isArray(lead.tags) && lead.tags.length > 0
              ? lead.tags.map(t => (
                  <Badge key={t} tone="neutral" className="text-[10px] py-0">{t}</Badge>
                ))
              : <span className="text-sm text-slate-300">—</span>
            }
          </div>
        </div>
      </div>

      {/* ── Score breakdown ── */}
      <section className="mb-8 bh-card px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="bh-section-label">Score breakdown</p>
          <p className="text-xs text-slate-400 tabular-nums">Total: {score} / 100</p>
        </div>
        {breakdown.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No scoring inputs yet — add a source, fit rating, or company size.</p>
        ) : (
          <ul className="space-y-1.5">
            {breakdown.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{item.label}</span>
                <span className="tabular-nums text-slate-700">+{item.points}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[10px] text-slate-400 mt-3">
          Scoring rules live in <code className="font-mono">src/data/crmLeadScoring.js</code> — adjustable without a migration.
        </p>
      </section>

      {/* ── Summary notes (from form) ── */}
      {lead.notes && (
        <section className="mb-4">
          <p className="bh-section-label mb-2">Summary</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{lead.notes}</p>
        </section>
      )}

      {/* ── Activity notes log ── */}
      <NotesLog
        entries={lead.notesLog ?? []}
        defaultOwner={user?.email ?? ''}
        onAdd={fields => addLeadNote(lead.id, fields)}
        onUpdate={(noteId, fields) => updateLeadNote(lead.id, noteId, fields)}
        readOnly={!can('crm.write')}
      />

      {/* ── Edit modal ── */}
      <LeadFormModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        lead={lead}
      />
    </div>
  );
}
