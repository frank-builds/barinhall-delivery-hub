/**
 * Computed status logic for engagements.
 *
 * computeStatus(workflow)   → derives status from workflow progress
 * effectiveStatus(engagement) → returns statusOverride if set, else computed
 *
 * Rules:
 *   0 done steps          → 'Draft'
 *   1 … total-1 done      → 'Active'
 *   all steps done        → 'Completed'
 *
 * 'On Hold' is a manual-override-only state; it is never auto-computed.
 */

export function computeStatus(workflow) {
  if (!Array.isArray(workflow) || workflow.length === 0) return 'Draft';
  const done = workflow.filter(s => s.done).length;
  if (done === 0)               return 'Draft';
  if (done === workflow.length) return 'Completed';
  return 'Active';
}

/**
 * The status to display and use for all UI and logic.
 *   effectiveStatus = engagement.statusOverride ?? computeStatus(engagement.workflow)
 */
export function effectiveStatus(engagement) {
  return engagement.statusOverride ?? computeStatus(engagement.workflow);
}
