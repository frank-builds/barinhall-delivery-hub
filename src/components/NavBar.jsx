import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const NAV_LINKS = [
  { to: '/',          label: 'Dashboard' },
  { to: '/templates', label: 'Templates' },
  { to: '/digest',    label: 'Digest' },
];

export function NavBar() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  function isActive(to) {
    return to === '/' ? pathname === '/' : pathname.startsWith(to);
  }

  const linkClass = (to) =>
    `text-sm font-medium transition-colors ${
      isActive(to) ? 'text-indigo-700' : 'text-gray-500 hover:text-gray-800'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200">
      {/* ── Desktop / top bar ── */}
      <div className="px-6 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-indigo-700 text-lg tracking-tight">
          Barinhall Delivery Hub
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <Link key={link.to} to={link.to} className={linkClass(link.to)}>
              {link.label}
            </Link>
          ))}
          {user && (
            <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
              <span className="text-xs text-gray-400">{user.email}</span>
              <button
                onClick={signOut}
                className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? (
            /* X icon */
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            /* Hamburger icon */
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile dropdown menu ── */}
      {open && (
        <div className="md:hidden border-t border-gray-100 px-6 py-3 flex flex-col gap-3 bg-white">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={linkClass(link.to)}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <span className="text-xs text-gray-400">{user.email}</span>
              <button
                onClick={() => { setOpen(false); signOut(); }}
                className="text-sm text-left text-gray-500 hover:text-gray-800 transition-colors"
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
