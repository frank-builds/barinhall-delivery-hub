// ── Barinhall Use Case Library ────────────────────────────────────────────────
//
// Static seed data for the Solutions Use Case Library.
// Each entry follows the USE_CASE schema defined below.
//
// Usage:
//   import { USE_CASES, USE_CASE_CATEGORIES, COMPLEXITY_LEVELS,
//            TIME_TO_VALUE_OPTIONS, MATURITY_LEVELS } from '../data/useCaseLibrary.js';
//
// Schema fields:
//   id                   — unique string key, never changes
//   title                — use case name
//   category             — one of USE_CASE_CATEGORIES
//   industryTags         — 2–4 industry strings
//   summary              — 2–3 sentence overview (consultant-facing)
//   painPoint            — client problem this use case solves
//   workflowImproved     — the specific process being automated / improved
//   expectedOutcomes     — array of 3–5 outcome bullet strings
//   dataSourcesRequired  — array of data source names
//   dataReadiness        — plain-text note on data requirements and readiness bar
//   complexity           — 'Low' | 'Medium' | 'High'
//   timeToValue          — one of TIME_TO_VALUE_OPTIONS
//   riskConsiderations   — key risks, governance concerns, or dependencies
//   maturityLevel        — 'Exploring' | 'Developing' | 'Advanced'
//   recommendedServices  — array of service keys (from services.js)
//   suggestedNextStep    — action text shown in the detail panel
//   notes                — reusable consultant guidance for delivery/scoping
// ─────────────────────────────────────────────────────────────────────────────

export const USE_CASE_CATEGORIES = [
  'Sales & Marketing',
  'Customer Service',
  'Operations',
  'Finance & Back Office',
  'HR & People Ops',
  'Knowledge Management',
  'Compliance & Governance',
  'Field Service & Logistics',
];

export const COMPLEXITY_LEVELS = ['Low', 'Medium', 'High'];

export const TIME_TO_VALUE_OPTIONS = [
  '2–4 weeks',
  '6–8 weeks',
  '2–3 months',
  '3–5 months',
  '5–8 months',
];

export const MATURITY_LEVELS = ['Exploring', 'Developing', 'Advanced'];

// ── Badge colour helpers ───────────────────────────────────────────────────────
// Returns Tailwind classes for bh-badge + category/complexity colouring.

export const CATEGORY_BADGE_CLASSES = {
  'Sales & Marketing':        'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Customer Service':         'bg-sky-50 text-sky-700 border-sky-200',
  'Operations':               'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Finance & Back Office':    'bg-violet-50 text-violet-700 border-violet-200',
  'HR & People Ops':          'bg-rose-50 text-rose-700 border-rose-200',
  'Knowledge Management':     'bg-amber-50 text-amber-700 border-amber-200',
  'Compliance & Governance':  'bg-slate-100 text-slate-600 border-slate-300',
  'Field Service & Logistics':'bg-orange-50 text-orange-700 border-orange-200',
};

export const COMPLEXITY_BADGE_CLASSES = {
  Low:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High:   'bg-red-50 text-red-700 border-red-200',
};

// ── Seed use cases ────────────────────────────────────────────────────────────

