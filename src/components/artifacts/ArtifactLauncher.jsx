// ArtifactLauncher — renders the "Step Tools" bar for a playbook step and
// dispatches into the appropriate builder modal.
//
// Each artifact in step.artifacts maps to a specific builder via templateKey.
// The modal contains a compact engagement-picker so data can be pre-populated
// from and saved back to a real engagement from the Templates tab.

import { useState } from 'react';
import { useEngagements } from '../../hooks/useEngagements.js';
import { Modal } from '../Modal.jsx';
import { SowBuilder } from './SowBuilder.jsx';
import { EmailDraftEditor } from './EmailDraftEditor.jsx';
import { StakeholderMapBuilder } from './StakeholderMapBuilder.jsx';
import { ChecklistBuilder } from './ChecklistBuilder.jsx';
import { AgendaBuilder } from './AgendaBuilder.jsx';
import { ScoringForm } from './ScoringForm.jsx';
import { ActionTracker } from './ActionTracker.jsx';
import { StructuredDocument } from './StructuredDocument.jsx';

// ── Icon map ──────────────────────────────────────────────────────────────────

const ARTIFACT_ICONS = {
  builder:       '🔨',
  emailTemplate: '✉️',
  form:          '📋',
  downloadable:  '⬇️',
  checklist:     '✅',
  agenda:        '📅',
  scoring:       '📊',
  tracker:       '🗂️',
  document:      '📄',
};

// ── Builder registry ──────────────────────────────────────────────────────────
// Routes by artifact.component (new) or artifact.templateKey (legacy).
// Add new component keys here when new artifact builders are created.

function BuilderRouter({ artifact, engagement, onSave, onClose }) {
  const { templateKey } = artifact;
  // 'component' field allows explicit routing; falls back to templateKey for
  // backward-compatibility with Phase 10 artifacts that pre-date this field.
  const comp = artifact.component ?? templateKey;

  // ── Legacy routes (Phase 10 Step 1 artifacts) ─────────────────────────────
  if (templateKey === 'sow')              return <SowBuilder engagement={engagement} onSave={onSave} onClose={onClose} />;
  if (templateKey === 'stakeholderMap')   return <StakeholderMapBuilder engagement={engagement} onSave={onSave} onClose={onClose} />;
  if (templateKey === 'preCallEmail' || templateKey === 'dataRequestEmail') {
    return <EmailDraftEditor type={templateKey} engagement={engagement} onSave={onSave} onClose={onClose} />;
  }

  // ── New component routes (Phase 10b) ──────────────────────────────────────
  if (comp === 'checklist')     return <ChecklistBuilder     storageKey={templateKey} engagement={engagement} onSave={onSave} onClose={onClose} />;
  if (comp === 'agenda')        return <AgendaBuilder        storageKey={templateKey} engagement={engagement} onSave={onSave} onClose={onClose} />;
  if (comp === 'scoring')       return <ScoringForm          storageKey={templateKey} engagement={engagement} onSave={onSave} onClose={onClose} />;
  if (comp === 'actionTracker') return <ActionTracker        storageKey={templateKey} engagement={engagement} onSave={onSave} onClose={onClose} />;
  if (comp === 'document')      return <StructuredDocument   storageKey={templateKey} engagement={engagement} onSave={onSave} onClose={onClose} />;
  if (comp === 'emailDraft')    return <EmailDraftEditor type={templateKey} engagement={engagement} onSave={onSave} onClose={onClose} />;

  return (
    <div className="py-10 text-center text-sm text-slate-400 italic">
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
    <Modal
      open
      onClose={onClose}
      title={artifact.label}
      description={artifact.description}
      maxWidth="max-w-2xl"
    >
      {/* Engagement selector */}
      <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 flex-wrap flex-shrink-0">
        <span className="text-xs font-medium text-slate-500">Engagement:</span>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          className="bh-input text-xs py-1 w-auto max-w-xs"
        >
          <option value="">— none selected —</option>
          {engagements.map(e => (
            <option key={e.id} value={e.id}>
              {e.clientName} · {e.company}
            </option>
          ))}
        </select>
        {!engagement && (
          <span className="text-[11px] text-slate-400 italic">
            Select an engagement to pre-populate fields and save output
          </span>
        )}
        {engagement && (
          <span className="text-[11px] text-emerald-600 font-medium">
            ✓ Changes will be saved to this engagement
          </span>
        )}
      </div>

      {/* Builder content — remount fresh when engagement changes */}
      <div className="px-5 py-5 overflow-y-auto" style={{ maxHeight: '72vh' }}>
        <BuilderRouter
          key={selectedId}                 // remount on engagement change
          artifact={artifact}
          engagement={engagement}
          onSave={onSave}
          onClose={onClose}
        />
      </div>
    </Modal>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

/**
 * @param {object[]} artifacts - From step.artifacts in playbooks.json
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
