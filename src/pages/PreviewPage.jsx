import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEngagements } from '../hooks/useEngagements.js';
import { getFormDef } from '../data/formDefinitions.js';
import { generateMarkdown } from '../data/templateMappings.js';
import { renderMarkdownBlocks } from '../lib/markdownRenderer.jsx';
import { exportElementToPdf, makePdfFilename } from '../lib/exportPdf.js';

export function PreviewPage() {
  const { id, formKey } = useParams();
  const { getEngagement } = useEngagements();
  const engagement = getEngagement(id);

  const [copied,   setCopied]   = useState(false);
  const [pdfBusy,  setPdfBusy]  = useState(false);
  const [pdfError, setPdfError] = useState('');
  const docCardRef = useRef(null);

  if (!engagement) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-3">Engagement not found.</p>
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 text-sm transition-colors">
          ← Dashboard
        </Link>
      </div>
    );
  }

  const formDef = getFormDef(engagement.serviceType, formKey);

  if (!formDef) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-3">Template not found.</p>
        <Link
          to={`/engagements/${id}`}
          className="text-indigo-600 hover:text-indigo-800 text-sm transition-colors"
        >
          ← Back to engagement
        </Link>
      </div>
    );
  }

  const markdown = generateMarkdown(formKey, engagement);

  function handleCopy() {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleDownloadPdf() {
    setPdfBusy(true);
    setPdfError('');
    try {
      await exportElementToPdf(
        docCardRef.current,
        makePdfFilename(formDef.label, engagement.clientName),
      );
    } catch (err) {
      console.error('PDF export failed:', err);
      setPdfError('PDF export failed — please try again.');
      setTimeout(() => setPdfError(''), 5000);
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div className="max-w-3xl">

      {/* ── Breadcrumb ── */}
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-slate-400">
        <Link to="/" className="hover:text-slate-600 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link to={`/engagements/${id}`} className="hover:text-slate-600 transition-colors">
          {engagement.clientName}
        </Link>
        <span>/</span>
        <span className="text-slate-600">{formDef.label}</span>
      </nav>

      {/* ── Page header ── */}
      <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
        <div>
          <h1>{formDef.label}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Document preview · {engagement.clientName}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`/engagements/${id}/forms/${formKey}`}
            className="bh-btn-ghost"
          >
            ← Edit Form
          </Link>
          <button onClick={handleCopy} className="bh-btn-secondary">
            {copied ? (
              <><span className="text-emerald-600">✓</span> Copied</>
            ) : (
              'Copy markdown'
            )}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfBusy}
            className="bh-btn-secondary disabled:opacity-50 disabled:cursor-wait"
          >
            {pdfBusy ? 'Generating…' : '↓ Download PDF'}
          </button>
          {pdfError && (
            <span className="text-xs text-red-600">{pdfError}</span>
          )}
        </div>
      </div>

      {/* ── Document card ── */}
      <div ref={docCardRef} className="bh-card overflow-hidden">
        {/* Document header bar */}
        <div className="bg-indigo-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/barinhall-logo.png"
              alt="Barinhall"
              className="h-6 w-auto object-contain opacity-90"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <span className="text-indigo-200 text-sm font-medium">Barinhall Delivery Hub</span>
          </div>
          <span className="text-indigo-300 text-xs">Preview · {formDef.label}</span>
        </div>

        {/* Document body */}
        <div className="px-8 py-7">
          {renderMarkdownBlocks(markdown)}
        </div>

        {/* Document footer */}
        <div className="border-t border-slate-100 px-8 py-3 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {engagement.clientName} · {engagement.company}
          </span>
          <span className="text-xs text-slate-400">
            Generated by Barinhall Delivery Hub
          </span>
        </div>
      </div>

    </div>
  );
}
