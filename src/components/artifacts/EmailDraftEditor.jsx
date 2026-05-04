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

  // ── Phase 10b additional templates ───────────────────────────────────────────

  debriefFollowUpEmail: {
    subject: 'AI Readiness Assessment — Debrief Follow-up & Next Steps for {company}',
    body:
`Hi {primaryContact},

Thank you for your time in today's debrief session. It was a great discussion and I appreciate your candid feedback on the findings.

Below is a summary of our agreed next steps:

  1. [Action 1] — Owner: [Name] — Due: [Date]
  2. [Action 2] — Owner: [Name] — Due: [Date]
  3. [Action 3] — Owner: [Name] — Due: [Date]

Attached to this email (or in our shared folder) you will find:
  • The full AI Readiness Assessment report
  • The scoring summary and evidence notes
  • Recommended use-case long list

Please review and let me know if anything needs clarification or correction before we circulate more widely.

I'll follow up in [X days / at our next touchpoint] to check progress on the agreed actions.

Best regards,
{owner}`,
  },

  workshopPrepEmail: {
    subject: 'AI Strategy Workshop — Preparation Notes for {company}',
    body:
`Hi {primaryContact},

I'm looking forward to our AI Strategy & Roadmap Workshop with the {company} team. To make the most of our time together, here are a few things I'd like to ask participants to do beforehand.

Workshop details:
  • Date: [Date]
  • Time: [Start time] – [End time]
  • Location / Link: [Venue or video link]
  • Facilitator: {owner}

Pre-work for all participants (30–45 minutes):
  1. Reflect on the biggest inefficiencies or bottlenecks in your area of the business
  2. Think of one process that is data-heavy and repetitive — could AI help?
  3. Note any concerns you have about AI adoption (technical, cultural, ethical)

Materials to bring (or share in advance):
  ☐ Any relevant data or process documentation
  ☐ Questions or hypotheses you'd like to explore on the day

On the day we'll work through current-state mapping, future vision, and use case prioritisation. Please come ready to contribute — there are no wrong answers.

Please confirm your attendance by replying to this email.

Best regards,
{owner}`,
  },

  participantInviteEmail: {
    subject: 'Invitation — AI Strategy Workshop at {company} on [Date]',
    body:
`Hi [First Name],

You are warmly invited to join the AI Strategy & Roadmap Workshop we are running with the {company} team.

Workshop details:
  • Date: [Date]
  • Time: [Start time] – [End time]
  • Location: [Venue / Video link]
  • Facilitator: {owner}, [Title]

Why your presence matters:
Your perspective on [specific area — e.g. operations / data / finance] will be invaluable as we work to identify AI opportunities and set a credible roadmap for {company}.

What to expect:
The session is hands-on and collaborative — exercises, group discussions, and a structured vote on priorities. There will be breaks and [lunch / refreshments] provided.

Pre-work (optional but encouraged):
  • Think of one task in your role that is highly repetitive and data-driven
  • Note one concern you'd like us to address during the day

Please RSVP by [Date] by replying to this email or contacting {primaryContact} directly.

We look forward to your contributions.

Best regards,
{owner}`,
  },

  reviewSessionEmail: {
    subject: 'Roadmap Draft Review — {company} — [Date]',
    body:
`Hi {primaryContact},

Following the workshop, I'm pleased to share that the draft AI roadmap for {company} is ready for review.

Attached / linked below you will find:
  • Draft roadmap (Horizons 1, 2, and 3)
  • Use case prioritisation matrix
  • Open questions and assumptions log

Proposed review session:
  • Date: [Date]
  • Duration: ~75 minutes
  • Format: [Video call / in-person]

Agenda for the session:
  1. Walk through the draft roadmap horizon by horizon (35 min)
  2. Open discussion and feedback (20 min)
  3. Agree changes and action items (10 min)
  4. Next steps and delivery timeline (10 min)

Please review the materials ahead of the session so we can focus time on discussion rather than reading. Note any questions or concerns — all feedback is welcome at this stage.

Please confirm the session or suggest an alternative time.

Best regards,
{owner}`,
  },

  pilotKickoffEmail: {
    subject: 'AI Pilot Kickoff — {company} — [Project Name]',
    body:
`Hi {primaryContact},

We're excited to kick off the AI pilot for {company}. This email confirms the start of the engagement and sets out key information for the team.

Pilot overview:
  • Project: [Project / Use Case Name]
  • Start date: {startDate}
  • Target end date: [End date]
  • Lead consultant: {owner}
  • Client lead: {primaryContact}

Agreed success criteria (summary):
  1. [Primary KPI — e.g. Reduce processing time by 30%]
  2. [Secondary KPI 1]
  3. [Secondary KPI 2]

Week 1 priorities:
  ☐ Environment access confirmed ([System / Platform])
  ☐ Sample data shared with consultant team
  ☐ Kickoff call completed — team introductions done
  ☐ Communication channel set up ([Slack / Teams / Email])
  ☐ Weekly check-in cadence agreed: [Day, Time]

Please circulate this email to your internal team so everyone is aligned on the plan.

Let's build something great together.

Best regards,
{owner}`,
  },

  midPilotEmail: {
    subject: 'Mid-Pilot Check-In — {company} — [Project Name]',
    body:
`Hi {primaryContact},

We're at the midpoint of the AI pilot and I wanted to share a progress update and flag a few items for your attention.

Progress summary:
  • Milestone 1: [Status — Complete / In Progress / Blocked]
  • Milestone 2: [Status]
  • Milestone 3: [Status]

Metrics so far (vs. success criteria):
  • [Primary KPI]: [Current reading] vs. target [Target]
  • [Secondary KPI 1]: [Current reading] vs. target [Target]

Items requiring client input:
  1. [Issue / Decision needed] — please advise by [Date]
  2. [Data / access requirement]

Revised timeline (if applicable):
  [Note any changes to the delivery schedule here]

I'd like to schedule a brief mid-pilot review call to walk through these points together. Please let me know your availability.

Best regards,
{owner}`,
  },

  pilotDeliveryEmail: {
    subject: 'AI Pilot Completion — Findings & Recommendations — {company}',
    body:
`Hi {primaryContact},

I'm pleased to confirm that the AI pilot for {company} has concluded. Please find attached the pilot completion report, which includes:

  1. Results vs. success criteria
  2. Technical findings and architecture notes
  3. Lessons learned
  4. Go / No-go recommendation
  5. Proposed next steps for [scale-up / further development / handoff]

Headline outcome:
  [One-sentence summary — e.g. "The pilot achieved a 34% reduction in processing time, exceeding the 30% target, and we recommend proceeding to full deployment."]

Recommended immediate actions:
  ☐ Review the full report (allow 30 minutes)
  ☐ Share with internal stakeholders as appropriate
  ☐ Confirm decision to [proceed / hold / stop] by [Date]
  ☐ Schedule a debrief call — I suggest [Date / Time]

It has been a pleasure working with the {company} team on this pilot. Please don't hesitate to reach out with any questions.

Best regards,
{owner}`,
  },

  scopeConfirmEmail: {
    subject: 'AI Governance Review — Scope Confirmation for {company}',
    body:
`Hi {primaryContact},

Thank you for the introductory call. I'm writing to confirm the agreed scope for the AI Governance & Risk Review engagement with {company} before we proceed to kick-off.

Confirmed scope:
  • Business units in scope: [List]
  • AI systems / tools in scope: [List]
  • Regulatory frameworks to be considered: [e.g. GDPR, EU AI Act, ISO 42001]
  • Out of scope: [Exclusions]

Key deliverables:
  1. AI inventory and current-state assessment
  2. Risk and control gap analysis
  3. Policy and standards gap report
  4. Governance programme recommendations

Engagement timeline:
  • Start date: {startDate}
  • Estimated completion: [Date]
  • Key milestones: [Milestone 1 — Date], [Milestone 2 — Date]

Access requirements (please arrange):
  ☐ Interviews with [AI leads / IT / Legal / Compliance] — [X] sessions of 60 min each
  ☐ Access to existing AI policies, contracts, and system documentation
  ☐ A point of contact in IT and in Legal / Compliance

Please confirm this scope is accurate by replying to this email. Any changes now are much easier to manage than mid-engagement.

Best regards,
{owner}`,
  },

  governanceDeliveryEmail: {
    subject: 'AI Governance Review — Final Report Delivery — {company}',
    body:
`Hi {primaryContact},

Please find attached the final AI Governance & Risk Review report for {company}.

The report covers:
  1. Executive summary and overall maturity rating
  2. AI inventory and current-state findings
  3. Risk and control gap analysis (prioritised by severity)
  4. Policy and standards gaps
  5. Recommended governance programme and remediation roadmap

Top 3 priority recommendations:
  1. [Recommendation 1 — e.g. Implement AI model registry]
  2. [Recommendation 2 — e.g. Develop AI acceptable-use policy]
  3. [Recommendation 3 — e.g. Establish AI risk review board]

Proposed next steps:
  ☐ Distribute report to relevant stakeholders
  ☐ Schedule governance findings briefing — I suggest [Date / Time]
  ☐ Agree ownership for the top 3 recommendations
  ☐ Confirm timeline for governance programme initiation

I look forward to presenting these findings at our briefing session.

Best regards,
{owner}`,
  },

  trainingIntakeEmail: {
    subject: 'AI Training Programme — Pre-Training Intake for {company}',
    body:
`Hi {primaryContact},

As we finalise the design of the AI training programme for {company}, I'd like to gather a little more information about the participant group to ensure the content is pitched at the right level and is as relevant as possible.

Could you help us with the following?

  1. Number of participants: [Expected headcount]
  2. Roles represented: [e.g. Managers, analysts, engineers, operations]
  3. Current AI / data literacy: [Beginner / Intermediate / Mixed — brief description]
  4. Primary tools your team uses today: [e.g. Excel, Power BI, Salesforce, Python]
  5. Top learning goals (pick up to 3):
       ☐ Understanding what AI is and isn't
       ☐ Identifying AI use cases in their own work
       ☐ Working effectively with AI tools
       ☐ Evaluating AI vendor claims and risks
       ☐ Building a data-driven mindset
       ☐ Other: [Please specify]
  6. Any topics to avoid or handle carefully: [e.g. job displacement concerns]

This information will be used to customise exercises and examples. It will not be shared outside the project team.

Please reply by [Date] so we have time to finalise the curriculum before [Training Date].

Best regards,
{owner}`,
  },

  postTrainingEmail: {
    subject: 'AI Training — Follow-up Resources & Next Steps — {company}',
    body:
`Hi {primaryContact},

Thank you to everyone who participated in the AI training session for {company} — the engagement and questions were excellent.

As promised, here are the follow-up resources:

  📄 Session slides — [Link / Attached]
  📋 Exercise workbook — [Link / Attached]
  📚 Recommended reading list — [Link / Attached]
  🛠  Suggested tools to try — [List or link]

Post-training action items for participants:
  1. Complete the feedback survey by [Date] — [Survey link]
  2. Apply [specific exercise / tool] to a real task in the next 2 weeks
  3. Share learnings with your team at your next meeting

Suggested next steps for {company}:
  ☐ Review training evaluation results with {primaryContact}
  ☐ Schedule a follow-up Q&A session in 4–6 weeks
  ☐ Identify 2–3 participants to act as internal AI champions
  ☐ Discuss advanced module options if appetite is strong

Please don't hesitate to reach out if participants have questions as they start applying what they've learned.

Best regards,
{owner}`,
  },

  monthlyCheckInEmail: {
    subject: 'Monthly AI Ops Check-In — {company} — [Month Year]',
    body:
`Hi {primaryContact},

Ahead of our monthly check-in, here is a brief agenda and any pre-read items.

Meeting details:
  • Date: [Date]
  • Time: [Time]
  • Format: [Video / In-person]
  • Duration: ~60 minutes

Agenda:
  1. Previous month recap — actions and outcomes (10 min)
  2. System health and monitoring review (10 min)
  3. Incidents and resolutions (10 min)
  4. Performance metrics and insights (15 min)
  5. Backlog priorities for next month (15 min)

Items for your attention before the call:
  ☐ Review the metrics dashboard — [Link]
  ☐ Any incidents or issues to add to the agenda? Please reply with brief details
  ☐ Confirm any priorities you'd like to add to the backlog discussion

If the proposed time no longer works for your team, please let me know as soon as possible so we can reschedule.

Best regards,
{owner}`,
  },

  monthlyReportEmail: {
    subject: 'Monthly AI Operations Report — {company} — [Month Year]',
    body:
`Hi {primaryContact},

Please find attached the monthly AI Operations report for {company} covering [Month Year].

Headline summary:
  • System uptime: [X]%
  • Incidents: [X] (resolved: [X], open: [X])
  • Key metric: [Primary KPI] — [Result] vs. target [Target]
  • Backlog items completed: [X]

Notable events this month:
  [Brief bullet of 1–3 key events, changes, or improvements]

Open issues requiring attention:
  1. [Issue 1] — Owner: [Name] — Priority: [High / Medium]
  2. [Issue 2] — Owner: [Name] — Priority: [High / Medium]

Next month focus areas:
  1. [Priority 1]
  2. [Priority 2]
  3. [Priority 3]

The full report with charts and supporting data is in the attachment. Please review before our monthly check-in call on [Date].

Best regards,
{owner}`,
  },

  deliveryEmail: {
    subject: 'Engagement Delivery — {company} — [Deliverable Name]',
    body:
`Hi {primaryContact},

I'm pleased to share the [Deliverable Name] for {company}.

Attached / accessible at [link]:
  • [Document 1]
  • [Document 2]
  • [Supporting materials]

Summary of what's included:
  [2–3 sentence overview of the deliverable and its purpose]

What we'd like you to do:
  1. Review the materials by [Date]
  2. Share with [relevant internal stakeholders] as appropriate
  3. Come prepared to [next meeting / call] with feedback and questions

Suggested next steps:
  ☐ Schedule a delivery walkthrough call — [proposed date / time]
  ☐ Confirm any revisions or clarifications needed
  ☐ Agree handoff or implementation plan

Please let me know if you have any questions in the meantime.

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

  // Compute the fallback flag BEFORE any hooks — used after all hooks are called.
  // (Hooks must be called unconditionally on every render — Rules of Hooks.)
  const noTemplate = !template && !saved;

  // ── All hooks first, regardless of noTemplate ────────────────────────────────
  const [subject, setSubject] = useState(
    () => saved?.subject ?? (template ? merge(template.subject, engagement) : '')
  );
  const [body, setBody] = useState(
    () => saved?.body ?? (template ? merge(template.body, engagement) : '')
  );
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedAll,     setCopiedAll]     = useState(false);
  const [isSaved,       setIsSaved]       = useState(!!saved);

  // Re-merge when engagement changes (new engagement selected)
  useEffect(() => {
    const newSaved = engagement?.artifactData?.[type];
    setSubject(newSaved?.subject ?? (template ? merge(template.subject, engagement) : ''));
    setBody(newSaved?.body    ?? (template ? merge(template.body,    engagement) : ''));
    setIsSaved(!!newSaved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engagement?.id]);

  // Guard: render fallback for unknown templateKey AFTER all hooks have been called.
  if (noTemplate) {
    return (
      <div className="py-10 text-center text-sm text-gray-400 italic">
        No template found for <strong>{type}</strong>.
        <br />
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Close
        </button>
      </div>
    );
  }

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
