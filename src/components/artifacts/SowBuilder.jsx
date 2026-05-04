// SowBuilder — guided Statement of Work builder.
//
// Form tab collects all SOW sections; Preview tab renders a clean HTML document
// suitable for copying or later PDF export (the structured data + htmlPreview are
// both stored so either path is possible without a migration).

import { useState } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const BTN   = 'text-xs px-3 py-1.5 rounded-md font-medium transition-colors';
const INPUT = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';
const LABEL = 'block text-xs font-semibold text-gray-600 mb-1';

function Field({ label, children }) {
  return (
    <div>
      <p className={LABEL}>{label}</p>
      {children}
    </div>
  );
}

// ── Default state ─────────────────────────────────────────────────────────────

function defaultSow(engagement) {
  return {
    clientName:            engagement?.clientName ?? '',
    company:               engagement?.company ?? '',
    engagementType:        engagement?.serviceTypes?.join(', ') ?? '',
    effectiveDate:         engagement?.startDate ?? '',
    scope:                 '',
    deliverables:          [''],
    timeline:              '',
    milestones:            [{ id: crypto.randomUUID(), date: '', description: '' }],
    assumptions:           '',
    exclusions:            '',
    feeAmount:             '',
    paymentTerms:          'Net 30',
    consultantName:        engagement?.owner ?? '',
    consultantTitle:       '',
    clientSignatoryName:   engagement?.primaryContact ?? '',
    clientSignatoryTitle:  '',
  };
}

// ── HTML generation ───────────────────────────────────────────────────────────

