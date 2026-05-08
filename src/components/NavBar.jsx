import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAuthz } from '../hooks/useAuthz.js';

// Links always visible to authenticated users
const BASE_NAV_LINKS = [
  { to: '/',          label: 'Dashboard' },
  { to: '/templates', label: 'Playbooks' },
  { to: '/library',   label: 'Library'   },
  { to: '/digest',    label: 'Digest'    },
];

// Links shown only when the user holds the required permission
const GATED_NAV_LINKS = [
  { to: '/crm',   label: 'CRM',   perm: 'crm.read'          },
  { to: '/admin', label: 'Admin', perm: 'admin.access.read' },
];

export function NavBar() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { can } = useAuthz();
  const [open, setOpen] = useState(false);

  // Merge base + permitted gated links
  const navLinks = [
    ...BASE_NAV_LINKS,
    ...GATED_NAV_LINKS.filter(link => can(link.perm)),
  ];

  function isActive(to) {
    return to === '/' ? pathname === '/' : pathname.startsWith(to);
  }

  return (
    /* sticky so the nav stays visible while scrolling long engagement pages */
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">

      {/* ── Desktop bar ── */}
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-6">

        {/* Brand mark — logo image + "Delivery Hub" wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 flex-shrink-0 group"
          aria-label="Barinhall Delivery Hub — home"
        >
          <img
            src="/barinhall-logo.png"
            alt="Barinhall"
            className="h-8 w-auto object-contain"
          />
          <span className="hidden sm:block text-sm font-semibold text-slate-700 tracking-tight group-hover:text-indigo-700 transition-colors">
            Delivery Hub
          </span>
        </Link>

        {/* Primary nav links */}
        <div className="hidden md:flex items-center gap-0.5 flex-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User meta + sign-out */}
        {user && (
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200 flex-shrink-0">
            <span className="text-xs text-slate-400 truncate max-w-[160px]" title={user.email}>
              {user.email}
            </span>
            <button
              onClick={signOut}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile dropdown ── */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <div className="pt-3 mt-1 border-t border-slate-100 px-1 space-y-2">
              <p className="text-xs text-slate-400">{user.email}</p>
              <button
                onClick={() => { setOpen(false); signOut(); }}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
