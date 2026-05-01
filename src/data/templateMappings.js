// Pure markdown generators — one per form key.
// Each generator takes an engagement object and reads from engagement.forms?.[formKey].
// Returns a complete markdown string. Missing values render as '—'.

function header(eng, title) {
  return `# ${title}

**Client:** ${eng.clientName}
**Company:** ${eng.company}
**Contact:** ${eng.primaryContact} (${eng.email})
**Start Date:** ${eng.startDate}
**Owner:** ${eng.owner}

---
`;
}

const GENERATORS = {

  // ── AI Readiness Assessment ──────────────────────────────────────────────

  'intake': (eng) => {
    const f = eng.forms?.intake ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, 'AI Readiness Assessment – Intake Questionnaire')}
## Client Profile

| Field | Response |
|---|---|
| Industry | ${v('industry')} |
| Employees | ${v('employeeCount')} |
| AI / Automation Experience | ${v('aiExperience')} |
| Decision-Maker | ${v('decisionMaker')} |
| Budget Range | ${v('budget')} |
| Desired Timeline | ${v('timeline')} |

## Current Tools & Software

${v('currentTools')}

## Top Operational Pain Points

${v('painPoints')}
`;
  },

  'scoring': (eng) => {
    const f = eng.forms?.scoring ?? {};
    const v = k => f[k] || '—';
    const scores = [
      ['Data Availability',             v('dataAvailability')],
      ['Data Quality',                  v('dataQuality')],
      ['Technical Infrastructure',      v('technicalReadiness')],
      ['Team Change Adoption',          v('teamAdoption')],
      ['Business Process Maturity',     v('processMaturity')],
    ];
    const total = scores.reduce((sum, [, s]) => sum + (parseInt(s) || 0), 0);
    const avg = scores.every(([, s]) => s !== '—')
      ? (total / scores.length).toFixed(1)
      : '—';

    return `${header(eng, 'AI Readiness Assessment – Scoring Worksheet')}
## Readiness Scores

| Dimension | Score (1–5) |
|---|---|
${scores.map(([label, score]) => `| ${label} | ${score} |`).join('\n')}
| **Average** | **${avg}** |

## Scoring Rationale & Observations

${v('scoringNotes')}
`;
  },

  'use-cases': (eng) => {
    const f = eng.forms?.['use-cases'] ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, 'AI Readiness Assessment – Use Case Prioritization')}
## Use Case Matrix

| # | Use Case | Impact | Effort |
|---|---|---|---|
| 1 | ${v('useCase1')} | ${v('useCase1Impact')} | ${v('useCase1Effort')} |
| 2 | ${v('useCase2')} | ${v('useCase2Impact')} | ${v('useCase2Effort')} |
| 3 | ${v('useCase3')} | ${v('useCase3Impact')} | ${v('useCase3Effort')} |

## Top Recommendation

${v('topRecommendation')}
`;
  },

  // ── AI Strategy & Roadmap Workshop ──────────────────────────────────────

  'stakeholders': (eng) => {
    const f = eng.forms?.stakeholders ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, 'AI Strategy & Roadmap Workshop – Stakeholder Alignment')}
## Stakeholder Goals

### ${v('stakeholder1Name')}
${v('stakeholder1Goal')}

### ${v('stakeholder2Name')}
${v('stakeholder2Goal')}

### ${v('stakeholder3Name')}
${v('stakeholder3Goal')}

## Alignment Gaps / Conflicts

${v('alignmentGaps')}

## Agreed Shared Objective

${v('sharedObjective')}
`;
  },

  'kpis': (eng) => {
    const f = eng.forms?.kpis ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, 'AI Strategy & Roadmap Workshop – KPI Worksheet')}
## Key Performance Indicators

| KPI | Baseline | Target |
|---|---|---|
| ${v('kpi1')} | ${v('kpi1Baseline')} | ${v('kpi1Target')} |
| ${v('kpi2')} | ${v('kpi2Baseline')} | ${v('kpi2Target')} |
| ${v('kpi3')} | ${v('kpi3Baseline')} | ${v('kpi3Target')} |

## Measurement Method

${v('measurementMethod')}
`;
  },

  'roadmap': (eng) => {
    const f = eng.forms?.roadmap ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, 'AI Strategy & Roadmap Workshop – Roadmap')}
