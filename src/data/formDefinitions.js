// Structured form definitions for all 6 service types.
// Each service maps to an ordered array of form groups.
// Each form group has a key, label, and array of field definitions.
// Field types: 'text' | 'textarea' | 'select'

export const FORM_DEFINITIONS = {
  'ai-readiness': [
    {
      key: 'intake',
      label: 'Intake Questionnaire',
      fields: [
        { key: 'industry',       label: 'Primary Industry',           type: 'text',     placeholder: 'e.g. Healthcare, Logistics, Retail' },
        { key: 'employeeCount',  label: 'Number of Employees',        type: 'select',   options: ['1–10', '11–50', '51–200', '201–500', '500+'] },
        { key: 'currentTools',   label: 'Current Tools & Software',   type: 'textarea', placeholder: 'List the key tools and systems in use' },
        { key: 'painPoints',     label: 'Top Operational Pain Points',type: 'textarea', placeholder: 'List the top 2–3 pain points' },
        { key: 'aiExperience',   label: 'Current AI/Automation Experience', type: 'select', options: ['None', 'Minimal', 'Some', 'Extensive'] },
        { key: 'decisionMaker',  label: 'Primary Decision-Maker',     type: 'text',     placeholder: 'Name and role' },
        { key: 'budget',         label: 'Estimated Budget Range',     type: 'select',   options: ['Under $5K', '$5K–$15K', '$15K–$50K', '$50K+', 'Unknown'] },
        { key: 'timeline',       label: 'Desired Implementation Timeline', type: 'text', placeholder: 'e.g. 3–6 months' },
      ],
    },
    {
      key: 'scoring',
      label: 'Scoring Worksheet',
      fields: [
        { key: 'dataAvailability',    label: 'Data Availability (1–5)',              type: 'select', options: ['1', '2', '3', '4', '5'] },
        { key: 'dataQuality',         label: 'Data Quality (1–5)',                   type: 'select', options: ['1', '2', '3', '4', '5'] },
        { key: 'technicalReadiness',  label: 'Technical Infrastructure Readiness (1–5)', type: 'select', options: ['1', '2', '3', '4', '5'] },
        { key: 'teamAdoption',        label: 'Team Change Adoption Readiness (1–5)',  type: 'select', options: ['1', '2', '3', '4', '5'] },
        { key: 'processMaturity',     label: 'Business Process Maturity (1–5)',       type: 'select', options: ['1', '2', '3', '4', '5'] },
        { key: 'scoringNotes',        label: 'Scoring Rationale & Observations',      type: 'textarea', placeholder: 'Explain each score and note key gaps' },
      ],
    },
    {
      key: 'use-cases',
      label: 'Use Case Prioritization',
      fields: [
        { key: 'useCase1',        label: 'Use Case #1',           type: 'text',   placeholder: 'Brief name or description' },
        { key: 'useCase1Impact',  label: 'Impact',                type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'useCase1Effort',  label: 'Effort',                type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'useCase2',        label: 'Use Case #2',           type: 'text',   placeholder: 'Brief name or description' },
        { key: 'useCase2Impact',  label: 'Impact',                type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'useCase2Effort',  label: 'Effort',                type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'useCase3',        label: 'Use Case #3',           type: 'text',   placeholder: 'Brief name or description' },
        { key: 'useCase3Impact',  label: 'Impact',                type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'useCase3Effort',  label: 'Effort',                type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'topRecommendation', label: 'Top Recommendation & Rationale', type: 'textarea', placeholder: 'Which use case to pursue first and why' },
      ],
    },
  ],

  'ai-strategy': [
    {
      key: 'stakeholders',
      label: 'Stakeholder Alignment Worksheet',
      fields: [
        { key: 'stakeholder1Name',  label: 'Stakeholder #1 — Name & Role',    type: 'text',     placeholder: 'e.g. Jane Smith, VP Operations' },
        { key: 'stakeholder1Goal',  label: 'Stakeholder #1 — Primary Goal',   type: 'textarea', placeholder: 'What outcome are they seeking?' },
        { key: 'stakeholder2Name',  label: 'Stakeholder #2 — Name & Role',    type: 'text',     placeholder: '' },
        { key: 'stakeholder2Goal',  label: 'Stakeholder #2 — Primary Goal',   type: 'textarea', placeholder: '' },
        { key: 'stakeholder3Name',  label: 'Stakeholder #3 — Name & Role',    type: 'text',     placeholder: '' },
        { key: 'stakeholder3Goal',  label: 'Stakeholder #3 — Primary Goal',   type: 'textarea', placeholder: '' },
        { key: 'alignmentGaps',     label: 'Alignment Gaps / Conflicts',      type: 'textarea', placeholder: 'Where do stakeholder goals diverge?' },
        { key: 'sharedObjective',   label: 'Agreed Shared Objective',         type: 'textarea', placeholder: 'The single outcome all stakeholders can commit to' },
      ],
    },
    {
      key: 'kpis',
      label: 'KPI Worksheet',
      fields: [
        { key: 'kpi1',          label: 'KPI #1',            type: 'text', placeholder: 'e.g. Patient intake processing time' },
        { key: 'kpi1Baseline',  label: 'KPI #1 Baseline',   type: 'text', placeholder: 'Current measured value' },
        { key: 'kpi1Target',    label: 'KPI #1 Target',     type: 'text', placeholder: 'Desired value after AI implementation' },
        { key: 'kpi2',          label: 'KPI #2',            type: 'text', placeholder: '' },
        { key: 'kpi2Baseline',  label: 'KPI #2 Baseline',   type: 'text', placeholder: '' },
        { key: 'kpi2Target',    label: 'KPI #2 Target',     type: 'text', placeholder: '' },
        { key: 'kpi3',          label: 'KPI #3',            type: 'text', placeholder: '' },
        { key: 'kpi3Baseline',  label: 'KPI #3 Baseline',   type: 'text', placeholder: '' },
        { key: 'kpi3Target',    label: 'KPI #3 Target',     type: 'text', placeholder: '' },
        { key: 'measurementMethod', label: 'Measurement Method',  type: 'textarea', placeholder: 'How and how often will KPIs be tracked?' },
      ],
    },
    {
      key: 'roadmap',
      label: 'Roadmap Inputs',
      fields: [
        { key: 'phase1Name',     label: 'Phase 1 — Initiative',  type: 'text',     placeholder: 'e.g. Automate patient intake triage' },
        { key: 'phase1Timeline', label: 'Phase 1 — Timeline',    type: 'text',     placeholder: 'e.g. Month 1–2' },
        { key: 'phase1Owner',    label: 'Phase 1 — Owner',       type: 'text',     placeholder: '' },
        { key: 'phase2Name',     label: 'Phase 2 — Initiative',  type: 'text',     placeholder: '' },
        { key: 'phase2Timeline', label: 'Phase 2 — Timeline',    type: 'text',     placeholder: '' },
        { key: 'phase2Owner',    label: 'Phase 2 — Owner',       type: 'text',     placeholder: '' },
        { key: 'phase3Name',     label: 'Phase 3 — Initiative',  type: 'text',     placeholder: '' },
        { key: 'phase3Timeline', label: 'Phase 3 — Timeline',    type: 'text',     placeholder: '' },
        { key: 'phase3Owner',    label: 'Phase 3 — Owner',       type: 'text',     placeholder: '' },
        { key: 'dependencies',        label: 'Key Dependencies & Assumptions', type: 'textarea', placeholder: 'What must be true for this roadmap to work?' },
        { key: 'successDefinition',   label: 'Definition of Roadmap Success',  type: 'textarea', placeholder: 'What does success look like at 6 months?' },
      ],
    },
  ],

  'ai-pilot': [
    {
      key: 'charter',
      label: 'Pilot Charter',
      fields: [
        { key: 'problemStatement', label: 'Problem Statement',         type: 'textarea', placeholder: 'What specific problem is this pilot solving?' },
        { key: 'pilotScope',       label: 'Scope (in / out of scope)', type: 'textarea', placeholder: 'What is included and excluded?' },
        { key: 'toolsUsed',        label: 'AI Tools / Platforms',      type: 'text',     placeholder: 'e.g. OpenAI API, Make.com, custom model' },
        { key: 'teamMembers',      label: 'Pilot Team Members & Roles',type: 'textarea', placeholder: 'Who is doing what?' },
        { key: 'executiveSponsor', label: 'Executive Sponsor',         type: 'text',     placeholder: 'Name and role' },
        { key: 'pilotStartDate',   label: 'Pilot Start Date',          type: 'text',     placeholder: 'e.g. 2026-04-10' },
        { key: 'pilotEndDate',     label: 'Pilot End Date',            type: 'text',     placeholder: 'e.g. 2026-05-10' },
      ],
    },
    {
      key: 'metrics',
      label: 'Success Metrics',
      fields: [
        { key: 'primaryMetric',    label: 'Primary Success Metric',    type: 'text',   placeholder: 'e.g. Scheduling no-show rate' },
        { key: 'primaryBaseline',  label: 'Baseline Value',            type: 'text',   placeholder: 'Current measured value' },
        { key: 'primaryTarget',    label: 'Target Value',              type: 'text',   placeholder: 'Goal by end of pilot' },
        { key: 'secondaryMetric1', label: 'Secondary Metric #1',       type: 'text',   placeholder: '' },
        { key: 'secondaryMetric2', label: 'Secondary Metric #2',       type: 'text',   placeholder: '' },
        { key: 'measurementFrequency', label: 'Measurement Frequency', type: 'select', options: ['Daily', 'Weekly', 'Bi-weekly', 'End of pilot'] },
        { key: 'qualitativeGoals', label: 'Qualitative Success Criteria', type: 'textarea', placeholder: 'Outcomes that matter but cannot be measured numerically' },
      ],
    },
    {
      key: 'requirements',
      label: 'Requirements',
      fields: [
        { key: 'techRequirements',   label: 'Technical Requirements',           type: 'textarea', placeholder: 'Systems, APIs, infrastructure needed' },
        { key: 'dataRequirements',   label: 'Data Requirements',                type: 'textarea', placeholder: 'What data is needed, in what format?' },
        { key: 'accessRequirements', label: 'Access & Permissions Required',    type: 'textarea', placeholder: 'System access, credentials, approvals needed' },
        { key: 'trainingNeeds',      label: 'Training Needs for Pilot Team',    type: 'textarea', placeholder: 'What does the team need to learn?' },
        { key: 'assumptions',        label: 'Key Assumptions',                  type: 'textarea', placeholder: 'What are we assuming to be true?' },
      ],
    },
    {
      key: 'risks',
      label: 'Risk Log',
      fields: [
        { key: 'risk1',             label: 'Risk #1',          type: 'text',   placeholder: 'Brief risk description' },
        { key: 'risk1Likelihood',   label: 'Likelihood',       type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'risk1Impact',       label: 'Impact',           type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'risk1Mitigation',   label: 'Mitigation',       type: 'text',   placeholder: 'How will this risk be managed?' },
        { key: 'risk2',             label: 'Risk #2',          type: 'text',   placeholder: '' },
        { key: 'risk2Likelihood',   label: 'Likelihood',       type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'risk2Impact',       label: 'Impact',           type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'risk2Mitigation',   label: 'Mitigation',       type: 'text',   placeholder: '' },
        { key: 'risk3',             label: 'Risk #3',          type: 'text',   placeholder: '' },
        { key: 'risk3Likelihood',   label: 'Likelihood',       type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'risk3Impact',       label: 'Impact',           type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'risk3Mitigation',   label: 'Mitigation',       type: 'text',   placeholder: '' },
      ],
    },
  ],

  'ai-governance': [
    {
      key: 'governance',
      label: 'Governance Questionnaire',
      fields: [
        { key: 'aiPoliciesExist',   label: 'AI policies documented?',                    type: 'select', options: ['Yes', 'No', 'In progress'] },
        { key: 'dataGovernance',    label: 'Data governance practices in place?',        type: 'select', options: ['Yes', 'No', 'Partial'] },
        { key: 'vendorOversight',   label: 'Vendor / third-party AI oversight?',         type: 'select', options: ['Yes', 'No', 'Partial'] },
        { key: 'incidentResponse',  label: 'AI incident response plan exists?',          type: 'select', options: ['Yes', 'No', 'Partial'] },
        { key: 'trainingProgram',   label: 'AI ethics / responsible-use training?',      type: 'select', options: ['Yes', 'No', 'Partial'] },
        { key: 'governanceNotes',   label: 'Additional Governance Observations',         type: 'textarea', placeholder: 'Other policy or process gaps noted' },
      ],
    },
    {
      key: 'findings',
      label: 'Findings',
      fields: [
        { key: 'finding1',          label: 'Finding #1',        type: 'textarea', placeholder: 'Describe the finding' },
        { key: 'finding1Severity',  label: 'Severity',          type: 'select',   options: ['Low', 'Medium', 'High', 'Critical'] },
        { key: 'finding2',          label: 'Finding #2',        type: 'textarea', placeholder: '' },
        { key: 'finding2Severity',  label: 'Severity',          type: 'select',   options: ['Low', 'Medium', 'High', 'Critical'] },
        { key: 'finding3',          label: 'Finding #3',        type: 'textarea', placeholder: '' },
        { key: 'finding3Severity',  label: 'Severity',          type: 'select',   options: ['Low', 'Medium', 'High', 'Critical'] },
        { key: 'executiveSummary',  label: 'Executive Findings Summary', type: 'textarea', placeholder: 'High-level summary for leadership' },
      ],
    },
    {
      key: 'remediation',
      label: 'Remediation Items',
      fields: [
        { key: 'item1',          label: 'Item #1',              type: 'text',   placeholder: 'Brief description of remediation action' },
        { key: 'item1Priority',  label: 'Priority',             type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'item1Owner',     label: 'Owner',                type: 'text',   placeholder: '' },
        { key: 'item1Due',       label: 'Due Date',             type: 'text',   placeholder: 'e.g. 2026-06-01' },
        { key: 'item2',          label: 'Item #2',              type: 'text',   placeholder: '' },
        { key: 'item2Priority',  label: 'Priority',             type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'item2Owner',     label: 'Owner',                type: 'text',   placeholder: '' },
        { key: 'item2Due',       label: 'Due Date',             type: 'text',   placeholder: '' },
        { key: 'item3',          label: 'Item #3',              type: 'text',   placeholder: '' },
        { key: 'item3Priority',  label: 'Priority',             type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'item3Owner',     label: 'Owner',                type: 'text',   placeholder: '' },
        { key: 'item3Due',       label: 'Due Date',             type: 'text',   placeholder: '' },
      ],
    },
  ],

  'ai-training': [
    {
      key: 'needs',
      label: 'Training Needs Assessment',
      fields: [
        { key: 'audienceRole',       label: 'Target Audience Role(s)',         type: 'text',     placeholder: 'e.g. Operations managers, front-line staff' },
        { key: 'audienceSize',       label: 'Number of Participants',          type: 'text',     placeholder: 'e.g. 12' },
        { key: 'currentSkillLevel',  label: 'Current AI Skill Level',          type: 'select',   options: ['Beginner', 'Intermediate', 'Advanced', 'Mixed'] },
        { key: 'deliveryFormat',     label: 'Delivery Format',                 type: 'select',   options: ['In-person', 'Virtual', 'Hybrid'] },
        { key: 'trainingGoals',      label: 'Training Goals & Desired Outcomes', type: 'textarea', placeholder: 'What should participants be able to do after the session?' },
        { key: 'topicsRequested',    label: 'Topics Requested by Stakeholders',  type: 'textarea', placeholder: 'Specific topics or tools to cover' },
        { key: 'constraints',        label: 'Constraints',                       type: 'textarea', placeholder: 'Time limits, format restrictions, tool availability' },
      ],
    },
    {
      key: 'participants',
      label: 'Participant Notes',
      fields: [
        { key: 'participantList',   label: 'Participant Names & Roles',    type: 'textarea', placeholder: 'List attendees and their roles' },
        { key: 'attendanceNotes',   label: 'Attendance & Engagement Notes',type: 'textarea', placeholder: 'Who attended, overall engagement level' },
        { key: 'questionsRaised',   label: 'Key Questions Raised',         type: 'textarea', placeholder: 'Notable questions or concerns from participants' },
        { key: 'groupDynamics',     label: 'Group Dynamics Observations',  type: 'textarea', placeholder: 'Energy, skeptics, champions, notable interactions' },
      ],
    },
    {
      key: 'action-plan',
      label: 'Action Plan',
      fields: [
        { key: 'action1',       label: 'Action Item #1',  type: 'text', placeholder: 'What needs to happen next?' },
        { key: 'action1Owner',  label: 'Owner',           type: 'text', placeholder: '' },
        { key: 'action1Due',    label: 'Due Date',        type: 'text', placeholder: '' },
        { key: 'action2',       label: 'Action Item #2',  type: 'text', placeholder: '' },
        { key: 'action2Owner',  label: 'Owner',           type: 'text', placeholder: '' },
        { key: 'action2Due',    label: 'Due Date',        type: 'text', placeholder: '' },
        { key: 'action3',       label: 'Action Item #3',  type: 'text', placeholder: '' },
        { key: 'action3Owner',  label: 'Owner',           type: 'text', placeholder: '' },
        { key: 'action3Due',    label: 'Due Date',        type: 'text', placeholder: '' },
        { key: 'followUpDate',  label: 'Follow-Up Check-In Date', type: 'text',     placeholder: '' },
        { key: 'resources',     label: 'Resources & Materials Shared',    type: 'textarea', placeholder: 'Links, docs, tools shared with participants' },
      ],
    },
  ],

  'ai-ops': [
    {
      key: 'review',
      label: 'Monthly Review Notes',
      fields: [
        { key: 'month',           label: 'Review Month',             type: 'text',     placeholder: 'e.g. April 2026' },
        { key: 'summaryOfWork',   label: 'Summary of Work Completed',type: 'textarea', placeholder: 'What was delivered this month?' },
        { key: 'kpiUpdates',      label: 'KPI / Metrics Updates',    type: 'textarea', placeholder: 'How are the key metrics trending?' },
        { key: 'clientFeedback',  label: 'Client Feedback',          type: 'textarea', placeholder: 'What did the client say this month?' },
        { key: 'highlights',      label: 'Key Highlights & Wins',    type: 'textarea', placeholder: 'What went especially well?' },
      ],
    },
    {
      key: 'issues',
      label: 'Issue Log',
      fields: [
        { key: 'issue1',            label: 'Issue #1',          type: 'text',   placeholder: 'Brief description' },
        { key: 'issue1Status',      label: 'Status',            type: 'select', options: ['Open', 'In Progress', 'Resolved'] },
        { key: 'issue1Resolution',  label: 'Resolution / Next Step', type: 'text', placeholder: '' },
        { key: 'issue2',            label: 'Issue #2',          type: 'text',   placeholder: '' },
        { key: 'issue2Status',      label: 'Status',            type: 'select', options: ['Open', 'In Progress', 'Resolved'] },
        { key: 'issue2Resolution',  label: 'Resolution / Next Step', type: 'text', placeholder: '' },
        { key: 'issue3',            label: 'Issue #3',          type: 'text',   placeholder: '' },
        { key: 'issue3Status',      label: 'Status',            type: 'select', options: ['Open', 'In Progress', 'Resolved'] },
        { key: 'issue3Resolution',  label: 'Resolution / Next Step', type: 'text', placeholder: '' },
      ],
    },
    {
      key: 'optimization',
      label: 'Optimization Backlog',
      fields: [
        { key: 'item1',           label: 'Item #1',      type: 'text',   placeholder: 'What could be improved?' },
        { key: 'item1Rationale',  label: 'Rationale',    type: 'text',   placeholder: 'Why is this worth doing?' },
        { key: 'item1Effort',     label: 'Effort',       type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'item2',           label: 'Item #2',      type: 'text',   placeholder: '' },
        { key: 'item2Rationale',  label: 'Rationale',    type: 'text',   placeholder: '' },
        { key: 'item2Effort',     label: 'Effort',       type: 'select', options: ['Low', 'Medium', 'High'] },
        { key: 'item3',           label: 'Item #3',      type: 'text',   placeholder: '' },
        { key: 'item3Rationale',  label: 'Rationale',    type: 'text',   placeholder: '' },
        { key: 'item3Effort',     label: 'Effort',       type: 'select', options: ['Low', 'Medium', 'High'] },
      ],
    },
    {
      key: 'recommendations',
      label: 'Recommendation Log',
      fields: [
        { key: 'rec1',           label: 'Recommendation #1',  type: 'text',     placeholder: 'What are you recommending?' },
        { key: 'rec1Priority',   label: 'Priority',           type: 'select',   options: ['Low', 'Medium', 'High'] },
        { key: 'rec1Rationale',  label: 'Rationale',          type: 'textarea', placeholder: 'Why does this matter?' },
        { key: 'rec2',           label: 'Recommendation #2',  type: 'text',     placeholder: '' },
        { key: 'rec2Priority',   label: 'Priority',           type: 'select',   options: ['Low', 'Medium', 'High'] },
        { key: 'rec2Rationale',  label: 'Rationale',          type: 'textarea', placeholder: '' },
        { key: 'rec3',           label: 'Recommendation #3',  type: 'text',     placeholder: '' },
        { key: 'rec3Priority',   label: 'Priority',           type: 'select',   options: ['Low', 'Medium', 'High'] },
        { key: 'rec3Rationale',  label: 'Rationale',          type: 'textarea', placeholder: '' },
      ],
    },
  ],
};

export const TEMPLATE_STATUSES = ['Not Started', 'In Progress', 'Complete'];

export function getFormDefs(serviceKey) {
  return FORM_DEFINITIONS[serviceKey] ?? [];
}

export function getFormDef(serviceKey, formKey) {
  return getFormDefs(serviceKey).find(f => f.key === formKey) ?? null;
}
