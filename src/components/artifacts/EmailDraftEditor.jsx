// EmailDraftEditor — shared email draft component used for both the pre-call
// email and the data request email.
//
// Merge fields ({clientName}, {primaryContact}, {company}, {owner}) are
// substituted from the selected engagement when available.
//
// Output options: copy to clipboard | open mailto: link
// Persistence: saved draft stored at engagement.artifactData[type]

import { useState, useEffect } from 'react';

// ── Merge helper ──────────────────────────────────────────────────────────────

function merge(template, engagement) {
  if (!engagement) return template;
  return template
    .replace(/\{clientName\}/g,      engagement.clientName      ?? '')
    .replace(/\{primaryContact\}/g,  engagement.primaryContact  ?? '')
    .replace(/\{company\}/g,         engagement.company         ?? '')
    .replace(/\{owner\}/g,           engagement.owner           ?? '')
    .replace(/\{startDate\}/g,       engagement.startDate       ?? '');
}

// ── Email templates ───────────────────────────────────────────────────────────

const TEMPLATES = {
  preCallEmail: {
    subject: 'Upcoming AI Readiness Discovery Call — {company}',
    body:
`Hi {primaryContact},

I hope this email finds you well. I'm writing ahead of our upcoming AI Readiness discovery call to help you prepare and make the most of our time together.

About the call:
  • Duration: 60–90 minutes
  • Format: Video call (calendar invite / link to follow)
  • Participants: Please include key stakeholders from AI/data, IT, and operations

To make the session as productive as possible, it would be helpful if you could:
  1. Identify 2–3 pain points or business processes you believe could benefit from AI or automation
  2. Think about your current data infrastructure — what data you have, where it lives, and how it's used
  3. Note any prior AI or automation initiatives, whether successful or not

On the call we'll cover your strategic goals, existing data assets, team capabilities, and any governance or compliance considerations.

Looking forward to a productive conversation.

Best regards,
{owner}`,
  },

  dataRequestEmail: {
    subject: 'AI Readiness Assessment — Data Request for {company}',
    body:
`Hi {primaryContact},

Thank you for the discovery call. To complete the AI Readiness Assessment for {company} accurately, we'd appreciate access to the following materials by [Date — 5 business days]:

Requested materials:
  ☐ Current software and tool list (CRM, ERP, data platforms, automation tools, any AI tools)
  ☐ Org chart or team structure overview for data, IT, and operations
  ☐ Documentation for the process we discussed — [Process Name] (rough notes or flowchart is fine)
  ☐ Data exports or samples relevant to that process (anonymised is perfectly acceptable)
  ☐ Summaries of any prior AI or automation projects, successful or otherwise
  ☐ Existing data governance policies, data dictionaries, or compliance documentation
  ☐ IT systems inventory — key platforms and integration points
  ☐ Any prior AI strategy documents or proof-of-concept outputs

None of these need to be polished documents. Working notes, screenshots, and informal write-ups are ideal.

Please let me know if any items are difficult to provide and we can adjust. You can reply to this email or share files via [secure link / shared folder].

Thank you in advance.

Best regards,
{owner}`,
  },
};

// ── Checklist editor (used for data request body when type === dataRequestEmail) ─

function EditableBody({ value, onChange }) {
  return (
    <textarea
      rows={18}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {'preCallEmail'|'dataRequestEmail'} type
 * @param {object|null} engagement   - For merge field substitution + save
 * @param {function}    onSave       - (key, { subject, body }) => void
 * @param {function}    onClose
 */
export function EmailDraftEditor({ type, engagement, onSave, onClose }) {
  const template = TEMPLATES[type];
  const saved    = engagement?.artifactData?.[type];

  const [subject, setSubject] = useState(
    () => saved?.subject ?? merge(template.subject, engagement)
  );
  const [body, setBody] = useState(
    () => saved?.body ?? merge(template.body, engagement)
  );
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedAll,     setCopiedAll]     = useState(false);
  const [isSaved,       setIsSaved]       = useState(!!saved);

  // Re-merge when engagement changes (new engagement selected)
  useEffect(() => {
    const newSaved = engagement?.artifactData?.[type];
    setSubject(newSaved?.subject ?? merge(template.subject, engagement));
    setBody(newSaved?.body    ?? merge(template.body,    engagement));
    setIsSaved(!!newSaved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engagement?.id]);

  function markDirty() { setIsSaved(false); }

  async function copyToClipboard(text, setter) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API unavailable — graceful no-op
    }
    setter(true);
    setTimeout(() => setter(false), 2000);
  }

  function buildMailtoHref() {
    const to      = engagement?.email ?? '';
    const subEnc  = encodeURIComponent(subject);
    const bodyEnc = encodeURIComponent(body);
    return `mailto:${to}?subject=${subEnc}&body=${bodyEnc}`;
  }

  function handleSave() {
    onSave(type, { subject, body });
    setIsSaved(true);
  }

  const BTN = 'text-xs px-3 py-1.5 rounded-md font-medium transition-colors';

  return (
    <div className="space-y-4">

      {/* Subject */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-gray-600">Subject line</label>
          <button
            type="button"
            onClick={() => copyToClipboard(subject, setCopiedSubject)}
            className="text-[11px] text-gray-400 hover:text-indigo-600 underline"
          >
            {copiedSubject ? '✓ Copied' : 'Copy subject'}
          </button>
        </div>
        <input
          value={subject}
          onChange={e => { setSubject(e.target.value); markDirty(); }}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-gray-600">
            Email body
            {type === 'dataRequestEmail' && (
              <span className="ml-1.5 text-gray-400 font-normal">
                — edit checklist items directly in the text
              </span>
            )}
          </label>
        </div>
        <EditableBody value={body} onChange={v => { setBody(v); markDirty(); }} />
      </div>

      {/* Merge-field hint */}
      {!engagement && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          ⚠️ Placeholders like <code className="font-mono bg-amber-100 px-0.5">{'{clientName}'}</code> will be
          substituted automatically when you select an engagement above.
        </p>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 flex-wrap">
        {engagement && (
          <button
            type="button"
            onClick={handleSave}
            className={`${BTN} bg-indigo-600 text-white hover:bg-indigo-700`}
          >
            {isSaved ? '✓ Draft saved' : 'Save draft'}
          </button>
        )}

        <button
          type="button"
          onClick={() => copyToClipboard(`Subject: ${subject}\n\n${body}`, setCopiedAll)}
          className={`${BTN} border border-gray-300 text-gray-700 hover:bg-gray-50`}
        >
          {copiedAll ? '✓ Copied!' : '📋 Copy full email'}
        </button>

        <a
          href={buildMailtoHref()}
          target="_blank"
          rel="noopener noreferrer"
          className={`${BTN} border border-gray-300 text-gray-700 hover:bg-gray-50 inline-block`}
        >
          ✉️ Open in mail client
        </a>

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
