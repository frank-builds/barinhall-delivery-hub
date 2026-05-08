/**
 * Sprint D1 — PermissionGate component.
 *
 * Renders `children` when the current user has the required permission(s);
 * renders `fallback` (default: null) otherwise.
 *
 * Props (mutually exclusive — use exactly one):
 *   perm   {string}   — single permission key
 *   anyOf  {string[]} — passes when the user has ANY of the listed keys
 *   allOf  {string[]} — passes when the user has ALL of the listed keys
 *
 * Optional:
 *   fallback {ReactNode} — rendered when the check fails (default: null)
 *
 * Dev behaviour:
 *   - Misusing more than one of perm/anyOf/allOf prints a console.warn
 *     and fails closed (renders fallback), never throws.
 *   - The component always fails closed; it never throws in production.
 *
 * Examples:
 *   <PermissionGate perm="outputs.write">
 *     <MarkReadyButton />
 *   </PermissionGate>
 *
 *   <PermissionGate perm="engagements.write" fallback={<ReadOnlyStatus />}>
 *     <StatusSelect />
 *   </PermissionGate>
 *
 *   <PermissionGate anyOf={['admin.users.manage', 'admin.roles.manage']}>
 *     <AdminLink />
 *   </PermissionGate>
 */
import { useAuthz } from '../hooks/useAuthz.js';

export function PermissionGate({ perm, anyOf, allOf, fallback = null, children }) {
  const { can, canAny, canAll } = useAuthz();

  // ── Misuse detection (dev only) ────────────────────────────────────────
  if (import.meta.env.DEV) {
    const provided = [perm, anyOf, allOf].filter(v => v !== undefined);
    if (provided.length === 0) {
      console.warn(
        '[PermissionGate] No permission prop supplied (perm / anyOf / allOf). ' +
        'Failing closed. Add a permission check or remove this gate.'
      );
      return fallback;
    }
    if (provided.length > 1) {
      console.warn(
        '[PermissionGate] More than one of perm / anyOf / allOf supplied. ' +
        'Use exactly one. Failing closed.'
      );
      return fallback;
    }
  } else {
    // Production: also fail closed on clearly wrong usage
    const provided = [perm, anyOf, allOf].filter(v => v !== undefined);
    if (provided.length !== 1) return fallback;
  }

  // ── Permission evaluation ──────────────────────────────────────────────
  let passes = false;

  if (perm !== undefined) {
    passes = can(perm);
  } else if (anyOf !== undefined) {
    passes = canAny(anyOf);
  } else if (allOf !== undefined) {
    passes = canAll(allOf);
  }

  return passes ? children : fallback;
}
