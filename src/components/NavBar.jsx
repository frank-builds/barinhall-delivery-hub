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

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="font-bold text-indigo-700 text-lg tracking-tight">
        Barinhall Delivery Hub
      </Link>
      <div className="flex items-center gap-6">
        {NAV_LINKS.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`text-sm font-medium transition-colors ${
              pathname === link.to
                ? 'text-indigo-700'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {link.label}
          </Link>
        ))}
        {user && (
          <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
            <span className="text-xs text-gray-400 hidden sm:inline">{user.email}</span>
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
