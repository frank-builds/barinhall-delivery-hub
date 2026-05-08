/**
 * Sprint D4 — LeadFormModal.
 *
 * Single modal handling both create and edit, mirroring the AccountFormModal
 * pattern. Required: name. Source defaults to 'inbound' on create. Tags entered
 * as comma-separated free text and split on save.
 */
import { useEffect, useState } from 'react';
import { Modal } from '../Modal.jsx';
import { useCRM } from '../../hooks/useCRM.js';
import {
  CRM_LEAD_SOURCES,
  DEFAULT_LEAD_SOURCE,
} from '../../data/crmLeadSources.js';
import {
  CRM_LEAD_STATUSES,
  DEFAULT_LEAD_STATUS,
} from '../../data/crmLeadStatuses.js';

const FIT_OPTIONS = [
  { key: '',     label: '—'    },
  { key: 'hot',  label: 'Hot'  },
  { key: 'warm', label: 'Warm' },
  { key: 'cold', label: 'Cold' },
];

const SIZE_OPTIONS = [
  { key: '',           label: '—'           },
  { key: 'startup',    label: 'Startup'     },
  { key: 'smb',        label: 'SMB'         },
  { key: 'mid-market', label: 'Mid-market'  },
  { key: 'enterprise', label: 'Enterprise'  },
];

export function LeadFormModal({ open, onClose, lead = null }) {
  const { addLead, updateLead } = useCRM();
  const isEdit = !!lead;

  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [company,     setCompany]     = useState('');
  const [title,       setTitle]       = useState('');
  const [phone,       setPhone]       = useState('');
  const [source,      setSource]      = useState(DEFAULT_LEAD_SOURCE);
  const [status,      setStatus]      = useState(DEFAULT_LEAD_STATUS);
  const [fitRating,   setFitRating]   = useState('');
  const [industry,    setIndustry]    = useState('');
  const [companySize, setCompanySize] = useState('');
  const [tagsText,    setTagsText]    = useState('');
  const [notes,       setNotes]       = useState('');

  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(lead?.name              ?? '');
    setEmail(lead?.email            ?? '');
    setCompany(lead?.company        ?? '');
    setTitle(lead?.title            ?? '');
    setPhone(lead?.phone            ?? '');
    setSource(lead?.source          ?? DEFAULT_LEAD_SOURCE);
    setStatus(lead?.status          ?? DEFAULT_LEAD_STATUS);
    setFitRating(lead?.fitRating    ?? '');
    setIndustry(lead?.industry      ?? '');
    setCompanySize(lead?.companySize ?? '');
    setTagsText(Array.isArray(lead?.tags) ? lead.tags.join(', ') : '');
    setNotes(lead?.notes            ?? '');
    setError('');
    setSaving(false);
  }, [open, lead]);

  function parseTags(raw) {
    return String(raw)
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

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
        name:        name.trim(),
        email:       email.trim(),
        company:     company.trim(),
        title:       title.trim(),
        phone:       phone.trim(),
        source,
        status,
        fitRating,
        industry:    industry.trim(),
        companySize,
        tags:        parseTags(tagsText),
        notes:       notes.trim(),
      };
      if (isEdit) {
        updateLead(lead.id, fields);
      } else {
        addLead(fields);
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
      title={isEdit ? 'Edit lead' : 'New lead'}
      description={isEdit ? lead?.name : 'Capture a new lead at the top of the funnel.'}
      closeOnBackdrop={false}
    >
      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label className="bh-section-label mb-1 block">Name <span className="text-red-500">*</span></label>
          <input
            className="bh-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Sarah Linden"
            autoFocus
          />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="bh-section-label mb-1 block">Company</label>
            <input
              className="bh-input"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Globex Manufacturing"
            />
          </div>
          <div>
            <label className="bh-section-label mb-1 block">Title</label>
            <input
              className="bh-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="VP Operations"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="bh-section-label mb-1 block">Source</label>
            <select
              className="bh-input"
              value={source}
              onChange={e => setSource(e.target.value)}
            >
              {CRM_LEAD_SOURCES.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="bh-section-label mb-1 block">Status</label>
            <select
              className="bh-input"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              {CRM_LEAD_STATUSES.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="bh-section-label mb-1 block">Fit rating</label>
            <select
              className="bh-input"
              value={fitRating}
              onChange={e => setFitRating(e.target.value)}
            >
              {FIT_OPTIONS.map(o => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="bh-section-label mb-1 block">Company size</label>
            <select
              className="bh-input"
              value={companySize}
              onChange={e => setCompanySize(e.target.value)}
            >
              {SIZE_OPTIONS.map(o => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="bh-section-label mb-1 block">Industry</label>
            <input
              className="bh-input"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              placeholder="Industrial manufacturing"
            />
          </div>
          <div>
            <label className="bh-section-label mb-1 block">Tags</label>
            <input
              className="bh-input"
              value={tagsText}
              onChange={e => setTagsText(e.target.value)}
              placeholder="priority, q3-target"
            />
            <p className="text-xs text-slate-400 mt-1">Comma-separated</p>
          </div>
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
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create lead'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
