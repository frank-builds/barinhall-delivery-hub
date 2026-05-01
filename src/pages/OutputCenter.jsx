import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEngagements } from '../hooks/useEngagements.js';
import { getOutputDefs, checkMissingFields, SERVICE_FILE_LABELS } from '../data/outputDefinitions.js';
import { generateDocument } from '../lib/outputGenerators.js';
import { makeFilename, makeFolderName } from '../lib/outputNaming.js';
import { exportEngagementZip } from '../lib/zipExport.js';
import { SERVICES } from '../data/services.js';

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
        <p className="text-gray-500 mb-3">Engagement not found.</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm">← Back to Dashboard</Link>
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
      <div className="mb-4">
        <Link
          to={`/engagements/${id}`}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← {engagement.clientName}
        </Link>
      </div>

      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Output Center</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {engagement.clientName} · {service?.label ?? engagement.serviceType}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {generatedCount} / {totalDefs} generated
          </span>
          <button
            onClick={handleExportZip}
            disabled={exporting || outputs.length === 0}
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            {exporting ? 'Exporting…' : 'Export Zip'}
          </button>
        </div>
      </div>

      {exportError && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {exportError}
        </p>
      )}

      {outputDefs.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          No document types defined for this service.
        </p>
      ) : (
        <div className="space-y-3 mb-8">
          {outputDefs.map(def => {
            const existing = getExistingOutput(def.id);
            const missing  = checkMissingFields(def, engagement);
            const ready    = missing.length === 0;
            const isPreviewing = previewDocType === def.id;

            return (
              <div
                key={def.id}
                className="border border-gray-200 rounded-lg bg-white overflow-hidden"
              >
                <div className="px-4 py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{def.label}</p>
                    {existing ? (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Generated {formatDate(existing.generatedAt)} · {existing.filename}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">Not yet generated</p>
                    )}
                    {!ready && (
                      <p className="text-xs text-amber-600 mt-1">
                        Missing: {missing.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {existing && (
                      <>
                        <button
                          onClick={() => setPreviewDocType(isPreviewing ? null : def.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-1 transition-colors"
                        >
                          {isPreviewing ? 'Hide' : 'Preview'}
                        </button>
                        <button
                          onClick={() => handleDownloadSingle(existing)}
                          className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-1 transition-colors"
                        >
                          Download
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleGenerate(def)}
                      disabled={!ready || generating === def.id}
                      title={!ready ? `Complete required fields first: ${missing.join(', ')}` : ''}
                      className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
                        ready
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      } disabled:opacity-50`}
                    >
                      {generating === def.id
                        ? 'Generating…'
                        : existing ? 'Regenerate' : 'Generate'}
                    </button>
                  </div>
                </div>

                {isPreviewing && existing && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                      {generateDocument(def.id, engagement)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Manifest ── */}
      {outputs.length > 0 && (
        <section className="border border-gray-200 rounded-lg bg-white px-4 py-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Output Manifest
          </h2>
          <div className="space-y-2">
            {outputs
              .filter(o => outputDefs.some(d => d.id === o.documentType))
              .map(o => (
                <div key={o.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 font-mono truncate mr-4">{o.filename}</span>
                  <span className="text-gray-400 flex-shrink-0">{formatDate(o.generatedAt)}</span>
                </div>
              ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            MANIFEST.json is included in the zip export.
          </p>
        </section>
      )}

      {/* ── Zip structure note ── */}
      {outputs.length > 0 && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Zip folder structure
          </p>
          <pre className="text-xs text-gray-600 font-mono leading-relaxed">
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
