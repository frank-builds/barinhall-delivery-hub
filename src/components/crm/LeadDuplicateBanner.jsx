/**
 * Sprint D4 — LeadDuplicateBanner.
 *
 * Yellow banner shown at the top of LeadDetail when other leads or contacts
 * share this lead's email. Lists matches with deep links. No automatic merge
 * action in D4 — that's deferred.
 */
import { Link } from 'react-router-dom';
import { useCRM } from '../../hooks/useCRM.js';

export function LeadDuplicateBanner({ lead }) {
  const { findLeadDuplicates } = useCRM();
  const { leads, contacts } = findLeadDuplicates(lead.email, lead.id);
  const total = leads.length + contacts.length;

  if (total === 0) return null;

  return (
    <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm">
      <p className="font-semibold text-amber-800 mb-2">
        Possible duplicate{total !== 1 ? 's' : ''}
      </p>
      <p className="text-amber-700 text-xs mb-2">
        Other records with the same email <code className="font-mono bg-amber-100 px-1 rounded">{lead.email}</code> exist:
      </p>
      <ul className="space-y-1">
        {leads.map(l => (
          <li key={l.id} className="text-sm">
            <Link to={`/crm/leads/${l.id}`} className="text-amber-900 hover:underline font-medium">
              Lead: {l.name || '—'}
            </Link>
            {l.company && <span className="text-amber-700 ml-1">· {l.company}</span>}
          </li>
        ))}
        {contacts.map(c => (
          <li key={c.id} className="text-sm">
            <Link to={`/crm/contacts/${c.id}`} className="text-amber-900 hover:underline font-medium">
              Contact: {c.name || '—'}
            </Link>
            {c.title && <span className="text-amber-700 ml-1">· {c.title}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
