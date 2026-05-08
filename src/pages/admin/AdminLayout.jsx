// AdminLayout — sub-nav and route guard for the /admin/* module.
//
// Renders an "Access denied" panel for non-admins instead of redirecting, so
// deep links don't bounce silently. The guard uses the runtime `can()` from
// useAuthz which already enforces the inactive-lockout invariant.

import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuthz } from '../../hooks/useAuthz.js';

const SUB_NAV = [
  { to: '/admin',        label: 'Access Overview',  end: true },
  { to: '/admin/users',  label: 'Users',            end: false },
  { to: '/admin/roles',  label: 'Roles & Permissions', end: false },
];

function FallbackBanner({ reason }) {
  const reasonText = {
    table_missing: 'The user_profiles table is not present in the database — apply migration 0001.',
    rls_denied:    'Supabase row-level security is blocking the profile read — review RLS policies.',
    network:       'The profile lookup failed (network or service error).',
  }[reason] ?? 'The profile lookup failed.';

  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-1">
        Scaffold mode
      </p>
      <p className="text-sm text-amber-900 leading-snug">
        Applying fallback access rules. {reasonText} Real role assignments
        require the table to be reachable.
      </p>
    </div>
  );
}

export function AdminLayout() {
  const { can, loading, isFallback, fallbackReason } = useAuthz();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  if (!can('admin.access.read')) {
    return (
      <div className="max-w-xl">
        <div className="mb-4">
          <Link to="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← Dashboard
          </Link>
        </div>
        <div className="bh-card px-5 py-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Access denied
          </p>
          <h1>Admin module</h1>
          <p className="text-sm text-slate-600 mt-2 leading-snug">
            Your account does not have permission to view the admin module.
            If you think this is a mistake, ask a platform admin to check
            your role and active status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1>Admin</h1>
        <p className="text-sm text-slate-500 mt-1">
          Users, roles, and access for the Delivery Hub.
        </p>
      </div>

      {isFallback && <FallbackBanner reason={fallbackReason} />}

      {/* Sub-nav */}
      <div className="flex flex-wrap gap-1.5 mb-6 border-b border-slate-100 pb-3">
        {SUB_NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
