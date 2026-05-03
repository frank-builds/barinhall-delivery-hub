// Reminder and notification content generators.
// Pure functions — take engagement data, return structured reminder objects
// or null if no reminder is needed.
// Used directly by the app and referenced as logic in n8n workflow code nodes.

const STALE_DAYS = 7;

function daysSince(isoString) {
  if (!isoString) return Infinity;
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 86_400_000);
}

function lastActivityDate(engagement) {
  const lastNote   = engagement.notesLog?.slice(-1)[0]?.date;
  const lastOutput = engagement.outputs?.slice(-1)[0]?.generatedAt;
  return [lastNote, lastOutput].filter(Boolean).sort().slice(-1)[0] ?? null;
}

// Returns a reminder object if the engagement has had no activity in STALE_DAYS,
// or null if the engagement is current.
export function generateStaleEngagementReminder(engagement) {
  const last = lastActivityDate(engagement);
  const days = daysSince(last);

  if (days < STALE_DAYS) return null;

  const incompleteSteps = (engagement.workflow ?? []).filter(s => !s.done).map(s => s.label);
  const openRisks       = (engagement.risksLog ?? []).filter(r => r.status === 'Open');
  const daysLabel       = days === Infinity ? 'no recorded activity' : `${days} day${days !== 1 ? 's' : ''} ago`;

  return {
    type:            'stale-engagement',
    engagementId:    engagement.id,
    clientName:      engagement.clientName,
    company:         engagement.company,
    serviceType:     engagement.serviceType,
    owner:           engagement.owner,
    status:          engagement.status,
    daysSinceActivity:             days === Infinity ? null : days,
    lastActivityDate:              last ?? null,
    incompleteWorkflowSteps:       incompleteSteps,
    incompleteWorkflowStepCount:   incompleteSteps.length,
    openRisksCount:                openRisks.length,
    subject: `Reminder: ${engagement.clientName} engagement needs attention`,
    message: [
      `The engagement with ${engagement.clientName} (${engagement.company}) has had ${daysLabel}.`,
      incompleteSteps.length > 0
        ? `${incompleteSteps.length} workflow step(s) are incomplete: ${incompleteSteps.slice(0, 3).join(', ')}${incompleteSteps.length > 3 ? `, and ${incompleteSteps.length - 3} more` : ''}.`
        : 'All workflow steps are complete.',
      openRisks.length > 0
        ? `${openRisks.length} open risk(s) require attention.`
        : 'No open risks.',
    ].join(' '),
  };
}

// Returns an array of reminder objects for each open High or Critical risk
// on the engagement. Returns [] if none.
export function generateOverdueRiskReminders(engagement) {
  const openHighRisks = (engagement.risksLog ?? []).filter(
    r => r.status === 'Open' && (r.severity === 'High' || r.severity === 'Critical')
  );

  return openHighRisks.map(risk => ({
    type:         'open-risk',
    engagementId: engagement.id,
    clientName:   engagement.clientName,
    company:      engagement.company,
    owner:        engagement.owner,
    riskId:       risk.id,
    riskTitle:    risk.title,
    severity:     risk.severity,
    description:  risk.description,
    riskOwner:    risk.owner,
    subject:      `[${risk.severity} Risk] ${risk.title} — ${engagement.clientName}`,
    message:      `A ${risk.severity} risk is still open on the ${engagement.clientName} engagement: "${risk.title}". Owner: ${risk.owner}. ${risk.description ?? ''}`.trim(),
  }));
}

// Returns a reminder object if any forms are Not Started, or null if all
// forms are at least In Progress.
export function generateMissingFormsReminder(engagement, formDefs) {
  if (!Array.isArray(formDefs) || formDefs.length === 0) return null;

  const notStarted = formDefs.filter(f => {
    const status = engagement.templateStatuses?.[f.key] ?? 'Not Started';
    return status === 'Not Started';
  });

  if (notStarted.length === 0) return null;

  return {
    type:         'missing-forms',
    engagementId: engagement.id,
    clientName:   engagement.clientName,
    company:      engagement.company,
    serviceType:  engagement.serviceType,
    owner:        engagement.owner,
    missingForms: notStarted.map(f => ({ key: f.key, label: f.label })),
    subject:      `Incomplete forms: ${engagement.clientName} engagement`,
    message:      `${engagement.clientName} (${engagement.company}) has ${notStarted.length} form(s) not yet started: ${notStarted.map(f => f.label).join(', ')}.`,
  };
}

// Convenience: generate all applicable reminders for a single engagement.
export function generateAllReminders(engagement, formDefs = []) {
  const reminders = [];

  if (engagement.status === 'Active') {
    const stale = generateStaleEngagementReminder(engagement);
    if (stale) reminders.push(stale);

    const risks = generateOverdueRiskReminders(engagement);
    reminders.push(...risks);

    const forms = generateMissingFormsReminder(engagement, formDefs);
    if (forms) reminders.push(forms);
  }

  return reminders;
}
