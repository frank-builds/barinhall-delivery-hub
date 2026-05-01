import { supabase } from './supabase.js';

export async function fetchEngagements(userId) {
  const { data, error } = await supabase
    .from('engagements')
    .select('data')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map(row => row.data);
}

export async function saveEngagement(engagement, userId) {
  const { error } = await supabase
    .from('engagements')
    .upsert(
      {
        id: engagement.id,
        user_id: userId,
        data: engagement,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  if (error) throw error;
}

export async function deleteEngagement(engagementId) {
  const { error } = await supabase
    .from('engagements')
    .delete()
    .eq('id', engagementId);
  if (error) throw error;
}
