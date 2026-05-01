// Document output type definitions per service type.
// Each entry defines: id, label, docTypeLabel (for filename), requiredFields.
// requiredFields: [{formKey, field, label}] — fields that must be non-empty before generation.

export const OUTPUT_DEFINITIONS = {
  'ai-readiness': [
    {
      id: 'executive-summary',
      label: 'Executive Summary',
      docTypeLabel: 'Executive_Summary',
      requiredFields: [
        { formKey: 'intake',    field: 'industry',          label: 'Industry (Intake)' },
        { formKey: 'intake',    field: 'decisionMaker',     label: 'Decision-Maker (Intake)' },
        { formKey: 'intake',    field: 'painPoints',        label: 'Pain Points (Intake)' },
        { formKey: 'scoring',   field: 'scoringNotes',      label: 'Scoring Rationale (Scoring)' },
        { formKey: 'use-cases', field: 'topRecommendation', label: 'Top Recommendation (Use Cases)' },
      ],
    },
    {
      id: 'readiness-report',
      label: 'AI Readiness Report',
      docTypeLabel: 'Readiness_Report',
      requiredFields: [
        { formKey: 'intake',    field: 'industry',         label: 'Industry (Intake)' },
        { formKey: 'intake',    field: 'currentTools',     label: 'Current Tools (Intake)' },
        { formKey: 'intake',    field: 'painPoints',       label: 'Pain Points (Intake)' },
        { formKey: 'scoring',   field: 'dataAvailability', label: 'Data Availability Score (Scoring)' },
        { formKey: 'use-cases', field: 'useCase1',         label: 'Use Case #1 (Use Cases)' },
      ],
    },
  ],

  'ai-strategy': [
    {
      id: 'roadmap-summary',
      label: 'Roadmap Summary',
      docTypeLabel: 'Roadmap_Summary',
      requiredFields: [
        { formKey: 'roadmap', field: 'phase1Name',        label: 'Phase 1 Initiative (Roadmap)' },
        { formKey: 'roadmap', field: 'phase1Timeline',    label: 'Phase 1 Timeline (Roadmap)' },
        { formKey: 'roadmap', field: 'successDefinition', label: 'Definition of Success (Roadmap)' },
      ],
    },
  ],

  'ai-pilot': [
    {
      id: 'pilot-charter',
      label: 'Pilot Charter',
      docTypeLabel: 'Pilot_Charter',
      requiredFields: [
        { formKey: 'charter', field: 'problemStatement', label: 'Problem Statement (Charter)' },
        { formKey: 'charter', field: 'pilotScope',       label: 'Scope (Charter)' },
        { formKey: 'charter', field: 'pilotStartDate',   label: 'Start Date (Charter)' },
      ],
    },
  ],

  'ai-governance': [
    {
      id: 'governance-findings-summary',
      label: 'Governance Findings Summary',
      docTypeLabel: 'Governance_Findings_Summary',
      requiredFields: [
        { formKey: 'findings',   field: 'finding1',         label: 'Finding #1 (Findings)' },
        { formKey: 'findings',   field: 'executiveSummary', label: 'Executive Summary (Findings)' },
        { formKey: 'governance', field: 'governanceNotes',  label: 'Governance Observations (Questionnaire)' },
      ],
    },
  ],

  'ai-training': [
    {
      id: 'training-action-plan',
      label: 'Training Action Plan',
      docTypeLabel: 'Training_Action_Plan',
      requiredFields: [
        { formKey: 'action-plan', field: 'action1',      label: 'Action Item #1 (Action Plan)' },
        { formKey: 'action-plan', field: 'followUpDate', label: 'Follow-Up Date (Action Plan)' },
      ],
    },
  ],

  'ai-ops': [
    {
      id: 'monthly-ops-review',
      label: 'Monthly Ops Review Summary',
      docTypeLabel: 'Monthly_Ops_Review_Summary',
      requiredFields: [
        { formKey: 'review', field: 'month',         label: 'Review Month (Monthly Review)' },
        { formKey: 'review', field: 'summaryOfWork', label: 'Summary of Work (Monthly Review)' },
      ],
    },
  ],
};

// Short service labels used in output filenames
export const SERVICE_FILE_LABELS = {
  'ai-readiness':  'AI_Readiness_Assessment',
  'ai-strategy':   'AI_Strategy_Roadmap',
  'ai-pilot':      'AI_Pilot',
  'ai-governance': 'AI_Governance_Review',
  'ai-training':   'AI_Training_Session',
  'ai-ops':        'Managed_AI_Ops',
};

export function getOutputDefs(serviceType) {
  return OUTPUT_DEFINITIONS[serviceType] ?? [];
}

export function getOutputDef(serviceType, docTypeId) {
  return getOutputDefs(serviceType).find(d => d.id === docTypeId) ?? null;
}

// Returns array of missing required field labels for a given def + engagement
export function checkMissingFields(def, engagement) {
  return def.requiredFields.filter(rf => {
    const val = engagement.forms?.[rf.formKey]?.[rf.field];
    return !val || String(val).trim() === '';
  }).map(rf => rf.label);
}
