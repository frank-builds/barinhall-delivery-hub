/**
 * Sprint D3 — OpportunityFormModal.
 *
 * Single modal handling both create and edit.
 * Required: name, accountId. Stage defaults to DEFAULT_STAGE on create.
 *
 * The primary-contact dropdown is filtered to contacts of the selected account
 * so users don't accidentally link a contact to the wrong account's deal. When
 * the account changes, any incompatible contact selection is cleared.
 */
import { useEffect, useState } from 'react';
import { Modal } from '../Modal.jsx';
import { useCRM } from '../../hooks/useCRM.js';
import { CRM_STAGES, DEFAULT_STAGE } from '../../data/crmStages.js';

export function OpportunityFormModal({
  open,
  onClose,
  opportunity = null,
  defaultAccountId = null,
}) {
  const { addOpportunity, updateOpportunity, accounts, getContactsForAccount } = useCRM();
  const isEdit = !!opportunity;

  const [name,              setName]              = useState('');
  const [accountId,         setAccountId]         = useState('');
  const [primaryContactId,  setPrimaryContactId]  = useState('');
  const [stage,             setStage]             = useState(DEFAULT_STAGE);
  const [expectedValue,     setExpectedValue]     = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [owner,             setOwner]             = useState('');
  const [source,            setSource]            = useState('');
  const [notes,             setNotes]             = useState('');

  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(opportunity?.name                       ?? '');
    setAccountId(opportunity?.accountId             ?? defaultAccountId ?? '');
    setPrimaryContactId(opportunity?.primaryContactId ?? '');
    setStage(opportunity?.stage                     ?? DEFAULT_STAGE);
    setExpectedValue(
      opportunity?.expectedValue != null ? String(opportunity.expectedValue) : ''
    );
    setExpectedCloseDate(opportunity?.expectedCloseDate ?? '');
    setOwner(opportunity?.owner   ?? '');
    setSource(opportunity?.source ?? '');
    setNotes(opportunity?.notes   ?? '');
    setError('');
    setSaving(false);
  }, [open, opportunity, defaultAccountId]);

  // When the account changes, clear primary contact if it no longer belongs
  // to the newly selected account.
  useEffect(() => {
    if (!accountId || !primaryContactId) return;
    const validContacts = getContactsForAccount(accountId);
    if (!validContacts.find(c => c.id === primaryContactId)) {
      setPrimaryContactId('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!accountId) {
      setError('Account is required.');
      return;
    }

    // Parse expected value: empty string → null; non-numeric → error
    let parsedValue = null;
    if (expectedValue.trim() !== '') {
      const n = Number(expectedValue.replace(/,/g, ''));
      if (!Number.isFinite(n) || n < 0) {
        setError('Expected value must be a non-negative number.');
        return;
      }
      parsedValue = Math.round(n);
    }

    setSaving(true);
    setError('');
    try {
      const fields = {
        name:              name.trim(),
        accountId,
        primaryContactId:  primaryContactId || null,
        stage,
        expectedValue:     parsedValue,
        expectedCloseDate: expectedCloseDate || '',
        owner:             owner.trim(),
        source:            source.trim(),
        notes:             notes.trim(),
      };
      if (isEdit) {
        updateOpportunity(opportunity.id, fields);
      } else {
        addOpportunity(fields);
      }
      onClose();
    } catch (err) {
      setError(err?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const sortedAccounts = [...accounts].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  );
  const eligibleContacts = accountId ? getContactsForAccount(accountId) : [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit opportunity' : 'New opportunity'}
      description={isEdit ? opportunity?.name : 'Add a deal to the pipeline.'}
      closeOnBackdrop={false}
    >
      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
        <div>
          <label className="bh-section-label mb-1 block">Name <span className="text-red-500">*</span></label>
          <input
            className="bh-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Acme — Autonomous QA pilot"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="bh-section-label mb-1 block">Account <span className="text-red-500">*</span></label>
            <select
              className="bh-input"
              value={accountId ?? ''}
              onChange={e => setAccountId(e.target.value)}
            >
              <option value="">— Select account —</option>
              {sortedAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="bh-section-label mb-1 block">Primary contact</label>
            <select
              className="bh-input"
              value={primaryContactId ?? ''}
              onChange={e => setPrimaryContactId(e.target.value)}
              disabled={!accountId}
            >
              <option value="">{accountId ? '—' : 'Select an account first'}</option>
              {eligibleContacts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="bh-section-label mb-1 block">Stage</label>
            <select
              className="bh-input"
              value={stage}
              onChange={e => setStage(e.target.value)}
            >
              {CRM_STAGES.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="bh-section-label mb-1 block">Owner</label>
            <input
              className="bh-input"
              value={owner}
              onChange={e => setOwner(e.target.value)}
              placeholder="Who owns this deal"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="bh-section-label mb-1 block">Expected value (USD)</label>
            <input
              className="bh-input"
              type="text"
              inputMode="numeric"
              value={expectedValue}
              onChange={e => setExpectedValue(e.target.value)}
              placeholder="180000"
            />
          </div>
          <div>
            <label className="bh-section-label mb-1 block">Expected close date</label>
            <input
              className="bh-input"
              type="date"
              value={expectedCloseDate}
              onChange={e => setExpectedCloseDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="bh-section-label mb-1 block">Source</label>
          <input
            className="bh-input"
            value={source}
            onChange={e => setSource(e.target.value)}
            placeholder="Inbound, referral, outbound, event…"
          />
        </div>

        <div>
          <label className="bh-section-label mb-1 block">Notes</label>
          <textarea
            className="bh-input"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Brief context — full activity goes in the notes log on the detail page."
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
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create opportunity'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
