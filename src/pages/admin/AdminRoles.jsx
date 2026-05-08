// AdminRoles — read-focused matrix of roles × permissions.
//
// Active permissions are rendered first (grouped by `permissions.js` group),
// followed by a visually-distinct "Reserved (Sprint D2+)" section for the
// future-flagged keys so it's obvious they don't gate any UI yet.
//
// The role→permission mapping is defined in src/data/roles.js. Editing it
// is a code change, called out at the bottom of the page.

import { ROLES } from '../../data/roles.js';
import {
  ACTIVE_PERMISSIONS, FUTURE_PERMISSIONS, groupPermissions,
} from '../../data/permissions.js';
import { hasPermission } from '../../lib/authz.js';
import { Badge } from '../../components/Badge.jsx';

function MatrixCell({ granted }) {
  return (
    <td className="px-3 py-2 text-center">
      {granted
        ? <span className="text-emerald-600 font-semibold">✓</span>
        : <span className="text-slate-300">—</span>}
    </td>
  );
}

function MatrixSection({ title, subtitle, permissions, dimmed = false }) {
  if (permissions.length === 0) return null;
  const groups = groupPermissions(permissions);

  return (
    <section className={`mb-8 ${dimmed ? 'opacity-80' : ''}`}>
      <div className="flex items-baseline gap-2 mb-3">
        <h2 className="font-semibold text-slate-800">{title}</h2>
        {subtitle && (
          <p className="text-xs text-slate-400 italic">{subtitle}</p>
        )}
      </div>

      <div className="bh-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-2.5 bh-section-label sticky left-0 bg-slate-50">
                Permission
              </th>
              {ROLES.map(role => (
                <th key={role.key} className="px-3 py-2.5 bh-section-label whitespace-nowrap">
                  {role.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(groups).map(([groupName, perms]) => (
              <>
                <tr key={`group-${groupName}`}>
                  <td
                    colSpan={1 + ROLES.length}
                    className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-white border-b border-slate-100"
                  >
                    {groupName}
                  </td>
                </tr>
                {perms.map(perm => (
                  <tr key={perm.key} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2 sticky left-0 bg-white">
                      <div className="text-sm text-slate-700">{perm.label}</div>
                      <code className="text-[10px] font-mono text-slate-400">{perm.key}</code>
                    </td>
                    {ROLES.map(role => (
                      <MatrixCell
                        key={`${role.key}:${perm.key}`}
                        granted={hasPermission(role.key, perm.key)}
                      />
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AdminRoles() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline gap-3">
        <h2 className="font-semibold text-slate-800">Roles &amp; Permissions</h2>
        <Badge tone="muted" className="text-[10px]">Read-only</Badge>
        <p className="text-xs text-slate-400 ml-auto">
          Mapping is defined in <code className="font-mono">src/data/roles.js</code>
        </p>
      </div>

      <MatrixSection
        title="Active permissions"
        subtitle="Gated by D1 UI"
        permissions={ACTIVE_PERMISSIONS}
      />

      <MatrixSection
        title="Reserved (Sprint D2+)"
        subtitle="Declared but not gated by D1 UI"
        permissions={FUTURE_PERMISSIONS}
        dimmed
      />

      <div className="bh-card px-4 py-3.5 text-xs text-slate-500 leading-snug">
        <p className="mb-1">
          <strong className="text-slate-700">How to change role capabilities.</strong>{' '}
          Edit the <code className="font-mono">permissions</code> array on the
          relevant role in <code className="font-mono">src/data/roles.js</code>,
          then redeploy. No DB change is required for permission changes.
        </p>
        <p>
          To add a new permission, add an entry to{' '}
          <code className="font-mono">src/data/permissions.js</code>, then
          reference it in any roles that should hold it.
        </p>
      </div>
    </div>
  );
}
