/**
 * Sprint D1 — /admin/users — User management page.
 *
 * Lists all user_profiles rows. Each row has an inline role selector and
 * is_active toggle with a per-row Save button. Changes do not auto-save.
 *
 * Calls reloadAuthz() after saving the current user's own row so that their
 * nav/permissions update immediately without a full page reload.
 */
import { useEffect, useState, useCallback } from 'react';
import { useAuthz } from '../../hooks/useAuthz.js';
import { fetchAllProfiles, updateProfile } from '../../lib/userProfilesApi.js';
import { ROLES, ROLE_LABELS } from '../../data/roles.js';
import { useAuth } from '../../contexts/AuthContext.jsx';

const SAVE_FLASH_MS = 1800;

function useProfiles() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await fetchAllProfiles();
    if (err) {
      setError(err.message ?? 'Failed to load profiles');
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { rows, loading, error, reload };
}

function UserRow({ row, currentUserId, onSaved }) {
  const [role,     setRole]     = useState(row.role);
  const [active,   setActive]   = useState(row.is_active !== false);
  const [saving,   setSaving]   = useState(false);
  const [flash,    setFlash]    = useState(null); // 'saved' | 'error'
  const [errMsg,   setErrMsg]   = useState('');

  const isDirty = role !== row.role || active !== (row.is_active !== false);

  async function handleSave() {
    setSaving(true);
    setFlash(null);
    const { error } = await updateProfile(row.user_id, { role, is_active: active });
    setSaving(false);
    if (error) {
      setErrMsg(error.message ?? 'Save failed');
      setFlash('error');
    } else {
      setFlash('saved');
      onSaved({ ...row, role, is_active: active });
      setTimeout(() => setFlash(null), SAVE_FLASH_MS);
    }
  }

  function handleRevert() {
    setRole(row.role);
    setActive(row.is_active !== false);
    setFlash(null);
  }

  const isSelf = row.user_id === currentUserId;

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50/50">
      {/* Email */}
      <td className="px-4 py-3 text-sm text-slate-700 max-w-[200px]">
        <span className="truncate block" title={row.email ?? row.user_id}>
          {row.email ?? <span className="text-slate-400 italic">—</span>}
        </span>
        {isSelf && (
          <span className="text-xs text-indigo-500 font-medium">(you)</span>
        )}
      </td>

      {/* Display name */}
      <td className="px-4 py-3 text-sm text-slate-600 max-w-[160px]">
        <span className="truncate block">
          {row.display_name ?? <span className="text-slate-300 italic">—</span>}
        </span>
      </td>

      {/* Role select */}
      <td className="px-4 py-3">
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="bh-input text-xs py-1 w-auto"
        >
          {ROLES.map(r => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </td>

      {/* Active toggle */}
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => setActive(v => !v)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
            active ? 'bg-indigo-600' : 'bg-slate-200'
          }`}
          aria-label={active ? 'Deactivate user' : 'Activate user'}
          role="switch"
          aria-checked={active}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              active ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right whitespace-nowrap">
        {flash === 'saved' && (
          <span className="text-xs text-emerald-600 font-medium mr-3">Saved ✓</span>
        )}
        {flash === 'error' && (
          <span className="text-xs text-red-600 mr-3" title={errMsg}>Error</span>
        )}
        {isDirty && !saving && (
          <>
            <button
              onClick={handleRevert}
              className="text-xs text-slate-400 hover:text-slate-600 mr-3 transition-colors"
            >
              Revert
            </button>
            <button
              onClick={handleSave}
              className="bh-btn-primary text-xs py-1 px-3"
            >
              Save
            </button>
          </>
        )}
        {saving && (
          <span className="text-xs text-slate-400">Saving…</span>
        )}
      </td>
    </tr>
  );
}

export function AdminUsers() {
  const { user } = useAuth();
  const { reloadAuthz } = useAuthz();
  const { rows, loading, error, reload } = useProfiles();

  function handleRowSaved(updated) {
    // If the admin just saved their own row, refresh the authz context
    // so nav links and permission gates update without a page reload.
    if (updated.user_id === user?.id) {
      reloadAuthz();
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400 py-10 text-center">Loading users…</p>;
  }

  if (error) {
    return (
      <div className="bh-card px-5 py-4">
        <p className="text-sm text-red-700 mb-3">Failed to load users: {error}</p>
        <button onClick={reload} className="bh-btn-secondary text-sm">Retry</button>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bh-card px-5 py-10 text-center">
        <p className="text-sm text-slate-400">No user profiles found.</p>
        <p className="text-xs text-slate-400 mt-1">
          Profiles are created automatically on first sign-in.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">
          Users
          <span className="ml-2 text-sm font-normal text-slate-400 tabular-nums">
            {rows.length}
          </span>
        </h2>
        <button onClick={reload} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Email</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Display name</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Role</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Active</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <UserRow
                key={row.user_id}
                row={row}
                currentUserId={user?.id}
                onSaved={handleRowSaved}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        Changes are saved per-row. Reactivating a deactivated user restores their assigned role permissions immediately on their next page load.
      </p>
    </div>
  );
}
