import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEngagements } from '../hooks/useEngagements.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { saveEngagement } from '../lib/engagementsApi.js';
import { EngagementCard } from '../components/EngagementCard.jsx';

const LOCAL_KEY = 'barinhall_engagements';

export function Dashboard() {
  const { engagements, loading } = useEngagements();
  const { user } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);

  const active = engagements.filter(e => e.status === 'Active' || e.status === 'Draft');

  const localData = (() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const hasMigratable = Array.isArray(localData) && localData.length > 0 && !migrated;

  async function handleMigrate() {
    if (!user || !localData) return;
    setMigrating(true);
    try {
      await Promise.all(localData.map(eng => saveEngagement(eng, user.id)));
      localStorage.removeItem(LOCAL_KEY);
      setMigrated(true);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Migration failed: ' + err.message);
    } finally {
      setMigrating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Loading engagements…
      </div>
    );
  }

  return (
    <div>
      {hasMigratable && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800">
            You have <strong>{localData.length}</strong> engagement{localData.length !== 1 ? 's' : ''} stored locally. Migrate them to the cloud to access them on any device.
          </p>
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="flex-shrink-0 bg-amber-600 text-white text-sm font-medium rounded-md px-3 py-1.5 hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {migrating ? 'Migrating…' : 'Migrate now'}
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {active.length} active engagement{active.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/engagements/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + New Engagement
        </Link>
      </div>

      {active.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">No active engagements</p>
          <Link to="/engagements/new" className="text-indigo-600 hover:underline text-sm">
            Create your first engagement →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {active.map(e => (
            <EngagementCard key={e.id} engagement={e} />
          ))}
        </div>
      )}
    </div>
  );
}
