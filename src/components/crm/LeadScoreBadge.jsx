/**
 * Sprint D4 — LeadScoreBadge.
 *
 * Compact "73 · hot" badge using the existing Badge component. Used in
 * LeadsList rows, LeadDetail header, and the import-preview table.
 */
import { Badge } from '../Badge.jsx';
import { scoreLead, tierBadgeTone } from '../../data/crmLeadScoring.js';

export function LeadScoreBadge({ lead, className = '' }) {
  const { score, tier } = scoreLead(lead);
  return (
    <Badge tone={tierBadgeTone(tier)} className={className}>
      <span className="tabular-nums">{score}</span>
      <span className="opacity-60 mx-1">·</span>
      <span>{tier}</span>
    </Badge>
  );
}
