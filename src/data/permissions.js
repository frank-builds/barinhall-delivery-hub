/**
 * Sprint D1 — canonical permission registry.
 *
 * Each entry has:
 *   key    — the string used in ROLE_PERMISSIONS maps and PermissionGate props
 *   label  — human-readable name shown in AdminRoles
 *   group  — used to group rows in the admin matrix
 *   future — (optional) true when the perm is reserved for a later sprint;
 *             UI shows it dimmed and never actively gates anything in D1.
 */
export const PERMISSIONS = [
  // ── Admin ────────────────────────────────────────────────────────────────
  { key: 'admin.users.manage',  label: 'Manage users',          group: 'Admin' },
  { key: 'admin.roles.manage',  label: 'Manage roles',          group: 'Admin' },
  { key: 'admin.access.read',   label: 'View access overview',  group: 'Admin' },

  // ── Engagements ──────────────────────────────────────────────────────────
  { key: 'engagements.read',    label: 'Read engagements',      group: 'Engagements' },
  { key: 'engagements.write',   label: 'Edit engagements',      group: 'Engagements' },
  { key: 'engagements.delete',  label: 'Delete engagements',    group: 'Engagements' },

  // ── Outputs ──────────────────────────────────────────────────────────────
  { key: 'outputs.read',        label: 'Read outputs',              group: 'Outputs' },
  { key: 'outputs.write',       label: 'Generate / mark ready',     group: 'Outputs' },
  { key: 'outputs.export',      label: 'Export outputs',            group: 'Outputs' },

  // ── Reference ────────────────────────────────────────────────────────────
  { key: 'templates.read',      label: 'View playbooks',            group: 'Reference' },
  { key: 'library.read',        label: 'View use-case library',     group: 'Reference' },
  { key: 'digest.read',         label: 'View weekly digest',        group: 'Reference' },

  // ── Future (D2+) — never actively gated in D1 UI ─────────────────────────
  { key: 'crm.read',            label: 'Read CRM records',          group: 'CRM',       future: true },
  { key: 'crm.write',           label: 'Edit CRM records',          group: 'CRM',       future: true },
  { key: 'workflows.read',      label: 'View workflows',            group: 'Workflows', future: true },
  { key: 'workflows.execute',   label: 'Execute workflows',         group: 'Workflows', future: true },
  { key: 'client_files.upload', label: 'Upload client files',       group: 'Files',     future: true },
];

/** All active permission keys (non-future) */
export const ACTIVE_PERMISSION_KEYS = PERMISSIONS
  .filter(p => !p.future)
  .map(p => p.key);

/** Every permission key (including future) */
export const PERMISSION_KEYS = PERMISSIONS.map(p => p.key);
