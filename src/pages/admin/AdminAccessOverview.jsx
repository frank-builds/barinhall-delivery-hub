/**
 * Sprint D1 — /admin (index) — Access Overview page.
 *
 * Explains the shared-app RBAC model:
 *   • What the 6 roles mean
 *   • Which surfaces each role can reach
 *   • Operational notes for the dev period
 */
import { ROLES, ROLE_LABELS, ROLE_PERMISSIONS } from '../../data/roles.js';
import { PERMISSIONS } from '../../data/permissions.js';
import { useAuthz } from '../../hooks/useAuthz.js';

/** Groups permissions by their `group` field for the overview matrix */
function groupPermissions(perms) {
  const map = {};
  for (const p of perms) {
    if (!map[p.group]) map[p.group] = [];
    map[p.group].push(p);
  }
  return map;
}

const ACTIVE_PERMS   = PERMISSIONS.filter(p => !p.future);
const PERM_GROUPS    = groupPermissions(ACTIVE_PERMS);
const GROUP_ORDER    = [...new Set(ACTIVE_PERMS.map(p => p.group))];

function CheckMark() {
  return (
    <span className="text-emerald-500 font-bold" aria-label="yes">✓</span>
  );
}

function Dash() {
  return (
    <span className="text-slate-300" aria-label="no">—</span>
  );
}

export function AdminAccessOverview() {
  const { role, bootstrapOverride } = useAuthz();

  return (
    <div className="space-y-8">

      {/* ── Current session ── */}
      <section className="bh-card px-5 py-4">
        <p className="bh-section-label mb-2">Current session</p>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-slate-700">
            Signed in as <strong>{ROLE_LABELS[role] ?? role ?? '—'}</strong>
          </span>
          {bootstrapOverride && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
              Bootstrap override
            </span>
          )}
        </div>
      </section>

      {/* ── Role cards ── */}
      <section>
        <h2 className="font-semibold text-slate-800 mb-4">Role definitions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ROLES.map(r => {
            const perms = (ROLE_PERMISSIONS[r] ?? []).filter(k =>
              ACTIVE_PERMS.some(p => p.key === k)
            );
            return (
              <div key={r} className="bh-card px-4 py-3.5">
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  {ROLE_LABELS[r]}
                  {r === role && (
                    <span className="ml-2 text-xs font-normal text-indigo-600">(you)</span>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  {perms.length} active permission{perms.length !== 1 ? 's' : ''}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Permission matrix ── */}
      <section>
        <h2 className="font-semibold text-slate-800 mb-4">Active permission matrix</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs whitespace-nowrap">
                  Permission
                </th>
                {ROLES.map(r => (
                  <th key={r} className="px-3 py-2.5 font-semibold text-slate-600 text-xs text-center whitespace-nowrap">
                    {ROLE_LABELS[r].replace('Internal ', 'Int. ').replace('Client ', 'Cl. ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GROUP_ORDER.map(group => (
                <>
                  <tr key={`${group}-header`} className="bg-slate-50/60">
                    <td
                      colSpan={ROLES.length + 1}
                      className="px-4 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-t border-slate-100"
                    >
                      {group}
                    </td>
                  </tr>
                  {PERM_GROUPS[group].map(perm => (
                    <tr key={perm.key} className="border-t border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 text-slate-700 text-xs font-medium whitespace-nowrap">
                        {perm.label}
                      </td>
                      {ROLES.map(r => {
                        const has = (ROLE_PERMISSIONS[r] ?? []).includes(perm.key);
                        return (
                          <td key={r} className="px-3 py-2.5 text-center">
                            {has ? <CheckMark /> : <Dash />}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Future permissions (CRM, Workflows, Files) are reserved for D2+ and not shown here.
        </p>
      </section>

      {/* ── Operational notes ── */}
      <section className="bh-card px-5 py-4 space-y-3">
        <p className="bh-section-label">Operational notes — Sprint D1</p>
        <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
          <li>
            Role changes take effect immediately for the affected user's next page load.
          </li>
          <li>
            Deactivating a user (<code className="text-xs font-mono bg-slate-100 px-1 rounded">is_active = false</code>)
            locks out all permissions until reactivated; the bootstrap admin override is unaffected.
          </li>
          <li>
            Only <strong>platform_admin</strong> can reach the Admin section; all other
            roles see an "Access denied" page.
          </li>
          <li>
            The bootstrap admin override (controlled by{' '}
            <code className="text-xs font-mono bg-slate-100 px-1 rounded">VITE_PLATFORM_ADMIN_EMAIL</code>)
            is a dev-only escape hatch. Leave blank in production.
          </li>
          <li>
            CRM, Workflow, and File permission gates are reserved for Sprint D2 and
            are currently assigned but never enforced.
          </li>
        </ul>
      </section>
    </div>
  );
}
