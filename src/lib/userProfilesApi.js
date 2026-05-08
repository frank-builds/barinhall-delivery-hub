/**
 * Sprint D1 — Supabase user_profiles table helpers.
 *
 * Table schema (created in supabase/migrations/0001_user_profiles.sql):
 *   user_id      uuid PK (references auth.users.id)
 *   role         text NOT NULL DEFAULT 'internal_consultant'
 *   email        text          (denormalised for admin sorting)
 *   display_name text
 *   org          text
 *   is_active    boolean NOT NULL DEFAULT true
 *   created_at   timestamptz
 *   updated_at   timestamptz   (app-managed — no DB trigger in D1)
 *
 * RLS policies on the table:
 *   self-read         — authenticated user can SELECT their own row
 *   self-insert-default — authenticated user can INSERT with role='internal_consultant'
 *   admin-all         — users whose profile.role is 'platform_admin' can do anything
 */
import { supabase } from './supabase.js';
import { DEFAULT_ROLE } from '../data/roles.js';

const TABLE = 'user_profiles';

// ── Profile fetching ──────────────────────────────────────────────────────────

/**
 * Fetches a single profile by auth user ID.
 *
 * Return contract (three distinct cases — do not conflate):
 *
 *   { data: <row>, error: null }   — row found; use data.
 *   { data: null,  error: null }   — query succeeded but no matching row exists
 *                                    (genuine miss — user has not signed in before,
 *                                    or the row was deleted). NOT a DB error.
 *   { data: null,  error: <obj> }  — DB/RLS/network error; treat as DB unavailable.
 *                                    Caller should call applyFallback(), not lazyProvision().
 *
 * Uses maybeSingle() so "no row" is never surfaced as an error object.
 */
export async function fetchProfile(userId) {
  return supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
}

/**
 * Fetches all profiles ordered by email ascending.
 * Requires the admin-all RLS policy (platform_admin only).
 */
export async function fetchAllProfiles() {
  return supabase
    .from(TABLE)
    .select('*')
    .order('email', { ascending: true, nullsFirst: false });
}

// ── Lazy provision ────────────────────────────────────────────────────────────

/**
 * Inserts a default profile row on first sign-in.
 * Uses the self-insert-default RLS policy (role must be DEFAULT_ROLE).
 *
 * Safe to call even if a row already exists — ON CONFLICT (user_id) DO NOTHING.
 * Returns { data, error }.
 */
export async function lazyProvision(userId, email) {
  return supabase
    .from(TABLE)
    .insert({
      user_id:      userId,
      role:         DEFAULT_ROLE,
      email:        email ?? null,
      display_name: email ?? null,
      is_active:    true,
    }, { onConflict: 'user_id', ignoreDuplicates: true })
    .select()
    .maybeSingle();
}

// ── Profile updates ───────────────────────────────────────────────────────────

/**
 * Partial update for a profile row.
 * Caller is responsible for setting updated_at = new Date().toISOString().
 * Returns { data, error }.
 */
export async function updateProfile(userId, patch) {
  return supabase
    .from(TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .maybeSingle();
}
