/**
 * Sprint D1 + D1.1 — Admin section shell.
 *
 * Guards: renders an "Access Denied" panel if the user lacks admin.access.read.
 * Banners:
 *   FallbackBanner     — shown when the DB is unreachable (isFallback = true).
 *   BootstrapBanner    — shown when role is coming from VITE_PLATFORM_ADMIN_EMAIL
 *                        rather than the database (bootstrapOverride = true).
 *                        These two conditions are mutually exclusive in practice
 *                        but coded as independent guards for clarity.
 */
import { Outlet, NavLink } from 'react-router-dom';
import { useAuthz } from '../../hooks/useAuthz.js';

const ADMIN_NAV = [
  { to: '/admin',       label: 'Overview', end: true },
  { to: '/admin/users', label: 'Users'               },
  { to: '/admin/roles', label: 'Roles'                },
];

function FallbackBanner({ reason }) {
  return (
    <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
      <strong className="font-semibold">Database unavailable.</strong>{' '}
      Displaying cached / fallback data.{reason ? ` (${reason})` : ''}
    </div>
  );
}

function BootstrapBanner() {
  return (
    <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
      <strong className="font-semibold">Bootstrap admin override active.</strong>{' '}
      Your role is taken from <code className="font-mono text-xs bg-amber-100 px-1 rounded">VITE_PLATFORM_ADMIN_EMAIL</code>,
      not the database. To make this permanent, apply the seed SQL in{' '}
      <code className="font-mono text-xs bg-amber-100 px-1 rounded">supabase/migrations/0001_user_profiles.sql</code>.
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center max-w-sm space-y-3 px-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-slate-800">Access denied</h2>
        <p className="text-sm text-slate-500">
          You don't have permission to view admin pages. Contact a platform admin if you think this is an error.
        </p>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const { can, loading, isFallback, fallbackReason, bootstrapOverride } = useAuthz();

  // Show nothing while auth resolves to avoid a flash of the denied state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!can('admin.access.read')) {
    return <AccessDenied />;
  }

  return (
    <div className="max-w-4xl">
      {/* ── Banners ── */}
      {isFallback    && <FallbackBanner reason={fallbackReason} />}
      {bootstrapOverride && !isFallback && <BootstrapBanner />}

      {/* ── Header ── */}
      <div className="mb-6">
        <h1>Admin</h1>
        <p className="text-slate-500 text-sm mt-1">
          Platform access, users, and role configuration.
        </p>
      </div>

      {/* ── Sub-nav ── */}
      <nav className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
        {ADMIN_NAV.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `px-3 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2 -mb-px ${
                isActive
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* ── Page content ── */}
      <Outlet />
    </div>
  );
}
