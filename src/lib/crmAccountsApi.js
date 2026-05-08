/**
 * Sprint D2 — CRM-lite accounts repo.
 *
 * Mirrors `engagementsApi.js` shape exactly:
 *   - JSONB `data` column carries the Account record
 *   - per-user scope via `user_id`
 *   - upsert on `id` for save
 *
 * The `crm_accounts` table is created by `supabase/migrations/0002_crm_lite.sql`.
 */
import { supabase } from './supabase.js';

const TABLE = 'crm_accounts';

/**
 * Returns all accounts owned by `userId`, most recently updated first.
 * Throws on error; the caller (CRMContext) catches and surfaces via state.
 *
 * @param {string} userId
 * @returns {Promise<import('../data/crmTypes.js').Account[]>}
 */
export async function fetchAccounts(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map(row => row.data);
}

/**
 * Upserts an account row. Caller is responsible for setting
 * `account.updatedAt = new Date().toISOString()` before calling.
 *
 * D2 has no UI mutators; this is exposed for D3 and for the seed script.
 *
 * @param {import('../data/crmTypes.js').Account} account
 * @param {string} userId
 */
export async function saveAccount(account, userId) {
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      {
        id:         account.id,
        user_id:    userId,
        data:       account,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  if (error) throw error;
}

/**
 * Removes an account by id. Linked contacts and opportunities are handled by
 * the FK ON DELETE behaviour set in the migration (contacts: SET NULL,
 * opportunities: CASCADE — see 0002_crm_lite.sql for rationale).
 *
 * @param {string} accountId
 */
export async function deleteAccount(accountId) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', accountId);
  if (error) throw error;
}
