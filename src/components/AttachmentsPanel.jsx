// AttachmentsPanel — internal-only attachment management backed by Supabase Storage.
//
// Upload path:  engagements/{engagementId}/{uuid}-{sanitizedFilename}
// Open:         signed URL generated on demand (2-min window) — bucket is private
// Delete:       remove([storageKey]) then strip from engagement metadata
//
// The schema retains isClientVisible and category so the future client portal
// can filter without a migration.

import { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const BUCKET         = 'engagement-attachments';
const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const SIGNED_URL_TTL = 120;              // seconds — enough to open/download

/** Extensions that are never accepted regardless of MIME type. */
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

// ── Pure helpers ──────────────────────────────────────────────────────────────

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

/**
 * Collapse whitespace → underscores, strip characters unsafe in storage paths,
 * cap at 100 characters so paths stay manageable.
 */
function sanitizeFilename(name) {
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 100);
}

function truncateFilename(name, max = 64) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name;
}

// ── File icon ─────────────────────────────────────────────────────────────────

function FileIcon({ type }) {
  if (type.startsWith('image/'))                                    return '🖼️';
  if (type === 'application/pdf')                                   return '📄';
  if (type.includes('spreadsheet') || type.includes('excel')
      || type === 'text/csv' || type.includes('csv'))               return '📊';
  if (type.includes('word') || type.includes('document'))          return '📝';
  if (type.startsWith('video/'))                                    return '🎬';
  if (type.startsWith('audio/'))                                    return '🎵';
  if (type.includes('zip') || type.includes('compressed'))         return '🗜️';
  return '📎';
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {string}   props.engagementId   - Used to build the storage path prefix
 * @param {object[]} props.attachments    - Current attachments from engagement
 * @param {function} props.onAdd          - (attachmentObject) => void — saves metadata
 * @param {function} props.onRemove       - (attachmentId) => void — removes metadata
 * @param {string}   [props.defaultOwner] - Fallback uploadedBy when auth email unavailable
 */
export function AttachmentsPanel({
  engagementId,
  attachments,
  onAdd,
  onRemove,
  defaultOwner,
}) {
  const { user }    = useAuth();
  const fileInputRef = useRef(null);

  const [isDragging,      setIsDragging]      = useState(false);
  const [error,           setError]           = useState(null);
  const [pendingCategory, setPendingCategory] = useState('');

  // Number of files currently being uploaded — drives the header indicator
  const [uploadingCount, setUploadingCount] = useState(0);

  // Set of attachment IDs currently being deleted — drives per-row disabled state
  const [deletingIds, setDeletingIds] = useState(() => new Set());

  const uploadedBy = user?.email ?? defaultOwner ?? 'Unknown';
  const isUploading = uploadingCount > 0;

  // ── Error display ──────────────────────────────────────────────────────────

  function showError(msg) {
    setError(msg);
    setTimeout(() => setError(null), 6000);
  }

  // ── Upload ─────────────────────────────────────────────────────────────────

  async function processFiles(files) {
    // Validate first; collect all valid files before touching state
    let firstValidationError = null;
    const valid = [];

    for (const file of files) {
      const err = validateFile(file);
      if (err) {
        firstValidationError = firstValidationError ?? err;
      } else {
        valid.push(file);
      }
    }

    if (firstValidationError) showError(firstValidationError);
    if (!valid.length) return;

    setUploadingCount(c => c + valid.length);

    // Upload all valid files in parallel
    await Promise.all(
      valid.map(async file => {
        const id         = crypto.randomUUID();
        const safe       = sanitizeFilename(file.name);
        const storageKey = `engagements/${engagementId}/${id}-${safe}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storageKey, file, {
            contentType: file.type || 'application/octet-stream',
          });

        setUploadingCount(c => c - 1);

        if (uploadError) {
          showError(`Failed to upload "${file.name}": ${uploadError.message}`);
          return;
        }

        onAdd({
          id,
          filename:        file.name,
          storageKey,
          url:             null,   // no permanent public URL; signed on demand
          size:            file.size,
          type:            file.type || 'application/octet-stream',
          category:        pendingCategory || null,
          uploadedBy,
          uploadedAt:      new Date().toISOString(),
          isClientVisible: false,  // expose toggle in client-portal phase
        });
      })
    );
  }

  // ── Open / download ────────────────────────────────────────────────────────

  async function handleOpen(att) {
    if (!att.storageKey) return;

    const { data, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(att.storageKey, SIGNED_URL_TTL);

    if (signError || !data?.signedUrl) {
      showError(
        `Could not open "${att.filename}": ${signError?.message ?? 'unknown error'}`
      );
      return;
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleRemove(att) {
    if (deletingIds.has(att.id)) return; // guard against double-click

    setDeletingIds(prev => new Set([...prev, att.id]));

    if (att.storageKey) {
      const { error: removeError } = await supabase.storage
        .from(BUCKET)
        .remove([att.storageKey]);

      if (removeError) {
        showError(
          `Could not delete "${att.filename}" from storage: ${removeError.message}`
        );
        setDeletingIds(prev => {
          const next = new Set(prev);
          next.delete(att.id);
          return next;
        });
        return;
      }
    }

    // Storage deletion succeeded (or there was no storageKey) — strip metadata
    onRemove(att.id);
    setDeletingIds(prev => {
      const next = new Set(prev);
      next.delete(att.id);
      return next;
    });
  }

  // ── Drag & drop ────────────────────────────────────────────────────────────

  function onDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false);
  }

  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }

  function onInputChange(e) {
    processFiles(Array.from(e.target.files));
    e.target.value = ''; // reset so re-selecting the same file fires onChange
  }

  // ── Render ─────────────────────────────────────────────────────────────────

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
        {isUploading && (
          <span className="text-xs text-indigo-500 animate-pulse">
            Uploading {uploadingCount} file{uploadingCount !== 1 ? 's' : ''}…
          </span>
        )}
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

      {/* ── Inline error / warning ── */}
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
          {sorted.map(att => {
            const isDeleting = deletingIds.has(att.id);
            return (
              <div
                key={att.id}
                className={`border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-start gap-3 transition-opacity ${
                  isDeleting ? 'opacity-40' : ''
                }`}
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
                      {/* Filename — async signed-URL open */}
                      {att.storageKey ? (
                        <button
                          type="button"
                          title={att.filename}
                          onClick={() => handleOpen(att)}
                          className="text-sm font-medium text-indigo-600 hover:underline break-all text-left"
                        >
                          {truncateFilename(att.filename)}
                        </button>
                      ) : (
                        <span
                          className="text-sm font-medium text-gray-800 break-all"
                          title={att.filename}
                        >
                          {truncateFilename(att.filename)}
                        </span>
                      )}

                      {/* Sub-line */}
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
                      disabled={isDeleting}
                      onClick={() => handleRemove(att)}
                      className={`flex-shrink-0 text-sm leading-none mt-0.5 transition-colors ${
                        isDeleting
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-300 hover:text-red-500'
                      }`}
                    >
                      {isDeleting ? '…' : '✕'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
