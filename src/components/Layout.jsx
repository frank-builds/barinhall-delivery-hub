import { NavBar } from './NavBar.jsx';

export function Layout({ children }) {
  return (
    /* slate-50 matches the CSS token --bh-bg; slightly cooler than gray-50 */
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
