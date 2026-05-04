// StructuredDocument — multi-section text document with pre-seeded headings.
// Each section is an editable textarea.
// Pre-seeded from DOCUMENT_TEMPLATES[storageKey].
// Saved to engagement.artifactData[storageKey].

import { useState } from 'react';

// ── Template registry ─────────────────────────────────────────────────────────

export const DOCUMENT_TEMPLATES = {
  dataQualityMemo: {
    title: 'Data Quality & Evidence Memo',
    sections: [
      { heading: 'Materials received',           placeholder: 'List each document or dataset received, with date...' },
      { heading: 'Missing materials',            placeholder: 'Items not yet received; impact on scoring confidence...' },
      { heading: 'Data quality observations',    placeholder: 'Notes on completeness, accuracy, and freshness of data received...' },
      { heading: 'Scoring confidence by category', placeholder: 'Rate each of the 7 readiness categories: High / Medium / Low confidence and why...' },
      { heading: 'Clarification calls needed',   placeholder: 'Topics that require a 30-min call to resolve gaps...' },
    ],
  },
  scoringNotes: {
    title: 'Readiness Scoring Evidence Notes',
    sections: [
      { heading: 'Data availability & quality — evidence',   placeholder: 'Specific evidence and quotes from client materials...' },
      { heading: 'Technology infrastructure — evidence',     placeholder: '' },
      { heading: 'AI / ML capability & talent — evidence',   placeholder: '' },
      { heading: 'Leadership & sponsorship — evidence',      placeholder: '' },
      { heading: 'Process definition — evidence',           placeholder: '' },
      { heading: 'Governance, risk & compliance — evidence', placeholder: '' },
      { heading: 'Culture & change readiness — evidence',    placeholder: '' },
      { heading: 'Scoring rationale summary',               placeholder: 'Overall narrative explaining the scores...' },
    ],
  },
  assessmentReport: {
    title: 'AI Readiness Assessment Report',
    sections: [
      { heading: 'Executive summary',            placeholder: '3–4 sentences: overall readiness band, headline finding, top recommendation...' },
      { heading: 'Company & engagement overview', placeholder: 'Client, engagement scope, assessment period, primary contact...' },
      { heading: 'Overall readiness score',       placeholder: 'Band (Low / Medium-Low / Medium / Medium-High / High), score, and interpretation...' },
      { heading: 'Findings: Data & technology',  placeholder: 'Detailed findings for data quality, infrastructure, and tooling...' },
      { heading: 'Findings: People & process',   placeholder: 'Talent, leadership, process maturity, and change readiness...' },
      { heading: 'Findings: Governance',         placeholder: 'Governance, risk, compliance maturity and gaps...' },
      { heading: 'Use case hypotheses',          placeholder: 'Top 3–5 use cases with effort / impact estimate and rationale...' },
      { heading: 'Recommended next steps',       placeholder: 'Numbered, prioritised recommendations with owners and timelines...' },
      { heading: 'Appendix: Scoring detail',     placeholder: 'Category-by-category scores with evidence citations...' },
    ],
  },
  workshopNotes: {
    title: 'Workshop Facilitation Notes',
    sections: [
      { heading: 'Participants present',          placeholder: 'Name, role, department...' },
      { heading: 'Session 1: Current state',      placeholder: 'Key points from SWOT / landscape mapping...' },
      { heading: 'Session 2: Future vision',      placeholder: 'Vision themes and priorities voiced by participants...' },
      { heading: 'Use cases generated',           placeholder: 'All ideas captured — unfiltered list...' },
      { heading: 'Dot-vote results',              placeholder: 'Top-voted use cases with vote counts...' },
      { heading: 'Roadmap sketch',               placeholder: 'Horizon 1 / 2 / 3 initiatives agreed in session...' },
      { heading: 'Capability gaps identified',    placeholder: '' },
      { heading: 'Key decisions made',            placeholder: '' },
      { heading: 'Open questions and blockers',   placeholder: '' },
    ],
  },
  themeMatrix: {
    title: 'Strategic Theme Synthesis',
    sections: [
      { heading: 'Recurring themes across use cases', placeholder: 'What patterns appeared repeatedly in the brainstorm?' },
      { heading: 'Theme 1 — detail',              placeholder: 'Name, description, supporting use cases...' },
      { heading: 'Theme 2 — detail',              placeholder: '' },
      { heading: 'Theme 3 — detail',              placeholder: '' },
      { heading: 'Prioritisation rationale',      placeholder: 'Why these themes are most strategically significant...' },
      { heading: 'Themes not taken forward',      placeholder: 'Ideas that were noted but deprioritised — and why...' },
    ],
  },
  roadmapBuilder: {
    title: 'AI Strategic Roadmap',
    sections: [
      { heading: 'Vision statement',              placeholder: 'Where AI should take this organisation in 3–5 years...' },
      { heading: 'Guiding principles',            placeholder: 'The 3–5 principles that govern AI investment decisions...' },
      { heading: 'Horizon 1 (0–6 months)',        placeholder: 'Quick wins: initiatives that can start now with existing resources...' },
      { heading: 'Horizon 2 (6–18 months)',       placeholder: 'Build phase: programmes that require investment or capability building...' },
      { heading: 'Horizon 3 (18 months+)',        placeholder: 'Transform phase: longer-horizon moonshots and structural changes...' },
      { heading: 'Capability investments needed', placeholder: 'Data infrastructure, talent, tooling, governance to unlock the roadmap...' },
      { heading: 'Success metrics',              placeholder: 'How progress against the roadmap will be measured...' },
      { heading: 'Risks and dependencies',       placeholder: '' },
    ],
  },
  pilotSow: {
    title: 'Pilot Scope & Success Criteria',
    sections: [
      { heading: 'Pilot objective',               placeholder: 'One sentence: what does success look like at the end of 30 days?' },
      { heading: 'Problem being tested',          placeholder: 'Specific process or challenge the pilot addresses...' },
      { heading: 'Scope and boundaries',          placeholder: 'What is in scope / out of scope for this pilot...' },
      { heading: 'Solution approach',             placeholder: 'Technology, method, and integration overview...' },
      { heading: 'Participants and stakeholders', placeholder: 'Who is involved, their roles, and time commitment...' },
      { heading: 'Timeline and milestones',       placeholder: 'Key dates: kickoff, mid-review, wrap-up, results presentation...' },
      { heading: 'Success criteria',              placeholder: 'Primary and secondary KPIs with target values (see Scoring tool)...' },
      { heading: 'Go / No-go criteria',           placeholder: 'The minimum bar that determines whether to scale...' },
      { heading: 'Assumptions and constraints',   placeholder: '' },
    ],
  },
  technicalSetupNotes: {
    title: 'Technical Setup & Configuration Notes',
    sections: [
      { heading: 'Environment details',           placeholder: 'URLs, cloud provider, region, account IDs...' },
      { heading: 'Access credentials (store securely — do not save here)', placeholder: 'Vault/1Password reference only — no raw credentials...' },
      { heading: 'Data connections configured',   placeholder: 'Databases, APIs, file sources connected and tested...' },
      { heading: 'Integration points',            placeholder: 'Systems integrated; method (API, webhook, batch)...' },
      { heading: 'Known issues / workarounds',    placeholder: '' },
      { heading: 'Rollback procedure',            placeholder: 'Steps to revert to pre-pilot state...' },
    ],
  },
  recommendationBuilder: {
    title: 'Recommendations & Next Steps',
    sections: [
      { heading: 'Overall recommendation',        placeholder: 'GO / NO-GO / CONDITIONAL GO — and one-paragraph rationale...' },
      { heading: 'Recommendation 1 (priority)',   placeholder: 'Description, rationale, owner, timeline...' },
      { heading: 'Recommendation 2',              placeholder: '' },
      { heading: 'Recommendation 3',              placeholder: '' },
      { heading: 'Resource requirements',         placeholder: 'Budget, headcount, tooling needed to execute...' },
      { heading: 'Risks if not actioned',         placeholder: '' },
      { heading: 'Proposed next milestone',       placeholder: 'The single most important next step with a date...' },
    ],
  },
  governanceScopeDoc: {
    title: 'Governance Review Scope & Alignment',
    sections: [
      { heading: 'Engagement objectives',         placeholder: 'What the review will and will not cover...' },
      { heading: 'AI systems in scope',           placeholder: 'List systems agreed for review with brief description...' },
      { heading: 'Regulatory context',            placeholder: 'Applicable regulations (GDPR, EU AI Act, sector-specific)...' },
      { heading: 'Stakeholders',                  placeholder: 'Sponsor, participants, subject-matter experts...' },
      { heading: 'Timeline and deliverables',     placeholder: 'Key dates and expected outputs...' },
      { heading: 'Agreed exclusions',             placeholder: 'What is explicitly out of scope...' },
    ],
  },
  inventoryNotes: {
    title: 'AI Systems Inventory Notes',
    sections: [
      { heading: 'Production AI / ML models',     placeholder: 'System name, purpose, owner, data inputs, refresh cycle...' },
      { heading: 'AI-enabled SaaS tools',         placeholder: 'Vendor, product, use case, data shared...' },
      { heading: 'Automation / RPA tools',        placeholder: 'Tool, process automated, volume...' },
      { heading: 'Shadow / unsanctioned AI use',  placeholder: 'Observed or suspected ungoverned AI use...' },
      { heading: 'Gaps in inventory',             placeholder: 'Areas where inventory is incomplete and next steps...' },
    ],
  },
  policyGapNotes: {
    title: 'Policy & Standards Gap Analysis',
    sections: [
      { heading: 'Policies reviewed',             placeholder: 'Document name, version, date reviewed...' },
      { heading: 'Gap 1',                         placeholder: 'Policy area, current state, required state, risk of gap...' },
      { heading: 'Gap 2',                         placeholder: '' },
      { heading: 'Gap 3',                         placeholder: '' },
      { heading: 'Policies to be created',        placeholder: 'New policies recommended with rationale...' },
      { heading: 'Quick wins',                    placeholder: 'Low-effort policy updates that can be made immediately...' },
    ],
  },
  governanceRecommendations: {
    title: 'Governance Recommendations & Remediation Plan',
    sections: [
      { heading: 'Executive summary',            placeholder: 'Overall risk posture and top 3 remediation priorities...' },
      { heading: 'Critical findings',            placeholder: 'High-severity risks requiring immediate action...' },
      { heading: 'Recommendation 1',             placeholder: 'Finding, risk, remediation action, owner, timeline...' },
      { heading: 'Recommendation 2',             placeholder: '' },
      { heading: 'Recommendation 3',             placeholder: '' },
      { heading: 'Governance programme roadmap', placeholder: 'Phased plan to build ongoing AI governance capability...' },
      { heading: 'Proposed governance structure', placeholder: 'Roles, responsibilities, review cadence...' },
    ],
  },
  audienceAnalysisNotes: {
    title: 'Training Audience Analysis',
    sections: [
      { heading: 'Audience profile',             placeholder: 'Roles, seniority, department, typical day...' },
      { heading: 'Current knowledge level',      placeholder: 'AI/ML literacy baseline; any prior training...' },
      { heading: 'Learning goals',               placeholder: 'What participants should know/do differently after training...' },
      { heading: 'Constraints',                  placeholder: 'Time availability, preferred format, language, accessibility needs...' },
      { heading: 'Existing knowledge to build on', placeholder: 'Tools or concepts participants already know...' },
      { heading: 'Anticipated resistance',       placeholder: 'Concerns, blockers, cultural barriers to address...' },
    ],
  },
  curriculumOutline: {
    title: 'Training Curriculum Design',
    sections: [
      { heading: 'Learning objectives',           placeholder: 'Numbered list: by the end of the session, participants will be able to...' },
      { heading: 'Module 1',                      placeholder: 'Topic, key concepts, activities, duration...' },
      { heading: 'Module 2',                      placeholder: '' },
      { heading: 'Module 3',                      placeholder: '' },
      { heading: 'Practical exercises',           placeholder: 'Exercises mapped to each module with instructions...' },
      { heading: 'Assessment / evaluation',       placeholder: 'How learning will be measured...' },
      { heading: 'Resources and materials',       placeholder: 'Slide decks, workbooks, reading list...' },
    ],
  },
  deliveryNotes: {
    title: 'Training Delivery Notes',
    sections: [
      { heading: 'Attendance',                    placeholder: 'Names present; any notable absences...' },
      { heading: 'Session flow',                  placeholder: 'How the session ran vs. plan; timing...' },
      { heading: 'Participant engagement',        placeholder: 'Observations on engagement level, questions asked, energy...' },
      { heading: 'Exercises: what worked',        placeholder: '' },
      { heading: 'Exercises: what to improve',    placeholder: '' },
      { heading: 'Key questions raised',          placeholder: 'Important questions or misconceptions to address in follow-up...' },
      { heading: 'Trainer observations',          placeholder: 'What to do differently next time...' },
    ],
  },
  planningNotes: {
    title: 'Monthly AI Ops Planning Notes',
    sections: [
      { heading: 'Previous month summary',        placeholder: 'Key wins, incidents, completions from last month...' },
      { heading: 'This month priorities',         placeholder: 'Top 3–5 focus areas agreed with client...' },
      { heading: 'Resource and capacity notes',   placeholder: 'Team availability, external dependencies...' },
      { heading: 'Risks entering the month',      placeholder: 'Known risks that may affect delivery...' },
      { heading: 'Client requests / feedback',    placeholder: 'New asks or feedback received since last check-in...' },
    ],
  },
  tuningNotes: {
    title: 'Model & Workflow Tuning Log',
    sections: [
      { heading: 'Performance observations',      placeholder: 'What the data is showing — drift, degradation, outliers...' },
      { heading: 'Changes made this cycle',       placeholder: 'Retraining, prompt updates, threshold adjustments...' },
      { heading: 'Impact of changes',             placeholder: 'Before / after metrics; observed improvement or regression...' },
      { heading: 'Changes deferred',              placeholder: 'What was considered but not actioned — and why...' },
      { heading: 'Next tuning window',            placeholder: 'Planned date and focus for next cycle...' },
    ],
  },
  metricsNotes: {
    title: 'Monthly Performance Metrics',
    sections: [
      { heading: 'KPI summary',                   placeholder: 'Table or bullet list of key metrics vs. targets...' },
      { heading: 'Positive trends',               placeholder: '' },
      { heading: 'Negative trends or concerns',   placeholder: '' },
      { heading: 'Incidents this month',          placeholder: 'What happened, root cause, resolution...' },
      { heading: 'Business impact highlights',    placeholder: 'Value generated / costs avoided this month...' },
      { heading: 'Data quality notes',            placeholder: '' },
    ],
  },
  retrospectiveNotes: {
    title: 'Monthly Retrospective',
    sections: [
      { heading: 'What went well',                placeholder: '' },
      { heading: 'What could be improved',        placeholder: '' },
      { heading: 'What to try next month',        placeholder: '' },
      { heading: 'Team capacity and morale',      placeholder: '' },
      { heading: 'Process improvements agreed',   placeholder: '' },
    ],
  },
  preworkMaterials: {
    title: 'Workshop Pre-Read & Prework',
    sections: [
      { heading: 'Workshop objectives (1-pager)',  placeholder: 'Brief overview of goals and format for participants...' },
      { heading: 'Pre-read materials',             placeholder: 'Links or summaries of required reading...' },
      { heading: 'Pre-work task',                  placeholder: 'What participants should prepare or bring to the session...' },
      { heading: 'Questions to reflect on',        placeholder: '3–5 reflection questions to prime thinking...' },
    ],
  },
  configurationNotes: {
    title: 'Solution Configuration Notes',
    sections: [
      { heading: 'Architecture overview',          placeholder: 'High-level description of the solution and components...' },
      { heading: 'Configuration decisions',        placeholder: 'Key choices made and rationale...' },
      { heading: 'Integration details',            placeholder: 'APIs, webhooks, data flows configured...' },
      { heading: 'Testing notes',                  placeholder: 'Test cases run, results, pass/fail...' },
      { heading: 'Known limitations',             placeholder: '' },
      { heading: 'Handover notes',                placeholder: 'What the client or ops team needs to know to maintain this...' },
    ],
  },
};

