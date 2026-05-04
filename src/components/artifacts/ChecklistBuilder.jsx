// ChecklistBuilder — generic checklist with add/edit/delete/check items.
// Pre-seeded from CHECKLIST_TEMPLATES[storageKey] on first open.
// Saved to engagement.artifactData[storageKey].

import { useState } from 'react';

// ── Template registry ─────────────────────────────────────────────────────────

export const CHECKLIST_TEMPLATES = {
  dataCollectionChecklist: [
    'Current software and tool list (CRM, ERP, data platforms, automation tools)',
    'Org chart / team structure overview for data, IT, and operations',
    'Process documentation for the focus area discussed in intake call',
    'Data exports or samples relevant to that process (anonymised OK)',
    'Summary of any prior AI or automation projects',
    'Data governance policies or data dictionary (if available)',
    'IT systems inventory — key platforms and integration points',
    'Any prior AI strategy documents or PoC outputs',
  ],
  internalQaChecklist: [
    'All 7 readiness scoring categories have evidence citations',
    'Band labels (Low / Medium / High) match the numeric scores',
    'Executive summary is free of jargon and readable by non-technical sponsor',
    'Each use case hypothesis has an effort and impact estimate',
    'Recommendations are numbered and linked to specific findings',
    'Client and company names are spelled correctly throughout',
    'No placeholder text ("TBD", "TODO", "[INSERT]") remains in the report',
    'Reviewer comments resolved or logged as open items',
  ],
  workshopPrepChecklist: [
    'Workshop objectives confirmed with client sponsor',
    'Participant list finalised — all key roles represented',
    'Invitations and pre-read sent at least 5 business days in advance',
    'Facilitation materials (slides, canvases, sticky note packs) prepared',
    'Video-call link or room booking confirmed',
    'Icebreaker / warm-up activity planned',
    'Workshop agenda shared with participants',
    'Recording preference noted and consent obtained if recording',
    'Timer and break schedule planned for sessions > 2 hours',
  ],
  accessSetupChecklist: [
    'Cloud environment provisioned (dev/sandbox)',
    'API keys / credentials issued and securely shared',
    'Data access permissions granted for relevant team members',
    'VPN or network access configured where required',
    'Test data loaded into sandbox environment',
    'Integration connections verified end-to-end',
    'Rollback plan documented',
    'Security review sign-off obtained',
  ],
  onboardingChecklist: [
    'Participant list confirmed with roles and contact details',
    'Training/onboarding session scheduled and invites sent',
    'User accounts created and login instructions distributed',
    'Sandbox environment accessible by all participants',
    'Quick-reference guide or user manual distributed',
    'Support contact / help desk details communicated',
    'Feedback form prepared for post-session collection',
  ],
  buildProgressChecklist: [
    'Core solution components built to spec',
    'Integration with primary data source functional',
    'Error handling and edge cases covered',
    'Unit tests written and passing',
    'Code reviewed by second developer or consultant',
    'Deployment to sandbox / staging environment complete',
    'Basic smoke test passed in staging',
    'Documentation (README / handover notes) drafted',
  ],
  monitoringChecklist: [
    'System uptime and availability checked',
    'Key performance metrics reviewed against baseline',
    'Error logs scanned for new or recurring issues',
    'Data pipeline integrity verified (no stale or missing records)',
    'Model drift indicators checked (if applicable)',
    'User-reported issues triaged and logged',
    'Scheduled jobs confirmed as completed successfully',
    'Capacity / quota headroom reviewed',
  ],
  wrapUpChecklist: [
    'Final metrics captured and compared against success criteria',
    'Pilot output documented (screenshots, exports, dashboards)',
    'All stakeholder interviews or feedback sessions completed',
    'Open issues and defects logged with severity rating',
    'Pilot environment archived or decommissioned per plan',
    'Lessons learned session held with delivery team',
    'Go / No-go recommendation drafted',
  ],
  policyReviewChecklist: [
    'Data privacy and GDPR / CCPA policy reviewed',
    'AI acceptable-use policy reviewed (or gap noted)',
    'Model governance and oversight policy reviewed',
    'Bias and fairness testing requirements identified',
    'Incident response and escalation plan reviewed',
    'Vendor / third-party AI tool risk assessed',
    'Regulatory compliance requirements mapped to current practices',
    'Policy version control and review cycle documented',
  ],
  aiInventoryChecklist: [
    'All production AI/ML models catalogued with owner',
    'All AI-enabled SaaS tools listed (Salesforce Einstein, MS Copilot, etc.)',
    'Automation/RPA tools inventoried separately',
    'Data sources feeding each AI system documented',
    'Model refresh/retraining cadence recorded',
    'Business impact and risk rating assigned to each system',
    'Vendor support contracts noted',
    'Shadow AI / unsanctioned tools identified',
  ],
  handoffChecklist: [
    'Final deliverable reviewed and approved by client sponsor',
    'All documents stored in agreed client folder / repository',
    'Engagement feedback survey sent to client',
    'Internal lessons-learned document completed',
    'Invoice raised per contract payment schedule',
    'CRM record updated with engagement outcomes',
    'Any open issues formally closed or transitioned',
    'Case study / testimonial request sent if appropriate',
  ],
  logisticsChecklist: [
    'Room booking or video-call link confirmed',
    'Participant invitations sent with dial-in / location details',
    'Pre-work or pre-read distributed at least 3 days before',
    'Training materials (slides, workbooks, exercises) printed or shared digitally',
    'A/V equipment tested (projector, mic, screen share)',
    'Attendance list prepared',
    'Breaks and refreshments arranged (for in-person)',
    'Post-session survey link prepared',
  ],
  moduleChecklist: [
    'Module 1: AI fundamentals and landscape',
    'Module 2: Understanding your data',
    'Module 3: Identifying AI use cases',
    'Module 4: Evaluating and selecting AI tools',
    'Module 5: Ethical AI and governance basics',
    'Module 6: Building internal capability',
    'Practical exercise for each module defined',
    'Assessment / quiz designed for certification track',
  ],
  attendanceChecklist: [],   // starts empty — filled live during session
  postTrainingChecklist: [
    'Attendance sheet collected and filed',
    'Post-session survey responses collected',
    'Training recording shared (if applicable)',
    'Slide deck and resource list distributed to participants',
    'Application commitment forms (if used) collected',
    'Follow-up coaching sessions booked where requested',
    'Completion certificates issued (if applicable)',
    'Training outcomes logged in CRM or engagement record',
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const INPUT = 'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1';

function makeItem(text = '', checked = false) {
  return { id: crypto.randomUUID(), text, checked, notes: '' };
}

function seedItems(storageKey) {
  return (CHECKLIST_TEMPLATES[storageKey] ?? []).map(t => makeItem(t, false));
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {string}      storageKey   - Determines pre-seeded template + engagement save key
 * @param {object|null} engagement
 * @param {function}    onSave       - (key, { items }) => void
 * @param {function}    onClose
 */
export function ChecklistBuilder({ storageKey, engagement, onSave, onClose }) {
  const saved  = engagement?.artifactData?.[storageKey];
  const [items, setItems]    = useState(() => saved?.items ?? seedItems(storageKey));
  const [adding, setAdding]  = useState(false);
  const [draft,  setDraft]   = useState('');
  const [isSaved, setIsSaved] = useState(!!saved);

  function toggle(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    setIsSaved(false);
  }
  function remove(id) {
    setItems(prev => prev.filter(i => i.id !== id));
    setIsSaved(false);
  }
  function addItem() {
    if (!draft.trim()) return;
    setItems(prev => [...prev, makeItem(draft.trim())]);
    setDraft('');
    setAdding(false);
    setIsSaved(false);
  }
  function handleSave() {
    onSave(storageKey, { items });
    setIsSaved(true);
  }

  const done  = items.filter(i => i.checked).length;
  const total = items.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{done} / {total} complete</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Items */}
      <div className="space-y-1.5 mb-3">
        {items.map(item => (
          <div key={item.id} className="flex items-start gap-2 group">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggle(item.id)}
              className="mt-1 flex-shrink-0 accent-indigo-600"
            />
            <span className={`text-sm flex-1 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {item.text}
            </span>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-xs flex-shrink-0 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add item */}
      {adding ? (
        <div className="flex gap-2 mb-3">
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addItem(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="New checklist item..."
            className={INPUT}
          />
          <button type="button" onClick={addItem}
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 font-medium flex-shrink-0">
            Add
          </button>
          <button type="button" onClick={() => setAdding(false)}
            className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-50 flex-shrink-0">
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium mb-3">
          + Add item
        </button>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 flex-wrap">
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