export const USE_CASES = [

  // ── Sales & Marketing ─────────────────────────────────────────────────────

  {
    id: 'uc-sm-001',
    title: 'AI-Assisted Lead Scoring & Prioritisation',
    category: 'Sales & Marketing',
    industryTags: ['SaaS', 'Professional Services', 'Financial Services'],
    summary:
      'Use machine learning to score and rank inbound leads based on CRM activity, firmographics, and behavioural signals so reps focus on the highest-conversion opportunities rather than working the queue in order of arrival.',
    painPoint:
      'Sales reps waste time on low-probability leads while hot prospects wait. Manual pipeline reviews are inconsistent across the team and rely on individual intuition rather than pattern recognition.',
    workflowImproved: 'CRM lead management and BDR outreach sequencing',
    expectedOutcomes: [
      '20–35 % improvement in qualified-to-close rate on prioritised leads',
      'Reduced time-to-first-contact for high-score opportunities',
      'Objective, data-driven prioritisation criteria replacing gut-feel sorting',
      'Better coaching insights — managers can see scoring factors per rep',
    ],
    dataSourcesRequired: [
      'CRM (Salesforce / HubSpot)',
      'Marketing automation platform',
      'Email engagement logs',
      'Firmographic enrichment data',
    ],
    dataReadiness:
      'Medium — requires 12+ months of historical CRM data with won/lost outcome labels. Incomplete deal closure data is the most common gap.',
    complexity: 'Medium',
    timeToValue: '2–3 months',
    riskConsiderations:
      'Model bias toward historical win patterns may exclude new market segments. Requires scheduled retraining as ICP evolves. Reps may resist or game scoring if adoption isn\'t managed carefully.',
    maturityLevel: 'Developing',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'AI Readiness Assessment — audit CRM data quality, field completeness, and outcome labelling before model design.',
    notes:
      'Start with a simple scoring model (logistic regression or gradient boosting) before moving to deep learning. Delivering a "top 10 leads" weekly nudge to reps is often higher ROI than a full CRM integration in phase 1.',
  },

  {
    id: 'uc-sm-002',
    title: 'Automated Proposal & Quote Drafting',
    category: 'Sales & Marketing',
    industryTags: ['Professional Services', 'Construction', 'Managed IT Services'],
    summary:
      'Generate first-draft proposals and quotes automatically from discovery notes, CRM opportunity data, and a library of reusable content blocks, then route to reps for customisation and approval before sending.',
    painPoint:
      'Sales teams spend 3–5 hours per proposal on copy-paste and formatting, leading to slow response times and inconsistent messaging. Proposal quality varies significantly by rep experience.',
    workflowImproved: 'Sales proposal creation and commercial document delivery',
    expectedOutcomes: [
      '70–80 % reduction in initial proposal drafting time',
      'Consistent brand voice and approved messaging across all proposals',
      'Faster time-to-proposal, reducing deal velocity drag',
      'Improved version control and proposal analytics',
    ],
    dataSourcesRequired: [
      'CRM opportunity and contact data',
      'Historical proposal and SOW library',
      'Product / service catalogue and pricing data',
      'Win/loss data for content effectiveness analysis',
    ],
    dataReadiness:
      'Medium — requires a structured library of reusable content blocks. Most firms have proposals scattered as Word docs; consolidation into a tagged content library is the key pre-work.',
    complexity: 'Medium',
    timeToValue: '6–8 weeks',
    riskConsiderations:
      'Over-reliance on automation produces generic proposals. A mandatory human customisation and review step is non-negotiable. Content blocks must be kept current — stale library content is a reputational risk.',
    maturityLevel: 'Developing',
    recommendedServices: ['ai-strategy', 'ai-pilot'],
    suggestedNextStep:
      'AI Strategy session — map the proposal workflow, identify highest-value template types, and agree on the content block taxonomy.',
    notes:
      'The highest-effort work is usually content library development, not the AI generation itself. Prioritise the top 3 proposal types by volume rather than building a universal generator from the start.',
  },

  {
    id: 'uc-sm-003',
    title: 'Customer Churn Prediction & Retention Targeting',
    category: 'Sales & Marketing',
    industryTags: ['SaaS', 'Telecommunications', 'Subscription Services'],
    summary:
      'Build a churn propensity model on customer usage patterns, billing events, and engagement signals to flag at-risk accounts 60+ days before renewal, enabling proactive outreach and targeted retention offers.',
    painPoint:
      'Customer success teams discover churn after it happens. There is no systematic early warning, and retention actions are reactive, expensive, and applied too late to change the outcome.',
    workflowImproved: 'Customer success management and renewal forecasting',
    expectedOutcomes: [
      'Identify 60–70 % of churners at least 60 days before renewal date',
      'Enable segmented, cost-efficient retention campaigns based on churn risk tier',
      'Improve net revenue retention (NRR) by 5–15 percentage points',
      'Better renewal forecast accuracy for CFO and board reporting',
    ],
    dataSourcesRequired: [
      'Product usage / event logs',
      'Subscription and billing system',
      'Support ticket history',
      'NPS / CSAT survey scores',
      'Customer success touchpoint data',
    ],
    dataReadiness:
      'High — requires consistent event logging and subscription data spanning at least 2 full renewal cycles. Gaps in usage logging or billing history significantly degrade model accuracy.',
    complexity: 'High',
    timeToValue: '3–5 months',
    riskConsiderations:
      'Model accuracy is only as good as the event logging completeness. False positives trigger costly retention offers unnecessarily. Model must be retrained at each renewal season as cohort behaviour shifts.',
    maturityLevel: 'Advanced',
    recommendedServices: ['ai-readiness', 'ai-strategy', 'ai-pilot'],
    suggestedNextStep:
      'AI Readiness Assessment focusing on product event logging maturity and subscription data completeness before modelling work begins.',
    notes:
      'Segment the churn model by cohort (tenure, plan tier, acquisition channel) rather than training a single global model — behaviour patterns differ significantly. Usage drop in the last 30 days before renewal is typically the strongest single signal.',
  },

  // ── Customer Service ──────────────────────────────────────────────────────

  {
    id: 'uc-cs-001',
    title: 'Support Ticket Triage & Intelligent Auto-Routing',
    category: 'Customer Service',
    industryTags: ['SaaS', 'E-Commerce', 'Managed IT Services', 'Financial Services'],
    summary:
      'Classify incoming support tickets by type, urgency, and required skill category, then route them automatically to the right queue or agent with a suggested resolution path — without requiring a dispatcher in the loop.',
    painPoint:
      'Support managers spend significant time manually triaging and reassigning misrouted tickets. Incorrect first routing leads to SLA breaches, customer frustration, and agent context-switching costs.',
    workflowImproved: 'Tier-1 helpdesk triage and ticket assignment',
    expectedOutcomes: [
      '50–65 % reduction in manual triage time for the support manager',
      'Improved first-assignment accuracy, reducing ticket bounces',
      'Faster SLA compliance on critical and high-priority issues',
      'Routing consistency regardless of queue volume or shift coverage',
    ],
    dataSourcesRequired: [
      'Helpdesk system (Zendesk / Freshdesk / ServiceNow)',
      'Historical ticket data with resolution type and outcome labels',
      'Agent skill and queue mapping matrix',
    ],
    dataReadiness:
      'Medium — requires 6+ months of labelled ticket history with issue type and resolution categories. Missing or inconsistent labelling is the most common readiness gap.',
    complexity: 'Low',
    timeToValue: '6–8 weeks',
    riskConsiderations:
      'Misclassification of genuinely urgent issues is a safety and SLA risk. A confidence threshold with human fallback queue is mandatory. Must not route safeguarding, legal, or escalated issues automatically.',
    maturityLevel: 'Developing',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'AI Readiness Assessment — review ticket volume, labelling consistency, and helpdesk API availability before pilot scoping.',
    notes:
      'Start with classification and routing suggestions (not hard routing) to build agent trust in the model. Hard routing can be phased in once accuracy exceeds 90 % on a holdout test set.',
  },

  {
    id: 'uc-cs-002',
    title: 'Intelligent FAQ & Self-Service Knowledge Bot',
    category: 'Customer Service',
    industryTags: ['SaaS', 'E-Commerce', 'Professional Services', 'Healthcare Adjacent'],
    summary:
      'Deploy a retrieval-augmented generation assistant trained on the company\'s knowledge base, help articles, and product documentation to answer common customer questions conversationally and deflect tier-1 support volume.',
    painPoint:
      'First-line support is overwhelmed with repetitive, answerable questions. Existing FAQ pages are poorly discoverable, and customers escalate to live agents for questions the knowledge base already covers.',
    workflowImproved: 'Customer self-service and live chat deflection',
    expectedOutcomes: [
      '30–45 % deflection of repetitive tier-1 support queries',
      'Consistent, accurate answers available 24/7 without staffing cost',
      'Improved customer satisfaction (CSAT) on routine queries',
      'Reduced cost-per-contact on FAQ-type tickets',
    ],
    dataSourcesRequired: [
      'Existing knowledge base or help centre articles',
      'Product documentation',
      'FAQ content',
      'Historically resolved tickets (for intent training)',
    ],
    dataReadiness:
      'Low-Medium — content volume is rarely the problem. Content freshness and accuracy are critical; outdated or contradictory KB articles will produce wrong bot answers. A content audit is usually required pre-launch.',
    complexity: 'Medium',
    timeToValue: '6–8 weeks',
    riskConsiderations:
      'Bot confidence scoring must be tuned carefully to avoid wrong answers appearing confident. Outdated KB content is the primary quality risk. Escalation path to a human must always be available and easy to trigger.',
    maturityLevel: 'Exploring',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'Content audit to assess KB completeness, accuracy, and coverage gaps before system architecture is designed.',
    notes:
      'Scope the v1 bot to a narrow, high-volume intent category (e.g. account/billing questions) rather than all topics. Narrow scope → higher accuracy → faster trust-building with support team and customers.',
  },

  {
    id: 'uc-cs-003',
    title: 'Customer Feedback Sentiment & Theme Analysis',
    category: 'Customer Service',
    industryTags: ['Retail', 'Hospitality', 'SaaS', 'Professional Services'],
    summary:
      'Apply NLP to survey responses, product reviews, and support chat transcripts to surface sentiment trends, recurring complaint themes, and early warning signals automatically — replacing manual sampling.',
    painPoint:
      'CX and product teams are drowning in unstructured feedback data and can only read a small fraction manually. Insights are delayed, anecdotal, and often influenced by recent memorable events rather than systemic patterns.',
    workflowImproved: 'Voice-of-customer programmes, CSAT/NPS analysis, product feedback loops',
    expectedOutcomes: [
      'Near-real-time visibility into customer sentiment across all feedback channels',
      'Automated theme tagging replacing manual analysis cycles',
      'Early detection of emerging issues before they hit support volumes',
      'Richer, data-backed product and CX improvement prioritisation',
    ],
    dataSourcesRequired: [
      'NPS / CSAT survey free-text (Qualtrics / Typeform / SurveyMonkey)',
      'App store or review platform data (G2, Capterra, Google Reviews)',
      'Support chat transcripts',
    ],
    dataReadiness:
      'Low — unstructured feedback is typically abundant. The main requirements are export access from survey and review tools, and enough volume per analysis period (minimum ~100 responses/month for meaningful trends).',
    complexity: 'Low',
    timeToValue: '2–4 weeks',
    riskConsiderations:
      'Off-the-shelf sentiment models may miss industry-specific language or brand tone nuances. Custom fine-tuning or structured prompt engineering is often needed for accuracy above 80 %. Results are statistical, not deterministic.',
    maturityLevel: 'Exploring',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'AI Pilot scoping — define output format, stakeholder dashboard design, feedback channel inventory, and review tool API/export availability.',
    notes:
      'This is often the fastest win in a customer service AI programme. Low data readiness bar, quick to deploy, and highly visible output for CX leadership. Build it as a push digest (weekly email/Slack summary) rather than a dashboard that people have to pull.',
  },

  // ── Operations ────────────────────────────────────────────────────────────

  {
    id: 'uc-ops-001',
    title: 'Automated Invoice Processing & 3-Way Match',
    category: 'Operations',
    industryTags: ['Manufacturing', 'Construction', 'Wholesale Distribution', 'Professional Services'],
    summary:
      'Use OCR and AI to extract line-item data from supplier invoices in any format, match against purchase orders and goods receipt records, and route exceptions automatically for human review — replacing manual AP data entry.',
    painPoint:
      'AP teams process hundreds of invoices monthly with manual data entry. Matching errors, missed discounts, and late payments cause supplier relationship issues and create audit exposure.',
    workflowImproved: 'Accounts payable, supplier payment cycle, and financial close',
    expectedOutcomes: [
      '75–90 % of invoices processed straight-through without human touch',
      '40–60 % reduction in cost-per-invoice processed',
      'Elimination of early-payment discount misses due to processing delays',
      'Cleaner audit trail with automated exception logging',
    ],
    dataSourcesRequired: [
      'Scanned or emailed supplier invoices (PDF / image)',
      'ERP purchase order data',
      'Goods receipt / delivery confirmation records',
      'Vendor master data',
    ],
    dataReadiness:
      'Medium — ERP PO and receipt data must be consistently structured. Invoice format diversity across suppliers increases OCR training overhead. Multi-currency invoices add complexity.',
    complexity: 'Medium',
    timeToValue: '2–3 months',
    riskConsiderations:
      'High-value invoices require robust exception handling and human approval gates. Supplier format diversity (especially handwritten or non-standard layouts) can limit straight-through rate. Change management with AP staff is important.',
    maturityLevel: 'Developing',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'AP process audit — map current workflow, inventory invoice format types, and assess ERP API or export capabilities.',
    notes:
      'Pilot with the highest-volume, most consistent invoice format first to maximise early straight-through rate and build confidence with the AP team. Add format complexity progressively.',
  },

  {
    id: 'uc-ops-002',
    title: 'Inventory Demand Forecasting & Reorder Optimisation',
    category: 'Operations',
    industryTags: ['Retail', 'Wholesale Distribution', 'E-Commerce', 'Manufacturing'],
    summary:
      'Build ML-based demand forecasting on historical sales data, seasonality patterns, and external signals (promotions, weather, events) to optimise reorder points and quantities by SKU, replacing gut-feel purchasing.',
    painPoint:
      'Manual ordering based on experience and spreadsheets leads to overstocking slow movers and stockouts on fast movers — tying up working capital and losing sales simultaneously.',
    workflowImproved: 'Purchasing, warehouse management, and replenishment cycle planning',
    expectedOutcomes: [
      '15–25 % reduction in inventory carrying costs through better ordering',
      'Stockout rate reduction and improved product availability / fill rate',
      'Faster stock turn and improved cash conversion cycle',
      'Reduced emergency procurement and expedited shipping costs',
    ],
    dataSourcesRequired: [
      'POS or ERP sales history (2+ years, SKU-level)',
      'Current inventory levels and location data',
      'Supplier lead times and MOQ constraints',
      'Promotional and seasonal calendar',
    ],
    dataReadiness:
      'Medium-High — requires clean, consistent SKU-level sales history with minimal data gaps. Businesses with recent system migrations or inconsistent SKU codes often need a data cleansing phase first.',
    complexity: 'Medium',
    timeToValue: '3–5 months',
    riskConsiderations:
      'Demand shocks (supply disruptions, unplanned promotions) are difficult to model. Forecast must be paired with human override capability and safety stock floors. Model drift during peak seasons is common without retraining.',
    maturityLevel: 'Developing',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'Data quality audit on sales history completeness and SKU master data consistency before forecasting model design.',
    notes:
      'Start with the top 20 % of SKUs by revenue volume — they typically drive 80 % of the financial impact and have the most reliable data. Expand to long-tail SKUs once the core model is validated.',
  },

  {
    id: 'uc-ops-003',
    title: 'Predictive Maintenance Scheduling',
    category: 'Operations',
    industryTags: ['Manufacturing', 'Facilities Management', 'Field Service', 'Utilities'],
    summary:
      'Analyse equipment sensor telemetry, maintenance logs, and historical failure events to predict when assets are likely to fail and schedule preventive interventions before unplanned breakdowns occur.',
    painPoint:
      'Reactive maintenance causes unplanned downtime, rushed parts procurement, and higher repair costs. Scheduled maintenance windows may be too frequent (waste) or too infrequent (failure risk).',
    workflowImproved: 'Maintenance planning, asset lifecycle management, and work order scheduling',
    expectedOutcomes: [
      '20–35 % reduction in unplanned downtime incidents',
      'Maintenance scheduling aligned to actual asset condition rather than calendar',
      'Extended asset service life through earlier intervention',
      'Parts procurement lead time improvement via predicted failure windows',
    ],
    dataSourcesRequired: [
      'IoT / sensor telemetry from equipment',
      'CMMS work order history with failure type labels',
      'Equipment maintenance logs',
      'Parts inventory and procurement data',
    ],
    dataReadiness:
      'High — requires consistent sensor coverage across target equipment and labelled failure history spanning multiple years. This is the highest readiness bar of any standard AI use case.',
    complexity: 'High',
    timeToValue: '5–8 months',
    riskConsiderations:
      'Sensor infrastructure is often incomplete or inconsistent in older facilities. Historical failure events may be poorly labelled in CMMS logs. Safety-critical equipment requires human confirmation of any AI-driven maintenance decision.',
    maturityLevel: 'Advanced',
    recommendedServices: ['ai-readiness', 'ai-strategy'],
    suggestedNextStep:
      'AI Readiness Assessment focused on IoT infrastructure coverage, CMMS data quality, and failure event labelling completeness.',
    notes:
      'This is a multi-year programme for most SMBs, not a quick win. If sensor infrastructure is immature, recommend starting with a connected assets pilot on 2–3 critical machines before committing to fleet-wide deployment.',
  },

  // ── Finance & Back Office ─────────────────────────────────────────────────

  {
    id: 'uc-fin-001',
    title: 'ML-Driven Rolling Cash Flow Forecasting',
    category: 'Finance & Back Office',
    industryTags: ['Professional Services', 'Manufacturing', 'Retail', 'Construction'],
    summary:
      'Combine AR aging, AP payment schedules, payroll commitments, and historical cash flow patterns to produce an automated 13-week rolling cash forecast — replacing the manually built Excel model that is stale before it circulates.',
    painPoint:
      'Finance teams build cash flow forecasts manually that are already out of date by the time they reach the CFO. Cash surprises — both shortfalls and surpluses — are common and avoidable.',
    workflowImproved: 'Financial planning & analysis, treasury management, and board reporting',
    expectedOutcomes: [
      'Automated weekly forecast refresh without FP&A manual effort',
      'Visibility into expected cash shortfalls 4–8 weeks ahead',
      'Reduced time on manual forecast assembly during busy close periods',
      'Improved confidence in board and bank reporting through data-backed projections',
    ],
    dataSourcesRequired: [
      'ERP or accounting system (AR aging, AP payment schedule)',
      'Bank transaction feeds',
      'Payroll system run dates and amounts',
      'Sales pipeline data for future AR expectations',
    ],
    dataReadiness:
      'Medium — accounting data must be current and accurately maintained. The most common gap is bank feed integration. Businesses with variable receivables (e.g. project-based billing) see wider forecast intervals.',
    complexity: 'Medium',
    timeToValue: '2–3 months',
    riskConsiderations:
      'Forecast accuracy is tied directly to AR collection pattern consistency. Businesses with highly irregular payment timing get wide confidence intervals, reducing actionability. Model must flag its own uncertainty clearly.',
    maturityLevel: 'Developing',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'Finance data audit and FP&A workflow mapping — assess ERP data quality, bank feed availability, and current forecast process.',
    notes:
      'Position the output as "forecast + confidence band" not a single number. Finance teams trust probabilistic outputs more than point estimates. The weekly digest format (pushed to CFO email) typically outperforms a dashboard in adoption.',
  },

  {
    id: 'uc-fin-002',
    title: 'Expense Anomaly Detection & Policy Compliance',
    category: 'Finance & Back Office',
    industryTags: ['Professional Services', 'Financial Services', 'Technology', 'Healthcare'],
    summary:
      'Apply ML and rule-based detection to expense submissions to automatically flag out-of-policy claims, duplicate submissions, unusual amounts or vendors, and policy violations before approval and reimbursement.',
    painPoint:
      'Manual expense review misses policy violations at volume; audits surface issues only after payment has been made. Non-compliant claims are a real cost and an audit liability.',
    workflowImproved: 'Expense management, AP approval workflow, and audit preparation',
    expectedOutcomes: [
      '80–90 % of policy violations surfaced before payment',
      'Faster approval cycle for fully compliant submissions',
      'Reduced audit risk and out-of-policy reimbursements',
      'Data-driven insights into expense trends and category spend patterns',
    ],
    dataSourcesRequired: [
      'Expense management system (Concur / Expensify / Spendesk)',
      'Company expense policy (digitised and structured)',
      'GL chart of accounts',
      'Vendor master data',
    ],
    dataReadiness:
      'Low — expense data is typically well-structured. The main pre-work is digitising and structuring the expense policy into machine-readable rules and category limits.',
    complexity: 'Low',
    timeToValue: '6–8 weeks',
    riskConsiderations:
      'False positives create employee friction and erode trust in the system. Tuning the detection threshold in the first 60 days is critical to reduce noise without missing genuine violations.',
    maturityLevel: 'Exploring',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'Expense policy review and anomaly labelling session with the finance team — classify which violation types to detect first.',
    notes:
      'Start with the highest-confidence detection rules (duplicate submissions, per diem over-claims, missing receipts above threshold) before adding ML-based anomaly detection. Simple rules deliver 70 % of the value with 20 % of the complexity.',
  },

  {
    id: 'uc-fin-003',
    title: 'GL Transaction Auto-Classification',
    category: 'Finance & Back Office',
    industryTags: ['Professional Services', 'Non-Profit', 'Real Estate', 'Construction'],
    summary:
      'Learn from historical GL coding patterns to automatically classify incoming bank transactions and invoices to the correct account, reducing manual bookkeeping effort and month-end reclassification work.',
    painPoint:
      'Finance staff spend hours each month reclassifying transactions and correcting GL coding errors. Month-end close is delayed by the volume of manual journal entries and corrections.',
    workflowImproved: 'General ledger management, month-end close, and bookkeeping',
    expectedOutcomes: [
      '60–80 % of routine transactions auto-coded correctly without human review',
      'Faster month-end close through reduced reclassification volume',
      'Fewer bookkeeper hours consumed by routine data entry',
      'Cleaner GL data for financial reporting and budgeting',
    ],
    dataSourcesRequired: [
      'Accounting system transaction data (QuickBooks / Xero / NetSuite)',
      'Bank feed transaction descriptions',
      'Vendor master data and payee history',
      'Historical GL coding patterns (12+ months)',
    ],
    dataReadiness:
      'Medium — requires 12+ months of consistently coded transactions for model training. Businesses with high GL recoding rates signal underlying coding inconsistency that must be resolved before training.',
    complexity: 'Low',
    timeToValue: '6–8 weeks',
    riskConsiderations:
      'Ambiguous transactions must be handled by a human review queue — automated coding of unclear items creates compounding errors in financial reports. Low-confidence predictions must always escalate.',
    maturityLevel: 'Exploring',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'Bookkeeping workflow audit and transaction volume/pattern analysis to identify highest-frequency auto-codeable transaction types.',
    notes:
      'The fastest deployment path is using vendor/payee-based rules for the top 50 recurring vendors (who typically account for 60–70 % of transaction volume) before adding ML for novel payees.',
  },

  // ── HR & People Ops ────────────────────────────────────────────────────────

  {
    id: 'uc-hr-001',
    title: 'AI-Assisted Resume Screening & Shortlisting',
    category: 'HR & People Ops',
    industryTags: ['Professional Services', 'Retail', 'Technology', 'Healthcare'],
    summary:
      'Use NLP to score and rank applicant CVs against structured job requirements, surface the top candidates matching key criteria, and flag skill gaps — dramatically reducing recruiter time on first-pass screening.',
    painPoint:
      'High-volume roles attract 200–500 applications. Recruiters spend most of their time on initial CV reviews rather than meaningful candidate conversations, and the process is inconsistent across reviewers.',
    workflowImproved: 'Talent acquisition, candidate review, and recruiter scheduling',
    expectedOutcomes: [
      '60–75 % reduction in time-to-shortlist on high-volume roles',
      'More consistent candidate evaluation criteria across the hiring team',
      'Increased recruiter capacity for strategic talent advisory work',
      'Improved diversity of applicants surfaced to interview stage',
    ],
    dataSourcesRequired: [
      'ATS resume database (Greenhouse / Lever / Workable)',
      'Structured job description library',
      'Historical hiring outcome data (hired / not hired) where available',
    ],
    dataReadiness:
      'Medium — ATS data is typically accessible. Historical hire outcome labels are valuable for model accuracy but often not consistently recorded. Job descriptions must be structured with clear requirements.',
    complexity: 'Medium',
    timeToValue: '2–3 months',
    riskConsiderations:
      'Algorithmic bias risk is significant if the model trains on historical hiring patterns that reflect past demographic skew. Fairness auditing and bias testing is mandatory before deployment in any hiring workflow.',
    maturityLevel: 'Developing',
    recommendedServices: ['ai-readiness', 'ai-governance', 'ai-pilot'],
    suggestedNextStep:
      'AI Governance assessment on fairness, compliance, and equal opportunity requirements before pilot design — this is non-negotiable.',
    notes:
      'Frame this to clients as "screening consistency support," not "AI hiring." Legal counsel should review the deployment approach. Pair with blind screening options for sensitive fields to reduce bias exposure.',
  },

  {
    id: 'uc-hr-002',
    title: 'Employee Sentiment & Engagement Pulse Analysis',
    category: 'HR & People Ops',
    industryTags: ['Professional Services', 'Technology', 'Healthcare', 'Retail'],
    summary:
      'Apply NLP to pulse survey free-text, open-ended feedback, and exit interview transcripts to identify engagement themes, team-level signals, and manager effectiveness patterns at a scale manual reading cannot reach.',
    painPoint:
      'HR leadership sees aggregate Likert scores but loses the nuance buried in thousands of free-text responses. Themes emerge slowly, response bias shapes manual sampling, and trends are hard to track over time.',
    workflowImproved: 'Employee engagement programmes, people analytics, and HRBP reporting',
    expectedOutcomes: [
      'Automated theme extraction from all survey free-text, not just sampled responses',
      'Early warning signals on team-level disengagement before it shows in turnover',
      'Richer, evidence-backed HRBP insights for manager coaching conversations',
      'Faster identification of systemic HR policy or process pain points',
    ],
    dataSourcesRequired: [
      'Pulse survey platform free-text (Culture Amp / Lattice / Glint / Leapsome)',
      'Annual engagement survey open responses',
      'Exit interview transcripts',
      'eNPS free-text commentary',
    ],
    dataReadiness:
      'Low — free-text data typically exists in survey tools. Main constraints are platform export access and volume (minimum ~50 responses per analysis cycle for meaningful theme detection).',
    complexity: 'Low',
    timeToValue: '2–4 weeks',
    riskConsiderations:
      'Individual-level analysis must be strictly prohibited — aggregated team/theme view only. Employee privacy governance must be established upfront. Results should be presented as signals, not diagnoses.',
    maturityLevel: 'Exploring',
    recommendedServices: ['ai-readiness', 'ai-governance', 'ai-pilot'],
    suggestedNextStep:
      'Privacy and data governance review before scoping the pilot — agree on minimum group sizes, anonymisation rules, and data retention policy.',
    notes:
      'This is an early-stage win that builds AI literacy in the HR team and delivers visible value to HRBPs quickly. Deliver findings as a structured narrative brief (not a raw theme cloud) — story-telling matters as much as the analysis.',
  },

  {
    id: 'uc-hr-003',
    title: 'Intelligent Onboarding Workflow Orchestration',
    category: 'HR & People Ops',
    industryTags: ['Technology', 'Financial Services', 'Professional Services', 'Healthcare'],
    summary:
      'Automate the orchestration of role-specific onboarding tasks across IT, HR, facilities, and the hiring manager\'s team, triggered by confirmed start date and role/location — eliminating manual checklist management and email chains.',
    painPoint:
      'New hire onboarding relies on manual checklists and email chains across multiple departments. IT access, equipment, and HR paperwork are routinely delayed, creating a poor first-day experience and productivity loss.',
    workflowImproved: 'New hire onboarding, IT provisioning, and cross-functional task orchestration',
    expectedOutcomes: [
      'Zero-day readiness for 90 %+ of new hires on systems and access',
      'Measurable reduction in IT and HR tickets raised by new starters in week 1',
      'Consistent onboarding experience across roles, teams, and locations',
      'Faster time-to-productivity through proactive knowledge and tool provisioning',
    ],
    dataSourcesRequired: [
      'HRIS with confirmed start date trigger (Workday / BambooHR / HiBob)',
      'Role and department structure matrix',
      'IT asset management and provisioning system',
      'Onboarding task templates by role type',
    ],
    dataReadiness:
      'Low-Medium — requires HRIS API access and a structured role-to-task mapping matrix. Cross-system integration (HRIS ↔ IT ↔ Facilities) is often the technical bottleneck, not the data.',
    complexity: 'Medium',
    timeToValue: '2–3 months',
    riskConsiderations:
      'Legacy system APIs — especially older ITSM and facilities tools — may limit automation scope. Integration complexity varies widely by tech stack. Start with highest-frequency task types only.',
    maturityLevel: 'Developing',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'Systems integration audit and onboarding task matrix workshop — map current state and identify the 5 highest-volume tasks to automate first.',
    notes:
      'The role-to-task matrix is the most valuable pre-work asset. Build it collaboratively with IT, HR, and a few hiring managers before any system integration work begins. It will surface inconsistencies that are costing time already.',
  },

  // ── Knowledge Management ──────────────────────────────────────────────────

  {
    id: 'uc-km-001',
    title: 'Internal Document Search & Conversational Q&A (RAG)',
    category: 'Knowledge Management',
    industryTags: ['Professional Services', 'Legal', 'Financial Services', 'Technology'],
    summary:
      'Build a retrieval-augmented generation system over internal documents, policies, SOPs, and knowledge bases so employees can ask questions in natural language and get sourced, accurate answers — without hunting through SharePoint.',
    painPoint:
      'Institutional knowledge is trapped in unstructured SharePoint folders, outdated wikis, and email threads. Employees waste time searching, re-asking colleagues, and escalating questions that are already documented somewhere.',
    workflowImproved: 'Internal knowledge retrieval, policy Q&A, and onboarding support',
    expectedOutcomes: [
      '40–60 % reduction in internal knowledge-seeking time',
      'Consistent, cited answers across the team regardless of individual tenure',
      'Reduced volume of repetitive internal questions to HR, legal, and ops',
      'Improved onboarding — new hires can self-serve answers in week 1',
    ],
    dataSourcesRequired: [
      'SharePoint or Confluence document libraries',
      'Internal policy and SOP documents',
      'Knowledge base or wiki content',
      'Historical internal Q&A pairs (if available)',
    ],
    dataReadiness:
      'Medium — content volume is rarely the problem. Content freshness and accuracy are critical; contradictory or outdated documents will produce misleading answers. A targeted content audit is usually required before launch.',
    complexity: 'Medium',
    timeToValue: '2–3 months',
    riskConsiderations:
      'Hallucination risk increases when source documents contain conflicting or outdated information. Citation/source display is essential for user trust. Document access controls must be replicated in the retrieval layer.',
    maturityLevel: 'Developing',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'Content audit and document taxonomy workshop before system design — identify the 3–5 highest-traffic question categories to target in v1.',
    notes:
      'Deploy to a single team (e.g. HR policies, sales playbook, or technical SOPs) before going company-wide. Narrow scope allows rapid accuracy measurement and builds confidence before broader rollout.',
  },

  {
    id: 'uc-km-002',
    title: 'Meeting Intelligence & Action Item Capture',
    category: 'Knowledge Management',
    industryTags: ['Professional Services', 'Technology', 'Financial Services', 'SaaS'],
    summary:
      'Transcribe meetings automatically and extract key decisions, action items, owners, and deadlines — delivering structured summaries to participants and optionally syncing tasks to the project management tool.',
    painPoint:
      'Meeting notes are inconsistent or missing entirely. Action items live in someone\'s notebook or inbox. Teams waste time on "what did we agree?" follow-up threads and miss commitments made in calls.',
    workflowImproved: 'Project management, client delivery calls, and internal team meetings',
    expectedOutcomes: [
      'Structured meeting summaries delivered within minutes of call end',
      'Action item capture rate improves from ~40 % to ~85 %+',
      'Fewer follow-up threads re-litigating decisions already made',
      'Searchable meeting record improves institutional memory and handover quality',
    ],
    dataSourcesRequired: [
      'Video conferencing platform (Teams / Zoom / Google Meet) for recording',
      'Calendar integration for auto-join trigger',
      'Project management tool (optional, for action item sync)',
    ],
    dataReadiness:
      'Low — minimal setup required. Works on live recorded calls. Calendar integration is needed for auto-join; otherwise a manual join or upload workflow is a viable v1.',
    complexity: 'Low',
    timeToValue: '2–4 weeks',
    riskConsiderations:
      'Recording consent requirements vary by jurisdiction and meeting type. A participant notification and consent workflow must be established before deployment. Client-facing calls need explicit consent disclosure.',
    maturityLevel: 'Exploring',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'Compliance check on recording consent obligations followed by a pilot scope definition with one willing team.',
    notes:
      'This is typically the fastest win in a knowledge management AI programme. Many clients are already using Otter, Granola, or Fireflies informally — the Barinhall value-add is in structuring the output and connecting it to delivery workflows.',
  },

  {
    id: 'uc-km-003',
    title: 'Competitive Intelligence Monitoring & Weekly Digest',
    category: 'Knowledge Management',
    industryTags: ['SaaS', 'Professional Services', 'Financial Services', 'Retail'],
    summary:
      'Automate collection, classification, and summarisation of competitor signals from public sources — pricing pages, product launches, press releases, job postings, and review sites — delivered as a structured weekly digest.',
    painPoint:
      'Competitive monitoring is ad hoc and dependent on whoever has bandwidth. The team lacks a consistent view of the landscape and often learns about competitor moves from customers or prospects first.',
    workflowImproved: 'Competitive intelligence, product strategy, and sales enablement',
    expectedOutcomes: [
      'Weekly competitive digest delivered to sales, product, and leadership teams',
      'Consistent signal coverage across 5–15 competitors regardless of analyst bandwidth',
      'Faster response to pricing changes, feature launches, or competitor vulnerability signals',
      'Sales team better prepared for competitive objections',
    ],
    dataSourcesRequired: [
      'Competitor public websites and pricing pages',
      'Press release and news feeds',
      'Job boards (LinkedIn, Indeed) for hiring signal intelligence',
      'Review platforms (G2, Capterra, Trustpilot)',
    ],
    dataReadiness:
      'Low — all data is publicly available. Main requirement is defining the competitor list, relevant signal categories, and recipient distribution before system setup.',
    complexity: 'Low',
    timeToValue: '2–4 weeks',
    riskConsiderations:
      'Web scraping reliability varies by site; rate limiting and structure changes require maintenance. Model must be tuned to distinguish meaningful signal from noise in high-volume sources.',
    maturityLevel: 'Exploring',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'Competitor scoping session and signal taxonomy definition workshop with product and sales leadership.',
    notes:
      'Deliver v1 as a simple push email digest rather than a portal. Curated, summarised content in an email outperforms a dashboard for this use case. Frequency should match the team\'s strategic cadence — weekly is usually right for SMBs.',
  },

  // ── Compliance & Governance ───────────────────────────────────────────────

  {
    id: 'uc-cg-001',
    title: 'AI-Assisted Contract Review & Risk Clause Flagging',
    category: 'Compliance & Governance',
    industryTags: ['Professional Services', 'Legal', 'Real Estate', 'Financial Services', 'Technology'],
    summary:
      'Use LLM-based contract analysis to identify missing clauses, non-standard terms, risk language, and deviations from approved template positions in vendor and customer contracts — before they reach signature.',
    painPoint:
      'Legal review is a bottleneck on commercial velocity. Non-legal staff often route contracts for signature without recognising risk language, and the legal team is stretched across too many reviews simultaneously.',
    workflowImproved: 'Contract lifecycle management, vendor onboarding, and sales contracting',
    expectedOutcomes: [
      'Faster contract review cycle for standard contract types',
      'Consistent flagging of high-risk clauses regardless of reviewer',
      'Reduced legal bottleneck — lawyers focus on non-standard and high-value contracts',
      'Lower risk exposure from unchecked non-standard terms reaching signature',
    ],
    dataSourcesRequired: [
      'Approved contract templates (MSA, NDA, vendor agreements)',
      'Signed contract library for training',
      'Legal risk clause playbook or red-line preferences',
      'Clause taxonomy with risk classifications',
    ],
    dataReadiness:
      'Medium — requires a structured risk clause library or approved legal playbook to calibrate the model. Most firms have templates but lack a formal clause taxonomy. Building this is the primary pre-work.',
    complexity: 'Medium',
    timeToValue: '2–3 months',
    riskConsiderations:
      'AI contract review is advisory only. Errors or missed high-risk clauses in material contracts carry legal and financial consequences. Human sign-off at all value thresholds is non-negotiable.',
    maturityLevel: 'Developing',
    recommendedServices: ['ai-readiness', 'ai-governance', 'ai-pilot'],
    suggestedNextStep:
      'Legal workflow audit and clause risk playbook development session with in-house or external counsel before any model work begins.',
    notes:
      'Scope v1 to a single contract type (e.g. vendor NDAs or standard MSAs) with high volume and low variability. This builds accuracy fast and demonstrates value without exposing the client to high-risk advisory error.',
  },

  {
    id: 'uc-cg-002',
    title: 'Regulatory Change Monitoring & Impact Flagging',
    category: 'Compliance & Governance',
    industryTags: ['Financial Services', 'Healthcare', 'Manufacturing', 'Insurance'],
    summary:
      'Monitor regulatory publication feeds and government sources to detect new or amended rules relevant to the business, summarise the change, and flag potential operational impact before an audit surfaces it.',
    painPoint:
      'Compliance officers spend significant time manually scanning regulatory sources across multiple jurisdictions. Changes are sometimes missed until an external event — an audit, a regulator query, or a customer flag — brings them forward.',
    workflowImproved: 'Compliance monitoring, risk management, and regulatory reporting',
    expectedOutcomes: [
      'Automated alerts on regulatory changes relevant to the business\'s scope',
      'Plain-language change summaries reducing time-to-understand for non-legal staff',
      'Reduced manual monitoring burden on the compliance team',
      'More comprehensive coverage across multiple regulatory bodies simultaneously',
    ],
    dataSourcesRequired: [
      'Regulatory body publication feeds (RSS / web scraping)',
      'Internal compliance register or obligation inventory',
      'Jurisdiction and sector scope matrix',
      'Existing policies and procedures for impact cross-referencing',
    ],
    dataReadiness:
      'Low for monitoring setup. Medium for impact mapping — requires a structured internal compliance register to cross-reference against regulatory changes.',
    complexity: 'Medium',
    timeToValue: '2–3 months',
    riskConsiderations:
      'Over-alerting on irrelevant regulatory changes causes alert fatigue and erodes trust in the system. Jurisdiction and topic scoping must be precise. Changes flagged as "potentially impactful" must always be confirmed by a qualified person.',
    maturityLevel: 'Developing',
    recommendedServices: ['ai-readiness', 'ai-governance', 'ai-pilot'],
    suggestedNextStep:
      'Jurisdiction and regulatory scope definition workshop with the compliance lead — agree on the source list, relevance filters, and alert thresholds before setup.',
    notes:
      'This use case is highly valuable for regulated SMBs that lack the headcount to run a proper compliance monitoring function. Position it as a force-multiplier for an under-resourced compliance team, not a replacement.',
  },

  {
    id: 'uc-cg-003',
    title: 'PII Detection & Data Privacy Scanning',
    category: 'Compliance & Governance',
    industryTags: ['Healthcare', 'Financial Services', 'Retail', 'Technology', 'Professional Services'],
    summary:
      'Scan unstructured data stores — documents, emails, databases — to detect, classify, and report personal data (PII / PHI) across systems, supporting GDPR, CCPA, and data minimisation compliance obligations.',
    painPoint:
      'Organisations don\'t know where all their personal data lives. Subject access requests take weeks, data breach scope assessments are guesswork, and data minimisation obligations remain unmet due to lack of visibility.',
    workflowImproved: 'Data privacy compliance, DSAR handling, and breach response scoping',
    expectedOutcomes: [
      'Comprehensive inventory of where PII and PHI resides across systems',
      'Faster DSAR response times through searchable data location records',
      'Reduced regulatory exposure from unknown data stores',
      'Evidence base for data minimisation and retention policy enforcement',
    ],
    dataSourcesRequired: [
      'Document repositories (SharePoint, Google Drive, email archives)',
      'Databases and CRM exports',
      'Helpdesk and support ticket content',
      'Legacy file stores and network drives',
    ],
    dataReadiness:
      'Low — data typically exists but is unstructured and uncategorised. The primary challenge is connectivity and access permission to all relevant data stores, not the data itself.',
    complexity: 'High',
    timeToValue: '3–5 months',
    riskConsiderations:
      'Extremely sensitive workstream — must be led by or closely partnered with the DPO and legal team from the outset. Misclassification of health or financial data carries regulatory risk. Access controls during scanning must be auditable.',
    maturityLevel: 'Exploring',
    recommendedServices: ['ai-readiness', 'ai-governance'],
    suggestedNextStep:
      'AI Governance assessment on data access protocols, privacy compliance obligations, and scanning scope — legal sign-off is required before any scanning commences.',
    notes:
      'Position this as a privacy programme enabler, not a one-off scan. The value compounds over time as the data map is maintained and used to respond to DSARs and breaches. Initial scoping should define in-scope systems carefully to avoid scope creep.',
  },

  // ── Field Service & Logistics ─────────────────────────────────────────────

  {
    id: 'uc-fsl-001',
    title: 'Intelligent Field Technician Scheduling & Dispatch',
    category: 'Field Service & Logistics',
    industryTags: ['Field Service', 'Facilities Management', 'Utilities', 'HVAC & Trades'],
    summary:
      'Optimise job assignment and scheduling using AI to match work orders to available technicians based on skills, location, travel time, parts availability, and customer SLA tier — replacing manual dispatcher decision-making.',
    painPoint:
      'Dispatchers assign jobs based on familiarity and gut feel. Technician utilisation is uneven across the team, travel routes are inefficient, and SLAs are missed due to suboptimal matching rather than capacity shortage.',
    workflowImproved: 'Dispatch and scheduling, SLA management, and field workforce planning',
    expectedOutcomes: [
      '15–25 % improvement in jobs completed per technician per day',
      'Higher SLA compliance rate without adding headcount',
      'Reduced total travel distance and fuel cost per shift',
      'More equitable workload distribution across the technician team',
    ],
    dataSourcesRequired: [
      'Work order management system',
      'Technician skill profiles and certification records',
      'GPS / real-time location data',
      'Parts and van stock inventory',
      'Customer SLA and priority tier data',
    ],
    dataReadiness:
      'Medium — requires structured work order history and technician skill data. GPS integration is needed for real-time routing optimisation and is often the key technical dependency.',
    complexity: 'Medium',
    timeToValue: '3–5 months',
    riskConsiderations:
      'Dispatcher resistance to AI recommendations is common and can limit adoption benefits. A "suggest, don\'t force" rollout model — where dispatchers can override with a reason — is critical for change management.',
    maturityLevel: 'Developing',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'Field ops workflow audit and dispatch data quality review — map current state and identify the scheduling constraints the model must respect.',
    notes:
      'Pair the AI system with a dispatcher override logging mechanism. Reviewing overrides in the first 30 days reveals mismatches between the model\'s assumptions and ground-truth field knowledge — this is where the fast learning happens.',
  },

  {
    id: 'uc-fsl-002',
    title: 'Automated Field Service Report Generation',
    category: 'Field Service & Logistics',
    industryTags: ['Field Service', 'Facilities Management', 'Construction', 'HVAC & Trades'],
    summary:
      'Allow technicians to dictate job details by voice or photograph completion evidence on a mobile app; AI converts inputs into structured service reports, pre-filled work orders, and parts usage records — eliminating end-of-day paperwork.',
    painPoint:
      'Technicians spend 20–40 minutes per job on post-completion paperwork. Reports are inconsistent, often incomplete, and missing required compliance fields — delaying billing and creating warranty and audit exposure.',
    workflowImproved: 'Job completion documentation, compliance reporting, billing, and warranty claims',
    expectedOutcomes: [
      'Report completion time reduced from 30+ minutes to under 5 minutes per job',
      'Consistent, standards-compliant report structure across all technicians',
      'Same-day report delivery enabling faster billing cycles',
      'Reduction in warranty claim rejections due to incomplete job documentation',
    ],
    dataSourcesRequired: [
      'Mobile app interface for voice input and photo capture',
      'Work order template library',
      'Asset and equipment catalogue',
      'Parts catalogue with codes',
    ],
    dataReadiness:
      'Low — no significant historical data required for v1. The main pre-work is digitising work order templates and ensuring technicians have compatible mobile devices.',
    complexity: 'Low',
    timeToValue: '6–8 weeks',
    riskConsiderations:
      'Adoption depends heavily on mobile device readiness and connectivity in the field. Poor signal areas require offline-first design with sync on reconnect. Technician buy-in is the primary success factor.',
    maturityLevel: 'Exploring',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'Field technology audit — assess mobile device coverage, connectivity conditions in the field, and work order template completeness.',
    notes:
      'Run the v1 pilot with 3–5 engaged technicians, not the whole fleet. Identify the voice/photo → report workflow that feels natural to them in the field before optimising for compliance field coverage.',
  },

  {
    id: 'uc-fsl-003',
    title: 'Delivery Route Optimisation & ETA Accuracy',
    category: 'Field Service & Logistics',
    industryTags: ['Logistics', 'Last-Mile Delivery', 'Wholesale Distribution', 'Field Service'],
    summary:
      'Apply AI-based routing to dynamic delivery schedules, accounting for real-time traffic, time windows, vehicle capacity, and priority stops to minimise total route cost and improve ETA accuracy communicated to customers.',
    painPoint:
      'Planners build routes manually in spreadsheets or simple mapping tools. Last-minute order additions cause costly reroutings, ETA accuracy is poor, and driver utilisation varies widely across the fleet.',
    workflowImproved: 'Delivery planning, last-mile routing, and customer ETA communication',
    expectedOutcomes: [
      '10–20 % reduction in total route distance and fuel cost',
      'ETA accuracy improved to ±15 minutes for proactive customer communication',
      'Reduced planner time on daily route-building by 60–70 %',
      'Ability to absorb last-minute order additions without full re-plan',
    ],
    dataSourcesRequired: [
      'Order management system with delivery addresses and time windows',
      'Vehicle fleet data (capacity, type, home depot)',
      'Historical delivery data for model calibration',
      'Real-time traffic API (Google Maps / HERE / TomTom)',
    ],
    dataReadiness:
      'Medium — order and fleet data is typically structured. Real-time traffic API integration adds cost and latency. Address geocoding quality is often the highest practical risk.',
    complexity: 'Medium',
    timeToValue: '2–3 months',
    riskConsiderations:
      'Routing optimisation requires high-quality address geocoding; failed or imprecise geocodes cascade into suboptimal routes. Address data cleansing is a mandatory pre-step. Driver app adoption must be managed alongside the back-office change.',
    maturityLevel: 'Developing',
    recommendedServices: ['ai-readiness', 'ai-pilot'],
    suggestedNextStep:
      'Order data quality audit and routing workflow mapping with the operations team — geocoding accuracy check is the first gating task.',
    notes:
      'Validate the optimisation model on a historical week of deliveries before going live — this builds planner trust and surfaces edge cases (restricted access zones, customer time window quirks) before they cause problems in production.',
  },
];
