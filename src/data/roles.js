/**
 * Sprint D1 — role definitions and permission assignments.
 *
 * Roles (6):
 *   platform_admin        — full access to everything
 *   internal_consultant   — default internal role; all active perms + future CRM/workflow
 *   internal_reviewer     — read-only internal; can export outputs
 *   client_admin          — engagement read + output read/export
 *   client_collaborator   — engagement read + output read
 *   client_viewer         — engagement read + output read (no export)
 *
 * Only platform_admin holds admin.* permissions.
 * is_active=false lockout is enforced in derivePermissions (authz.js), not here.
 */
import { PERMISSION_KEYS } from './permissions.js';

export const DEFAULT_ROLE = 'internal_consultant';

export const ROLES = [
  'platform_admin',
  'internal_consultant',
  'internal_reviewer',
  'client_admin',
  'client_collaborator',
  'client_viewer',
];

/** Human-readable labels for each role */
export const ROLE_LABELS = {
  platform_admin:       'Platform Admin',
  internal_consultant:  'Internal Consultant',
  internal_reviewer:    'Internal Reviewer',
  client_admin:         'Client Admin',
  client_collaborator:  'Client Collaborator',
  client_viewer:        'Client Viewer',
};

/**
 * Permission sets per role.
 * Listed explicitly so that adding a new perm requires a deliberate choice here.
 */
export const ROLE_PERMISSIONS = {
  platform_admin: PERMISSION_KEYS, // all perms, present and future

  internal_consultant: [
    'engagements.read',
    'engagements.write',
    'engagements.delete',
    'outputs.read',
    'outputs.write',
    'outputs.export',
    'templates.read',
    'library.read',
    'digest.read',
    // future
    'crm.read',
    'crm.write',
    'workflows.read',
    'workflows.execute',
    'client_files.upload',
  ],

  internal_reviewer: [
    'engagements.read',
    'outputs.read',
    'outputs.export',
    'templates.read',
    'library.read',
    'digest.read',
    // future
    'crm.read',
    'workflows.read',
    'client_files.upload',
  ],

  client_admin: [
    'engagements.read',
    'outputs.read',
    'outputs.export',
    // future
    'crm.read',
    'client_files.upload',
  ],

  client_collaborator: [
    'engagements.read',
    'outputs.read',
    // future
    'client_files.upload',
  ],

  client_viewer: [
    'engagements.read',
    'outputs.read',
  ],
};

/** Returns true if `role` is a recognised role string */
export function isKnownRole(role) {
  return ROLES.includes(role);
}

/** Returns true if `role` is an admin-level role (has admin.access.read) */
export function isAdminRole(role) {
  return !!(role && ROLE_PERMISSIONS[role]?.includes('admin.access.read'));
}

/** Returns the permission array for a role, or [] for unknown roles */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] ?? [];
}
