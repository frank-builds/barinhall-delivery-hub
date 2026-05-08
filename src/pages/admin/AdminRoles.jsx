/**
 * Sprint D1 — /admin/roles — Role definitions and permission matrix.
 *
 * Read-only in D1 — roles and their permission assignments are defined in
 * src/data/roles.js. Editing is a D2+ feature.
 *
 * Layout:
 *   Active permissions matrix (all non-future perms × all 6 roles)
 *   Dimmed "Reserved D2+" section (future perms)
 */
import { ROLES, ROLE_LABELS, ROLE_PERMISSIONS } from '../../data/roles.js';
import { PERMISSIONS } from '../../data/permissions.js';
import { useAuthz } from '../../hooks/useAuthz.js';

const ACTIVE_PERMS = PERMISSIONS.filter(p => !p.future);
const FUTURE_PERMS = PERMISSIONS.filter(p =>  p.future);

/** Returns sorted unique group names for a permission list */
function groups(perms) {
  return [...new Set(perms.map(p => p.group))];
}

function CheckMark() {
  return <span className="text-emerald-500 font-bold" aria-label="yes">✓</span>;
}
function Dash({ dimmed }) {
  return (
    <span className={dimmed ? 'text-slate-200' : 'text-slate-300'} aria-label="no">—</span>
  );
}

function PermMatrix({ perms, dimmed = false }) {
  const groupList = groups(perms);
  const byGroup   = Object.fromEntries(
    groupList.map(g => [g, perms.filter(p => p.group === g)])
  );

  return (
    <div className={`overflow-x-auto rounded-xl border ${dimmed ? 'border-slate-100' : 'border-slate-200'}`}>
      <table className={`w-full text-sm border-collapse ${dimmed ? 'opacity-50' : ''}`}>
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 whitespace-nowrap">
              Permission
            </th>
            {ROLES.map(r => (
              <th key={r} className="px-3 py-2.5 text-xs font-semibold text-slate-500 text-center whitespace-nowrap">
                {ROLE_LABELS[r]
                  .replace('Internal ', 'Int. ')
                  .replace('Client ', 'Cl. ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groupList.map(group => (
            <>
              <tr key={`${group}-hdr`} className="bg-slate-50/60">
                <td
                  colSpan={ROLES.length + 1}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-t border-slate-100"
                >
                  {group}
                </td>
              </tr>
              {byGroup[group].map(perm => (
                <tr key={perm.key} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                    {perm.label}
                    <code className="ml-1.5 text-[10px] text-slate-400 font-mono">{perm.key}</code>
                  </td>
                  {ROLES.map(r => {
                    const has = (ROLE_PERMISSIONS[r] ?? []).includes(perm.key);
                    return (
                      <td key={r} className="px-3 py-2.5 text-center">
                        {has ? <CheckMark /> : <Dash dimmed={dimmed} />}
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
  );
}

export function AdminRoles() {
  const { role } = useAuthz();

  return (
    <div className="space-y-8">

      {/* ── Current role callout ── */}
      <div className="bh-card px-5 py-3.5 flex items-center gap-3">
        <div className="flex-1 text-sm text-slate-700">
          Role definitions are managed in{' '}
          <code className="text-xs font-mono bg-slate-100 px-1 rounded">src/data/roles.js</code>.
          {' '}Editing via UI is planned for Sprint D2.
        </div>
        <span className="flex-shrink-0 text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
          {ROLE_LABELS[role] ?? role}
        </span>
      </div>

      {/* ── Active permissions ── */}
      <section>
        <h2 className="font-semibold text-slate-800 mb-1">Active permissions</h2>
        <p className="text-sm text-slate-400 mb-4">
          {ACTIVE_PERMS.length} permissions currently gating features in the app.
        </p>
        <PermMatrix perms={ACTIVE_PERMS} />
      </section>

      {/* ── Future permissions ── */}
      <section>
        <h2 className="font-semibold text-slate-400 mb-1">Reserved — Sprint D2+</h2>
        <p className="text-sm text-slate-400 mb-4">
          These permissions are assigned to roles but do not gate any feature yet.
        </p>
        <PermMatrix perms={FUTURE_PERMS} dimmed />
      </section>
    </div>
  );
}