## Initiative Phases

| Phase | Initiative | Timeline | Owner |
|---|---|---|---|
| 1 | ${v('phase1Name')} | ${v('phase1Timeline')} | ${v('phase1Owner')} |
| 2 | ${v('phase2Name')} | ${v('phase2Timeline')} | ${v('phase2Owner')} |
| 3 | ${v('phase3Name')} | ${v('phase3Timeline')} | ${v('phase3Owner')} |

## Key Dependencies & Assumptions

${v('dependencies')}

## Definition of Success

${v('successDefinition')}
`;
  },

  // ── 30-Day AI Pilot ─────────────────────────────────────────────────────

  'charter': (eng) => {
    const f = eng.forms?.charter ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, '30-Day AI Pilot – Charter')}
## Problem Statement

${v('problemStatement')}

## Scope

${v('pilotScope')}

## Pilot Details

| Field | Value |
|---|---|
| Tools / Platforms | ${v('toolsUsed')} |
| Executive Sponsor | ${v('executiveSponsor')} |
| Start Date | ${v('pilotStartDate')} |
| End Date | ${v('pilotEndDate')} |

## Team

${v('teamMembers')}
`;
  },

  'metrics': (eng) => {
    const f = eng.forms?.metrics ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, '30-Day AI Pilot – Success Metrics')}
## Primary Metric

| Metric | Baseline | Target |
|---|---|---|
| ${v('primaryMetric')} | ${v('primaryBaseline')} | ${v('primaryTarget')} |

## Secondary Metrics

- ${v('secondaryMetric1')}
- ${v('secondaryMetric2')}

**Measurement Frequency:** ${v('measurementFrequency')}

## Qualitative Success Criteria

${v('qualitativeGoals')}
`;
  },

  'requirements': (eng) => {
    const f = eng.forms?.requirements ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, '30-Day AI Pilot – Requirements')}
## Technical Requirements

${v('techRequirements')}

## Data Requirements

${v('dataRequirements')}

## Access & Permissions

${v('accessRequirements')}

## Training Needs

${v('trainingNeeds')}

## Key Assumptions

${v('assumptions')}
`;
  },

  'risks': (eng) => {
    const f = eng.forms?.risks ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, '30-Day AI Pilot – Risk Log')}
## Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | ${v('risk1')} | ${v('risk1Likelihood')} | ${v('risk1Impact')} | ${v('risk1Mitigation')} |
| 2 | ${v('risk2')} | ${v('risk2Likelihood')} | ${v('risk2Impact')} | ${v('risk2Mitigation')} |
| 3 | ${v('risk3')} | ${v('risk3Likelihood')} | ${v('risk3Impact')} | ${v('risk3Mitigation')} |
`;
  },

  // ── AI Governance & Risk Review ──────────────────────────────────────────

  'governance': (eng) => {
    const f = eng.forms?.governance ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, 'AI Governance & Risk Review – Questionnaire')}
## Governance Controls Assessment

| Control Area | Status |
|---|---|
| AI Policies Documented | ${v('aiPoliciesExist')} |
| Data Governance Practices | ${v('dataGovernance')} |
| Vendor / Third-Party Oversight | ${v('vendorOversight')} |
| AI Incident Response Plan | ${v('incidentResponse')} |
| AI Ethics / Responsible-Use Training | ${v('trainingProgram')} |

## Additional Observations

${v('governanceNotes')}
`;
  },

  'findings': (eng) => {
    const f = eng.forms?.findings ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, 'AI Governance & Risk Review – Findings')}
## Finding #1 — Severity: ${v('finding1Severity')}

${v('finding1')}

## Finding #2 — Severity: ${v('finding2Severity')}

${v('finding2')}

## Finding #3 — Severity: ${v('finding3Severity')}

${v('finding3')}

## Executive Summary

