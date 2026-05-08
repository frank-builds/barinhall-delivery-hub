/**
 * Sprint D2 — CRM-lite opportunities repo.
 *
 * Adds two FK columns to the row:
 *   account_id          NOT NULL — every opportunity belongs to an account
 *   primary_contact_id  nullable — primary contact assignment is optional
 *
 * Both also live inside `data` so client code can read them without joining.
 */
import { supabase } from './supabase.js';

const TABLE = 'crm_opportunities';

/**
 * @param {string} userId
 * @returns {Promise<import('../data/crmTypes.js').Opportunity[]>}
 */
export async function fetchOpportunities(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map(row => row.data);
}

/**
 * Upserts an opportunity row. Both FK columns are mirrored from the data
 * object onto the row so the FKs are enforced and queryable at the SQL level.
 *
 * @param {import('../data/crmTypes.js').Opportunity} opportunity
 * @param {string} userId
 */
export async function saveOpportunity(opportunity, userId) {
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      {
        id:                 opportunity.id,
        user_id:            userId,
        account_id:         opportunity.accountId,
        primary_contact_id: opportunity.primaryContactId ?? null,
        data:               opportunity,
        updated_at:         new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  if (error) throw error;
}

/**
 * @param {string} opportunityId
 */
export async function deleteOpportunity(opportunityId) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', opportunityId);
  if (error) throw error;
}
