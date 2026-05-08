/**
 * Sprint D4 — LeadImportModal.
 *
 * CSV/paste import flow with row-by-row preview and selective commit.
 *
 * Stages:
 *   1. INPUT   — paste textarea + .csv file upload.
 *   2. PREVIEW — parse + dedup-classify each row, show table with checkboxes,
 *                summary footer, and a Confirm button.
 *   3. RESULT  — small summary after the bulk save (created + failed counts).
 *
 * Recognised CSV columns (case-insensitive, in any order):
 *   name (required)
 *   email
 *   company
 *   title
 *   phone
 *   source
 *   industry
 *   companysize  (or 'company size', 'company_size')
 *   fitrating    (or 'fit rating', 'fit_rating', 'fit')
 *   notes
 *   tags         (comma-separated within a single quoted cell)
 *
 * Unknown columns are ignored. Unknown source values map to 'other'. Unknown
 * fit values are dropped (treated as ''). Rows without a name are flagged as
 * errors.
 *
 * Dedup classification:
 *   'unique'                  — green, default-checked
 *   'duplicate of existing'   — amber, default-unchecked
 *   'duplicate within batch'  — amber, default-unchecked
 *   'error'                   — red, cannot be checked
 */
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../Modal.jsx';
import { useCRM } from '../../hooks/useCRM.js';
import { parseCsv } from '../../lib/csvParser.js';
import { coerceSource, sourceLabel } from '../../data/crmLeadSources.js';
import { LeadScoreBadge } from './LeadScoreBadge.jsx';

const STAGE_INPUT   = 'input';
const STAGE_PREVIEW = 'preview';
const STAGE_RESULT  = 'result';

const FIT_VALUES = new Set(['hot', 'warm', 'cold']);
const SIZE_VALUES = new Set(['startup', 'smb', 'mid-market', 'enterprise']);

function getCol(row, ...keys) {
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(row, k)) return row[k];
  }
  return '';
}

/**
 * Maps a parsed CSV row to a Lead-shaped fields object. Unknown values are
 * coerced to safe defaults rather than rejected so import is forgiving.
 */
function rowToLead(row) {
  const name    = String(getCol(row, 'name')).trim();
  const email   = String(getCol(row, 'email')).trim();
  const company = String(getCol(row, 'company')).trim();
  const title   = String(getCol(row, 'title')).trim();
  const phone   = String(getCol(row, 'phone')).trim();
  const sourceRaw = String(getCol(row, 'source')).trim();
  const industry  = String(getCol(row, 'industry')).trim();
  const sizeRaw   = String(getCol(row, 'companysize', 'company size', 'company_size')).trim().toLowerCase();
  const fitRaw    = String(getCol(row, 'fitrating', 'fit rating', 'fit_rating', 'fit')).trim().toLowerCase();
  const notes     = String(getCol(row, 'notes')).trim();
  const tagsRaw   = String(getCol(row, 'tags')).trim();

  const fields = {
    name,
    email,
    company,
    title,
    phone,
    source:      coerceSource(sourceRaw),
    industry,
    companySize: SIZE_VALUES.has(sizeRaw) ? sizeRaw : '',
    fitRating:   FIT_VALUES.has(fitRaw)   ? fitRaw  : '',
    notes,
    tags: tagsRaw
      ? tagsRaw.split(',').map(s => s.trim()).filter(Boolean)
      : [],
  };

  return fields;
}

function classifyRow(fields, existingEmailSet, batchSeenEmails) {
  if (!fields.name) {
    return { kind: 'error', reason: 'Missing name' };
  }
  const norm = fields.email.trim().toLowerCase();
  if (norm) {
    if (existingEmailSet.has(norm)) {
      return { kind: 'duplicate-existing', reason: 'Email already exists in CRM' };
    }
    if (batchSeenEmails.has(norm)) {
      return { kind: 'duplicate-batch', reason: 'Same email earlier in this batch' };
    }
    batchSeenEmails.add(norm);
  }
  return { kind: 'unique', reason: 'Unique' };
}

