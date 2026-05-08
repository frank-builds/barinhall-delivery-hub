/**
 * Sprint D1 — pure authorization utilities.
 * No React imports; safe to call in any context.
 */
import { isKnownRole, isAdminRole, getRolePermissions } from '../data/roles.js';

export { isKnownRole, isAdminRole };

/**
 * Derives the effective permission set for a profile object.
 *
 * Returns [] (no access) when:
 *   - profile is null/undefined (not signed in)
 *   - profile.is_active === false (deactivated account)
 *   - profile.role is not a recognised role string
 */
export function derivePermissions(profile) {
  if (!profile) return [];
  if (profile.is_active === false) return [];
  if (!isKnownRole(profile.role)) return [];
  return getRolePermissions(profile.role);
}

/**
 * Returns true if `permissions` array includes ALL of the supplied keys.
 */
export function hasPermission(permissions, key) {
  return Array.isArray(permissions) && permissions.includes(key);
}

/**
 * Returns true if `permissions` includes at least one key from `keys`.
 */
export function hasAnyPermission(permissions, keys) {
  return Array.isArray(keys) && keys.some(k => hasPermission(permissions, k));
}

/**
 * Returns true if `permissions` includes every key in `keys`.
 */
export function hasAllPermissions(permissions, keys) {
  return Array.isArray(keys) && keys.every(k => hasPermission(permissions, k));
}
