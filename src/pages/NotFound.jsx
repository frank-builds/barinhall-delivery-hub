import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="text-6xl font-bold text-slate-100 mb-4">404</p>
      <p className="text-slate-500 mb-6">Page not found.</p>
      <Link to="/" className="text-indigo-600 hover:underline text-sm">← Back to Dashboard</Link>
    </div>
  );
}