${v('executiveSummary')}
`;
  },

  'remediation': (eng) => {
    const f = eng.forms?.remediation ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, 'AI Governance & Risk Review – Remediation Plan')}
## Remediation Items

| # | Item | Priority | Owner | Due |
|---|---|---|---|---|
| 1 | ${v('item1')} | ${v('item1Priority')} | ${v('item1Owner')} | ${v('item1Due')} |
| 2 | ${v('item2')} | ${v('item2Priority')} | ${v('item2Owner')} | ${v('item2Due')} |
| 3 | ${v('item3')} | ${v('item3Priority')} | ${v('item3Owner')} | ${v('item3Due')} |
`;
  },

  // ── AI Team Training Session ─────────────────────────────────────────────

  'needs': (eng) => {
    const f = eng.forms?.needs ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, 'AI Team Training Session – Needs Assessment')}
## Audience Profile

| Field | Value |
|---|---|
| Target Roles | ${v('audienceRole')} |
| Participants | ${v('audienceSize')} |
| Current AI Skill Level | ${v('currentSkillLevel')} |
| Delivery Format | ${v('deliveryFormat')} |

## Training Goals & Desired Outcomes

${v('trainingGoals')}

## Topics Requested

${v('topicsRequested')}

## Constraints

${v('constraints')}
`;
  },

  'participants': (eng) => {
    const f = eng.forms?.participants ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, 'AI Team Training Session – Participant Notes')}
## Participant List

${v('participantList')}

## Attendance & Engagement

${v('attendanceNotes')}

## Key Questions Raised

${v('questionsRaised')}

## Group Dynamics Observations

${v('groupDynamics')}
`;
  },

  'action-plan': (eng) => {
    const f = eng.forms?.['action-plan'] ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, 'AI Team Training Session – Action Plan')}
## Action Items

| # | Action | Owner | Due |
|---|---|---|---|
| 1 | ${v('action1')} | ${v('action1Owner')} | ${v('action1Due')} |
| 2 | ${v('action2')} | ${v('action2Owner')} | ${v('action2Due')} |
| 3 | ${v('action3')} | ${v('action3Owner')} | ${v('action3Due')} |

**Follow-Up Check-In:** ${v('followUpDate')}

## Resources & Materials Shared

${v('resources')}
`;
  },

  // ── Managed AI Ops – Monthly ─────────────────────────────────────────────

  'review': (eng) => {
    const f = eng.forms?.review ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, `Managed AI Ops – Monthly Review: ${v('month')}`)}
## Summary of Work Completed

${v('summaryOfWork')}

## KPI / Metrics Update

${v('kpiUpdates')}

## Client Feedback

${v('clientFeedback')}

## Highlights & Wins

${v('highlights')}
`;
  },

  'issues': (eng) => {
    const f = eng.forms?.issues ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, 'Managed AI Ops – Issue Log')}
## Open Issues

| # | Issue | Status | Resolution / Next Step |
|---|---|---|---|
| 1 | ${v('issue1')} | ${v('issue1Status')} | ${v('issue1Resolution')} |
| 2 | ${v('issue2')} | ${v('issue2Status')} | ${v('issue2Resolution')} |
| 3 | ${v('issue3')} | ${v('issue3Status')} | ${v('issue3Resolution')} |
`;
  },

  'optimization': (eng) => {
    const f = eng.forms?.optimization ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, 'Managed AI Ops – Optimization Backlog')}
## Backlog Items

| # | Item | Rationale | Effort |
|---|---|---|---|
| 1 | ${v('item1')} | ${v('item1Rationale')} | ${v('item1Effort')} |
| 2 | ${v('item2')} | ${v('item2Rationale')} | ${v('item2Effort')} |
| 3 | ${v('item3')} | ${v('item3Rationale')} | ${v('item3Effort')} |
`;
  },

  'recommendations': (eng) => {
    const f = eng.forms?.recommendations ?? {};
    const v = k => f[k] || '—';
    return `${header(eng, 'Managed AI Ops – Recommendation Log')}
## Recommendations

### ${v('rec1')} — Priority: ${v('rec1Priority')}

${v('rec1Rationale')}

### ${v('rec2')} — Priority: ${v('rec2Priority')}

${v('rec2Rationale')}

### ${v('rec3')} — Priority: ${v('rec3Priority')}

${v('rec3Rationale')}
`;
  },
};

export function generateMarkdown(formKey, engagement) {
  const gen = GENERATORS[formKey];
  if (!gen) return `# Preview Unavailable\n\nNo template is defined for form key: \`${formKey}\``;
  return gen(engagement);
}
