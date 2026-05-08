/**
 * Sprint D4 — CRM-lite leads repo.
 *
 * Same shape as crmAccountsApi.js. Per-user `user_id` filter; JSONB `data`
 * holds the full Lead record. The migration in 0003_crm_leads.sql adds an
 * expression index on lower(data->>'email') so dedup queries stay fast even
 * at moderate volume.
 */
import { supabase } from './supabase.js';

const TABLE = 'crm_leads';

/**
 * @param {string} userId
 * @returns {Promise<import('../data/crmTypes.js').Lead[]>}
 */
export async function fetchLeads(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map(row => row.data);
}

/**
 * @param {import('../data/crmTypes.js').Lead} lead
 * @param {string} userId
 */
export async function saveLead(lead, userId) {
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      {
        id:         lead.id,
        user_id:    userId,
        data:       lead,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  if (error) throw error;
}

/**
 * Bulk-save N leads. D4 uses sequential Promise.all of single upserts —
 * adequate at hundreds of rows. If D5+ needs to ingest thousands at once,
 * switch to a single multi-row .insert([…]) call.
 *
 * Returns counts for the import preview to display.
 *
 * @param {import('../data/crmTypes.js').Lead[]} leads
 * @param {string} userId
 * @returns {Promise<{ created: number, failed: number, errors: string[] }>}
 */
export async function bulkSaveLeads(leads, userId) {
  const results = await Promise.allSettled(
    leads.map(l => saveLead(l, userId))
  );
  const errors = [];
  let created = 0;
  let failed  = 0;
  for (const r of results) {
    if (r.status === 'fulfilled') created++;
    else {
      failed++;
      errors.push(r.reason?.message ?? String(r.reason));
    }
  }
  return { created, failed, errors };
}

/**
 * @param {string} leadId
 */
export async function deleteLead(leadId) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', leadId);
  if (error) throw error;
}
