// SowBuilder — guided Statement of Work builder.
//
// Produces a professional-grade consulting SOW draft with 18 numbered sections.
// Data model v2 (Phase 11): structured deliverables, milestone schedule,
// client responsibilities, objectives, acceptance criteria, change control,
// governance, and IP/confidentiality stubs.
//
// Backward compatibility: normalizeSow() migrates v1 saved data (string
// deliverables, string assumptions/exclusions) into the v2 shape safely.

import { useState } from 'react';

// ── Style constants ───────────────────────────────────────────────────────────

const BTN   = 'text-xs px-3 py-1.5 rounded-md font-medium transition-colors';
const INPUT = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';
const LABEL = 'block text-xs font-semibold text-gray-600 mb-1';
const SEC   = 'text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-3 pt-1';

function Field({ label, hint, children }) {
  return (
    <div>
      <p className={LABEL}>{label}</p>
      {hint && <p className="text-[11px] text-gray-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <div className="border-b border-indigo-100 pb-1 mb-3">
      <p className={SEC}>{children}</p>
    </div>
  );
}

// ── Default / blank SOW ───────────────────────────────────────────────────────

function defaultSow(engagement) {
  return {
    // ── Identity ──────────────────────────────────────────────────────────────
    sowTitle:              'Statement of Work',
    engagementTitle:       engagement?.serviceTypes?.join(' / ') ?? '',
    clientName:            engagement?.clientName ?? '',
    company:               engagement?.company ?? '',
    consultantFirm:        'Barinhall',
    effectiveDate:         engagement?.startDate ?? '',
    termStart:             engagement?.startDate ?? '',
    termEnd:               '',
    governingAgreement:    '',

    // ── Background & objectives ───────────────────────────────────────────────
    background:            '',
    objectives:            [''],

    // ── Scope ─────────────────────────────────────────────────────────────────
    scopeNarrative:        '',

    // ── Deliverables (structured) ─────────────────────────────────────────────
    deliverables: [
      { id: crypto.randomUUID(), title: '', description: '', dueDate: '', acceptanceCriteria: '' },
    ],

    // ── Milestones ────────────────────────────────────────────────────────────
    milestones: [
      { id: crypto.randomUUID(), date: '', description: '', linkedDeliverables: '' },
    ],

    // ── Client responsibilities ───────────────────────────────────────────────
    clientResponsibilities: [''],

    // ── Assumptions & exclusions ──────────────────────────────────────────────
    assumptions:  [''],
    exclusions:   [''],

    // ── Fees ──────────────────────────────────────────────────────────────────
    feeStructure:    'fixed',
    feeAmount:       '',
    billingSchedule: '',
    paymentTerms:    'Net 30',
    expensePolicy:   'Reasonable, documented, pre-approved expenses will be billed at cost.',

    // ── Acceptance ────────────────────────────────────────────────────────────
    acceptanceProcess:  '',
    reviewPeriodDays:   '5',

    // ── Change control ────────────────────────────────────────────────────────
    changeControlNote:
      'Any addition to, or modification of, the scope, timeline, or fees described in this SOW requires a written Change Order executed by both parties before work commences.',

    // ── Governance ────────────────────────────────────────────────────────────
    consultantPM:    engagement?.owner ?? '',
    clientPM:        engagement?.primaryContact ?? '',
    meetingCadence:  '',

    // ── Legal stubs ───────────────────────────────────────────────────────────
    confidentialityNote:
      'All information disclosed by either party in connection with this SOW is confidential and subject to the non-disclosure provisions of the Governing Agreement. Neither party shall disclose the other\'s confidential information to any third party without prior written consent.',
    ipNote:
      'Subject to full payment of all fees due, all deliverables and work product produced by Consultant solely for Client under this SOW shall be the property of Client. Consultant retains ownership of its pre-existing methodologies, tools, frameworks, and intellectual property.',
    terminationNote:
      'Either party may terminate this SOW on 14 days\' written notice to the other. In the event of termination, Client shall pay for all work satisfactorily completed and expenses incurred to the effective date of termination.',

    // ── Risks (optional) ─────────────────────────────────────────────────────
    risks: [''],

    // ── Signatories ───────────────────────────────────────────────────────────
    consultantName:       engagement?.owner ?? '',
    consultantTitle:      '',
    clientSignatoryName:  engagement?.primaryContact ?? '',
    clientSignatoryTitle: '',
  };
}

// ── Backward-compatibility normalizer ────────────────────────────────────────
// v1 had: deliverables: string[], assumptions: string, exclusions: string,
// no scopeNarrative (used 'scope'), no objectives/clientResponsibilities, etc.

function normalizeSow(saved, engagement) {
  if (!saved) return defaultSow(engagement);
  const base = defaultSow(engagement);

  // String → array migrations
  const toArr = v =>
    Array.isArray(v) ? (v.length ? v : ['']) : (v ? [v] : ['']);

  // deliverables: string[] → object[]
  const deliverables = Array.isArray(saved.deliverables)
    ? saved.deliverables.map(d =>
        typeof d === 'string'
          ? { id: crypto.randomUUID(), title: d, description: '', dueDate: '', acceptanceCriteria: '' }
          : { id: d.id ?? crypto.randomUUID(), title: d.title ?? '', description: d.description ?? '', dueDate: d.dueDate ?? '', acceptanceCriteria: d.acceptanceCriteria ?? '' }
      )
    : base.deliverables;

  // milestones: add linkedDeliverables if missing
  const milestones = Array.isArray(saved.milestones)
    ? saved.milestones.map(m => ({
        id:                  m.id ?? crypto.randomUUID(),
        date:                m.date ?? '',
        description:         m.description ?? '',
        linkedDeliverables:  m.linkedDeliverables ?? '',
      }))
    : base.milestones;

  return {
    ...base,
    ...saved,
    // Override with normalized shapes
    deliverables,
    milestones,
    assumptions:            toArr(saved.assumptions),
    exclusions:             toArr(saved.exclusions),
    objectives:             toArr(saved.objectives),
    clientResponsibilities: toArr(saved.clientResponsibilities),
    risks:                  toArr(saved.risks),
    // Migrate v1 'scope' → 'scopeNarrative' when new field absent
    scopeNarrative: saved.scopeNarrative || saved.scope || '',
    // Preserve legacy engagementType as fallback for engagementTitle
    engagementTitle: saved.engagementTitle || saved.engagementType || '',
  };
}

// ── HTML generator ────────────────────────────────────────────────────────────

const S = (n, heading, body) =>
  body
    ? `<h2 style="font-size:14px;font-weight:700;color:#1e1b4b;border-bottom:2px solid #e0e7ff;padding-bottom:5px;margin:28px 0 10px">${n}. ${heading}</h2>${body}`
    : '';

const P = text => text ? `<p style="margin:0 0 10px;line-height:1.75">${text}</p>` : '';

const UL = items => {
  const rows = items.filter(Boolean).map(i => `<li style="margin-bottom:4px">${i}</li>`).join('');
  return rows ? `<ul style="margin:0 0 10px;padding-left:22px">${rows}</ul>` : '';
};

const TABLE = (head, rows) =>
  rows
    ? `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:12px">
        <thead><tr>${head.map(h => `<th style="text-align:left;padding:7px 10px;border:1px solid #e5e7eb;background:#f5f3ff;font-weight:600;white-space:nowrap">${h}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
       </table>`
    : '';

const TR = cells =>
  `<tr>${cells.map(c => `<td style="padding:6px 10px;border:1px solid #e5e7eb;vertical-align:top">${c || '—'}</td>`).join('')}</tr>`;

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

function generateSowHtml(d) {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const consultantDisplay = [d.consultantName, d.consultantTitle].filter(Boolean).join(', ');

  // ── 1. Cover block (with Barinhall logo) ───────────────────────────────────
  const cover = `
<div style="border-bottom:4px solid #4338ca;padding-bottom:18px;margin-bottom:28px">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
    <img src="/barinhall-logo.png" alt="Barinhall" style="height:28px;width:auto;object-fit:contain" />
    <p style="font-size:11px;color:#6b7280;margin:0">Confidential · Draft</p>
  </div>
  <p style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6d28d9;margin:0 0 6px;font-weight:600">Professional Services</p>
  <h1 style="font-size:26px;font-weight:800;margin:0 0 4px;color:#1e1b4b;font-family:inherit">${d.sowTitle || 'Statement of Work'}</h1>
  ${d.engagementTitle ? `<p style="font-size:15px;color:#4338ca;margin:0 0 12px;font-weight:600">${d.engagementTitle}</p>` : ''}
  <p style="margin:0;color:#6b7280;font-size:12px">Prepared by ${d.consultantFirm || 'Barinhall'} · ${today}</p>
</div>

<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:28px;border:1px solid #e5e7eb">
  <tr style="background:#f5f3ff"><td colspan="2" style="padding:6px 10px;font-weight:700;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#4338ca">Key Details</td></tr>
  <tr><td style="padding:6px 10px;font-weight:600;width:180px;border-top:1px solid #e5e7eb">Client</td><td style="padding:6px 10px;border-top:1px solid #e5e7eb">${d.clientName || '—'}${d.company ? ` · ${d.company}` : ''}</td></tr>
  <tr style="background:#fafafa"><td style="padding:6px 10px;font-weight:600;border-top:1px solid #e5e7eb">Consultant</td><td style="padding:6px 10px;border-top:1px solid #e5e7eb">${consultantDisplay || d.consultantFirm || '—'}</td></tr>
  <tr><td style="padding:6px 10px;font-weight:600;border-top:1px solid #e5e7eb">Effective Date</td><td style="padding:6px 10px;border-top:1px solid #e5e7eb">${fmtDate(d.effectiveDate)}</td></tr>
  <tr style="background:#fafafa"><td style="padding:6px 10px;font-weight:600;border-top:1px solid #e5e7eb">Performance Period</td><td style="padding:6px 10px;border-top:1px solid #e5e7eb">${fmtDate(d.termStart)}${d.termEnd ? ` – ${fmtDate(d.termEnd)}` : ''}</td></tr>
  ${d.governingAgreement ? `<tr><td style="padding:6px 10px;font-weight:600;border-top:1px solid #e5e7eb">Governing Agreement</td><td style="padding:6px 10px;border-top:1px solid #e5e7eb">${d.governingAgreement}</td></tr>` : ''}
</table>`;

  // ── Section bodies ──────────────────────────────────────────────────────────

  const overviewBody = P(
    `This Statement of Work ("SOW") is entered into between <strong>${d.consultantFirm || 'Consultant'}</strong> ("Consultant") and <strong>${d.company || d.clientName || 'Client'}</strong> ("Client") and sets out the specific services, deliverables, fees, and terms applicable to the engagement described herein. ${d.governingAgreement ? `This SOW is governed by and incorporates by reference the ${d.governingAgreement}. In the event of any conflict between this SOW and the Governing Agreement, the Governing Agreement shall take precedence except where this SOW expressly states otherwise.` : 'This SOW constitutes the complete agreement between the parties with respect to the services described herein and supersedes all prior discussions relating to this engagement.'}`
  );

  const partiesBody = TABLE(
    ['Party', 'Role', 'Primary Contact'],
    [
      TR([d.consultantFirm || 'Consultant', 'Service Provider', d.consultantPM || d.consultantName || '—']),
      TR([d.company || d.clientName || 'Client', 'Client', d.clientPM || d.clientSignatoryName || '—']),
    ].join('')
  );

  const backgroundBody = P(d.background);

  const objectivesBody = d.objectives?.filter(Boolean).length
    ? P('This engagement is intended to achieve the following business outcomes:') + UL(d.objectives)
    : '';

  const scopeBody = P(d.scopeNarrative);

  // Deliverables — rich table
  const delivRows = (d.deliverables ?? [])
    .filter(dv => dv.title)
    .map((dv, i) => TR([
      `<strong>D${i + 1} – ${dv.title}</strong>`,
      dv.description || '—',
      dv.dueDate ? fmtDate(dv.dueDate) : '—',
      dv.acceptanceCriteria || '—',
    ])).join('');
  const deliverablesBody = delivRows
    ? TABLE(['Deliverable', 'Description', 'Due', 'Acceptance Criteria'], delivRows)
    : '';

  // Milestones table
  const msRows = (d.milestones ?? [])
    .filter(m => m.description)
    .map(m => TR([
      fmtDate(m.date),
      m.description,
      m.linkedDeliverables || '—',
    ])).join('');
  const milestonesBody = msRows
    ? TABLE(['Target Date', 'Milestone', 'Associated Deliverable(s)'], msRows)
    : '';

  const clientRespBody = (d.clientResponsibilities ?? []).filter(Boolean).length
    ? P('The successful delivery of the services under this SOW is contingent upon the following contributions and timely actions from Client:') + UL(d.clientResponsibilities)
    : '';

  const assumptionsBody = (d.assumptions ?? []).filter(Boolean).length
    ? P('The scope and fees in this SOW are based on the following assumptions. If any assumption proves incorrect or changes, Consultant reserves the right to propose a Change Order to address the impact on scope, timeline, and/or fees:') + UL(d.assumptions)
    : '';

  const exclusionsBody = (d.exclusions ?? []).filter(Boolean).length
    ? P('The following are explicitly outside the scope of this SOW and will not be performed without a written Change Order:') + UL(d.exclusions)
    : '';

  const feeLabel = { fixed: 'Fixed Fee', 'time-and-materials': 'Time & Materials', retainer: 'Monthly Retainer' }[d.feeStructure] ?? 'Fee';
  const feesBody = (d.feeAmount || d.paymentTerms || d.billingSchedule)
    ? TABLE(
        ['Item', 'Detail'],
        [
          d.feeAmount    ? TR([`${feeLabel}`, d.feeAmount]) : '',
          d.billingSchedule ? TR(['Billing Schedule', d.billingSchedule]) : '',
          d.paymentTerms ? TR(['Payment Terms', d.paymentTerms]) : '',
          d.expensePolicy ? TR(['Expenses', d.expensePolicy]) : '',
        ].join('')
      ) + P('Invoices are payable in full within the period stated above. Consultant reserves the right to suspend services if invoices remain outstanding beyond 30 days after the due date.')
    : '';

  const acceptanceBody = (d.acceptanceProcess || d.reviewPeriodDays)
    ? P(d.acceptanceProcess
        ? d.acceptanceProcess
        : `Upon delivery of each deliverable, Client shall have ${d.reviewPeriodDays || '5'} business days to review and either (a) provide written acceptance or (b) provide written notice of specific deficiencies. Deliverables not rejected within the review period will be deemed accepted. Consultant shall remedy any documented deficiencies within an agreed timeframe at no additional cost.`)
    : P(`Upon delivery of each deliverable, Client shall have ${d.reviewPeriodDays || '5'} business days to review and either (a) provide written acceptance or (b) provide written notice of specific deficiencies. Deliverables not rejected within the review period will be deemed accepted. Consultant shall remedy any documented deficiencies within an agreed timeframe at no additional cost.`);

  const changeBody = P(d.changeControlNote);

  const governanceBody = (d.consultantPM || d.clientPM || d.meetingCadence)
    ? TABLE(
        ['Role', 'Name', 'Responsibility'],
        [
          d.consultantPM ? TR(['Consultant Project Lead', d.consultantPM, 'Day-to-day delivery, status reporting, escalation point for Consultant']) : '',
          d.clientPM ? TR(['Client Project Lead', d.clientPM, 'Day-to-day coordination, access facilitation, Client-side decisions']) : '',
        ].join('')
      ) + (d.meetingCadence ? P(`<strong>Meeting cadence:</strong> ${d.meetingCadence}`) : '')
    : '';

  const confidentialityBody = P(d.confidentialityNote);
  const ipBody = P(d.ipNote);

  const termBody = `${P(`<strong>Term:</strong> This SOW commences on ${fmtDate(d.termStart || d.effectiveDate)}${d.termEnd ? ` and expires on ${fmtDate(d.termEnd)}` : ', and continues until the services are completed or the SOW is otherwise terminated'}. `)}${P(d.terminationNote)}`;

  const risksBody = (d.risks ?? []).filter(Boolean).length
    ? P('The following risks and constraints have been identified. Both parties agree to monitor these and raise issues promptly through the governance process:') + UL(d.risks)
    : '';

  // Signatures
  const sigBlock = `
<h2 style="font-size:14px;font-weight:700;color:#1e1b4b;border-bottom:2px solid #e0e7ff;padding-bottom:5px;margin:28px 0 10px">18. Signatures</h2>
<p style="margin:0 0 16px;font-size:13px;line-height:1.75">By signing below, each party agrees to be bound by this Statement of Work and, where applicable, the Governing Agreement referenced herein.</p>
<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:8px">
  <tr>
    <td style="width:48%;padding-right:20px;vertical-align:top">
      <p style="font-weight:700;margin:0 0 2px;color:#1e1b4b">${d.consultantFirm || 'Consultant'}</p>
      <p style="margin:0">${d.consultantName || '___________________________'}</p>
      <p style="margin:2px 0 0;color:#6b7280;font-size:12px">${d.consultantTitle || ''}</p>
      <div style="margin-top:32px;border-top:1px solid #9ca3af;padding-top:5px;color:#9ca3af;font-size:11px">Signature &amp; Date</div>
    </td>
    <td style="width:4%"></td>
    <td style="width:48%;vertical-align:top">
      <p style="font-weight:700;margin:0 0 2px;color:#1e1b4b">${d.company || 'Client'}</p>
      <p style="margin:0">${d.clientSignatoryName || '___________________________'}</p>
      <p style="margin:2px 0 0;color:#6b7280;font-size:12px">${d.clientSignatoryTitle || ''}</p>
      <div style="margin-top:32px;border-top:1px solid #9ca3af;padding-top:5px;color:#9ca3af;font-size:11px">Signature &amp; Date</div>
    </td>
  </tr>
</table>`;

  const disclaimer = `
<p style="margin-top:36px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;line-height:1.6">
  <em>This document is a working draft prepared for review and discussion. It does not constitute legal advice. Parties should seek independent legal counsel before execution.</em>
</p>`;

  return `<div style="font-family:Georgia,serif;max-width:760px;margin:0 auto;color:#111827;font-size:14px;line-height:1.7;padding:12px">
${cover}
${S(1,  'Overview',                          overviewBody)}
${S(2,  'Parties',                            partiesBody)}
${S(3,  'Background and Purpose',             backgroundBody)}
${S(4,  'Objectives',                         objectivesBody)}
${S(5,  'Scope of Services',                  scopeBody)}
${S(6,  'Deliverables',                       deliverablesBody)}
${S(7,  'Milestones and Schedule',            milestonesBody)}
${S(8,  'Client Responsibilities',            clientRespBody)}
${S(9,  'Assumptions',                        assumptionsBody)}
${S(10, 'Out of Scope',                       exclusionsBody)}
${S(11, 'Fees and Payment Terms',             feesBody)}
${S(12, 'Acceptance Criteria',               acceptanceBody)}
${S(13, 'Change Control',                    changeBody)}
${S(14, 'Governance and Communications',     governanceBody)}
${S(15, 'Confidentiality and Data Handling', confidentialityBody)}
${S(16, 'Intellectual Property',             ipBody)}
${S(17, 'Term and Termination',              termBody)}
${risksBody ? S(17.5, 'Risks and Constraints', risksBody) : ''}
${sigBlock}
${disclaimer}
</div>`;
}

// ── Reusable list editors ─────────────────────────────────────────────────────

function StringList({ items, onChange, placeholder, addLabel }) {
  function update(i, val) {
    const next = [...items]; next[i] = val; onChange(next);
  }
  function add()     { onChange([...items, '']); }
  function remove(i) { onChange(items.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            value={item}
            onChange={e => update(i, e.target.value)}
            placeholder={placeholder?.(i) ?? `Item ${i + 1}`}
            className={INPUT}
          />
          {items.length > 1 && (
            <button type="button" onClick={() => remove(i)}
              className="flex-shrink-0 text-gray-300 hover:text-red-400 text-sm">✕</button>
          )}
        </div>
      ))}
      <button type="button" onClick={add}
        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
        {addLabel ?? '+ Add item'}
      </button>
    </div>
  );
}

function DeliverablesList({ items, onChange }) {
  function update(i, field, val) {
    onChange(items.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  }
  function add() {
    onChange([...items, { id: crypto.randomUUID(), title: '', description: '', dueDate: '', acceptanceCriteria: '' }]);
  }
  function remove(i) { onChange(items.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-3">
      {items.map((dv, i) => (
        <div key={dv.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2 relative">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Deliverable {i + 1}</p>
            {items.length > 1 && (
              <button type="button" onClick={() => remove(i)}
                className="text-gray-300 hover:text-red-400 text-xs">Remove</button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <p className={LABEL}>Title *</p>
              <input value={dv.title} onChange={e => update(i, 'title', e.target.value)}
                placeholder="e.g. AI Readiness Assessment Report" className={INPUT} />
            </div>
            <div className="col-span-2">
              <p className={LABEL}>Description</p>
              <textarea rows={2} value={dv.description}
                onChange={e => update(i, 'description', e.target.value)}
                placeholder="What this deliverable contains and how it will be provided..."
                className={INPUT} />
            </div>
            <div>
              <p className={LABEL}>Due Date</p>
              <input type="date" value={dv.dueDate}
                onChange={e => update(i, 'dueDate', e.target.value)}
                className={INPUT} />
            </div>
            <div>
              <p className={LABEL}>Acceptance Criteria</p>
              <input value={dv.acceptanceCriteria}
                onChange={e => update(i, 'acceptanceCriteria', e.target.value)}
                placeholder="e.g. Client written sign-off within 5 days" className={INPUT} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add}
        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
        + Add deliverable
      </button>
    </div>
  );
}

function MilestoneList({ items, onChange }) {
  function update(i, field, val) {
    onChange(items.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  }
  function add() {
    onChange([...items, { id: crypto.randomUUID(), date: '', description: '', linkedDeliverables: '' }]);
  }
  function remove(i) { onChange(items.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-2">
      {items.map((m, i) => (
        <div key={m.id} className="grid grid-cols-12 gap-2 items-start">
          <div className="col-span-3">
            <input type="date" value={m.date}
              onChange={e => update(i, 'date', e.target.value)}
              className={INPUT} />
          </div>
          <div className="col-span-5">
            <input value={m.description}
              onChange={e => update(i, 'description', e.target.value)}
              placeholder="Milestone description"
              className={INPUT} />
          </div>
          <div className="col-span-3">
            <input value={m.linkedDeliverables}
              onChange={e => update(i, 'linkedDeliverables', e.target.value)}
              placeholder="Linked deliverable(s)"
              className={INPUT} />
          </div>
          <div className="col-span-1 flex items-center justify-end pt-1">
            {items.length > 1 && (
              <button type="button" onClick={() => remove(i)}
                className="text-gray-300 hover:text-red-400 text-sm">✕</button>
            )}
          </div>
        </div>
      ))}
      <div className="grid grid-cols-12 gap-2">
        <p className="col-span-3 text-[10px] text-gray-400">Date</p>
        <p className="col-span-5 text-[10px] text-gray-400">Description</p>
        <p className="col-span-3 text-[10px] text-gray-400">Linked deliverable(s)</p>
      </div>
      <button type="button" onClick={add}
        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
        + Add milestone
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SowBuilder({ engagement, onSave, onClose }) {
  const savedFields = engagement?.artifactData?.sow?.fields;
  const [form,   setForm]   = useState(() => normalizeSow(savedFields, engagement));
  const [tab,    setTab]    = useState('form');
  const [copied, setCopied] = useState(false);
  const [saved_, setSaved_] = useState(!!savedFields);

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved_(false);
  }

  function handleSave() {
    const html = generateSowHtml(form);
    onSave('sow', { fields: form, htmlPreview: html });
    setSaved_(true);
  }

  async function handleCopyHtml() {
    try { await navigator.clipboard.writeText(generateSowHtml(form)); } catch { /* no-op */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const previewHtml = tab === 'preview' ? generateSowHtml(form) : '';

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {['form', 'preview'].map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`text-sm px-4 py-2 font-medium border-b-2 transition-colors -mb-px ${
              tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'form' ? '📝 Form' : '👁 Preview'}
          </button>
        ))}
      </div>

      {tab === 'form' && (
        <div className="space-y-7">

          {/* ── 1. Document identity ── */}
          <div>
            <SectionHeading>Document &amp; Parties</SectionHeading>
            <div className="grid grid-cols-2 gap-3">
              <Field label="SOW Title">
                <input value={form.sowTitle} onChange={e => set('sowTitle', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Engagement Title">
                <input value={form.engagementTitle}
                  onChange={e => set('engagementTitle', e.target.value)}
                  placeholder="e.g. AI Readiness Assessment" className={INPUT} />
              </Field>
              <Field label="Client Name *">
                <input value={form.clientName}
                  onChange={e => set('clientName', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Client Company *">
                <input value={form.company}
                  onChange={e => set('company', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Consulting Firm">
                <input value={form.consultantFirm}
                  onChange={e => set('consultantFirm', e.target.value)}
                  placeholder="e.g. Barinhall" className={INPUT} />
              </Field>
              <Field label="Effective Date">
                <input type="date" value={form.effectiveDate}
                  onChange={e => set('effectiveDate', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Performance Period — Start">
                <input type="date" value={form.termStart}
                  onChange={e => set('termStart', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Performance Period — End">
                <input type="date" value={form.termEnd}
                  onChange={e => set('termEnd', e.target.value)} className={INPUT} />
              </Field>
              <div className="col-span-2">
                <Field label="Governing Agreement (if applicable)"
                  hint="e.g. 'Master Services Agreement dated 1 January 2025'. Leave blank if this SOW is the primary agreement.">
                  <input value={form.governingAgreement}
                    onChange={e => set('governingAgreement', e.target.value)}
                    placeholder="Master Services Agreement dated..." className={INPUT} />
                </Field>
              </div>
            </div>
          </div>

          {/* ── 2. Background & objectives ── */}
          <div>
            <SectionHeading>Background &amp; Objectives</SectionHeading>
            <div className="space-y-3">
              <Field label="Project Background / Context"
                hint="What led to this engagement? What problem is being solved?">
                <textarea rows={3} value={form.background}
                  onChange={e => set('background', e.target.value)}
                  placeholder="Describe the business context, drivers, and why this work is needed..."
                  className={INPUT} />
              </Field>
              <Field label="Objectives / Business Outcomes"
                hint="List measurable or concrete outcomes the engagement is intended to deliver.">
                <StringList items={form.objectives}
                  onChange={v => set('objectives', v)}
                  placeholder={i => `Objective ${i + 1} — e.g. Identify top 3 AI use cases...`}
                  addLabel="+ Add objective" />
              </Field>
            </div>
          </div>

          {/* ── 3. Scope ── */}
          <div>
            <SectionHeading>Scope of Services</SectionHeading>
            <Field label="Scope Narrative"
              hint="Describe the approach, methods, and activities Consultant will perform.">
              <textarea rows={4} value={form.scopeNarrative}
                onChange={e => set('scopeNarrative', e.target.value)}
                placeholder="Consultant will provide... This engagement will include... Activities include..."
                className={INPUT} />
            </Field>
          </div>

          {/* ── 4. Deliverables ── */}
          <div>
            <SectionHeading>Deliverables</SectionHeading>
            <p className="text-[11px] text-gray-400 mb-3">
              Add each tangible output. Include a description, due date, and how acceptance will be confirmed.
            </p>
            <DeliverablesList
              items={form.deliverables}
              onChange={v => set('deliverables', v)} />
          </div>

          {/* ── 5. Milestones ── */}
          <div>
            <SectionHeading>Milestones &amp; Schedule</SectionHeading>
            <MilestoneList
              items={form.milestones}
              onChange={v => set('milestones', v)} />
          </div>

          {/* ── 6. Client responsibilities ── */}
          <div>
            <SectionHeading>Client Responsibilities &amp; Dependencies</SectionHeading>
            <p className="text-[11px] text-gray-400 mb-3">
              List what Client must provide, decide, or action for the engagement to proceed. Delays here may trigger a Change Order.
            </p>
            <StringList items={form.clientResponsibilities}
              onChange={v => set('clientResponsibilities', v)}
              placeholder={i => `Client responsibility ${i + 1} — e.g. Provide access to internal systems by Day 3...`}
              addLabel="+ Add responsibility" />
          </div>

          {/* ── 7. Assumptions ── */}
          <div>
            <SectionHeading>Assumptions</SectionHeading>
            <p className="text-[11px] text-gray-400 mb-3">
              State conditions the engagement depends on. Invalid assumptions may require a Change Order.
            </p>
            <StringList items={form.assumptions}
              onChange={v => set('assumptions', v)}
              placeholder={i => `Assumption ${i + 1} — e.g. Client data is accessible and of sufficient quality...`}
              addLabel="+ Add assumption" />
          </div>

          {/* ── 8. Out of scope ── */}
          <div>
            <SectionHeading>Out of Scope / Exclusions</SectionHeading>
            <p className="text-[11px] text-gray-400 mb-3">
              Explicitly state what is not included to prevent scope creep.
            </p>
            <StringList items={form.exclusions}
              onChange={v => set('exclusions', v)}
              placeholder={i => `Exclusion ${i + 1} — e.g. Implementation or build of any AI systems...`}
              addLabel="+ Add exclusion" />
          </div>

          {/* ── 9. Fees ── */}
          <div>
            <SectionHeading>Fees &amp; Invoicing</SectionHeading>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fee Structure">
                <select value={form.feeStructure}
                  onChange={e => set('feeStructure', e.target.value)}
                  className={INPUT}>
                  <option value="fixed">Fixed Fee</option>
                  <option value="time-and-materials">Time &amp; Materials</option>
                  <option value="retainer">Monthly Retainer</option>
                </select>
              </Field>
              <Field label="Fee Amount">
                <input value={form.feeAmount}
                  onChange={e => set('feeAmount', e.target.value)}
                  placeholder="e.g. $12,500" className={INPUT} />
              </Field>
              <div className="col-span-2">
                <Field label="Billing / Invoicing Schedule"
                  hint="e.g. 50% upon execution, 50% upon delivery of final report.">
                  <input value={form.billingSchedule}
                    onChange={e => set('billingSchedule', e.target.value)}
                    placeholder="e.g. 50% on execution, 50% on final delivery" className={INPUT} />
                </Field>
              </div>
              <Field label="Payment Terms">
                <input value={form.paymentTerms}
                  onChange={e => set('paymentTerms', e.target.value)}
                  placeholder="e.g. Net 30" className={INPUT} />
              </Field>
              <Field label="Expense Policy">
                <input value={form.expensePolicy}
                  onChange={e => set('expensePolicy', e.target.value)} className={INPUT} />
              </Field>
            </div>
          </div>

          {/* ── 10. Acceptance criteria ── */}
          <div>
            <SectionHeading>Acceptance Criteria &amp; Review Process</SectionHeading>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Review Period (business days)">
                <input value={form.reviewPeriodDays}
                  onChange={e => set('reviewPeriodDays', e.target.value)}
                  placeholder="e.g. 5" className={INPUT} />
              </Field>
              <div className="col-span-1" />
              <div className="col-span-2">
                <Field label="Acceptance Process (optional override)"
                  hint="Leave blank to use the standard review-period language in the output.">
                  <textarea rows={2} value={form.acceptanceProcess}
                    onChange={e => set('acceptanceProcess', e.target.value)}
                    placeholder="Describe the sign-off and remediation process, or leave blank for default language..."
                    className={INPUT} />
                </Field>
              </div>
            </div>
          </div>

          {/* ── 11. Change control ── */}
          <div>
            <SectionHeading>Change Control</SectionHeading>
            <Field label="Change Control Clause">
              <textarea rows={2} value={form.changeControlNote}
                onChange={e => set('changeControlNote', e.target.value)}
                className={INPUT} />
            </Field>
          </div>

          {/* ── 12. Governance ── */}
          <div>
            <SectionHeading>Governance &amp; Communications</SectionHeading>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Consultant Project Lead">
                <input value={form.consultantPM}
                  onChange={e => set('consultantPM', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Client Project Lead">
                <input value={form.clientPM}
                  onChange={e => set('clientPM', e.target.value)} className={INPUT} />
              </Field>
              <div className="col-span-2">
                <Field label="Meeting Cadence / Status Reporting"
                  hint="e.g. Weekly status call every Monday, written status report each Friday.">
                  <input value={form.meetingCadence}
                    onChange={e => set('meetingCadence', e.target.value)}
                    placeholder="e.g. Weekly 30-min check-in, bi-weekly written status report"
                    className={INPUT} />
                </Field>
              </div>
            </div>
          </div>

          {/* ── 13. Legal provisions ── */}
          <div>
            <SectionHeading>Legal Provisions (editable defaults)</SectionHeading>
            <div className="space-y-3">
              <Field label="Confidentiality / Data Handling Note">
                <textarea rows={3} value={form.confidentialityNote}
                  onChange={e => set('confidentialityNote', e.target.value)}
                  className={INPUT} />
              </Field>
              <Field label="Intellectual Property / Work Product Note">
                <textarea rows={3} value={form.ipNote}
                  onChange={e => set('ipNote', e.target.value)}
                  className={INPUT} />
              </Field>
              <Field label="Termination / Suspension Note">
                <textarea rows={2} value={form.terminationNote}
                  onChange={e => set('terminationNote', e.target.value)}
                  className={INPUT} />
              </Field>
            </div>
          </div>

          {/* ── 14. Risks ── */}
          <div>
            <SectionHeading>Risks &amp; Constraints (optional)</SectionHeading>
            <StringList items={form.risks}
              onChange={v => set('risks', v)}
              placeholder={i => `Risk ${i + 1} — e.g. Delayed stakeholder availability may extend timeline...`}
              addLabel="+ Add risk" />
          </div>

          {/* ── 15. Signatories ── */}
          <div>
            <SectionHeading>Signatories</SectionHeading>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Consultant Signatory Name">
                <input value={form.consultantName}
                  onChange={e => set('consultantName', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Consultant Title">
                <input value={form.consultantTitle}
                  onChange={e => set('consultantTitle', e.target.value)}
                  placeholder="e.g. Principal Consultant" className={INPUT} />
              </Field>
              <Field label="Client Signatory Name">
                <input value={form.clientSignatoryName}
                  onChange={e => set('clientSignatoryName', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Client Signatory Title">
                <input value={form.clientSignatoryTitle}
                  onChange={e => set('clientSignatoryTitle', e.target.value)}
                  placeholder="e.g. Chief Operating Officer" className={INPUT} />
              </Field>
            </div>
          </div>

        </div>
      )}

      {tab === 'preview' && (
        <div
          className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      )}

      {/* Action bar */}
      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100 flex-wrap">
        {engagement && (
          <button type="button" onClick={handleSave}
            className={`${BTN} bg-indigo-600 text-white hover:bg-indigo-700`}>
            {saved_ ? '✓ Saved' : 'Save to engagement'}
          </button>
        )}
        <button type="button" onClick={handleCopyHtml}
          className={`${BTN} border border-gray-300 text-gray-700 hover:bg-gray-50`}>
          {copied ? '✓ Copied!' : 'Copy HTML'}
        </button>
        <button type="button"
          onClick={() => setTab(t => t === 'form' ? 'preview' : 'form')}
          className={`${BTN} border border-gray-300 text-gray-600 hover:bg-gray-50`}>
          {tab === 'form' ? '👁 Preview' : '📝 Edit form'}
        </button>
        <button type="button" onClick={onClose}
          className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline">
          Close
        </button>
      </div>
    </div>
  );
}
