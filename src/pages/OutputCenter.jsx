import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEngagements } from '../hooks/useEngagements.js';
import { getOutputDefs, checkMissingFields, SERVICE_FILE_LABELS } from '../data/outputDefinitions.js';
import { generateDocument } from '../lib/outputGenerators.js';
import { makeFilename, makeFolderName } from '../lib/outputNaming.js';
import { exportEngagementZip } from '../lib/zipExport.js';
import { SERVICES } from '../data/services.js';
import { renderMarkdownBlocks } from '../lib/markdownRenderer.jsx';

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function downloadFile(filename, content) {
  const blob   = new Blob([content], { type: 'text/markdown' });
  const url    = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href     = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function OutputCenter() {
  const { id } = useParams();
  const { getEngagement, saveOutput } = useEngagements();
  const engagement = getEngagement(id);

  const [generating, setGenerating]       = useState(null); // docTypeId currently generating
  const [exporting, setExporting]         = useState(false);
  const [exportError, setExportError]     = useState('');
  const [previewDocType, setPreviewDocType] = useState(null);

  if (!engagement) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-3">Engagement not found.</p>
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 text-sm transition-colors">← Back to Dashboard</Link>
      </div>
    );
  }

  const service     = SERVICES.find(s => s.key === engagement.serviceType);
  const outputDefs  = getOutputDefs(engagement.serviceType);
  const outputs     = engagement.outputs ?? [];
  const serviceLabel = SERVICE_FILE_LABELS[engagement.serviceType] ?? engagement.serviceType;

  function getExistingOutput(docTypeId) {
    return outputs.find(o => o.documentType === docTypeId) ?? null;
  }

  async function handleGenerate(def) {
    setGenerating(def.id);
    const date     = new Date().toISOString().slice(0, 10);
    const filename = makeFilename(engagement.clientName, serviceLabel, def.docTypeLabel, date);
    saveOutput(engagement.id, {
      id:           crypto.randomUUID(),
      documentType: def.id,
      filename,
      generatedAt:  new Date().toISOString(),
    });
    setGenerating(null);
  }

  async function handleExportZip() {
    setExportError('');
    setExporting(true);
    try {
      await exportEngagementZip(engagement);
    } catch (err) {
      setExportError(err.message);
    } finally {
      setExporting(false);
    }
  }

  function handleDownloadSingle(output) {
    const content = generateDocument(output.documentType, engagement);
    downloadFile(output.filename, content);
  }

  const totalDefs     = outputDefs.length;
  const generatedCount = outputs.filter(o => outputDefs.some(d => d.id === o.documentType)).length;

  return (
    <div className="max-w-3xl">

      {/* ── Breadcrumb ── */}
      <div className="mb-5">
        <Link
          to={`/engagements/${id}`}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← {engagement.clientName}
        </Link>
      </div>

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
        <div>
          <h1>Output Center</h1>
          <p className="text-slate-500 text-sm mt-1">
            {engagement.clientName} · {service?.label ?? engagement.serviceType}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">
            {generatedCount}/{totalDefs} generated
          </span>
          <button
            onClick={handleExportZip}
            disabled={exporting || outputs.length === 0}
            className="bh-btn-primary disabled:opacity-40"
          >
            {exporting ? 'Exporting…' : 'Export Zip'}
          </button>
        </div>
      </div>

      {exportError && (
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          {exportError}
        </p>
      )}

      {outputDefs.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">
          No document types defined for this service.
        </p>
      ) : (
        <div className="space-y-3 mb-8">
          {outputDefs.map(def => {
            const existing    = getExistingOutput(def.id);
            const missing     = checkMissingFields(def, engagement);
            const ready       = missing.length === 0;
            const isPreviewing = previewDocType === def.id;

            return (
              <div key={def.id} className="bh-card overflow-hidden">
                {/* Row */}
                <div className="px-4 py-3.5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{def.label}</p>
                    {existing ? (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Generated {formatDate(existing.generatedAt)}
                        <span className="mx-1.5 opacity-40">·</span>
                        <code className="font-mono">{existing.filename}</code>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5">Not yet generated</p>
                    )}
                    {!ready && (
                      <p className="text-xs text-amber-600 mt-1">
                        Missing: {missing.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {existing && (
                      <>
                        <button
                          onClick={() => setPreviewDocType(isPreviewing ? null : def.id)}
                          className="bh-btn-ghost text-xs px-2.5 py-1"
                        >
                          {isPreviewing ? 'Hide' : 'Preview'}
                        </button>
                        <button
                          onClick={() => handleDownloadSingle(existing)}
                          className="bh-btn-ghost text-xs px-2.5 py-1"
                        >
                          Download
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleGenerate(def)}
                      disabled={!ready || generating === def.id}
                      title={!ready ? `Complete required fields first: ${missing.join(', ')}` : ''}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                        ready
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {generating === def.id
                        ? 'Generating…'
                        : existing ? 'Regenerate' : 'Generate'}
                    </button>
                  </div>
                </div>

                {/* Inline preview panel */}
                {isPreviewing && existing && (
                  <div className="border-t border-slate-100">
                    {/* Preview header */}
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">{def.label} — Preview</span>
                      <span className="text-xs text-slate-400">{engagement.clientName}</span>
                    </div>
                    {/* Rendered document */}
                    <div className="px-6 py-5 max-h-[500px] overflow-y-auto">
                      {renderMarkdownBlocks(generateDocument(def.id, engagement))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Manifest ── */}
      {outputs.length > 0 && (
        <section className="bh-card px-4 py-4 mb-4">
          <p className="bh-section-label mb-3">Output Manifest</p>
          <div className="space-y-2">
            {outputs
              .filter(o => outputDefs.some(d => d.id === o.documentType))
              .map(o => (
                <div key={o.id} className="flex items-center justify-between text-xs">
                  <code className="text-slate-700 font-mono truncate mr-4">{o.filename}</code>
                  <span className="text-slate-400 flex-shrink-0">{formatDate(o.generatedAt)}</span>
                </div>
              ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            MANIFEST.json is included in the zip export.
          </p>
        </section>
      )}

      {/* ── Zip structure note ── */}
      {outputs.length > 0 && (
        <div className="bh-card px-4 py-3.5">
          <p className="bh-section-label mb-2">Zip Folder Structure</p>
          <pre className="text-xs text-slate-500 font-mono leading-relaxed bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
{`${makeFolderName(engagement.clientName, serviceLabel, new Date().toISOString().slice(0, 10))}/
  outputs/
${outputs.filter(o => outputDefs.some(d => d.id === o.documentType)).map(o => `    ${o.filename}`).join('\n')}
  MANIFEST.json`}
          </pre>
        </div>
      )}
    </div>
  );
}
