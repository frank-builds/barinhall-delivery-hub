import { NavBar } from './NavBar.jsx';
import { useAuthz } from '../hooks/useAuthz.js';

/**
 * Shown when the user's profile exists but is_active = false and the
 * bootstrap override is NOT in effect. Covers the entire viewport so
 * the user cannot interact with any feature.
 */
function DeactivatedBanner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-sm text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-slate-800">Account deactivated</h2>
        <p className="text-sm text-slate-500">
          Your account has been deactivated. Contact a platform admin to restore access.
        </p>
      </div>
    </div>
  );
}

export function Layout({ children }) {
  const { loading, profile, isActive, bootstrapOverride } = useAuthz();

  // Show deactivated banner only when:
  //   - profile loaded (not null, not still loading)
  //   - is_active is explicitly false
  //   - bootstrap override is NOT active (the override always re-activates)
  const showDeactivated =
    !loading && profile !== null && !isActive && !bootstrapOverride;

  return (
    /* slate-50 matches the CSS token --bh-bg; slightly cooler than gray-50 */
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {showDeactivated ? <DeactivatedBanner /> : children}
      </main>
    </div>
  );
}
