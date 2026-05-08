/**
 * Sprint D2 — CRM-lite page shell.
 *
 * Provides:
 *   - Page-level guard: users without `crm.read` see AccessDenied.
 *   - Sub-nav (Overview / Accounts / Contacts / Opportunities).
 *   - SchemaMissing banner if the migration hasn't been applied yet.
 *   - Generic error banner for other DB failures.
 *
 * Mirrors the structure of `src/pages/admin/AdminLayout.jsx` deliberately so
 * the two surfaces feel consistent.
 */
import { Outlet, NavLink } from 'react-router-dom';
import { useAuthz } from '../../hooks/useAuthz.js';
import { useCRM }   from '../../hooks/useCRM.js';

const CRM_NAV = [
  { to: '/crm',                label: 'Overview',      end: true },
  { to: '/crm/accounts',       label: 'Accounts'                 },
  { to: '/crm/contacts',       label: 'Contacts'                 },
  { to: '/crm/opportunities',  label: 'Opportunities'            },
];

function SchemaMissingBanner() {
  return (
    <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
      <strong className="font-semibold">CRM tables not found.</strong>{' '}
      Apply <code className="font-mono text-xs bg-amber-100 px-1 rounded">supabase/migrations/0002_crm_lite.sql</code>{' '}
      in the Supabase SQL editor to create <code className="font-mono text-xs">crm_accounts</code>,{' '}
      <code className="font-mono text-xs">crm_contacts</code>, and{' '}
      <code className="font-mono text-xs">crm_opportunities</code>. The seed snippet at the bottom of
      that file populates demo records.
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
      <strong className="font-semibold">CRM data failed to load.</strong>{' '}
      {message}
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
          You don't have permission to view the CRM module. Contact a platform admin if you think this is an error.
        </p>
      </div>
    </div>
  );
}

export function CRMLayout() {
  const { can, loading: authzLoading } = useAuthz();
  const { schemaMissing, error }       = useCRM();

  // Avoid a flash of "Access denied" while authz is still resolving
  if (authzLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!can('crm.read')) {
    return <AccessDenied />;
  }

  return (
    <div className="max-w-5xl">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1>CRM</h1>
        <p className="text-slate-500 text-sm mt-1">
          Pre-engagement pipeline — accounts, contacts, and opportunities.
        </p>
      </div>

      {/* ── Sub-nav ── */}
      <nav className="flex gap-1 mb-6 border-b border-slate-200 pb-px overflow-x-auto">
        {CRM_NAV.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `px-3 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2 -mb-px whitespace-nowrap ${
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

      {/* ── Banners ── */}
      {schemaMissing && <SchemaMissingBanner />}
      {!schemaMissing && error && <ErrorBanner message={error} />}

      {/* ── Page content ── */}
      <Outlet />
    </div>
  );
}
