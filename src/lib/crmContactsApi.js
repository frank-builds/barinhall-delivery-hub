/**
 * Sprint D2 — CRM-lite contacts repo.
 *
 * Same shape as `crmAccountsApi.js` plus the `account_id` FK column, which
 * is duplicated on the row for efficient relational queries (the value also
 * appears inside `data.accountId` so the React layer can read it without an
 * extra denormalisation step).
 */
import { supabase } from './supabase.js';

const TABLE = 'crm_contacts';

/**
 * @param {string} userId
 * @returns {Promise<import('../data/crmTypes.js').Contact[]>}
 */
export async function fetchContacts(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map(row => row.data);
}

/**
 * Upserts a contact row. The `account_id` column on the DB row is set from
 * `contact.accountId` so the FK relationship is queryable at the SQL level.
 *
 * @param {import('../data/crmTypes.js').Contact} contact
 * @param {string} userId
 */
export async function saveContact(contact, userId) {
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      {
        id:         contact.id,
        user_id:    userId,
        account_id: contact.accountId ?? null,
        data:       contact,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  if (error) throw error;
}

/**
 * @param {string} contactId
 */
export async function deleteContact(contactId) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', contactId);
  if (error) throw error;
}