function generateSowHtml(d) {
  const listItems = arr =>
    arr.filter(Boolean).map(s => `<li style="margin-bottom:4px">${s}</li>`).join('');

  const milestoneRows = d.milestones
    .filter(m => m.description)
    .map(m => `<tr>
      <td style="padding:6px 10px;border:1px solid #e5e7eb;white-space:nowrap">${m.date || '—'}</td>
      <td style="padding:6px 10px;border:1px solid #e5e7eb">${m.description}</td>
    </tr>`)
    .join('');

  const section = (heading, content) =>
    content
      ? `<h2 style="font-size:15px;font-weight:700;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin:24px 0 10px">${heading}</h2>${content}`
      : '';

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return `<div style="font-family:Georgia,serif;max-width:720px;margin:0 auto;color:#111;font-size:14px;line-height:1.7;padding:8px">
<div style="border-bottom:3px solid #4338ca;padding-bottom:14px;margin-bottom:24px">
  <h1 style="font-size:22px;font-weight:700;margin:0 0 4px">Statement of Work</h1>
  <p style="margin:0;color:#6b7280;font-size:12px">Prepared by Barinhall · ${today}</p>
</div>

<table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px">
  <tr><td style="padding:5px 8px;font-weight:700;width:180px">Client</td><td>${d.clientName || '—'}</td></tr>
  <tr><td style="padding:5px 8px;font-weight:700">Company</td><td>${d.company || '—'}</td></tr>
  <tr><td style="padding:5px 8px;font-weight:700">Engagement type</td><td>${d.engagementType || '—'}</td></tr>
  <tr><td style="padding:5px 8px;font-weight:700">Effective date</td><td>${d.effectiveDate || '—'}</td></tr>
  <tr><td style="padding:5px 8px;font-weight:700">Consultant</td><td>${[d.consultantName, d.consultantTitle].filter(Boolean).join(', ') || '—'}</td></tr>
</table>

${section('Scope of Work', d.scope ? `<p>${d.scope}</p>` : '')}
${section('Deliverables', d.deliverables.filter(Boolean).length ? `<ul style="padding-left:20px;margin:0">${listItems(d.deliverables)}</ul>` : '')}
${section('Timeline', d.timeline ? `<p>${d.timeline}</p>` : '')}
${section('Milestones', milestoneRows ? `<table style="width:100%;border-collapse:collapse;font-size:13px">
  <thead><tr>
    <th style="text-align:left;padding:6px 10px;border:1px solid #e5e7eb;background:#f9fafb">Date</th>
    <th style="text-align:left;padding:6px 10px;border:1px solid #e5e7eb;background:#f9fafb">Milestone</th>
  </tr></thead>
  <tbody>${milestoneRows}</tbody>
</table>` : '')}
${section('Assumptions', d.assumptions ? `<p>${d.assumptions}</p>` : '')}
${section('Exclusions', d.exclusions ? `<p>${d.exclusions}</p>` : '')}
${d.feeAmount || d.paymentTerms ? section('Fees & Payment',
  `<table style="width:100%;border-collapse:collapse;font-size:13px">
    ${d.feeAmount    ? `<tr><td style="padding:5px 8px;font-weight:700;width:180px">Fee</td><td>${d.feeAmount}</td></tr>` : ''}
    ${d.paymentTerms ? `<tr><td style="padding:5px 8px;font-weight:700">Payment terms</td><td>${d.paymentTerms}</td></tr>` : ''}
  </table>`) : ''}

<h2 style="font-size:15px;font-weight:700;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin:28px 0 16px">Signatures</h2>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <tr>
    <td style="width:50%;padding-right:24px;vertical-align:top">
      <p style="font-weight:700;margin:0 0 4px">Consultant</p>
      <p style="margin:0">${d.consultantName || '_______________'}</p>
      <p style="margin:2px 0 0;color:#6b7280;font-size:12px">${d.consultantTitle || ''}</p>
      <div style="margin-top:28px;border-top:1px solid #9ca3af;padding-top:4px;color:#9ca3af;font-size:11px">Signature &amp; Date</div>
    </td>
    <td style="width:50%;vertical-align:top">
      <p style="font-weight:700;margin:0 0 4px">Client</p>
      <p style="margin:0">${d.clientSignatoryName || '_______________'}</p>
      <p style="margin:2px 0 0;color:#6b7280;font-size:12px">${d.clientSignatoryTitle || ''}</p>
      <div style="margin-top:28px;border-top:1px solid #9ca3af;padding-top:4px;color:#9ca3af;font-size:11px">Signature &amp; Date</div>
    </td>
  </tr>
</table>
</div>`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DeliverablesList({ items, onChange }) {
  function update(i, val) {
    const next = [...items];
    next[i] = val;
    onChange(next);
  }
  function add()    { onChange([...items, '']); }
  function remove(i) { onChange(items.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            value={item}
            onChange={e => update(i, e.target.value)}
            placeholder={`Deliverable ${i + 1}`}
            className={INPUT}
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="flex-shrink-0 text-gray-300 hover:text-red-400 text-sm"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
      >
        + Add deliverable
      </button>
    </div>
  );
}

function MilestoneList({ items, onChange }) {
  function update(i, field, val) {
    const next = items.map((m, idx) => idx === i ? { ...m, [field]: val } : m);
    onChange(next);
  }
  function add() {
    onChange([...items, { id: crypto.randomUUID(), date: '', description: '' }]);
  }
  function remove(i) { onChange(items.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-2">
      {items.map((m, i) => (
        <div key={m.id} className="flex gap-2 items-center">
          <input
            type="date"
            value={m.date}
            onChange={e => update(i, 'date', e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-36 flex-shrink-0"
          />
          <input
            value={m.description}
            onChange={e => update(i, 'description', e.target.value)}
            placeholder="Milestone description"
            className={INPUT}
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="flex-shrink-0 text-gray-300 hover:text-red-400 text-sm"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
      >
        + Add milestone
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {object|null} engagement  - Selected engagement (for pre-population + save)
 * @param {function}    onSave      - (key, data) => void — persists to engagement
 * @param {function}    onClose     - Close the modal
 */
export function SowBuilder({ engagement, onSave, onClose }) {
  const saved     = engagement?.artifactData?.sow?.fields;
  const [form,    setForm]    = useState(() => saved ?? defaultSow(engagement));
  const [tab,     setTab]     = useState('form'); // 'form' | 'preview'
  const [copied,  setCopied]  = useState(false);
  const [saved_,  setSaved_]  = useState(!!saved);

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
    const html = generateSowHtml(form);
    try {
      await navigator.clipboard.writeText(html);
    } catch {
      // fallback — select textarea
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const previewHtml = tab === 'preview' ? generateSowHtml(form) : '';

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-5 border-b border-gray-200 pb-0">
        {['form', 'preview'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`text-sm px-4 py-2 font-medium border-b-2 transition-colors -mb-px ${
              tab === t
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'form' ? '📝 Form' : '👁 Preview'}
          </button>
        ))}
      </div>

      {tab === 'form' && (
        <div className="space-y-5">

          {/* ─ Section 1: Client info ─ */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Client &amp; Engagement
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Client Name *">
                <input value={form.clientName} onChange={e => set('clientName', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Company *">
                <input value={form.company} onChange={e => set('company', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Engagement Type">
                <input value={form.engagementType} onChange={e => set('engagementType', e.target.value)} placeholder="e.g. AI Readiness Assessment" className={INPUT} />
              </Field>
              <Field label="Effective Date">
                <input type="date" value={form.effectiveDate} onChange={e => set('effectiveDate', e.target.value)} className={INPUT} />
              </Field>
            </div>
          </div>

          {/* ─ Section 2: Scope ─ */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Scope &amp; Deliverables
            </p>
            <div className="space-y-3">
              <Field label="Scope of Work">
                <textarea
                  rows={4}
                  value={form.scope}
                  onChange={e => set('scope', e.target.value)}
                  placeholder="Describe the work to be performed..."
                  className={INPUT}
                />
              </Field>
              <Field label="Deliverables">
                <DeliverablesList
                  items={form.deliverables}
                  onChange={v => set('deliverables', v)}
                />
              </Field>
            </div>
          </div>

          {/* ─ Section 3: Timeline ─ */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Timeline
            </p>
            <div className="space-y-3">
              <Field label="Timeline Summary">
                <input
                  value={form.timeline}
                  onChange={e => set('timeline', e.target.value)}
                  placeholder="e.g. 4 weeks from execution, delivering on [Date]"
                  className={INPUT}
                />
              </Field>
              <Field label="Milestones">
                <MilestoneList
                  items={form.milestones}
                  onChange={v => set('milestones', v)}
                />
              </Field>
            </div>
          </div>

          {/* ─ Section 4: Assumptions & Exclusions ─ */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Assumptions &amp; Exclusions
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Assumptions">
                <textarea
                  rows={4}
                  value={form.assumptions}
                  onChange={e => set('assumptions', e.target.value)}
                  placeholder="What this engagement assumes to be true or available..."
                  className={INPUT}
                />
              </Field>
              <Field label="Exclusions">
                <textarea
                  rows={4}
                  value={form.exclusions}
                  onChange={e => set('exclusions', e.target.value)}
                  placeholder="What is explicitly out of scope..."
                  className={INPUT}
                />
              </Field>
            </div>
          </div>

          {/* ─ Section 5: Fees ─ */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Fees &amp; Payment
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fee Amount">
                <input
                  value={form.feeAmount}
                  onChange={e => set('feeAmount', e.target.value)}
                  placeholder="e.g. $8,500 fixed fee"
                  className={INPUT}
                />
              </Field>
              <Field label="Payment Terms">
                <input
                  value={form.paymentTerms}
                  onChange={e => set('paymentTerms', e.target.value)}
                  placeholder="e.g. Net 30, 50% upfront"
                  className={INPUT}
                />
              </Field>
            </div>
          </div>

          {/* ─ Section 6: Signatories ─ */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Key Contacts / Signatories
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Consultant Name">
                <input value={form.consultantName} onChange={e => set('consultantName', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Consultant Title">
                <input value={form.consultantTitle} onChange={e => set('consultantTitle', e.target.value)} placeholder="e.g. Principal Consultant" className={INPUT} />
              </Field>
              <Field label="Client Signatory Name">
                <input value={form.clientSignatoryName} onChange={e => set('clientSignatoryName', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Client Signatory Title">
                <input value={form.clientSignatoryTitle} onChange={e => set('clientSignatoryTitle', e.target.value)} placeholder="e.g. VP Operations" className={INPUT} />
              </Field>
            </div>
          </div>
        </div>
      )}

      {tab === 'preview' && (
        <div
          className="border border-gray-200 rounded-lg overflow-hidden bg-white"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      )}

      {/* Action bar */}
      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100 flex-wrap">
        {engagement && (
          <button
            type="button"
            onClick={handleSave}
            className={`${BTN} bg-indigo-600 text-white hover:bg-indigo-700`}
          >
            {saved_ ? '✓ Saved' : 'Save to engagement'}
          </button>
        )}
        <button
          type="button"
          onClick={handleCopyHtml}
          className={`${BTN} border border-gray-300 text-gray-700 hover:bg-gray-50`}
        >
          {copied ? '✓ Copied!' : 'Copy HTML'}
        </button>
        <button
          type="button"
          onClick={() => setTab(t => t === 'form' ? 'preview' : 'form')}
          className={`${BTN} border border-gray-300 text-gray-600 hover:bg-gray-50`}
        >
          {tab === 'form' ? '👁 Preview' : '📝 Edit form'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}
