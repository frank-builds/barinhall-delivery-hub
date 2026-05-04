// AttachmentsPanel — internal-only attachment management for an engagement.
// The data model carries isClientVisible and category so a future client portal
// can filter/display without reworking the schema.

import { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

/** File extensions that are never accepted. */
const BLOCKED_EXTS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.msi',
  '.dmg', '.app', '.vbs', '.jar', '.scr', '.pif',
]);

export const ATTACHMENT_CATEGORIES = [
  'Intake docs',
  'Contracts',
  'Data extracts',
  'Reports',
  'Presentations',
  'Other',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtSize(bytes) {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024)     return `${Math.round(bytes / 1_024)} KB`;
  return `${bytes} B`;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function fileExt(filename) {
  const dot = filename.lastIndexOf('.');
  return dot >= 0 ? filename.slice(dot).toLowerCase() : '';
}

function validateFile(file) {
  if (BLOCKED_EXTS.has(fileExt(file.name))) {
    return `"${file.name}" is an unsupported file type and cannot be uploaded.`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `"${file.name}" is ${fmtSize(file.size)} — exceeds the 25 MB limit.`;
  }
  return null;
}

// ── File icon ─────────────────────────────────────────────────────────────────

function FileIcon({ type }) {
  if (type.startsWith('image/'))                                       return '🖼️';
  if (type === 'application/pdf')                                      return '📄';
  if (type.includes('spreadsheet') || type.includes('excel')
      || type === 'text/csv' || type.includes('csv'))                  return '📊';
  if (type.includes('word') || type.includes('document'))             return '📝';
  if (type.startsWith('video/'))                                       return '🎬';
  if (type.startsWith('audio/'))                                       return '🎵';
  if (type.includes('zip') || type.includes('compressed'))            return '🗜️';
  return '📎';
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {object[]} props.attachments       - Current attachments array from engagement
 * @param {function} props.onAdd             - (attachmentObject) => void
 * @param {function} props.onRemove          - (attachmentId) => void
 * @param {string}   [props.defaultOwner]    - Fallback uploadedBy when user email unavailable
 */
export function AttachmentsPanel({ attachments, onAdd, onRemove, defaultOwner }) {
  const { user }   = useAuth();
  const fileInputRef = useRef(null);

  const [isDragging,       setIsDragging]       = useState(false);
  const [error,            setError]            = useState(null);
  const [pendingCategory,  setPendingCategory]  = useState('');

  // Prefer logged-in user's email; fall back to engagement owner name
  const uploadedBy = user?.email ?? defaultOwner ?? 'Unknown';

  function showError(msg) {
    setError(msg);
    // Auto-dismiss after 6 s so the zone stays tidy
    setTimeout(() => setError(null), 6000);
  }

  function processFiles(files) {
    let firstError = null;
    for (const file of files) {
      const err = validateFile(file);
      if (err) {
        firstError = firstError ?? err;
        continue;
      }
      // Simulate upload: create a local object URL.
      // To swap in a real backend, replace URL.createObjectURL with your upload
      // call and store the resulting remote URL / storageKey instead.
      const url = URL.createObjectURL(file);
      onAdd({
        id:              crypto.randomUUID(),
        filename:        file.name,
        url,
        storageKey:      null,   // reserved for real backend (e.g. S3 key)
        size:            file.size,
        type:            file.type || 'application/octet-stream',
        category:        pendingCategory || null,
        uploadedBy,
        uploadedAt:      new Date().toISOString(),
        isClientVisible: false,  // default off; expose toggle in client portal phase
      });
    }
    if (firstError) showError(firstError);
  }

  // ── Drag & drop ────────────────────────────────────────────────────────────

  function onDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e) {
    // Only clear when leaving the zone entirely (not a child element)
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false);
  }

  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }

  function onInputChange(e) {
    processFiles(Array.from(e.target.files));
    // Reset so re-selecting the same file triggers onChange
    e.target.value = '';
  }

  const sorted = [...attachments].sort((a, b) =>
    b.uploadedAt.localeCompare(a.uploadedAt)
  );

  return (
    <section className="mt-8">

      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-gray-800">
          Attachments
          {attachments.length > 0 && (
            <span className="text-gray-400 font-normal text-sm ml-1">
              ({attachments.length})
            </span>
          )}
        </h2>
      </div>

      {/* ── Category selector ── */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500">Category for next upload:</span>
        <select
          value={pendingCategory}
          onChange={e => setPendingCategory(e.target.value)}
          className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        >
          <option value="">None</option>
          {ATTACHMENT_CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* ── Drop zone ── */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg px-6 py-8 text-center transition-colors mb-4 ${
          isDragging
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
        }`}
      >
        <p className="text-2xl mb-2 select-none">📁</p>
        <p className="text-sm text-gray-600 mb-1">
          Drag &amp; drop files here, or{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-indigo-600 hover:text-indigo-800 font-medium underline"
          >
            browse files
          </button>
        </p>
        <p className="text-xs text-gray-400">
          PDF, DOCX, XLSX, CSV, images &amp; more · Max&nbsp;25&nbsp;MB per file
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {/* ── Validation error ── */}
      {error && (
        <div className="mb-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          <span className="flex-shrink-0 mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Attachment list ── */}
      {attachments.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No attachments yet.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map(att => (
            <div
              key={att.id}
              className="border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-start gap-3"
            >
              {/* Icon */}
              <span
                className="text-lg leading-none mt-0.5 flex-shrink-0 select-none"
                aria-hidden="true"
              >
                <FileIcon type={att.type} />
              </span>

              {/* Meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {/* Filename — clickable if URL is available */}
                    {att.url ? (
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={att.filename}
                        className="text-sm font-medium text-indigo-600 hover:underline break-all"
                      >
                        {att.filename.length > 64
                          ? att.filename.slice(0, 61) + '…'
                          : att.filename}
                      </a>
                    ) : (
                      <span
                        className="text-sm font-medium text-gray-800 break-all"
                        title={att.filename}
                      >
                        {att.filename.length > 64
                          ? att.filename.slice(0, 61) + '…'
                          : att.filename}
                      </span>
                    )}

                    {/* Sub-line: size · date · uploader · category badge */}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {fmtSize(att.size)}
                      &nbsp;·&nbsp;{fmtDate(att.uploadedAt)}
                      &nbsp;·&nbsp;{att.uploadedBy}
                      {att.category && (
                        <span className="ml-2 inline-block bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-[11px]">
                          {att.category}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    title="Remove attachment"
                    onClick={() => onRemove(att.id)}
                    className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors text-sm leading-none mt-0.5"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
