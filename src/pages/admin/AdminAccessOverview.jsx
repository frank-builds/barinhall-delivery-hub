// AdminAccessOverview — index page for /admin.
//
// Plain-English shared-app framing copy + a card per role with description
// and the active permissions it currently grants. Internal vs client roles
// are visually grouped so the "one app, two audiences" model is obvious.

import { Link } from 'react-router-dom';
import { ROLES } from '../../data/roles.js';
import { getPermissionMeta, isActivePermission } from '../../data/permissions.js';
import { Badge } from '../../components/Badge.jsx';

function RoleCard({ role }) {
  const activePerms = role.permissions.filter(isActivePermission);
  const futureCount = role.permissions.length - activePerms.length;

  return (
    <div className="bh-card px-4 py-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{role.label}</p>
          <code className="text-[11px] font-mono text-slate-400">{role.key}</code>
        </div>
        {role.key === 'platform_admin' && (
          <Badge tone="brand" className="text-[10px]">Admin tier</Badge>
        )}
      </div>
      <p className="text-sm text-slate-600 leading-snug mb-3">{role.description}</p>

      <p className="bh-section-label mb-1.5">Active capabilities</p>
      {activePerms.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No active permissions.</p>
      ) : (
        <ul className="text-xs text-slate-600 space-y-0.5">
          {activePerms.map(key => {
            const meta = getPermissionMeta(key);
            return (
              <li key={key} className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                <span>{meta?.label ?? key}</span>
                <code className="ml-auto text-[10px] font-mono text-slate-300">{key}</code>
              </li>
            );
          })}
        </ul>
      )}

      {futureCount > 0 && (
        <p className="text-[11px] text-slate-400 mt-2 italic">
          + {futureCount} permission{futureCount !== 1 ? 's' : ''} reserved for Sprint D2
        </p>
      )}
    </div>
  );
}

export function AdminAccessOverview() {
  const internalRoles = ROLES.filter(r => r.key === 'platform_admin' || r.key.startsWith('internal_'));
  const clientRoles   = ROLES.filter(r => r.key.startsWith('client_'));

  return (
    <div className="space-y-8">

      {/* ── Shared-app framing copy ── */}
      <section className="bh-card px-5 py-5">
        <p className="bh-section-label mb-2">How shared access works</p>
        <p className="text-sm text-slate-700 leading-relaxed mb-2">
          The Delivery Hub is a single application used by both the Barinhall
          team and the clients we work with. There is no separate client portal
          — instead, every user sees a version of the app shaped by the role
          they hold. Internal consultants get full delivery tooling; clients
          see a narrower, read-focused experience for the engagements they’re
          attached to.
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          Roles describe <em>what someone can do</em> across the app.
          Per-engagement scoping (which engagements a client can see) lands in
          a future sprint. In the meantime, role-level capabilities are
          enforced everywhere they are gated.
        </p>
      </section>

      {/* ── Internal roles ── */}
      <section>
        <h2 className="font-semibold text-slate-800 mb-3">Internal roles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {internalRoles.map(role => (
            <RoleCard key={role.key} role={role} />
          ))}
        </div>
      </section>

      {/* ── Client roles ── */}
      <section>
        <h2 className="font-semibold text-slate-800 mb-3">Client roles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {clientRoles.map(role => (
            <RoleCard key={role.key} role={role} />
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3 leading-snug">
          Client-side roles currently grant app-level capabilities only.
          Per-engagement assignment — which engagements a specific client user
          can see — is implemented in Sprint D2.
        </p>
      </section>

      {/* ── Operational notes ── */}
      <section className="bh-card px-5 py-4">
        <p className="bh-section-label mb-2">Operational notes</p>
        <ul className="text-sm text-slate-600 space-y-1.5 leading-snug list-disc list-inside">
          <li>
            New users are auto-provisioned with the <code className="text-xs">internal_consultant</code> role
            on their first sign-in. A platform admin can change the role
            in <Link to="/admin/users" className="text-indigo-600 hover:underline">Users</Link> after that.
          </li>
          <li>
            Deactivating an account (<code className="text-xs">is_active = false</code>) immediately
            revokes all permissions, regardless of role.
          </li>
          <li>
            Role → permission mappings are defined in the codebase
            (<code className="text-xs">src/data/roles.js</code>). Changing them is a code change,
            not a runtime configuration.
          </li>
        </ul>
      </section>
    </div>
  );
}
