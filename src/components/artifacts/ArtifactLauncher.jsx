// ArtifactLauncher — renders the "Step Tools" bar for a playbook step and
// dispatches into the appropriate builder modal.
//
// Each artifact in step.artifacts maps to a specific builder via templateKey.
// The modal contains a compact engagement-picker so data can be pre-populated
// from and saved back to a real engagement from the Templates tab.

import { useState } from 'react';
import { useEngagements } from '../../hooks/useEngagements.js';
import { SowBuilder } from './SowBuilder.jsx';
import { EmailDraftEditor } from './EmailDraftEditor.jsx';
import { StakeholderMapBuilder } from './StakeholderMapBuilder.jsx';

// ── Icon map ──────────────────────────────────────────────────────────────────

const ARTIFACT_ICONS = {
  builder:       '🔨',
  emailTemplate: '✉️',
  form:          '📋',
  downloadable:  '⬇️',
};

// ── Builder registry — add new templateKeys here as artifacts are created ─────

function BuilderRouter({ templateKey, engagement, onSave, onClose }) {
  if (templateKey === 'sow') {
    return <SowBuilder engagement={engagement} onSave={onSave} onClose={onClose} />;
  }
  if (templateKey === 'preCallEmail' || templateKey === 'dataRequestEmail') {
    return (
      <EmailDraftEditor
        type={templateKey}
        engagement={engagement}
        onSave={onSave}
        onClose={onClose}
      />
    );
  }
  if (templateKey === 'stakeholderMap') {
    return (
      <StakeholderMapBuilder
        engagement={engagement}
        onSave={onSave}
        onClose={onClose}
      />
    );
  }
  return (
    <div className="py-10 text-center text-sm text-gray-400 italic">
      Builder for <strong>{templateKey}</strong> is not yet implemented.
    </div>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────

function ArtifactModal({ artifact, onClose }) {
  const { engagements, updateArtifactData } = useEngagements();
  const [selectedId, setSelectedId] = useState('');

  const engagement = engagements.find(e => e.id === selectedId) ?? null;

  function onSave(key, data) {
    if (!engagement) return;
    updateArtifactData(engagement.id, key, {
      ...data,
      savedAt: new Date().toISOString(),
    });
  }

  return (
    // Full-screen backdrop — pointer-events on the backdrop close the modal
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-start justify-center overflow-y-auto py-8 px-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col">

        {/* Modal header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">{artifact.label}</h2>
            <p className="text-xs text-gray-500 mt-0.5 max-w-lg">{artifact.description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-700 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Engagement selector */}
        <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500">Engagement:</span>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 max-w-xs"
          >
            <option value="">— none selected —</option>
            {engagements.map(e => (
              <option key={e.id} value={e.id}>
                {e.clientName} · {e.company}
              </option>
            ))}
          </select>
          {!engagement && (
            <span className="text-[11px] text-gray-400 italic">
              Select an engagement to pre-populate fields and save output
            </span>
          )}
          {engagement && (
            <span className="text-[11px] text-green-600 font-medium">
              ✓ Changes will be saved to this engagement
            </span>
          )}
        </div>

        {/* Builder content — remount fresh when engagement changes */}
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: '72vh' }}>
          <BuilderRouter
            key={selectedId}                 // remount on engagement change
            templateKey={artifact.templateKey}
            engagement={engagement}
            onSave={onSave}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

/**
 * @param {object[]} artifacts - From step.artifacts in playbooks.js
 */
export function ArtifactLauncher({ artifacts }) {
  const [openArtifact, setOpenArtifact] = useState(null);

  if (!artifacts?.length) return null;

  return (
    <>
      <div className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-2">
          Step Tools
        </p>
        <div className="flex flex-wrap gap-2">
          {artifacts.map(artifact => (
            <button
              key={artifact.id}
              type="button"
              onClick={() => setOpenArtifact(artifact)}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-violet-200 bg-white text-violet-700 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-colors font-medium shadow-sm"
            >
              <span>{ARTIFACT_ICONS[artifact.artifactType] ?? '🛠️'}</span>
              <span>{artifact.label}</span>
              {artifact.isRequired && (
                <span className="text-[9px] font-bold uppercase tracking-wide bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full ml-0.5 border border-orange-200">
                  Required
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {openArtifact && (
        <ArtifactModal
          artifact={openArtifact}
          onClose={() => setOpenArtifact(null)}
        />
      )}
    </>
  );
}