// ── Main component ────────────────────────────────────────────────────────────

export function StructuredDocument({ storageKey, engagement, onSave, onClose }) {
  const saved    = engagement?.artifactData?.[storageKey];
  const template = DOCUMENT_TEMPLATES[storageKey] ?? { title: storageKey, sections: [{ heading: 'Notes', placeholder: '' }] };

  const [title, setTitle]     = useState(saved?.title    ?? template.title);
  const [sections, setSections] = useState(() =>
    saved?.sections ?? template.sections.map(s => ({ id: crypto.randomUUID(), ...s, content: s.content ?? '' }))
  );
  const [isSaved, setIsSaved]  = useState(!!saved);
  const [copied,  setCopied]   = useState(false);

  function update(id, val) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, content: val } : s));
    setIsSaved(false);
  }
  function handleSave() {
    onSave(storageKey, { title, sections });
    setIsSaved(true);
  }
  async function handleCopy() {
    const text = `# ${title}\n\n` + sections.map(s => `## ${s.heading}\n\n${s.content || '—'}`).join('\n\n');
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {/* Document title */}
      <div className="mb-5">
        <input
          value={title}
          onChange={e => { setTitle(e.target.value); setIsSaved(false); }}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {sections.map(section => (
          <div key={section.id}>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">{section.heading}</label>
            <textarea
              rows={4}
              value={section.content}
              onChange={e => update(section.id, e.target.value)}
              placeholder={section.placeholder}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 leading-relaxed resize-y"
            />
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 flex-wrap">
        {engagement && (
          <button type="button" onClick={handleSave}
            className="text-xs px-3 py-1.5 rounded-md font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
            {isSaved ? '✓ Saved' : 'Save to engagement'}
          </button>
        )}
        <button type="button" onClick={handleCopy}
          className="text-xs px-3 py-1.5 rounded-md font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
          {copied ? '✓ Copied!' : '📋 Copy as Markdown'}
        </button>
        <button type="button" onClick={onClose}
          className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline">
          Close
        </button>
      </div>
    </div>
  );
}
