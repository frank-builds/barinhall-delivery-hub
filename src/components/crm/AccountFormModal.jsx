/**
 * Sprint D3 — AccountFormModal.
 *
 * Single modal that handles BOTH create and edit modes:
 *   <AccountFormModal open={true} onClose={...} />            → create
 *   <AccountFormModal open={true} onClose={...} account={a}/> → edit
 *
 * Required: name. Everything else optional.
 */
import { useEffect, useState } from 'react';
import { Modal } from '../Modal.jsx';
import { useCRM } from '../../hooks/useCRM.js';

const SIZE_OPTIONS = ['', 'Startup', 'SMB', 'Mid-market', 'Enterprise'];

export function AccountFormModal({ open, onClose, account = null }) {
  const { addAccount, updateAccount } = useCRM();
  const isEdit = !!account;

  const [name,       setName]       = useState('');
  const [industry,   setIndustry]   = useState('');
  const [website,    setWebsite]    = useState('');
  const [hqLocation, setHqLocation] = useState('');
  const [sizeBand,   setSizeBand]   = useState('');
  const [notes,      setNotes]      = useState('');

  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  // Reset form whenever the modal opens (or the record being edited changes).
  useEffect(() => {
    if (!open) return;
    setName(account?.name        ?? '');
    setIndustry(account?.industry  ?? '');
    setWebsite(account?.website    ?? '');
    setHqLocation(account?.hqLocation ?? '');
    setSizeBand(account?.sizeBand  ?? '');
    setNotes(account?.notes        ?? '');
    setError('');
    setSaving(false);
  }, [open, account]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const fields = {
        name:       name.trim(),
        industry:   industry.trim(),
        website:    website.trim(),
        hqLocation: hqLocation.trim(),
        sizeBand,
        notes:      notes.trim(),
      };
      if (isEdit) {
        updateAccount(account.id, fields);
      } else {
        addAccount(fields);
      }
      onClose();
    } catch (err) {
      setError(err?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit account' : 'New account'}
      description={isEdit ? account?.name : 'Add a company to the pipeline.'}
      closeOnBackdrop={false}
    >
      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
        <div>
          <label className="bh-section-label mb-1 block">Name <span className="text-red-500">*</span></label>
          <input
            className="bh-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Acme Robotics"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="bh-section-label mb-1 block">Industry</label>
            <input
              className="bh-input"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              placeholder="Industrial automation"
            />
          </div>
          <div>
            <label className="bh-section-label mb-1 block">HQ location</label>
            <input
              className="bh-input"
              value={hqLocation}
              onChange={e => setHqLocation(e.target.value)}
              placeholder="Pittsburgh, PA"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="bh-section-label mb-1 block">Website</label>
            <input
              className="bh-input"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="bh-section-label mb-1 block">Size band</label>
            <select
              className="bh-input"
              value={sizeBand}
              onChange={e => setSizeBand(e.target.value)}
            >
              {SIZE_OPTIONS.map(s => (
                <option key={s} value={s}>{s || '—'}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="bh-section-label mb-1 block">Notes</label>
          <textarea
            className="bh-input"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Anything we should remember about this account…"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="bh-btn-secondary text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bh-btn-primary text-sm"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create account'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
