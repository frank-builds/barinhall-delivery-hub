/**
 * Sprint D3 — ContactFormModal.
 *
 * Single modal handling both create and edit. Required: name. Optional account
 * link can be pre-filled by passing `defaultAccountId` (used when launching
 * from an AccountDetail page).
 */
import { useEffect, useState } from 'react';
import { Modal } from '../Modal.jsx';
import { useCRM } from '../../hooks/useCRM.js';

export function ContactFormModal({ open, onClose, contact = null, defaultAccountId = null }) {
  const { addContact, updateContact, accounts } = useCRM();
  const isEdit = !!contact;

  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [title,     setTitle]     = useState('');
  const [accountId, setAccountId] = useState('');
  const [notes,     setNotes]     = useState('');

  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(contact?.name      ?? '');
    setEmail(contact?.email    ?? '');
    setPhone(contact?.phone    ?? '');
    setTitle(contact?.title    ?? '');
    setAccountId(contact?.accountId ?? defaultAccountId ?? '');
    setNotes(contact?.notes    ?? '');
    setError('');
    setSaving(false);
  }, [open, contact, defaultAccountId]);

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
        name:      name.trim(),
        email:     email.trim(),
        phone:     phone.trim(),
        title:     title.trim(),
        accountId: accountId || null,
        notes:     notes.trim(),
      };
      if (isEdit) {
        updateContact(contact.id, fields);
      } else {
        addContact(fields);
      }
      onClose();
    } catch (err) {
      setError(err?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  // Sort accounts alphabetically for the dropdown
  const sortedAccounts = [...accounts].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit contact' : 'New contact'}
      description={isEdit ? contact?.name : 'Add a person to the pipeline.'}
      closeOnBackdrop={false}
    >
      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
        <div>
          <label className="bh-section-label mb-1 block">Name <span className="text-red-500">*</span></label>
          <input
            className="bh-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Marisol Vega"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="bh-section-label mb-1 block">Title</label>
            <input
              className="bh-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="VP, Operations"
            />
          </div>
          <div>
            <label className="bh-section-label mb-1 block">Account</label>
            <select
              className="bh-input"
              value={accountId ?? ''}
              onChange={e => setAccountId(e.target.value)}
            >
              <option value="">—</option>
              {sortedAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="bh-section-label mb-1 block">Email</label>
            <input
              type="email"
              className="bh-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="bh-section-label mb-1 block">Phone</label>
            <input
              className="bh-input"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 555-555-0123"
            />
          </div>
        </div>

        <div>
          <label className="bh-section-label mb-1 block">Notes</label>
          <textarea
            className="bh-input"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Role on the deal, relationship history, etc."
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
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create contact'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
