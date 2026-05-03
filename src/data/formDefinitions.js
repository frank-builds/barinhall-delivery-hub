// Structured form definitions for all 6 service types.
// Each service maps to an ordered array of form groups.
// Each form group has a key, label, and array of field definitions.
//
// Field types:
//   'text'     — single-line text input
//   'textarea' — multi-line text input
//   'select'   — dropdown; options: string[]
//   'section'  — visual section header (no input, no key)
//   'derived'  — computed read-only display (no input)
//               requires either categoryKey (scoring categories)
//               or ucIndex (use case prioritization scores)

export const FORM_DEFINITIONS = {
  'ai-readiness': [

    // ── A. Intake Questionnaire ─────────────────────────────────────────────
    {
      key: 'intake',
      label: 'Intake Questionnaire',
      fields: [
        // ── Company Profile ──
        { type: 'section', label: 'Company Profile', description: 'Foundational context about the client organization.' },
        { key: 'industry',      type: 'text',   label: 'Primary Industry',          placeholder: 'e.g. Healthcare, Logistics, Retail' },
        { key: 'companyStage',  type: 'select', label: 'Company Stage',             options: ['Pre-revenue / Startup', 'Growth (scaling)', 'Established (stable)', 'Enterprise (large-scale)'] },
        { key: 'employeeCount', type: 'select', label: 'Number of Employees',       options: ['1–10', '11–50', '51–200', '201–500', '500+'] },
        { key: 'annualRevenue', type: 'select', label: 'Approximate Annual Revenue',options: ['Under $1M', '$1M–$5M', '$5M–$25M', '$25M–$100M', '$100M+', 'Unknown / Not disclosed'] },

        // ── Operating Model ──
        { type: 'section', label: 'Operating Model', description: 'How the business operates and is structured.' },
        { key: 'primaryFunction', type: 'text',   label: 'Core Business Function',  placeholder: 'e.g. Outbound logistics and last-mile delivery' },
        { key: 'teamStructure',   type: 'select', label: 'Team Structure',          options: ['Centralized', 'Decentralized / distributed', 'Hybrid'] },

        // ── Current Technology ──
        { type: 'section', label: 'Current Technology', description: 'The tools and infrastructure already in place.' },
        { key: 'currentTools',        type: 'textarea', label: 'Current Tools & Software in Use',     placeholder: 'List the key tools, platforms, and systems currently in use' },
        { key: 'techStack',           type: 'select',   label: 'Infrastructure Model',                options: ['On-premise only', 'Mostly on-premise, some cloud', 'Hybrid (significant cloud adoption)', 'Mostly cloud', 'Fully cloud-native'] },
        { key: 'integrationMaturity', type: 'select',   label: 'Systems Integration Maturity',        options: ['Systems are siloed, no integration', 'Manual data transfer between systems', 'Some integration via scheduled exports', 'Several API integrations in place', 'Well-integrated with a central data layer'] },

        // ── AI & Automation History ──
        { type: 'section', label: 'AI & Automation History', description: 'Prior exposure to automation and AI initiatives.' },
        { key: 'aiExperience',      type: 'select',   label: 'Current AI / Automation Experience',     options: ['None', 'Minimal', 'Some', 'Extensive'] },
        { key: 'previousInitiatives', type: 'textarea', label: 'Previous Automation or AI Initiatives', placeholder: 'Describe past attempts, what was tried, and what the outcomes were. None if first initiative.' },

        // ── Process Under Review ──
        { type: 'section', label: 'Process Under Review', description: 'The specific workflow or process being evaluated for AI improvement.' },
        { key: 'primaryProcess', type: 'text', label: 'Primary Process or Workflow Being Evaluated', placeholder: 'e.g. Invoice reconciliation, customer intake, inventory replenishment' },
        { key: 'processVolume',  type: 'text', label: 'Process Volume / Frequency',                  placeholder: 'e.g. ~200 invoices per week, 50 customer intakes per day' },
        { key: 'processOwner',   type: 'text', label: 'Process Owner',                               placeholder: 'Name and role of the person responsible for this process' },

        // ── Pain Points & Bottlenecks ──
        { type: 'section', label: 'Pain Points & Bottlenecks', description: 'Where the current process breaks down and what it costs.' },
        { key: 'painPoints',         type: 'textarea', label: 'Top Pain Points & Bottlenecks',      placeholder: 'Describe the 2–3 most significant pain points. Be specific about frequency and impact.' },
        { key: 'estimatedTimeImpact',type: 'text',     label: 'Estimated Staff Time Lost Weekly',   placeholder: 'e.g. ~8 hours per week across 3 staff' },

        // ── Data & Analytics ──
        { type: 'section', label: 'Data & Analytics', description: 'Where key data lives and how it is currently used.' },
        { key: 'dataLandscape',       type: 'textarea', label: 'Data Sources & Storage',                   placeholder: 'Describe where key operational data lives, how it is stored, and how it is currently accessed' },
        { key: 'reportingCapability', type: 'select',   label: 'Current Reporting & Analytics Capability', options: ['No formal reporting', 'Ad-hoc manual reports (spreadsheets)', 'Regular manual reports on a schedule', 'Automated dashboards or BI tool in use', 'Real-time analytics and alerting'] },

        // ── Stakeholders ──
        { type: 'section', label: 'Stakeholders', description: 'Who will influence and be affected by this initiative.' },
        { key: 'decisionMaker',     type: 'text', label: 'Primary Decision-Maker',          placeholder: 'Name and role' },
        { key: 'projectChampions',  type: 'text', label: 'Internal Project Champion(s)',     placeholder: 'Who will advocate for this initiative internally?' },
        { key: 'potentialResistors',type: 'text', label: 'Potential Sources of Resistance',  placeholder: 'Who may push back, and why?' },

        // ── Constraints & Compliance ──
        { type: 'section', label: 'Constraints & Compliance', description: 'Known limitations and regulatory considerations.' },
        { key: 'complianceRequirements', type: 'text',     label: 'Regulatory or Compliance Requirements', placeholder: 'e.g. HIPAA, SOC 2, GDPR, PCI-DSS, or None known' },
        { key: 'constraints',            type: 'textarea', label: 'Known Constraints',                     placeholder: 'Budget limits, timeline pressures, technical limitations, or political / organizational factors' },

        // ── Budget & Timeline ──
        { type: 'section', label: 'Budget & Timeline', description: 'Investment parameters and target delivery window.' },
        { key: 'budget',   type: 'select', label: 'Estimated Budget Range',           options: ['Under $5K', '$5K–$15K', '$15K–$50K', '$50K–$150K', '$150K+', 'Unknown'] },
        { key: 'timeline', type: 'text',   label: 'Desired Implementation Timeline',  placeholder: 'e.g. Live within 6 months' },

        // ── Desired Outcomes ──
        { type: 'section', label: 'Desired Outcomes', description: 'What success looks like and how it will be measured.' },
        { key: 'desiredOutcome', type: 'textarea', label: 'Desired Outcome',  placeholder: 'What does success look like in plain terms, 6–12 months from now?' },
        { key: 'successMetrics', type: 'textarea', label: 'Success Metrics',  placeholder: 'How will you know it worked? What will you measure and against what baseline?' },
      ],
    },

    // ── B. Scoring Worksheet ────────────────────────────────────────────────
    {
      key: 'scoring',
      label: 'Scoring Worksheet',
      fields: [

        // ── Data Availability ──
        { type: 'section', label: 'Data Availability', description: 'Evaluates whether the required data is captured digitally, accessible, and has sufficient history.' },
        { key: 'da_capture', type: 'select', label: 'Digital Data Capture',    options: ['1 – Mostly paper or verbal, not digitally captured', '2 – Some digital records; significant gaps remain', '3 – Mix of digital and manual; key data is captured', '4 – Mostly digital; minor gaps', '5 – Fully digital and consistently structured'] },
        { key: 'da_access',  type: 'select', label: 'Data Accessibility',      options: ['1 – Locked in systems; no export capability', '2 – Requires heavy IT involvement to extract', '3 – Exportable with manual effort', '4 – Accessible via standard reports or exports', '5 – Available via API, direct query, or live connection'] },
        { key: 'da_history', type: 'select', label: 'Historical Data Volume',  options: ['1 – Less than 3 months available', '2 – 3–12 months available', '3 – 1–2 years available', '4 – 2–5 years available', '5 – 5+ years with consistent schema'] },
        { type: 'derived', label: 'Data Availability Score', categoryKey: 'dataAvailability' },

        // ── Data Quality ──
        { type: 'section', label: 'Data Quality', description: 'Evaluates the reliability, completeness, and timeliness of available data.' },
        { key: 'dq_consistency',  type: 'select', label: 'Data Consistency',       options: ['1 – No standards; highly inconsistent across sources', '2 – Some standards; varies significantly by system', '3 – Partially standardized; known inconsistencies', '4 – Mostly standardized; minor exceptions', '5 – Fully standardized and validated across all sources'] },
        { key: 'dq_completeness', type: 'select', label: 'Data Completeness',      options: ['1 – >50% of key fields missing or unreliable', '2 – 25–50% missing or unreliable', '3 – 10–25% missing or unreliable', '4 – <10% missing; mostly reliable', '5 – Near-complete and validated'] },
        { key: 'dq_freshness',    type: 'select', label: 'Data Freshness',         options: ['1 – Months or years out of date', '2 – Updated weekly or less', '3 – Updated daily', '4 – Near real-time (hours)', '5 – Real-time or continuous feed'] },
        { type: 'derived', label: 'Data Quality Score', categoryKey: 'dataQuality' },

        // ── Technical Infrastructure ──
        { type: 'section', label: 'Technical Infrastructure', description: 'Evaluates cloud readiness, system integration capability, and internal IT capacity.' },
        { key: 'ti_cloud', type: 'select', label: 'Cloud Readiness',          options: ['1 – On-premise only; no migration path', '2 – On-premise; migration being discussed', '3 – Hybrid; partial cloud adoption', '4 – Mostly cloud-based', '5 – Fully cloud-native'] },
        { key: 'ti_api',   type: 'select', label: 'API & Integration Support',options: ['1 – No APIs; no integration capability', '2 – Limited APIs; significant custom work required', '3 – Some systems have APIs; others require manual handling', '4 – Most key systems have usable APIs or webhooks', '5 – All key systems have modern APIs or native integrations'] },
        { key: 'ti_it',    type: 'select', label: 'Internal IT Capacity',     options: ['1 – No internal IT resources', '2 – External / contractor only', '3 – Part-time internal IT available', '4 – Dedicated internal IT support available', '5 – Dedicated AI / data engineering team'] },
        { type: 'derived', label: 'Technical Infrastructure Score', categoryKey: 'technicalInfrastructure' },

        // ── Team Adoption Readiness ──
        { type: 'section', label: 'Team Adoption Readiness', description: 'Evaluates executive sponsorship, staff openness to change, and organizational change management capability.' },
        { key: 'ta_leadership', type: 'select', label: 'Executive Sponsorship',       options: ['1 – No executive awareness or support', '2 – Passive awareness only', '3 – Stated support; not actively driving', '4 – Active support with resource commitment', '5 – Full executive sponsorship with accountability'] },
        { key: 'ta_staff',      type: 'select', label: 'Staff Openness to Adoption',  options: ['1 – Significant active resistance', '2 – Majority resistant or skeptical', '3 – Mixed; majority cautiously open', '4 – Generally open and willing to try', '5 – Enthusiastic advocates; have requested automation'] },
        { key: 'ta_change',     type: 'select', label: 'Change Management Track Record', options: ['1 – Failed past technology initiatives', '2 – Mixed results; change is generally difficult', '3 – Some success; adoption is slow but possible', '4 – Good track record of adopting new tools', '5 – Strong change capability with formal change management'] },
        { type: 'derived', label: 'Team Adoption Readiness Score', categoryKey: 'teamAdoptionReadiness' },

        // ── Business Process Maturity ──
        { type: 'section', label: 'Business Process Maturity', description: 'Evaluates whether target processes are documented, consistently executed, and measured.' },
        { key: 'pm_documented', type: 'select', label: 'Process Documentation',  options: ['1 – Processes are undocumented', '2 – Informally documented (notes, emails)', '3 – Partially documented; some SOPs exist', '4 – Mostly documented with clear SOPs', '5 – Fully documented, maintained, and version-controlled'] },
        { key: 'pm_consistent', type: 'select', label: 'Process Consistency',    options: ['1 – Highly variable; each person executes differently', '2 – Some consistency; many exceptions', '3 – Generally consistent with regular variations', '4 – Mostly consistent with defined exceptions', '5 – Highly consistent and auditable'] },
        { key: 'pm_measured',   type: 'select', label: 'Process Measurement',    options: ['1 – No measurement or tracking', '2 – Anecdotal or occasional spot-checks', '3 – Some metrics tracked; not comprehensive', '4 – Key metrics tracked consistently', '5 – Comprehensive metrics with regular review cadence'] },
        { type: 'derived', label: 'Business Process Maturity Score', categoryKey: 'processMaturity' },

        // ── Business Value Potential ──
        { type: 'section', label: 'Business Value Potential', description: 'Evaluates the urgency, breadth of impact, and clarity of the ROI case.' },
        { key: 'bv_urgency', type: 'select', label: 'Business Urgency',       options: ['1 – Nice-to-have; no urgency', '2 – Some urgency; addressed when convenient', '3 – Moderate urgency; causing regular friction', '4 – High urgency; impacting performance or morale', '5 – Critical; impacting revenue, compliance, or retention'] },
        { key: 'bv_scale',   type: 'select', label: 'Breadth of Impact',      options: ['1 – Single person or isolated task', '2 – Small team or sub-department', '3 – Full department or business unit', '4 – Cross-department or significant revenue impact', '5 – Organization-wide or competitive differentiation'] },
        { key: 'bv_roi',     type: 'select', label: 'ROI Clarity',            options: ['1 – No ROI case identified', '2 – Vague or intuitive ROI estimate', '3 – Rough ROI estimate with some data', '4 – Clear ROI estimate with measurable baseline', '5 – Documented ROI with quantified baseline and target'] },
        { type: 'derived', label: 'Business Value Potential Score', categoryKey: 'businessValuePotential' },

        // ── Risk & Governance Readiness ──
        { type: 'section', label: 'Risk & Governance Readiness', description: 'Evaluates compliance barriers, data governance posture, and AI oversight capability.' },
        { key: 'rg_compliance', type: 'select', label: 'Compliance & Regulatory Posture', options: ['1 – Major barriers with no current plan', '2 – Significant barriers being investigated', '3 – Some requirements; largely manageable', '4 – Minor compliance considerations already addressed', '5 – No material compliance barriers'] },
        { key: 'rg_privacy',    type: 'select', label: 'Data Privacy & Security Posture', options: ['1 – No data privacy policies in place', '2 – Ad-hoc practices; no formal policy', '3 – Basic privacy policy exists but inconsistently applied', '4 – Formal data governance with documented policies', '5 – Mature data governance with AI-specific policies'] },
        { key: 'rg_oversight',  type: 'select', label: 'AI Output Oversight Process',     options: ['1 – No oversight process', '2 – Ad-hoc review by individuals', '3 – Informal team-level review process', '4 – Formal review process with defined criteria', '5 – Governance committee or equivalent with escalation paths'] },
        { type: 'derived', label: 'Risk & Governance Readiness Score', categoryKey: 'riskGovernance' },

        // ── Analyst Notes ──
        { type: 'section', label: 'Analyst Notes' },
        { key: 'scoringNotes', type: 'textarea', label: 'Scoring Rationale & Key Observations', placeholder: 'Summarize the key findings across categories. Note any critical gaps, surprises, or context that the sub-question scores do not fully capture.' },
      ],
    },

    // ── C. Use Case Prioritization ──────────────────────────────────────────
    {
      key: 'use-cases',
      label: 'Use Case Prioritization',
      fields: [

        // ── Use Case #1 ──
        { type: 'section', label: 'Use Case #1', description: 'Identify and systematically evaluate the first AI use case candidate.' },
        { key: 'uc1_name',    type: 'text',     label: 'Use Case Name',                           placeholder: 'Brief name or description' },
        { key: 'uc1_problem', type: 'textarea', label: 'Problem / Opportunity Being Addressed',   placeholder: 'What specific pain point or opportunity does this use case address? Be concrete.' },
        { key: 'uc1_impact',      type: 'select', label: 'Business Impact Potential',  options: ['1 – Marginal', '2 – Low', '3 – Moderate', '4 – High', '5 – Transformative'] },
        { key: 'uc1_dataReady',   type: 'select', label: 'Data & Process Readiness',   options: ['1 – Not at all ready', '2 – Early stage; major gaps', '3 – Partially ready; gaps manageable', '4 – Mostly ready; minor preparation needed', '5 – Fully ready; data and process are in place'] },
        { key: 'uc1_timeToValue', type: 'select', label: 'Time to Value',              options: ['1 – 18+ months to first value', '2 – 9–18 months', '3 – 6–9 months', '4 – 3–6 months', '5 – Under 3 months'] },
        { key: 'uc1_feasibility', type: 'select', label: 'Technical Feasibility',      options: ['1 – Requires significant custom R&D', '2 – Complex; high custom effort', '3 – Moderate effort; established approaches exist', '4 – Well-understood; manageable effort', '5 – Off-the-shelf or near plug-and-play'] },
        { key: 'uc1_adoptionEase',type: 'select', label: 'Adoption Ease',              options: ['1 – High resistance expected', '2 – Significant change management needed', '3 – Moderate adoption effort', '4 – Likely smooth with basic training', '5 – Minimal change required; high enthusiasm'] },
        { type: 'derived', label: 'Use Case #1 Prioritization Score', ucIndex: 1 },
        { key: 'uc1_notes', type: 'textarea', label: 'Key Considerations & Notes', placeholder: 'Prerequisites, risks, dependencies, or context that affects prioritization' },

        // ── Use Case #2 ──
        { type: 'section', label: 'Use Case #2', description: 'Identify and systematically evaluate the second AI use case candidate.' },
        { key: 'uc2_name',    type: 'text',     label: 'Use Case Name',                           placeholder: '' },
        { key: 'uc2_problem', type: 'textarea', label: 'Problem / Opportunity Being Addressed',   placeholder: '' },
        { key: 'uc2_impact',      type: 'select', label: 'Business Impact Potential',  options: ['1 – Marginal', '2 – Low', '3 – Moderate', '4 – High', '5 – Transformative'] },
        { key: 'uc2_dataReady',   type: 'select', label: 'Data & Process Readiness',   options: ['1 – Not at all ready', '2 – Early stage; major gaps', '3 – Partially ready; gaps manageable', '4 – Mostly ready; minor preparation needed', '5 – Fully ready; data and process are in place'] },
        { key: 'uc2_timeToValue', type: 'select', label: 'Time to Value',              options: ['1 – 18+ months to first value', '2 – 9–18 months', '3 – 6–9 months', '4 – 3–6 months', '5 – Under 3 months'] },
        { key: 'uc2_feasibility', type: 'select', label: 'Technical Feasibility',      options: ['1 – Requires significant custom R&D', '2 – Complex; high custom effort', '3 – Moderate effort; established approaches exist', '4 – Well-understood; manageable effort', '5 – Off-the-shelf or near plug-and-play'] },
        { key: 'uc2_adoptionEase',type: 'select', label: 'Adoption Ease',              options: ['1 – High resistance expected', '2 – Significant change management needed', '3 – Moderate adoption effort', '4 – Likely smooth with basic training', '5 – Minimal change required; high enthusiasm'] },
        { type: 'derived', label: 'Use Case #2 Prioritization Score', ucIndex: 2 },
        { key: 'uc2_notes', type: 'textarea', label: 'Key Considerations & Notes', placeholder: '' },

        // ── Use Case #3 ──
        { type: 'section', label: 'Use Case #3', description: 'Identify and systematically evaluate the third AI use case candidate.' },
        { key: 'uc3_name',    type: 'text',     label: 'Use Case Name',                           placeholder: '' },
        { key: 'uc3_problem', type: 'textarea', label: 'Problem / Opportunity Being Addressed',   placeholder: '' },
        { key: 'uc3_impact',      type: 'select', label: 'Business Impact Potential',  options: ['1 – Marginal', '2 – Low', '3 – Moderate', '4 – High', '5 – Transformative'] },
        { key: 'uc3_dataReady',   type: 'select', label: 'Data & Process Readiness',   options: ['1 – Not at all ready', '2 – Early stage; major gaps', '3 – Partially ready; gaps manageable', '4 – Mostly ready; minor preparation needed', '5 – Fully ready; data and process are in place'] },
        { key: 'uc3_timeToValue', type: 'select', label: 'Time to Value',              options: ['1 – 18+ months to first value', '2 – 9–18 months', '3 – 6–9 months', '4 – 3–6 months', '5 – Under 3 months'] },
        { key: 'uc3_feasibility', type: 'select', label: 'Technical Feasibility',      options: ['1 – Requires significant custom R&D', '2 – Complex; high custom effort', '3 – Moderate effort; established approaches exist', '4 – Well-understood; manageable effort', '5 – Off-the-shelf or near plug-and-play'] },
        { key: 'uc3_adoptionEase',type: 'select', label: 'Adoption Ease',              options: ['1 – High resistance expected', '2 – Significant change management needed', '3 – Moderate adoption effort', '4 – Likely smooth with basic training', '5 – Minimal change required; high enthusiasm'] },
        { type: 'derived', label: 'Use Case #3 Prioritization Score', ucIndex: 3 },
        { key: 'uc3_notes', type: 'textarea', label: 'Key Considerations & Notes', placeholder: '' },

        // ── Overall Recommendation ──
        { type: 'section', label: 'Overall Recommendation', description: 'Synthesize the use case scores and context into a top recommendation.' },
        { key: 'topRecommendation', type: 'textarea', label: 'Top Recommendation & Rationale', placeholder: 'Which use case to pursue first and why. Reference the scores and key considerations above.' },
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
