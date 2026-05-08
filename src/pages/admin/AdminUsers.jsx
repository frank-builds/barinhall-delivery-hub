// AdminUsers — list of user_profiles with per-row role assignment and active toggle.
//
// UX rules from the D1 plan:
//   - Sorted by email ascending (server-side; falls back to client-side sort).
//   - Per-row explicit Save: editing the role select or active toggle stages
//     local pending changes; the row's Save button commits. No silent
//     auto-save. A `✓ Saved` flash confirms.
//   - Discard via the "Revert" link, or by reloading the page.
//
// Adding new users is by lazy-provision on their first sign-in — admins
// cannot create profile rows for users who don't yet have an auth account.

import { useEffect, useState, useCallback } from 'react';
import { useAuthz } from '../../hooks/useAuthz.js';
import { fetchAllProfiles, setRole, setActive } from '../../lib/userProfilesApi.js';
import { ROLES, DEFAULT_ROLE } from '../../data/roles.js';
import { Badge } from '../../components/Badge.jsx';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// Has the row been edited from its persisted state?
function isDirty(row) {
  return row.role !== row._origRole || row.is_active !== row._origActive;
}

function UserRow({ row, onLocalChange, onSave, isSelf }) {
  const dirty   = isDirty(row);
  const [saving,    setSaving]    = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error,     setError]     = useState(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(row);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) {
      setError(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function handleRevert() {
    onLocalChange(row.user_id, {
      role:      row._origRole,
      is_active: row._origActive,
    });
    setError(null);
  }

  return (
    <tr className="border-b border-slate-50 last:border-0">
      {/* Email + display name */}
      <td className="px-4 py-3 align-top">
        <p className="text-sm font-medium text-slate-800 truncate" title={row.email ?? ''}>
          {row.email ?? <span className="text-slate-400 italic">no email</span>}
          {isSelf && <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-indigo-500">you</span>}
        </p>
        {row.display_name && row.display_name !== row.email && (
          <p className="text-xs text-slate-500 truncate">{row.display_name}</p>
        )}
        <code className="text-[10px] font-mono text-slate-300 truncate block">{row.user_id}</code>
      </td>

      {/* Role */}
      <td className="px-4 py-3 align-top">
        <select
          value={row.role}
          onChange={e => onLocalChange(row.user_id, { role: e.target.value })}
          className="bh-input w-auto text-xs py-1"
        >
          {ROLES.map(r => (
            <option key={r.key} value={r.key}>{r.label}</option>
          ))}
        </select>
      </td>

      {/* Active */}
      <td className="px-4 py-3 align-top text-center">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!row.is_active}
            onChange={e => onLocalChange(row.user_id, { is_active: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          {row.is_active
            ? <Badge tone="success" className="text-[10px]">Active</Badge>
            : <Badge tone="muted"   className="text-[10px]">Inactive</Badge>}
        </label>
      </td>

      {/* Updated */}
      <td className="px-4 py-3 align-top text-xs text-slate-400 whitespace-nowrap">
        {formatDate(row.updated_at)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-2 justify-end flex-wrap">
          {error && <span className="text-xs text-red-600">{error}</span>}
          {savedFlash && !dirty && (
            <span className="text-xs text-emerald-600 font-medium">✓ Saved</span>
          )}
          {dirty && (
            <button
              type="button"
              onClick={handleRevert}
              disabled={saving}
              className="text-xs text-slate-400 hover:text-slate-600 underline disabled:opacity-40"
            >
              Revert
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="bh-btn-primary text-xs py-1 px-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </td>
    </tr>
  );
}

export function AdminUsers() {
  const { user, isFallback, reload: reloadAuthz } = useAuthz();

  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAllProfiles();
      // Defensive client-side sort in case the server didn't honour the order
      // (e.g., null emails clustered). Locale-aware ascending.
      list.sort((a, b) => (a.email ?? '').localeCompare(b.email ?? ''));
      setRows(list.map(p => ({
        ...p,
        _origRole:   p.role,
        _origActive: p.is_active,
      })));
    } catch (err) {
      setError(err.message ?? 'Failed to load profiles');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRows(); }, [loadRows]);

  function handleLocalChange(userId, patch) {
    setRows(prev => prev.map(r =>
      r.user_id === userId ? { ...r, ...patch } : r
    ));
  }

  async function handleSave(row) {
    const tasks = [];
    if (row.role      !== row._origRole)   tasks.push(setRole(row.user_id, row.role));
    if (row.is_active !== row._origActive) tasks.push(setActive(row.user_id, row.is_active));
    if (tasks.length === 0) return;
    await Promise.all(tasks);

    // Stamp the local origin so the row clears its dirty state.
    setRows(prev => prev.map(r =>
      r.user_id === row.user_id
        ? { ...r, _origRole: r.role, _origActive: r.is_active, updated_at: new Date().toISOString() }
        : r
    ));

    // If the admin just changed their own role/active state, refresh authz so
    // the rest of the app immediately reflects the new permission set.
    if (user && row.user_id === user.id) {
      await reloadAuthz();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-3 mb-3">
        <h2 className="font-semibold text-slate-800">Users</h2>
        <p className="text-xs text-slate-400">
          {rows.length} profile{rows.length !== 1 ? 's' : ''}
        </p>
        <button
          type="button"
          onClick={loadRows}
          disabled={loading}
          className="ml-auto text-xs text-slate-400 hover:text-slate-600 underline disabled:opacity-40"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Lazy-provision explainer */}
      <p className="text-xs text-slate-500 mb-4 leading-snug">
        New users are auto-provisioned with the{' '}
        <code className="font-mono text-slate-600">{DEFAULT_ROLE}</code> role
        on their first sign-in. To grant access to someone new, ask them to
        sign up at the login screen first; their row will appear here on the
        next refresh.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <p className="font-medium mb-0.5">Couldn’t load user profiles</p>
          <p className="text-xs">{error}</p>
          {isFallback && (
            <p className="text-xs mt-1 text-red-600">
              The app is running in scaffold mode — apply migration 0001
              and ensure RLS allows admin reads.
            </p>
          )}
        </div>
      )}

      {!error && rows.length === 0 && !loading && (
        <div className="bh-card px-5 py-8 text-center">
          <p className="text-sm text-slate-500 mb-1">No user profiles yet.</p>
          <p className="text-xs text-slate-400">
            Once a user signs in, their profile will appear here.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="bh-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left  px-4 py-2.5 bh-section-label">User</th>
                <th className="text-left  px-4 py-2.5 bh-section-label">Role</th>
                <th className="text-center px-4 py-2.5 bh-section-label">Active</th>
                <th className="text-left  px-4 py-2.5 bh-section-label">Updated</th>
                <th className="text-right px-4 py-2.5 bh-section-label">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <UserRow
                  key={row.user_id}
                  row={row}
                  onLocalChange={handleLocalChange}
                  onSave={handleSave}
                  isSelf={user?.id === row.user_id}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
