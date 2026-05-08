/**
 * Sprint D1 + D1.1 — Authorization context.
 *
 * Provides:
 *   profile          — raw DB row (null if not loaded or no row)
 *   role             — effective role string (may be overridden by bootstrap)
 *   isActive         — effective is_active flag
 *   permissions      — string[] of active permission keys
 *   isAdmin          — shorthand: role holds admin.access.read
 *   loading          — true while profile is being fetched
 *   isFallback       — true when DB fetch failed (network/RLS error)
 *   fallbackReason   — short error description when isFallback is true
 *   bootstrapOverride — true when role is being supplied by VITE_PLATFORM_ADMIN_EMAIL
 *   can(perm)        — boolean; single perm check
 *   canAny(perms[])  — boolean; any-of check
 *   canAll(perms[])  — boolean; all-of check
 *   reloadAuthz()    — re-fetches profile from DB (call after admin saves own row)
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { supabase } from '../lib/supabase.js';
import { fetchProfile, lazyProvision } from '../lib/userProfilesApi.js';
import {
  derivePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdminRole,
} from '../lib/authz.js';

// ── Bootstrap-admin override (D1.1) ──────────────────────────────────────────
//
// If VITE_PLATFORM_ADMIN_EMAIL is set in .env, any signed-in user whose email
// matches (case-insensitive) is treated as an active platform_admin REGARDLESS
// of what the database says. This handles:
//   • No DB row yet   → same as before (applyFallback path)
//   • Stale role row  → NOW FIXED: override applies even when a row exists
//   • Deactivated row → override re-activates (intentional dev-only escape hatch)
//
// Leave VITE_PLATFORM_ADMIN_EMAIL blank in production to disable this entirely.
const PLATFORM_ADMIN_EMAIL = (
  import.meta.env.VITE_PLATFORM_ADMIN_EMAIL ?? ''
).trim().toLowerCase();

// ── Context shape ─────────────────────────────────────────────────────────────

const EMPTY_VALUE = {
  profile:          null,
  role:             null,
  isActive:         false,
  permissions:      [],
  isAdmin:          false,
  loading:          true,
  isFallback:       false,
  fallbackReason:   null,
  bootstrapOverride: false,
  can:    () => false,
  canAny: () => false,
  canAll: () => false,
  reloadAuthz: () => {},
};

const AuthzContext = createContext(EMPTY_VALUE);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthzProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fallback state — set when the DB is unreachable or RLS blocks the read
  const [isFallback,     setIsFallback]     = useState(false);
  const [fallbackReason, setFallbackReason] = useState(null);

  // Stable ref so reloadAuthz can always call the latest fetchAndApply
  const fetchRef = useRef(null);

  // ── Profile loading ─────────────────────────────────────────────────────

  const applyFallback = useCallback((reason) => {
    console.warn('[AuthzContext] profile load failed, applying fallback.', reason);
    setIsFallback(true);
    setFallbackReason(String(reason ?? 'Unknown error'));
    setProfile(null);
    setLoading(false);
  }, []);

  const fetchAndApply = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null);
      setIsFallback(false);
      setFallbackReason(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setIsFallback(false);
    setFallbackReason(null);

    try {
      const { data, error } = await fetchProfile(authUser.id);

      if (error) {
        // Distinguish RLS / network errors from "no row"
        applyFallback(error.message ?? error.code ?? 'DB error');
        return;
      }

      if (data) {
        setProfile(data);
        setLoading(false);
        return;
      }

      // No row → lazy-provision a default one
      const { data: provisioned, error: provErr } = await lazyProvision(
        authUser.id,
        authUser.email,
      );

      if (provErr) {
        // Provision failed (RLS / constraint / network) — retry the fetch in
        // case a concurrent tab already inserted the row.
        const { data: retry, error: retryErr } = await fetchProfile(authUser.id);
        if (retryErr || !retry) {
          applyFallback(provErr.message ?? 'Provision error');
          return;
        }
        setProfile(retry);
      } else if (provisioned) {
        // INSERT succeeded and returned the new row.
        setProfile(provisioned);
      } else {
        // INSERT did nothing and returned no data — this happens when
        // ignoreDuplicates hits an existing row (ON CONFLICT DO NOTHING).
        // Re-fetch so we don't call setProfile(null) on an existing row.
        const { data: existing, error: existErr } = await fetchProfile(authUser.id);
        if (existErr || !existing) {
          applyFallback('Row exists but re-fetch after provision returned nothing');
          return;
        }
        setProfile(existing);
      }

      setLoading(false);
    } catch (err) {
      applyFallback(err?.message ?? 'Unexpected error');
    }
  }, [applyFallback]);

  // Keep ref current
  fetchRef.current = fetchAndApply;

  // ── Auth subscription ───────────────────────────────────────────────────

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      fetchRef.current(u);
    });

    // Live auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        fetchRef.current(u);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── D1.2 Bootstrap-admin override — DB-first precedence ─────────────────
  //
  // The override is a fallback of last resort. It fires ONLY when the DB did
  // not return a usable profile row — either because the row is genuinely
  // absent (no row yet, first sign-in) or because the DB was unreachable
  // (isFallback = true). If the DB returned ANY profile row (regardless of
  // its role or is_active value), that row is authoritative and the env-var
  // override is suppressed entirely.
  //
  // Decision tree for `role` / `isActive`:
  //   1. DB row present  → use row.role and row.is_active (DB wins)
  //   2. No DB row + env var matches email → bootstrap override (platform_admin)
  //   3. No DB row + env var not set/mismatch → role=null, isActive=false (locked out)
  //   4. DB error (isFallback) + env var matches → bootstrap override (recovery)
  //   4. DB error + env var not set → isFallback banner, locked out

  const hasUsableDbProfile = !isFallback && profile !== null;

  const isBootstrapAdmin =
    !hasUsableDbProfile &&
    !!PLATFORM_ADMIN_EMAIL &&
    (user?.email ?? '').trim().toLowerCase() === PLATFORM_ADMIN_EMAIL;

  const role     = isBootstrapAdmin ? 'platform_admin' : (profile?.role ?? null);
  const isActive = isBootstrapAdmin ? true : (!!profile && profile.is_active !== false);

  const permissions = isActive
    ? derivePermissions({ role, is_active: true })
    : [];

  const isAdmin = isActive && isAdminRole(role);

  // ── Permission checkers ─────────────────────────────────────────────────

  const can    = useCallback((perm)  => hasPermission(permissions, perm),    [permissions]);
  const canAny = useCallback((perms) => hasAnyPermission(permissions, perms), [permissions]);
  const canAll = useCallback((perms) => hasAllPermissions(permissions, perms), [permissions]);

  // ── Public reload ───────────────────────────────────────────────────────

  const reloadAuthz = useCallback(() => {
    if (user) fetchRef.current(user);
  }, [user]);

  // ── Context value ───────────────────────────────────────────────────────

  const value = {
    profile,
    role,
    isActive,
    permissions,
    isAdmin,
    loading,
    isFallback,
    fallbackReason,
    bootstrapOverride: isBootstrapAdmin,
    can,
    canAny,
    canAll,
    reloadAuthz,
  };

  return (
    <AuthzContext.Provider value={value}>
      {children}
    </AuthzContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuthzContext() {
  return useContext(AuthzContext);
}
