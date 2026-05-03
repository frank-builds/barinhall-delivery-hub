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
//
// Optional facilitation metadata (all fields):
//   helpText        — brief plain-language clarification; shown inline below
//                     the input; respondent-facing
//   facilitatorNote — internal guidance on what the question is probing;
//                     shown only in Facilitator Mode; supported on section
//                     headers as well as regular fields
//   askScript       — suggested exact phrasing for live sessions;
//                     shown only in Facilitator Mode
//   probeExamples   — string[]; neutral follow-up prompts that do not lead
//                     the respondent; shown only in Facilitator Mode
//   scoringGuidance — for scored items, what observable evidence supports
//                     each score range; shown only in Facilitator Mode

// ── Shared facilitation metadata for use case evaluation criteria ─────────────
// Defined once here and spread into uc1/uc2/uc3 fields to avoid identical
// guidance content repeated three times in the form definition below.

const _ucImpact = {
  helpText: 'How significant could the business benefit be if this use case is fully implemented and working?',
  askScript: 'If this use case worked exactly as intended, what would be measurably different in the business in 12 months?',
  probeExamples: [
    'Can you put a number on the potential value — hours saved, cost reduced, or revenue enabled?',
    'Who outside this team would feel the impact if it worked well?',
  ],
  scoringGuidance: 'Score 1–2 for improvements affecting one person or a minor administrative task with no downstream effects. Score 3 for solid department-level improvements with clear but modest ROI. Score 4 for significant time savings, quality improvements, or revenue impact at team or department scale. Score 5 for transformative potential — competitive advantage, major revenue impact, or organization-wide effects. Challenge vague high-impact claims without supporting specifics.',
};

const _ucDataReady = {
  helpText: 'How close is the underlying data and process foundation to being ready for this use case today?',
  askScript: 'What data and process foundation does this use case need to work — and how much of that is already in place?',
  probeExamples: [
    "What's the biggest data gap that would need to be resolved before building this?",
    'Is the underlying process stable enough to automate, or does it change frequently?',
  ],
  scoringGuidance: 'Score 1–2 if significant data preparation — multiple months of work — is required before building can begin. Score 3 if gaps exist but are addressable with a defined 2–4 week prep effort. Score 4–5 if the data is structured, accessible, and the process is documented and stable — minimal preparation needed before build starts.',
};

const _ucTimeToValue = {
  helpText: 'How quickly after build begins could someone in the business feel the first real benefit?',
  askScript: 'If we started building this tomorrow, when would the first person in the business notice a tangible improvement?',
  probeExamples: [
    'Is there a simpler version that could deliver value faster, even if incomplete?',
    'What approvals, integrations, or dependencies would delay going live?',
  ],
  scoringGuidance: 'Score 1–2 for use cases that are 12+ months from first value due to complexity or long approval cycles. Score 3 for a 6–9 month path with a clear build sequence. Score 4 for 3–6 months with available tools and data. Score 5 for use cases deliverable under 3 months — typically automation of a well-defined, data-ready process using off-the-shelf tooling.',
};

const _ucFeasibility = {
  helpText: 'How technically straightforward is this use case to build with currently available tools and infrastructure?',
  askScript: 'Is there a proven, established technical approach to solving this, or would we be building something new?',
  probeExamples: [
    'Have you seen other organizations solve a similar problem with AI?',
    'Does this require custom AI model development, or can it be done with existing tools?',
  ],
  scoringGuidance: 'Score 1–2 if the use case requires significant custom R&D or depends on data infrastructure that does not yet exist. Score 3 for well-established approaches that need meaningful integration or customization work. Score 4 for problems with available, proven tooling and moderate integration effort. Score 5 for off-the-shelf solutions that closely match the need — the build is primarily configuration, not development.',
};

const _ucAdoptionEase = {
  helpText: 'How much organizational change, training, and change management would be needed to get the team actively using this?',
  askScript: 'If we built this and it worked perfectly, how much effort would it take to get the team to actually adopt it?',
  probeExamples: [
    'How much would this change the day-to-day workflow of the people who would use it?',
    'Is there anyone on the team who has already asked for something like this?',
  ],
  scoringGuidance: 'Score 1–2 if high resistance is likely or if adoption requires significant role changes that will be contested. Score 3 for moderate adoption effort — new workflows, some retraining, some skeptics to manage. Score 4 for changes most users would welcome with light training. Score 5 for minimal friction — the tool immediately improves someone\'s day and they have asked for it, or it operates entirely in the background with no user behavior change required.',
};

// ── Use case criteria option sets (shared across uc1/uc2/uc3) ────────────────

const _ucImpactOptions     = ['1 – Marginal', '2 – Low', '3 – Moderate', '4 – High', '5 – Transformative'];
const _ucDataReadyOptions   = ['1 – Not at all ready', '2 – Early stage; major gaps', '3 – Partially ready; gaps manageable', '4 – Mostly ready; minor preparation needed', '5 – Fully ready; data and process are in place'];
const _ucTimeToValueOptions = ['1 – 18+ months to first value', '2 – 9–18 months', '3 – 6–9 months', '4 – 3–6 months', '5 – Under 3 months'];
const _ucFeasibilityOptions = ['1 – Requires significant custom R&D', '2 – Complex; high custom effort', '3 – Moderate effort; established approaches exist', '4 – Well-understood; manageable effort', '5 – Off-the-shelf or near plug-and-play'];
const _ucAdoptionOptions    = ['1 – High resistance expected', '2 – Significant change management needed', '3 – Moderate adoption effort', '4 – Likely smooth with basic training', '5 – Minimal change required; high enthusiasm'];

