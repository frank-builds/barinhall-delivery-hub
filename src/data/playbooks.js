// Delivery playbook content for each service template step.
//
// Each step answers three questions:
//   1. What do I do?       → objective + procedure
//   2. What do I produce?  → outputArtifact
//   3. How do I know it's done? → acceptanceCriteria
//
// Schema per step:
//   title              — matches the label in workflows.js
//   objective          — 1–2 sentence purpose statement
//   duration           — estimated time (e.g. "60–90 min", "2–3 days")
//   ownerRole          — who is responsible
//   requiredInputs     — string[]: what must be in hand before starting
//   procedure          — string[]: ordered execution steps
//   talkTrack          — { label, content }[] | null: call/meeting agenda where relevant
//   outputArtifact     — string: primary deliverable
//   acceptanceCriteria — string[]: definition of done checklist items
//
// Services without playbook content set to null — UI falls back to the simple step list.

export const PLAYBOOKS = {

  // ── AI Readiness Assessment ───────────────────────────────────────────────
  // Fully populated with consultant-grade content for all 6 steps.

  'ai-readiness': [
    {
      title: 'Client intake & discovery call',
      objective:
        'Establish shared context on the client\'s business, technology landscape, and goals. Capture the evidence base needed to score AI readiness and form initial use case hypotheses.',
      duration: '60–90 min',
      ownerRole: 'Lead Consultant',
      requiredInputs: [
        'Signed statement of work',
        'Company website and LinkedIn research completed (15-min pre-read)',
        'Intake Questionnaire open in Delivery Hub for this engagement',
      ],
      procedure: [
        'Send a pre-call email 48h in advance: attach the agenda, confirm attendees, and request any prior AI/automation documentation',
        'Open the call: introductions, restate the purpose, confirm the 90-minute window and no-recording preference if applicable',
        'Business context (15 min): industry, company stage, employee count, org structure, key functional areas',
        'Technology landscape (15 min): current software stack, CRM/ERP/data tools, integration maturity, cloud vs. on-premise posture',
        'AI & automation experience (10 min): past experiments, vendor relationships, current level of awareness in the leadership team',
        'Pain points & process overview (20 min): what takes too long, what is error-prone, what is highest volume, what breaks most often',
        'Goals, timeline & budget (10 min): what success looks like in 12 months, rough budget range, who controls the decision',
        'Stakeholder map (5 min): who champions this initiative, who may resist, who controls budget vs. who influences it',
        'Wrap-up (5 min): confirm the data request list, agree on the timeline for the next step',
        'Complete the Intake Questionnaire in Delivery Hub within 4 hours of the call while notes are fresh',
        'Send the data request email within 24 hours (see Step 2)',
      ],
      talkTrack: [
        {
          label: 'Opening',
          content:
            '"Thanks for making time today. The goal of this call is to understand your business context and current technology landscape so we can give you an honest, evidence-based readiness assessment — not a generic one. I\'ll be asking questions across a few areas: your tech stack, where AI has or hasn\'t been tried, and where the biggest operational pain points are. There are no right or wrong answers — accuracy matters more than completeness. We have about 90 minutes. Sound good?"',
        },
        {
          label: 'Pain point probe',
          content:
            '"Walk me through a week in the life of [target process]. What happens when it goes wrong? How much of the team\'s time does this consume on a good week vs. a bad one?"',
        },
        {
          label: 'AI experience probe',
          content:
            '"Have you tried to automate or use AI on anything in the last two years — even informally, even a single tool? How did it go? What caused it to stall or stop?"',
        },
        {
          label: 'Decision dynamics probe',
          content:
            '"When it comes to making a decision to move forward with a pilot — who needs to say yes, and what does that \'yes\' require from them? Is this a budget conversation, a board conversation, a technical review?"',
        },
        {
          label: 'Closing',
          content:
            '"This has been really useful. After this call I\'ll send a short data request — things like your current tool list, any process documentation you have, and optionally a sample data export. Nothing onerous. We\'ll be back with a scored assessment and prioritized use case list within [timeline]. Any questions before we wrap up?"',
        },
      ],
      outputArtifact:
        'Completed Intake Questionnaire (all 27 fields) saved in Delivery Hub, plus data request email sent',
      acceptanceCriteria: [
        'All required Intake Questionnaire fields completed in Delivery Hub',
        'Primary process under review identified and documented',
        'At least three distinct pain points captured with context',
        'Budget range and target timeline recorded',
        'At least one preliminary use case hypothesis noted in the form',
        'Stakeholder map (champion, potential resistor, budget owner) captured',
        'Data request email sent to client within 24h of call',
      ],
    },

    {
      title: 'Current-state data collection',
      objective:
        'Gather the documentation, system information, and data samples needed to score AI readiness accurately. Resolve evidence gaps identified during the intake call before scoring begins.',
      duration: '3–5 business days (async)',
      ownerRole: 'Lead Consultant + Client Contact',
      requiredInputs: [
        'Completed Intake Questionnaire (Delivery Hub)',
        'Data request email sent (Step 1)',
        'Client project folder created in shared drive',
      ],
      procedure: [
        'Create client folder in project drive: /clients/[Company]/ai-readiness/ with subfolders: Process, Data, Technology, Governance',
        'Confirm data request email was sent within 24h of intake call; resend if needed',
        'Follow up with a brief nudge email if no response within 2 business days',
        'As documents arrive, review each one: note relevance, data quality, and any gaps',
        'For any tool or system mentioned in intake but not documented, request a screenshot or system overview',
        'If any data gap is critical for a scoring category, flag it and schedule a 30-min clarification call',
        'Organize all received materials in the client folder by category',
        'Draft a data quality memo: what was received, what is missing, and confidence level per scoring category',
        'Confirm with yourself: can each of the 7 scoring categories be rated with the available evidence, even if low?',
      ],
      talkTrack: [
        {
          label: 'Data request email template',
          content:
            'Subject: [Company] AI Readiness — Data Request\n\nHi [Name],\n\nThank you for the discovery call. To complete the readiness assessment accurately, we\'d appreciate the following by [Date — 5 business days out]:\n\n• Current software and tool list (CRM, ERP, data platforms, automation tools, any AI tools)\n• Org chart or team structure overview\n• Documentation for the process we discussed — [Process Name] (even rough notes or a flowchart)\n• Any data exports or samples relevant to that process (anonymized is perfectly fine)\n• Summaries of any prior AI or automation projects, if applicable\n• Any existing data governance policies, data dictionaries, or compliance documentation\n\nNone of these need to be polished — working documents are ideal.\n\nPlease let me know if any of these are difficult to provide and we can adjust.\n\nBest,\n[Your name]',
        },
        {
          label: 'Follow-up nudge (day 3)',
          content:
            'Subject: Re: [Company] AI Readiness — Data Request\n\nHi [Name],\n\nJust a quick check-in on the data request I sent on [Date]. No pressure — even partial information is helpful. If anything on the list is hard to get, please let me know and we can work around it.\n\nWe\'re aiming to start scoring next week, so anything you can share by [Date] would be great.\n\nThanks,\n[Your name]',
        },
      ],
      outputArtifact:
        'Organized client data folder with categorized received artifacts and a data quality memo',
      acceptanceCriteria: [
        'Data request acknowledged by client',
        'Client folder created and organized by category (Process, Data, Technology, Governance)',
        'At least one process document or system overview received',
        'Data availability can be rated for all 7 scoring categories (even if some are low)',
        'Data quality memo drafted: what was received and confidence level per category',
        'Any critical gaps either resolved via clarification call or documented as scoring assumptions',
      ],
    },

    {
      title: 'AI readiness scoring',
      objective:
        'Produce a scored AI readiness assessment across all 7 categories using the standardized rubric, and prioritize the top 3 use cases using the weighted criteria model.',
      duration: '2–3 hours',
      ownerRole: 'Lead Consultant',
      requiredInputs: [
        'Completed Intake Questionnaire (Delivery Hub)',
        'Organized client data folder with received artifacts',
        'Data quality memo from Step 2',
        'Scoring Worksheet open in Delivery Hub for this engagement',
        'Use Case Prioritization form open in Delivery Hub',
      ],
      procedure: [
        'Open the Scoring Worksheet in Delivery Hub — do not reference prior engagements to avoid anchoring bias',
        'Score Category 1 — Data Availability & Quality: reference data received in Step 2 as primary evidence',
        'Score Category 2 — Process Maturity & Documentation: reference process docs and intake pain-point responses',
        'Score Category 3 — Technical Infrastructure: reference tool list, integration notes, and cloud posture',
        'Score Category 4 — AI Awareness & Talent: reference intake responses on AI experience and team skill level',
        'Score Category 5 — Leadership & Strategic Alignment: reference decision-maker dynamics and budget information',
        'Score Category 6 — Governance & Risk Tolerance: reference compliance docs, governance policies, and risk responses',
        'Score Category 7 — Use Case Clarity: reference pain points, process volume, and preliminary hypotheses from intake',
        'Add analyst notes for each category (minimum 2 sentences per category — cite the specific evidence)',
        'Score all 3 use cases across the 5 weighted criteria: Impact (30%), Feasibility (25%), Data Readiness (20%), Time to Value (15%), Adoption Ease (10%)',
        'Review the composite score and band label — does it match your overall qualitative impression of the client?',
        'If composite score feels off, check for any category where the score may be inflated or deflated by limited data',
        'Draft the top recommendation in the Use Case Prioritization form (be specific — reference the client\'s process and team)',
        'Save the Scoring Worksheet and Use Case Prioritization form in Delivery Hub',
      ],
      talkTrack: null,
      outputArtifact:
        'Completed Scoring Worksheet (all 21 sub-questions, analyst notes for all 7 categories) and Use Case Prioritization form (all 3 use cases scored, top recommendation drafted)',
      acceptanceCriteria: [
        'All 21 scoring sub-question fields completed — no blanks',
        'Analyst notes present for all 7 categories with at least one evidence citation each',
        'All 3 use cases scored across all 5 weighted criteria',
        'Top recommendation drafted with client-specific context (not generic)',
        'Composite score reviewed — analyst can justify the band label from the evidence',
        'Scoring Worksheet and Use Case form saved in Delivery Hub',
      ],
    },

    {
      title: 'Draft assessment report',
      objective:
        'Produce the first draft of both the Full Readiness Report and the Executive Summary using completed intake and scoring data, ready for internal QA review.',
      duration: '2–3 hours',
      ownerRole: 'Lead Consultant',
      requiredInputs: [
        'Completed Intake Questionnaire (Delivery Hub)',
        'Completed and saved Scoring Worksheet (Delivery Hub)',
        'Completed and saved Use Case Prioritization form (Delivery Hub)',
        'Output Center accessible in Delivery Hub for this engagement',
      ],
      procedure: [
        'Open the Output Center for this engagement in Delivery Hub',
        'Generate "AI Readiness Assessment – Full Report" — review the preview before exporting',
        'Generate "AI Readiness Assessment – Executive Summary" — review the preview before exporting',
        'Scan both documents end-to-end: flag any "—" placeholders indicating missing form data',
        'Return to the relevant form for any field showing "—", fill it, and save',
        'Regenerate both documents after resolving all gaps',
        'Full Report narrative review: for any category scoring 1–2, add an analyst note that explains the gap constructively',
        'Executive Summary review: confirm the recommendation section names the specific client process and use case — not a generic statement',
        'Run the report QA checklist (see Talk Track)',
        'Export both documents as PDF or markdown',
        'Save in client folder: "[Company]_AI_Readiness_Report_DRAFT.pdf" and "[Company]_AI_Readiness_ExecSummary_DRAFT.pdf"',
        'Update template statuses to "In Progress" in Delivery Hub',
        'Assign internal reviewer and schedule review within 1–2 business days',
      ],
      talkTrack: [
        {
          label: 'Report QA checklist',
          content:
            '☐  Client name and company correct throughout both documents\n☐  No "—" placeholders in any section header, table cell, or key field\n☐  Composite score in the Executive Summary matches the Scoring Worksheet\n☐  Category scores are consistent between the Full Report and the worksheet\n☐  Use case prioritization table fully populated (all 3 use cases, all scores)\n☐  Recommendation section is client-specific — mentions their process, team, or context\n☐  Tone is professional and constructive — not alarmist, not overly positive\n☐  All date fields and contact information are correct\n☐  Full Report length is appropriate: 4–8 pages; Executive Summary: 1–2 pages',
        },
      ],
      outputArtifact:
        'Draft Full Report + Draft Executive Summary (QA-checked, saved in client folder with DRAFT designation)',
      acceptanceCriteria: [
        'Both documents generated without any "—" placeholders remaining',
        'QA checklist passed — all 9 items confirmed',
        'Recommendation section is specific to this client',
        'Both files saved in client folder with DRAFT designation',
        'Template statuses updated to "In Progress" in Delivery Hub',
        'Internal reviewer assigned and review scheduled',
      ],
    },

    {
      title: 'Internal review of report',
      objective:
        'Quality-assure the draft report against the evidence base and Barinhall delivery standards. Ensure every finding is supported, every recommendation is actionable, and the document is ready for a client audience.',
      duration: '45–60 min',
      ownerRole: 'Reviewer (not the primary analyst)',
      requiredInputs: [
        'Draft Full Report (DRAFT designation, from Step 4)',
        'Draft Executive Summary (DRAFT designation, from Step 4)',
        'Completed Scoring Worksheet (Delivery Hub — for cross-referencing scores)',
        'Completed Intake Questionnaire (Delivery Hub — for verifying evidence claims)',
      ],
      procedure: [
        'Reviewer reads both draft documents cold — without a briefing from the analyst first',
        'Cross-check: for each of the 7 category scores, identify which intake response or received document supports it',
        'Flag any score that cannot be directly traced to a documented evidence item',
        'Confirm use case rankings are logically consistent with their individual criterion scores',
        'Check the recommendation section: is it actionable and specific to this client, or is it generic?',
        'Review tone: would this document land well with a non-technical executive decision-maker?',
        'Note any factual errors, internal inconsistencies, or unclear language (use tracked changes or a comments doc)',
        'Brief debrief with analyst (15–20 min): walk through all flagged items; agree on what to change vs. accept',
        'Analyst incorporates feedback and produces Final versions — remove DRAFT from filenames',
        'Reviewer confirms the final version is cleared — record sign-off via email or comment',
      ],
      talkTrack: [
        {
          label: 'Reviewer checklist',
          content:
            '☐  Every category score is traceable to at least one intake response or received document\n☐  No score differs from the evidence by more than 1 point without an explanatory analyst note\n☐  Use case rankings are logically consistent with their scored criteria\n☐  The top recommendation is specific to this client (not copy-paste from a prior engagement)\n☐  The executive summary is self-contained — a senior exec could read it without the full report\n☐  No unsupported superlatives ("world-class," "highly advanced") without evidence\n☐  Tone is constructive and professional throughout\n☐  No client data errors (name, company, contact, dates)\n☐  Both documents are internally consistent with each other',
        },
      ],
      outputArtifact:
        'Reviewer-annotated draft + Final Full Report + Final Executive Summary (DRAFT designation removed, reviewer sign-off recorded)',
      acceptanceCriteria: [
        'Reviewer has read both documents without analyst briefing',
        'All reviewer feedback documented in writing (tracked changes or comment doc)',
        'Analyst has addressed or explicitly accepted each major feedback item',
        'Final versions produced with DRAFT removed from filenames',
        'Reviewer sign-off recorded (email confirmation or written comment)',
        'Both final documents saved and ready to send to client',
      ],
    },

    {
      title: 'Client debrief & handoff',
      objective:
        'Present assessment findings to the client, confirm understanding and alignment, and hand off actionable next steps with clear ownership and dates.',
      duration: '60–90 min (call) + 30 min (post-call admin)',
      ownerRole: 'Lead Consultant',
      requiredInputs: [
        'Final Full Report (reviewer sign-off confirmed)',
        'Final Executive Summary (reviewer sign-off confirmed)',
        'Prepared screen-share sequence or debrief deck',
        'Post-call email template ready to send',
      ],
      procedure: [
        'Send final reports and call agenda to client 24 hours before the call',
        'Prepare screen-share sequence: Executive Summary → composite score → category walk-through → use case table → recommendation',
        'Open call: restate the purpose, confirm attendees and roles, set the agenda (presentation then Q&A)',
        'Present composite score with band context — frame what the score means for a company in their stage and industry',
        'Walk through category scores — lead with strengths, then gaps, then the implication of each gap',
        'Present use case prioritization table with the scoring rationale behind the top-ranked use case',
        'Deep dive on the top recommendation: what it is, why this client specifically, what it requires to succeed',
        'Open Q&A — take full notes; for any question you cannot answer live, log it with an owner and response date',
        'Confirm next steps live on the call: client actions, Barinhall follow-up actions, with names and dates',
        'Send post-call summary email within 2 hours of call end (see template)',
        'Update engagement status to Completed in Delivery Hub',
        'Log all confirmed decisions and next steps in the Decisions log in Delivery Hub',
        'Archive all final artifacts in the client folder',
      ],
      talkTrack: [
        {
          label: 'Debrief agenda (60–90 min)',
          content:
            '0:00–0:05  Opening — restate the engagement purpose and confirm what we\'re presenting today\n0:05–0:15  Composite Score — overall readiness rating with band context and what it means operationally\n0:15–0:35  Category Walk-Through — 2–3 key observations per category; strengths first, then gaps\n0:35–0:50  Use Case Prioritization — top 3 use cases, scoring rationale, and ranking logic\n0:50–1:00  Recommendation — specific recommended next step, rationale, and what it requires\n1:00–1:20  Q&A — open discussion; log all questions and answers\n1:20–1:30  Next Steps — confirm actions, owners, and dates live on the call',
        },
        {
          label: 'Composite score framing',
          content:
            '"[Company] scored [X.X] out of 5.0, which puts you in the [Band Label] tier. That means [band description — from the scoring rubric]. Of the 7 categories we assessed, your strongest areas are [top 2] and the areas with the most near-term opportunity are [bottom 2 or most actionable]. This is a [positive framing of where they sit]."',
        },
        {
          label: 'Post-call email template',
          content:
            'Subject: [Company] AI Readiness Assessment — Debrief Summary & Next Steps\n\nHi [Name],\n\nThank you for the time today. Here is a summary of what we covered and the next steps we agreed on:\n\nKey findings:\n  • Composite AI Readiness Score: [X.X] / 5.0 — [Band Label]\n  • Strongest area: [Category Name]\n  • Priority improvement area: [Category Name]\n  • Top recommended use case: [Use Case Name]\n\nAgreed next steps:\n  • [Client action 1] — Owner: [Name] — By: [Date]\n  • [Client action 2] — Owner: [Name] — By: [Date]\n  • [Barinhall follow-up action] — Owner: [Name] — By: [Date]\n\nAttached: Final Assessment Report and Executive Summary.\n\nPlease let us know if anything needs clarification.\n\nBest,\n[Your name]',
        },
      ],
      outputArtifact:
        'Final reports delivered to client, post-call summary email with confirmed next steps sent, engagement marked Complete in Delivery Hub',
      acceptanceCriteria: [
        'Final reports delivered to client at least 24 hours before the call',
        'Debrief call completed with all key stakeholders present',
        'All client questions addressed live or logged with a follow-up owner and date',
        'Post-call summary email sent within 2 hours of call end',
        'Engagement status set to Completed in Delivery Hub',
        'Decisions and next steps logged in Delivery Hub Decisions log',
        'All final artifacts archived in the client project folder',
      ],
    },
  ],

  // ── Remaining services — playbook content coming in a future phase ─────────
  // UI falls back to the simple step list when a service key maps to null.

  'ai-strategy':   null,
  'ai-pilot':      null,
  'ai-governance': null,
  'ai-training':   null,
  'ai-ops':        null,
};