const KIND_LABEL = {
  unique:               { label: 'Unique',      tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  'duplicate-existing': { label: 'Duplicate',   tone: 'text-amber-700  bg-amber-50  border-amber-200'  },
  'duplicate-batch':    { label: 'In-batch dup', tone: 'text-amber-700  bg-amber-50  border-amber-200'  },
  error:                { label: 'Error',       tone: 'text-red-700    bg-red-50    border-red-200'    },
};

export function LeadImportModal({ open, onClose }) {
  const { leads, contacts, bulkAddLeads } = useCRM();

  const [stage, setStage]         = useState(STAGE_INPUT);
  const [pasted, setPasted]       = useState('');
  const [previewRows, setPreviewRows] = useState([]);  // { fields, classification, checked, line }
  const [parseErrors, setParseErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult]       = useState(null);

  // Reset everything when opened/closed
  useEffect(() => {
    if (!open) return;
    setStage(STAGE_INPUT);
    setPasted('');
    setPreviewRows([]);
    setParseErrors([]);
    setImporting(false);
    setResult(null);
  }, [open]);

  // Build the existing-email set whenever the modal opens (constant during
  // the import flow — leads added mid-flow would not be reflected in dedup,
  // which is fine since we close the modal on confirm).
  const existingEmailSet = useMemo(() => {
    const s = new Set();
    for (const l of leads)    if (l.email)    s.add(l.email.trim().toLowerCase());
    for (const c of contacts) if (c.email)    s.add(c.email.trim().toLowerCase());
    return s;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      setPasted(text);
    };
    reader.readAsText(file);
  }

  function buildPreview(text) {
    const { rows, errors } = parseCsv(text);
    setParseErrors(errors);

    const seen = new Set();
    const decorated = rows.map((row, idx) => {
      const fields = rowToLead(row);
      const classification = classifyRow(fields, existingEmailSet, seen);
      return {
        line: idx + 2, // +2 because line 1 is header, rows are 0-indexed
        fields,
        classification,
        checked: classification.kind === 'unique',
      };
    });

    setPreviewRows(decorated);
    setStage(STAGE_PREVIEW);
  }

  function handleParse() {
    if (!pasted.trim()) return;
    buildPreview(pasted);
  }

  function toggleRow(idx) {
    setPreviewRows(rows => rows.map((r, i) =>
      i === idx ? { ...r, checked: r.classification.kind === 'error' ? false : !r.checked } : r
    ));
  }

  function selectAll(predicate) {
    setPreviewRows(rows => rows.map(r => ({
      ...r,
      checked: predicate(r) && r.classification.kind !== 'error',
    })));
  }

  async function handleConfirm() {
    const toImport = previewRows
      .filter(r => r.checked && r.classification.kind !== 'error')
      .map(r => r.fields);
    if (toImport.length === 0) return;

    setImporting(true);
    const res = await bulkAddLeads(toImport);
    setImporting(false);
    setResult(res);
    setStage(STAGE_RESULT);
  }

  // ── Counts for the preview footer ──
  const counts = previewRows.reduce(
    (acc, r) => {
      acc[r.classification.kind]++;
      if (r.checked) acc.checked++;
      return acc;
    },
    { unique: 0, 'duplicate-existing': 0, 'duplicate-batch': 0, error: 0, checked: 0 }
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import leads"
      description={
        stage === STAGE_INPUT   ? 'Paste CSV or upload a .csv file.' :
        stage === STAGE_PREVIEW ? 'Review classification and select rows to import.' :
                                   'Import complete.'
      }
      maxWidth="max-w-5xl"
      closeOnBackdrop={false}
    >
      {/* ── INPUT stage ── */}
      {stage === STAGE_INPUT && (
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="bh-section-label mb-1 block">Paste CSV</label>
            <textarea
              className="bh-input font-mono text-xs"
              rows={12}
              value={pasted}
              onChange={e => setPasted(e.target.value)}
              placeholder={'name,email,company,source,fitRating\nSarah Linden,sarah@example.com,Globex,referral,hot\n…'}
            />
            <p className="text-xs text-slate-400 mt-1">
              Required column: <code className="font-mono">name</code>. Recognised:{' '}
              <code className="font-mono">email</code>, <code className="font-mono">company</code>,{' '}
              <code className="font-mono">title</code>, <code className="font-mono">phone</code>,{' '}
              <code className="font-mono">source</code>, <code className="font-mono">industry</code>,{' '}
              <code className="font-mono">companySize</code>, <code className="font-mono">fitRating</code>,{' '}
              <code className="font-mono">notes</code>, <code className="font-mono">tags</code>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="bh-btn-secondary text-sm cursor-pointer">
              Upload CSV…
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFile}
                className="hidden"
              />
            </label>
            <span className="text-xs text-slate-400">or paste above</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button onClick={onClose} className="bh-btn-secondary text-sm">Cancel</button>
            <button
              onClick={handleParse}
              disabled={!pasted.trim()}
              className="bh-btn-primary text-sm disabled:opacity-40"
            >
              Preview
            </button>
          </div>
        </div>
      )}

      {/* ── PREVIEW stage ── */}
      {stage === STAGE_PREVIEW && (
        <div className="flex flex-col max-h-[80vh]">
          <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-emerald-700">
              <strong className="tabular-nums">{counts.unique}</strong> unique
            </span>
            <span className="text-amber-700">
              <strong className="tabular-nums">
                {counts['duplicate-existing'] + counts['duplicate-batch']}
              </strong> duplicate
            </span>
            {counts.error > 0 && (
              <span className="text-red-700">
                <strong className="tabular-nums">{counts.error}</strong> error
              </span>
            )}
            <span className="text-slate-500 ml-auto">
              <strong className="tabular-nums">{counts.checked}</strong> selected to import
            </span>
            <button
              type="button"
              onClick={() => selectAll(r => r.classification.kind === 'unique')}
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              Select unique only
            </button>
            <button
              type="button"
              onClick={() => selectAll(() => true)}
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => selectAll(() => false)}
              className="text-slate-500 hover:text-slate-700 underline"
            >
              Clear
            </button>
          </div>

          {parseErrors.length > 0 && (
            <div className="px-5 py-2 bg-red-50 border-b border-red-200 text-xs text-red-700">
              Parse errors: {parseErrors.map(e => `line ${e.line}: ${e.message}`).join(' · ')}
            </div>
          )}

          {previewRows.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">
              No rows parsed.
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500 w-8"></th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Status</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Name</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Email</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Company</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Source</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((r, idx) => {
                    const k = KIND_LABEL[r.classification.kind];
                    return (
                      <tr key={idx} className="border-t border-slate-100">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={r.checked}
                            onChange={() => toggleRow(idx)}
                            disabled={r.classification.kind === 'error'}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${k.tone}`}
                            title={r.classification.reason}
                          >
                            {k.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-800">
                          {r.fields.name || <span className="text-red-500 italic">(missing)</span>}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {r.fields.email || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {r.fields.company || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{sourceLabel(r.fields.source)}</td>
                        <td className="px-3 py-2">
                          <LeadScoreBadge lead={r.fields} className="text-[10px] py-0" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setStage(STAGE_INPUT)}
              disabled={importing}
              className="bh-btn-secondary text-sm"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={importing || counts.checked === 0}
              className="bh-btn-primary text-sm disabled:opacity-40"
            >
              {importing ? 'Importing…' : `Import ${counts.checked} lead${counts.checked === 1 ? '' : 's'}`}
            </button>
          </div>
        </div>
      )}

      {/* ── RESULT stage ── */}
      {stage === STAGE_RESULT && result && (
        <div className="px-5 py-6 space-y-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mx-auto">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-sm text-slate-700">
            <strong>{result.created}</strong> lead{result.created === 1 ? '' : 's'} imported
            {result.failed > 0 && <>, <strong className="text-red-600">{result.failed} failed</strong></>}.
          </p>
          {result.errors.length > 0 && (
            <details className="text-left max-w-md mx-auto text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <summary className="cursor-pointer font-medium">Errors ({result.errors.length})</summary>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </details>
          )}
          <div>
            <button onClick={onClose} className="bh-btn-primary text-sm">Done</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