export const FORM_DEFINITIONS = {
  'ai-readiness': [

    // ── A. Intake Questionnaire ─────────────────────────────────────────────
    {
      key: 'intake',
      label: 'Intake Questionnaire',
      fields: [
        // ── Company Profile ──
        { type: 'section', label: 'Company Profile', description: 'Foundational context about the client organization.' },
        { key: 'industry',      type: 'text',   label: 'Primary Industry',           placeholder: 'e.g. Healthcare, Logistics, Retail' },
        { key: 'companyStage',  type: 'select', label: 'Company Stage',              options: ['Pre-revenue / Startup', 'Growth (scaling)', 'Established (stable)', 'Enterprise (large-scale)'] },
        { key: 'employeeCount', type: 'select', label: 'Number of Employees',        options: ['1–10', '11–50', '51–200', '201–500', '500+'] },
        { key: 'annualRevenue', type: 'select', label: 'Approximate Annual Revenue', options: ['Under $1M', '$1M–$5M', '$5M–$25M', '$25M–$100M', '$100M+', 'Unknown / Not disclosed'] },

        // ── Operating Model ──
        { type: 'section', label: 'Operating Model', description: 'How the business operates and is structured.' },
        { key: 'primaryFunction', type: 'text',   label: 'Core Business Function', placeholder: 'e.g. Outbound logistics and last-mile delivery' },
        { key: 'teamStructure',   type: 'select', label: 'Team Structure',          options: ['Centralized', 'Decentralized / distributed', 'Hybrid'] },

        // ── Current Technology ──
        { type: 'section', label: 'Current Technology', description: 'The tools and infrastructure already in place.' },
        { key: 'currentTools',        type: 'textarea', label: 'Current Tools & Software in Use',    placeholder: 'List the key tools, platforms, and systems currently in use' },
        { key: 'techStack',           type: 'select',   label: 'Infrastructure Model',               options: ['On-premise only', 'Mostly on-premise, some cloud', 'Hybrid (significant cloud adoption)', 'Mostly cloud', 'Fully cloud-native'] },
        { key: 'integrationMaturity', type: 'select',   label: 'Systems Integration Maturity',       options: ['Systems are siloed, no integration', 'Manual data transfer between systems', 'Some integration via scheduled exports', 'Several API integrations in place', 'Well-integrated with a central data layer'] },

        // ── AI & Automation History ──
        { type: 'section', label: 'AI & Automation History', description: 'Prior exposure to automation and AI initiatives.' },
        { key: 'aiExperience',
          type: 'select', label: 'Current AI / Automation Experience',
          options: ['None', 'Minimal', 'Some', 'Extensive'],
          helpText: 'Include any prior use of automation tools, RPA, AI-powered software, or custom AI models — not just generative AI.',
        },
        { key: 'previousInitiatives', type: 'textarea', label: 'Previous Automation or AI Initiatives', placeholder: 'Describe past attempts, what was tried, and what the outcomes were. None if first initiative.' },

        // ── Process Under Review ──
        {
          type: 'section', label: 'Process Under Review',
          description: 'The specific workflow or process being evaluated for AI improvement.',
          facilitatorNote: 'Be specific here — "operations" or "admin work" is too broad. The scoring worksheet is calibrated to one specific process. If the client names multiple, help them identify the single highest-priority one to assess in this engagement.',
        },
        {
          key: 'primaryProcess', type: 'text',
          label: 'Primary Process or Workflow Being Evaluated',
          placeholder: 'e.g. Invoice reconciliation, customer intake, inventory replenishment',
          helpText: 'The single workflow that is the primary focus of this assessment.',
          askScript: 'If you could only fix one process or workflow in the next six months, which one would have the biggest impact?',
        },
        { key: 'processVolume',  type: 'text', label: 'Process Volume / Frequency', placeholder: 'e.g. ~200 invoices per week, 50 customer intakes per day' },
        { key: 'processOwner',   type: 'text', label: 'Process Owner',              placeholder: 'Name and role of the person responsible for this process' },

        // ── Pain Points & Bottlenecks ──
        { type: 'section', label: 'Pain Points & Bottlenecks', description: 'Where the current process breaks down and what it costs.' },
        {
          key: 'painPoints', type: 'textarea',
          label: 'Top Pain Points & Bottlenecks',
          placeholder: 'Describe the 2–3 most significant pain points. Be specific about frequency and impact.',
          helpText: 'Describe what goes wrong, how often, and what it costs in time or quality.',
          askScript: 'Walk me through what a typical bad day looks like with this process — what breaks down and how does the team deal with it?',
          probeExamples: [
            'How often does that happen?',
            'What does it cost in time when that occurs?',
            'Who ends up dealing with the fallout?',
          ],
        },
        {
          key: 'estimatedTimeImpact', type: 'text',
          label: 'Estimated Staff Time Lost Weekly',
          placeholder: 'e.g. ~8 hours per week across 3 staff',
          helpText: 'A rough estimate of staff hours consumed by the pain points described above.',
          facilitatorNote: 'This number is often guessed rather than measured. Push for specificity — an estimate grounded in "about 2 hours per invoice × 50 invoices/week" is more credible than a general impression, and more useful for building the ROI case later.',
        },

        // ── Data & Analytics ──
        {
          type: 'section', label: 'Data & Analytics',
          description: 'Where key data lives and how it is currently used.',
          facilitatorNote: 'This is often where surprises surface. Clients frequently discover mid-description that their data is more fragmented or manual than they assumed. Listen for signs of shadow data — personal spreadsheets, email chains, whiteboards — that exist alongside or instead of formal systems.',
        },
        {
          key: 'dataLandscape', type: 'textarea',
          label: 'Data Sources & Storage',
          placeholder: 'Describe where key operational data lives, how it is stored, and how it is currently accessed',
          helpText: 'Describe where the data for this process lives — the systems, files, and formats that contain the information an AI would need.',
          askScript: 'If I needed to understand everything that happened in this process last month, where would I find that information?',
          probeExamples: [
            'Is there any data that exists only in a personal spreadsheet or email thread?',
            'How do you combine data from different systems when you need a complete picture?',
          ],
        },
        { key: 'reportingCapability', type: 'select', label: 'Current Reporting & Analytics Capability', options: ['No formal reporting', 'Ad-hoc manual reports (spreadsheets)', 'Regular manual reports on a schedule', 'Automated dashboards or BI tool in use', 'Real-time analytics and alerting'] },

        // ── Stakeholders ──
        { type: 'section', label: 'Stakeholders', description: 'Who will influence and be affected by this initiative.' },
        { key: 'decisionMaker',      type: 'text', label: 'Primary Decision-Maker',         placeholder: 'Name and role' },
        { key: 'projectChampions',   type: 'text', label: 'Internal Project Champion(s)',    placeholder: 'Who will advocate for this initiative internally?' },
        { key: 'potentialResistors', type: 'text', label: 'Potential Sources of Resistance', placeholder: 'Who may push back, and why?' },

        // ── Constraints & Compliance ──
        {
          type: 'section', label: 'Constraints & Compliance',
          description: 'Known limitations and regulatory considerations.',
          facilitatorNote: 'Organizational and political constraints are often omitted because they feel awkward to name. A departing champion, a multi-month budget approval process, or a technical veto from IT leadership are all real constraints. Better to surface them here than during implementation.',
        },
        { key: 'complianceRequirements', type: 'text',     label: 'Regulatory or Compliance Requirements', placeholder: 'e.g. HIPAA, SOC 2, GDPR, PCI-DSS, or None known' },
        {
          key: 'constraints', type: 'textarea',
          label: 'Known Constraints',
          placeholder: 'Budget limits, timeline pressures, technical limitations, or political / organizational factors',
          helpText: 'Include any limits on budget, timeline, vendor selection, or organizational factors that would affect how this initiative is designed or delivered.',
          facilitatorNote: 'Push past the surface constraints. The most impactful constraints are often unspoken: a technology skeptic in IT who must approve tools, a budget cycle that resets in Q3, or a team that is already at capacity. Ask directly whether there are internal dynamics that could affect this project.',
        },

        // ── Budget & Timeline ──
        { type: 'section', label: 'Budget & Timeline', description: 'Investment parameters and target delivery window.' },
        { key: 'budget',   type: 'select', label: 'Estimated Budget Range',          options: ['Under $5K', '$5K–$15K', '$15K–$50K', '$50K–$150K', '$150K+', 'Unknown'] },
        { key: 'timeline', type: 'text',   label: 'Desired Implementation Timeline', placeholder: 'e.g. Live within 6 months' },

        // ── Desired Outcomes ──
        { type: 'section', label: 'Desired Outcomes', description: 'What success looks like and how it will be measured.' },
        {
          key: 'desiredOutcome', type: 'textarea',
          label: 'Desired Outcome',
          placeholder: 'What does success look like in plain terms, 6–12 months from now?',
          helpText: 'The specific, tangible change you want to see in the business as a result of this engagement.',
          askScript: 'Twelve months from now, if this initiative succeeded completely, what would you be able to say is different?',
          probeExamples: [
            'What would that mean for your team\'s day-to-day work?',
            'What would you stop doing that you do today?',
            'What would a customer or stakeholder outside your team notice?',
          ],
        },
        {
          key: 'successMetrics', type: 'textarea',
          label: 'Success Metrics',
          placeholder: 'How will you know it worked? What will you measure and against what baseline?',
          helpText: 'The measurable indicators that will confirm whether the desired outcome was achieved.',
          facilitatorNote: 'Many clients struggle here because they have not established baselines. Push for specific, measurable targets — "faster" is not a metric; "reduces processing time from 4 hours to 1 hour" is. If baselines do not exist, note that establishing them is a prerequisite to measuring success.',
          askScript: 'How will you know, concretely, whether this initiative worked? What number or observable change would tell you it succeeded?',
        },
      ],
    },

    // ── B. Scoring Worksheet ────────────────────────────────────────────────
    {
      key: 'scoring',
      label: 'Scoring Worksheet',
      fields: [

        // ── Data Availability ──
        {
          type: 'section', label: 'Data Availability',
          description: 'Evaluates whether the required data is captured digitally, accessible, and has sufficient history.',
          facilitatorNote: 'Data availability is frequently overestimated. Clients conflate "we have data somewhere" with "data is accessible and usable for AI." Probe for where data actually lives, who can extract it, and whether that extraction requires heroic effort. The goal is to assess the specific data this use case needs — not data availability in general.',
        },
        {
          key: 'da_capture', type: 'select', label: 'Digital Data Capture',
          options: ['1 – Mostly paper or verbal, not digitally captured', '2 – Some digital records; significant gaps remain', '3 – Mix of digital and manual; key data is captured', '4 – Mostly digital; minor gaps', '5 – Fully digital and consistently structured'],
          helpText: 'How consistently is the relevant process data captured in a structured digital system?',
          askScript: 'Walk me through how data from this process gets recorded — from the moment something happens, where does it end up?',
          probeExamples: [
            'What happens if the person who usually records this is out sick — does the data still get captured the same way?',
            'Is there any part of this process where the only record is in someone\'s head or on a whiteboard?',
          ],
          scoringGuidance: 'Score 1–2 if any significant portion of key data lives on paper, in verbal agreements, or in informal notes with no reliable digital record. Score 3 if digital capture exists but has known gaps or exceptions that the client can name. Score 4–5 only if the client names a specific system that consistently captures this data with minimal exceptions — validate by asking whether all team members use it the same way.',
        },
        {
          key: 'da_access', type: 'select', label: 'Data Accessibility',
          options: ['1 – Locked in systems; no export capability', '2 – Requires heavy IT involvement to extract', '3 – Exportable with manual effort', '4 – Accessible via standard reports or exports', '5 – Available via API, direct query, or live connection'],
          helpText: 'How easily can this data be retrieved when needed for analysis or automation?',
          askScript: 'If I asked you to pull six months of records from this process right now, what would that look like?',
          probeExamples: [
            'Who would you need to involve to get that data?',
            'Are there any systems where getting data out requires a vendor support ticket or IT escalation?',
          ],
          scoringGuidance: 'Score 1–2 if extraction requires IT tickets, vendor calls, or significant manual file assembly. Score 3 if data can be exported manually but requires multiple steps or merging. Score 4–5 if data is available via API, live query, or a standard report runnable with minimal friction. Ask about latency — a system updated "nightly" may have a 24–36 hour lag that affects real-time use cases.',
        },
        {
          key: 'da_history', type: 'select', label: 'Historical Data Volume',
          options: ['1 – Less than 3 months available', '2 – 3–12 months available', '3 – 1–2 years available', '4 – 2–5 years available', '5 – 5+ years with consistent schema'],
          helpText: 'How far back does usable historical data go in a consistent format?',
          askScript: 'If we needed historical data to calibrate or test an AI model, how far back does your reliable data go?',
          probeExamples: [
            'Has the way you capture this data changed significantly in the last 2–3 years?',
            'Were there any system migrations that may have left gaps or changed how older records are formatted?',
          ],
          scoringGuidance: 'Score 1–2 if history is under 12 months, or if older records exist in a different format or system that makes them impractical to use. Score 3–4 for 1–5 years of reasonably consistent records. Score 5 requires 5+ years with a stable schema. Consistent schema is often more valuable than raw volume — ask specifically about system migrations that might have broken data continuity.',
        },
        { type: 'derived', label: 'Data Availability Score', categoryKey: 'dataAvailability' },

        // ── Data Quality ──
        {
          type: 'section', label: 'Data Quality',
          description: 'Evaluates the reliability, completeness, and timeliness of available data.',
          facilitatorNote: 'Clients consistently overrate data quality. Push beyond "our data is pretty good" — ask for specific evidence of quality checks, known error rates, or data problems they have encountered. The gap between perceived and actual quality is the most common obstacle to AI project success. A single conversation often surfaces a "surprise" gap that changes the project plan.',
        },
        {
          key: 'dq_consistency', type: 'select', label: 'Data Consistency',
          options: ['1 – No standards; highly inconsistent across sources', '2 – Some standards; varies significantly by system', '3 – Partially standardized; known inconsistencies', '4 – Mostly standardized; minor exceptions', '5 – Fully standardized and validated across all sources'],
          helpText: 'Does data recorded by different people, at different times, or in different systems follow the same format and conventions?',
          askScript: 'If two different people recorded the same type of event in your system, would their records look the same?',
          probeExamples: [
            'Are there fields where people use different formats — like dates, status codes, or category names?',
            'If you merged records from two different teams or locations, would they combine cleanly without manual cleanup?',
          ],
          scoringGuidance: 'Score 1–2 if there are acknowledged format inconsistencies, free-text fields where structured data should be, or different conventions between teams or systems that the client can name. Score 3 if most data is consistent but the client immediately names known exceptions. Score 4–5 if validation rules or system constraints enforce consistency — ask the client to describe the enforcement mechanism rather than accept a general assurance.',
        },
        {
          key: 'dq_completeness', type: 'select', label: 'Data Completeness',
          options: ['1 – >50% of key fields missing or unreliable', '2 – 25–50% missing or unreliable', '3 – 10–25% missing or unreliable', '4 – <10% missing; mostly reliable', '5 – Near-complete and validated'],
          helpText: 'What percentage of records have all key fields populated with no significant blanks?',
          askScript: 'If you pulled a sample of recent records right now, what percentage would you expect to have all the important fields filled in?',
          probeExamples: [
            'Are there fields that people routinely skip because they are optional?',
            'Do certain types of records tend to be less complete than others?',
          ],
          scoringGuidance: 'Score 1–2 if more than 25% of records have missing key fields, or if any critical field is frequently blank. Score 3 if completeness is generally good but known gaps exist in specific fields or record types. Score 4–5 requires a completeness rate above 90% for key fields — push for evidence rather than impression. System validation that prevents saving incomplete records is a strong signal for score 4–5.',
        },
        {
          key: 'dq_freshness', type: 'select', label: 'Data Freshness',
          options: ['1 – Months or years out of date', '2 – Updated weekly or less', '3 – Updated daily', '4 – Near real-time (hours)', '5 – Real-time or continuous feed'],
          helpText: 'How current is the data relative to when it would be used to inform an AI decision?',
          askScript: 'When the AI would need to act on this data, how old would that information typically be?',
          probeExamples: [
            'Is there a delay between when something happens and when it shows up in the system?',
            'Are there any batch processes or manual steps that create a lag in the data?',
          ],
          scoringGuidance: 'Match required freshness to the specific use case before scoring. For forecasting or reporting, weekly updates may be sufficient (score 3). For real-time routing, recommendations, or exception detection, data older than a few hours is a problem (score 1–2). A system described as updated "nightly" often has a 24–36 hour pipeline lag — verify actual timing. Score 4–5 requires near-real-time or continuous pipelines.',
        },
        { type: 'derived', label: 'Data Quality Score', categoryKey: 'dataQuality' },

        // ── Technical Infrastructure ──
        {
          type: 'section', label: 'Technical Infrastructure',
          description: 'Evaluates cloud readiness, system integration capability, and internal IT capacity.',
          facilitatorNote: 'Technical readiness is often underestimated by business sponsors and overestimated by IT staff. Look for evidence of actual integration experience — not just theoretical capability. "We have an API" frequently means "we have an API but no one has called it from an external system." Ask for a concrete example of a working integration.',
        },
        {
          key: 'ti_cloud', type: 'select', label: 'Cloud Readiness',
          options: ['1 – On-premise only; no migration path', '2 – On-premise; migration being discussed', '3 – Hybrid; partial cloud adoption', '4 – Mostly cloud-based', '5 – Fully cloud-native'],
          helpText: 'What proportion of the relevant systems run in cloud environments vs. on internal servers?',
          askScript: 'Where do your key systems actually run — on your own servers, in the cloud, or a mix?',
          probeExamples: [
            'Are there any systems that require VPN or a specific internal network to access?',
            'Have there been any recent discussions about migrating systems to the cloud?',
          ],
          scoringGuidance: 'Score 1–2 if all core systems are on-premise with no cloud services and no migration plan. Score 3 for a genuine hybrid with meaningful workloads in both. Score 4–5 if primary operational systems are SaaS or hosted in cloud infrastructure. Watch for "we use Gmail" or "we use Zoom" being cited as cloud readiness — focus on systems relevant to the specific use case.',
        },
        {
          key: 'ti_api', type: 'select', label: 'API & Integration Support',
          options: ['1 – No APIs; no integration capability', '2 – Limited APIs; significant custom work required', '3 – Some systems have APIs; others require manual handling', '4 – Most key systems have usable APIs or webhooks', '5 – All key systems have modern APIs or native integrations'],
          helpText: 'Can data be moved between key systems automatically, or does it require manual export and import?',
          askScript: 'Have any of your key systems ever been connected to other tools automatically — without someone manually moving a file?',
          probeExamples: [
            'Has the team used Zapier, Make, or similar automation tools to connect systems?',
            'What was the last time two systems needed to share data — how was that handled?',
          ],
          scoringGuidance: 'Score 1–2 if data movement between systems is entirely manual — CSV exports, copy-paste, or manual re-entry. Score 3 if some integrations exist but others require workarounds. Score 4–5 if multiple systems are actively integrated and the client can describe a specific working example. Even good APIs require maintenance — ask whether existing integrations are actively maintained or were set up and forgotten.',
        },
        {
          key: 'ti_it', type: 'select', label: 'Internal IT Capacity',
          options: ['1 – No internal IT resources', '2 – External / contractor only', '3 – Part-time internal IT available', '4 – Dedicated internal IT support available', '5 – Dedicated AI / data engineering team'],
          helpText: 'Does the organization have internal technical staff available to support AI implementation and ongoing maintenance?',
          askScript: 'Who on your team would be the technical point of contact for configuring, maintaining, and troubleshooting the systems we would be building on?',
          probeExamples: [
            'How much of that person\'s time is already committed to other projects?',
            'What happens when they are unavailable — is there backup coverage?',
          ],
          scoringGuidance: 'Score 1–2 if all technical work goes through an external vendor or contractor with no internal resource. Score 3 if part-time or generalist IT coverage exists. Score 4–5 requires a dedicated resource with relevant skills and meaningful available capacity. Verify capacity, not just existence — a technically capable person who is 100% allocated elsewhere is not a score 4.',
        },
        { type: 'derived', label: 'Technical Infrastructure Score', categoryKey: 'technicalInfrastructure' },

        // ── Team Adoption Readiness ──
        {
          type: 'section', label: 'Team Adoption Readiness',
          description: 'Evaluates executive sponsorship, staff openness to change, and organizational change management capability.',
          facilitatorNote: 'Adoption readiness is the most underestimated risk factor in AI implementations. More projects stall due to human resistance than technical failure. Always probe beyond the executive sponsor\'s characterization of their team — frontline staff attitudes are frequently very different from what the sponsor reports, and those attitudes are more predictive of project outcomes.',
        },
        {
          key: 'ta_leadership', type: 'select', label: 'Executive Sponsorship',
          options: ['1 – No executive awareness or support', '2 – Passive awareness only', '3 – Stated support; not actively driving', '4 – Active support with resource commitment', '5 – Full executive sponsorship with accountability'],
          helpText: 'How actively is a senior leader personally invested in this initiative succeeding?',
          askScript: 'Who at the executive level is championing this initiative, and what have they personally committed — time, budget, or accountability?',
          probeExamples: [
            'Has the executive sponsor participated in any planning conversations about this?',
            'What would happen to this initiative if that sponsor changed roles or left?',
          ],
          scoringGuidance: 'Score 1–2 if awareness is passive — "leadership has been informed" with no active involvement. Score 3 if verbal support exists but no budget, allocated staff time, or accountability mechanism has been established. Score 4–5 requires evidence of active investment: a sponsor who joins planning discussions, an approved budget, and named accountability. Stated support without any resource commitment is a score 3 at most.',
        },
        {
          key: 'ta_staff', type: 'select', label: 'Staff Openness to Adoption',
          options: ['1 – Significant active resistance', '2 – Majority resistant or skeptical', '3 – Mixed; majority cautiously open', '4 – Generally open and willing to try', '5 – Enthusiastic advocates; have requested automation'],
          helpText: 'How do the frontline team members who will actually use this tool feel about it?',
          askScript: 'If I asked the people who would use this day-to-day, how would they describe their feelings about it?',
          probeExamples: [
            'Have any team members raised concerns about job security or role changes?',
            'Has anyone on the team explicitly asked for automation or expressed excitement about this type of tool?',
          ],
          scoringGuidance: 'Score 1–2 if there are active objections or significant anxiety, particularly around job displacement. Score 3 for a mixed team — some open, some skeptical — which is the most realistic common scenario. Score 4–5 requires genuine evidence of enthusiasm: frontline staff who have requested this, or a history of smooth technology adoption. Do not accept a manager\'s characterization without asking what they have heard directly from frontline staff.',
        },
        {
          key: 'ta_change', type: 'select', label: 'Change Management Track Record',
          options: ['1 – Failed past technology initiatives', '2 – Mixed results; change is generally difficult', '3 – Some success; adoption is slow but possible', '4 – Good track record of adopting new tools', '5 – Strong change capability with formal change management'],
          helpText: 'How effectively does this organization adopt new tools and change existing workflows when it needs to?',
          askScript: 'Think about the last significant new tool or process your team adopted — how did that rollout go?',
          probeExamples: [
            'How long did it take before everyone was actually using it consistently?',
            'Were there holdouts, and how was that handled?',
          ],
          scoringGuidance: 'Score 1–2 if the client can describe a failed or stalled technology rollout with no clear lessons extracted. Score 3 if prior changes were eventually adopted but were slow or required significant pushing. Score 4–5 requires a concrete success story with a clear process behind it — not just "we generally adapt well." An organization with no significant prior change experience is itself a risk signal worth noting separately.',
        },
        { type: 'derived', label: 'Team Adoption Readiness Score', categoryKey: 'teamAdoptionReadiness' },

        // ── Business Process Maturity ──
        {
          type: 'section', label: 'Business Process Maturity',
          description: 'Evaluates whether target processes are documented, consistently executed, and measured.',
          facilitatorNote: 'AI automates processes. If the underlying process is undocumented, inconsistent, or unmeasured, automation will either lock in the chaos or fail unpredictably. The most common mistake is starting AI before the process is ready for it. Do not allow the client to conflate "our people know how to do this" with "we have a consistent, documented process."',
        },
        {
          key: 'pm_documented', type: 'select', label: 'Process Documentation',
          options: ['1 – Processes are undocumented', '2 – Informally documented (notes, emails)', '3 – Partially documented; some SOPs exist', '4 – Mostly documented with clear SOPs', '5 – Fully documented, maintained, and version-controlled'],
          helpText: 'Is the process written down in a way that someone unfamiliar with it could follow correctly?',
          askScript: 'If a new employee joined tomorrow and needed to do this process, what would they read or follow?',
          probeExamples: [
            'Are those documents up to date, or do they reflect how the process used to work?',
            'Do different people follow the same process, or has each person developed their own version?',
          ],
          scoringGuidance: 'Score 1–2 if process knowledge lives entirely in people\'s heads or in informal notes not consistently referenced. Score 3 if SOPs exist but are incomplete, out of date, or not regularly used. Score 4–5 requires documentation that people actively reference — ask when it was last updated. Documentation written more than a year ago and never revised is a score 2–3 in practice regardless of original quality.',
        },
        {
          key: 'pm_consistent', type: 'select', label: 'Process Consistency',
          options: ['1 – Highly variable; each person executes differently', '2 – Some consistency; many exceptions', '3 – Generally consistent with regular variations', '4 – Mostly consistent with defined exceptions', '5 – Highly consistent and auditable'],
          helpText: 'Would watching multiple people execute this process on different days produce the same result?',
          askScript: 'If I observed several different people doing this process on different days, would they all look the same?',
          probeExamples: [
            'Are there unofficial shortcuts or workarounds that are not in the documented process?',
            'What causes the most variation in how the process gets done?',
          ],
          scoringGuidance: 'Score 1–2 if variation is acknowledged and common — the client can immediately name the ways it varies. Score 3 if the process is "generally followed" but exceptions are frequent enough that the client names them easily. Score 4–5 requires a process control mechanism — a system that guides users through steps or an audit mechanism that flags deviations. Verbal assurance of consistency without an enforcement mechanism is a score 2–3.',
        },
        {
          key: 'pm_measured', type: 'select', label: 'Process Measurement',
          options: ['1 – No measurement or tracking', '2 – Anecdotal or occasional spot-checks', '3 – Some metrics tracked; not comprehensive', '4 – Key metrics tracked consistently', '5 – Comprehensive metrics with regular review cadence'],
          helpText: 'Are there specific metrics that track how well this process performs, reviewed on a regular basis?',
          askScript: 'Right now, how do you know whether this process is working well or poorly?',
          probeExamples: [
            'What number would tell you the process had a bad week?',
            'How often is that reviewed, and by whom?',
            'Has the process ever changed because of what the data showed?',
          ],
          scoringGuidance: 'Score 1–2 if performance is assessed anecdotally — "we would know if something was wrong." Score 3 if metrics exist but are not regularly reviewed or have never led to process changes. Score 4–5 requires specific, tracked KPIs reviewed on a regular schedule that have demonstrably influenced process decisions — ask for a concrete example. A metric that exists but is not acted on is a score 2–3.',
        },
        { type: 'derived', label: 'Business Process Maturity Score', categoryKey: 'processMaturity' },

        // ── Business Value Potential ──
        {
          type: 'section', label: 'Business Value Potential',
          description: 'Evaluates the urgency, breadth of impact, and clarity of the ROI case.',
          facilitatorNote: 'Business value potential is often inflated in initial discovery. The goal here is to separate a real, measurable opportunity from general enthusiasm. A vague sense that "this would save time" is not a value case. Probe for specifics — if the client cannot name the baseline, the ROI case is not real yet.',
        },
        {
          key: 'bv_urgency', type: 'select', label: 'Business Urgency',
          options: ['1 – Nice-to-have; no urgency', '2 – Some urgency; addressed when convenient', '3 – Moderate urgency; causing regular friction', '4 – High urgency; impacting performance or morale', '5 – Critical; impacting revenue, compliance, or retention'],
          helpText: 'How much pain is this problem causing right now, and what is the cost of leaving it unaddressed?',
          askScript: 'If we did nothing about this problem for the next 12 months, what would happen?',
          probeExamples: [
            'Has this problem gotten worse over the last year?',
            'Is there a competitive pressure, deadline, or business event that makes timing critical?',
          ],
          scoringGuidance: 'Score 1–2 if the problem is acknowledged but not currently painful — the client would be comfortable waiting another year. Score 3 if it is a recurring source of friction but not business-critical. Score 4–5 requires evidence of real urgency: documented staff hours lost, measurable revenue impact, customer complaints, or a deadline that makes inaction costly. Urgency felt only by the sponsor but not visible in business outcomes is at most a score 3.',
        },
        {
          key: 'bv_scale', type: 'select', label: 'Breadth of Impact',
          options: ['1 – Single person or isolated task', '2 – Small team or sub-department', '3 – Full department or business unit', '4 – Cross-department or significant revenue impact', '5 – Organization-wide or competitive differentiation'],
          helpText: 'How many people, departments, or revenue streams would a successful outcome meaningfully affect?',
          askScript: 'If this worked perfectly, who and what in the business would actually be different?',
          probeExamples: [
            'How many people touch this process today?',
            'If you improved this process, would it unlock any other processes that are currently bottlenecked by it?',
          ],
          scoringGuidance: 'Score 1–2 if impact is limited to a single person or an isolated administrative task with no downstream effects. Score 3 if a full team or department benefits but the improvement does not extend further. Score 4–5 if the impact has cross-departmental reach, customer-visible effects, or significant revenue implications. Challenge scope inflation — cascading downstream benefits should be treated as speculative until evidence supports them.',
        },
        {
          key: 'bv_roi', type: 'select', label: 'ROI Clarity',
          options: ['1 – No ROI case identified', '2 – Vague or intuitive ROI estimate', '3 – Rough ROI estimate with some data', '4 – Clear ROI estimate with measurable baseline', '5 – Documented ROI with quantified baseline and target'],
          helpText: 'How clearly has the financial return been estimated, and is it grounded in measured data rather than intuition?',
          askScript: 'Has anyone estimated what solving this problem is actually worth — in dollars saved, revenue generated, or staff hours recovered?',
          probeExamples: [
            'Do you have a baseline — do you know what this costs today in time or money?',
            'What is the most conservative version of the ROI case?',
          ],
          scoringGuidance: 'Score 1–2 if ROI is purely intuitive with no numbers attached. Score 3 if a rough estimate exists but is based on a single person\'s guess rather than measured data. Score 4–5 requires a documented, measurable baseline and a specific savings calculation — for example, "12 hours/week × $35/hr × 50 weeks = $21,000/year." If the client cannot state the current baseline cost, the ROI case is not yet real.',
        },
        { type: 'derived', label: 'Business Value Potential Score', categoryKey: 'businessValuePotential' },

        // ── Risk & Governance Readiness ──
        {
          type: 'section', label: 'Risk & Governance Readiness',
          description: 'Evaluates compliance barriers, data governance posture, and AI oversight capability.',
          facilitatorNote: 'The goal here is to identify whether compliance or governance gaps would create blockers or significant delays for this specific use case — not to assess overall organizational maturity. Focus on the data and decisions this AI would actually touch. Avoid over-engineering compliance concerns that simply do not apply to this use case.',
        },
        {
          key: 'rg_compliance', type: 'select', label: 'Compliance & Regulatory Posture',
          options: ['1 – Major barriers with no current plan', '2 – Significant barriers being investigated', '3 – Some requirements; largely manageable', '4 – Minor compliance considerations already addressed', '5 – No material compliance barriers'],
          helpText: 'Are there legal, regulatory, or contractual requirements that would govern how AI handles this data or decision?',
          askScript: 'For the data this AI would work with — is there any regulation, compliance requirement, or contractual obligation we would need to navigate?',
          probeExamples: [
            'Does this data include anything that could be considered personal, health, or financial information?',
            'Has your legal or compliance team ever flagged concerns about automating this type of process?',
          ],
          scoringGuidance: 'Score 1–2 if known regulatory barriers exist — such as HIPAA with no AI governance plan, or GDPR with unclear data flows — and no current mitigation plan is in place. Score 3 if requirements exist but are understood and manageable with standard diligence. Score 4–5 if there are no material compliance implications for this specific use case. This assessment is use-case-specific — not about the organization\'s overall compliance posture.',
        },
        {
          key: 'rg_privacy', type: 'select', label: 'Data Privacy & Security Posture',
          options: ['1 – No data privacy policies in place', '2 – Ad-hoc practices; no formal policy', '3 – Basic privacy policy exists but inconsistently applied', '4 – Formal data governance with documented policies', '5 – Mature data governance with AI-specific policies'],
          helpText: 'Does the organization have documented, enforced policies around who can access this data and how it is protected?',
          askScript: 'How does your organization currently control who can access this data, and is that documented anywhere?',
          probeExamples: [
            'Has the organization gone through a data security audit or certification in the last two years?',
            'Are there any policies about which data can be shared with or processed by external AI tools?',
          ],
          scoringGuidance: 'Score 1–2 if data access is informal and undocumented — anyone can access it, or access is controlled by verbal agreement only. Score 3 if a basic policy exists but is not consistently enforced or has not been updated to address AI use cases. Score 4–5 requires documented governance with active enforcement — ask when the policy was last reviewed. For AI specifically, ask whether there are rules about which data can be passed to external AI services.',
        },
        {
          key: 'rg_oversight', type: 'select', label: 'AI Output Oversight Process',
          options: ['1 – No oversight process', '2 – Ad-hoc review by individuals', '3 – Informal team-level review process', '4 – Formal review process with defined criteria', '5 – Governance committee or equivalent with escalation paths'],
          helpText: 'When the AI makes a recommendation or takes an action, is there a defined process for a human to review, validate, and correct it?',
          askScript: 'If this AI made an incorrect decision or recommendation, how would someone catch it, and what would happen next?',
          probeExamples: [
            'Who would be responsible for reviewing AI outputs before they affect real decisions?',
            'Is there a plan for what happens when the AI is wrong?',
          ],
          scoringGuidance: 'Score 1–2 if there is no oversight plan — the expectation is that AI outputs will be trusted automatically. Score 3 if there is an informal expectation that someone will "check the results" with no defined process, frequency, or owner. Score 4–5 requires a named reviewer, a defined review cadence, and a documented escalation path. For regulated or high-stakes use cases, human-in-the-loop review is not optional — raise this explicitly if compliance requires it.',
        },
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
        { key: 'uc1_name',    type: 'text',     label: 'Use Case Name',                         placeholder: 'Brief name or description' },
        { key: 'uc1_problem', type: 'textarea', label: 'Problem / Opportunity Being Addressed', placeholder: 'What specific pain point or opportunity does this use case address? Be concrete.' },
        { key: 'uc1_impact',       type: 'select', label: 'Business Impact Potential', options: _ucImpactOptions,     ..._ucImpact },
        { key: 'uc1_dataReady',    type: 'select', label: 'Data & Process Readiness',  options: _ucDataReadyOptions,  ..._ucDataReady },
        { key: 'uc1_timeToValue',  type: 'select', label: 'Time to Value',             options: _ucTimeToValueOptions,..._ucTimeToValue },
        { key: 'uc1_feasibility',  type: 'select', label: 'Technical Feasibility',     options: _ucFeasibilityOptions,..._ucFeasibility },
        { key: 'uc1_adoptionEase', type: 'select', label: 'Adoption Ease',             options: _ucAdoptionOptions,   ..._ucAdoptionEase },
        { type: 'derived', label: 'Use Case #1 Prioritization Score', ucIndex: 1 },
        { key: 'uc1_notes', type: 'textarea', label: 'Key Considerations & Notes', placeholder: 'Prerequisites, risks, dependencies, or context that affects prioritization' },

        // ── Use Case #2 ──
        { type: 'section', label: 'Use Case #2', description: 'Identify and systematically evaluate the second AI use case candidate.' },
        { key: 'uc2_name',    type: 'text',     label: 'Use Case Name',                         placeholder: '' },
        { key: 'uc2_problem', type: 'textarea', label: 'Problem / Opportunity Being Addressed', placeholder: '' },
        { key: 'uc2_impact',       type: 'select', label: 'Business Impact Potential', options: _ucImpactOptions,     ..._ucImpact },
        { key: 'uc2_dataReady',    type: 'select', label: 'Data & Process Readiness',  options: _ucDataReadyOptions,  ..._ucDataReady },
        { key: 'uc2_timeToValue',  type: 'select', label: 'Time to Value',             options: _ucTimeToValueOptions,..._ucTimeToValue },
        { key: 'uc2_feasibility',  type: 'select', label: 'Technical Feasibility',     options: _ucFeasibilityOptions,..._ucFeasibility },
        { key: 'uc2_adoptionEase', type: 'select', label: 'Adoption Ease',             options: _ucAdoptionOptions,   ..._ucAdoptionEase },
        { type: 'derived', label: 'Use Case #2 Prioritization Score', ucIndex: 2 },
        { key: 'uc2_notes', type: 'textarea', label: 'Key Considerations & Notes', placeholder: '' },

        // ── Use Case #3 ──
        { type: 'section', label: 'Use Case #3', description: 'Identify and systematically evaluate the third AI use case candidate.' },
        { key: 'uc3_name',    type: 'text',     label: 'Use Case Name',                         placeholder: '' },
        { key: 'uc3_problem', type: 'textarea', label: 'Problem / Opportunity Being Addressed', placeholder: '' },
        { key: 'uc3_impact',       type: 'select', label: 'Business Impact Potential', options: _ucImpactOptions,     ..._ucImpact },
        { key: 'uc3_dataReady',    type: 'select', label: 'Data & Process Readiness',  options: _ucDataReadyOptions,  ..._ucDataReady },
        { key: 'uc3_timeToValue',  type: 'select', label: 'Time to Value',             options: _ucTimeToValueOptions,..._ucTimeToValue },
        { key: 'uc3_feasibility',  type: 'select', label: 'Technical Feasibility',     options: _ucFeasibilityOptions,..._ucFeasibility },
        { key: 'uc3_adoptionEase', type: 'select', label: 'Adoption Ease',             options: _ucAdoptionOptions,   ..._ucAdoptionEase },
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
        { key: 'audienceRole',       label: 'Target Audience Role(s)',           type: 'text',     placeholder: 'e.g. Operations managers, front-line staff' },
        { key: 'audienceSize',       label: 'Number of Participants',            type: 'text',     placeholder: 'e.g. 12' },
        { key: 'currentSkillLevel',  label: 'Current AI Skill Level',            type: 'select',   options: ['Beginner', 'Intermediate', 'Advanced', 'Mixed'] },
        { key: 'deliveryFormat',     label: 'Delivery Format',                   type: 'select',   options: ['In-person', 'Virtual', 'Hybrid'] },
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
        { key: 'followUpDate',  label: 'Follow-Up Check-In Date',     type: 'text',     placeholder: '' },
        { key: 'resources',     label: 'Resources & Materials Shared',type: 'textarea', placeholder: 'Links, docs, tools shared with participants' },
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
