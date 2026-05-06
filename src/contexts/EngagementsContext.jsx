import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { fetchEngagements, saveEngagement } from '../lib/engagementsApi.js';
import { SEED_ENGAGEMENTS } from '../data/seed.js';
import { DEFAULT_WORKFLOWS } from '../data/workflows.js';

const EngagementsContext = createContext(null);

export function EngagementsProvider({ children }) {
  const { user } = useAuth();
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEngagements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchEngagements(user.id)
      .then(rows => {
        if (rows.length === 0) {
          const seedKey = `barinhall_seeded_${user.id}`;
          if (!localStorage.getItem(seedKey)) {
            localStorage.setItem(seedKey, '1');
            const saves = SEED_ENGAGEMENTS.map(eng => saveEngagement(eng, user.id));
            Promise.all(saves).catch(console.error);
            setEngagements(SEED_ENGAGEMENTS);
          } else {
            setEngagements([]);
          }
        } else {
          setEngagements(rows);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const applyAndSave = useCallback((engagementId, updater) => {
    setEngagements(prev => {
      const next = prev.map(eng => eng.id === engagementId ? updater(eng) : eng);
      const updated = next.find(e => e.id === engagementId);
      if (updated && user) saveEngagement(updated, user.id).catch(console.error);
      return next;
    });
  }, [user]);

  // ── Engagement creation ──────────────────────────────────────────────────

  function addEngagement(fields) {
    const svcKeys = fields.serviceTypes ?? (fields.serviceType ? [fields.serviceType] : []);
    const steps = svcKeys.flatMap(svcKey =>
      (DEFAULT_WORKFLOWS[svcKey] ?? []).map(label => ({
        id: crypto.randomUUID(),
        label,
        done: false,
      }))
    );

    const engagement = {
      id: crypto.randomUUID(),
      ...fields,
      status: 'Draft',
      workflow: steps,
      forms: {},
      templateStatuses: {},
      notesLog: [],
      decisionsLog: [],
      risksLog: [],
      attachments: [],
      createdAt: new Date().toISOString(),
    };

    setEngagements(prev => [engagement, ...prev]);
    if (user) saveEngagement(engagement, user.id).catch(console.error);
    return engagement.id;
  }

  // ── Workflow ─────────────────────────────────────────────────────────────

  function updateWorkflowStep(engagementId, stepId, done) {
    applyAndSave(engagementId, eng => ({
      ...eng,
      workflow: eng.workflow.map(step =>
        step.id === stepId ? { ...step, done } : step
      ),
    }));
  }

  // ── Forms (Phase 2A) ─────────────────────────────────────────────────────

  function updateFormData(engagementId, formKey, formData) {
    applyAndSave(engagementId, eng => ({
      ...eng,
      forms: { ...(eng.forms ?? {}), [formKey]: formData },
    }));
  }

  function updateTemplateStatus(engagementId, formKey, status) {
    applyAndSave(engagementId, eng => ({
      ...eng,
      templateStatuses: { ...(eng.templateStatuses ?? {}), [formKey]: status },
    }));
  }

  // ── Notes log (Phase 2B) ─────────────────────────────────────────────────

  function addNote(engagementId, fields) {
    const note = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      author: fields.author,
      content: fields.content,
    };
    applyAndSave(engagementId, eng => ({
      ...eng,
      notesLog: [...(eng.notesLog ?? []), note],
    }));
  }

  function updateNote(engagementId, noteId, fields) {
    applyAndSave(engagementId, eng => ({
      ...eng,
      notesLog: (eng.notesLog ?? []).map(n =>
        n.id === noteId ? { ...n, ...fields } : n
      ),
    }));
  }

  // ── Decisions log (Phase 2B) ─────────────────────────────────────────────

  function addDecision(engagementId, fields) {
    const decision = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      decision: fields.decision,
      rationale: fields.rationale,
      owner: fields.owner,
    };
    applyAndSave(engagementId, eng => ({
      ...eng,
      decisionsLog: [...(eng.decisionsLog ?? []), decision],
    }));
  }

  function updateDecision(engagementId, decisionId, fields) {
    applyAndSave(engagementId, eng => ({
      ...eng,
      decisionsLog: (eng.decisionsLog ?? []).map(d =>
        d.id === decisionId ? { ...d, ...fields } : d
      ),
    }));
  }

  // ── Risks / blockers log (Phase 2B) ──────────────────────────────────────

  function addRisk(engagementId, fields) {
    const risk = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      title: fields.title,
      description: fields.description,
      severity: fields.severity,
      status: fields.status,
      owner: fields.owner,
    };
    applyAndSave(engagementId, eng => ({
      ...eng,
      risksLog: [...(eng.risksLog ?? []), risk],
    }));
  }

  function updateRisk(engagementId, riskId, fields) {
    applyAndSave(engagementId, eng => ({
      ...eng,
      risksLog: (eng.risksLog ?? []).map(r =>
        r.id === riskId ? { ...r, ...fields } : r
      ),
    }));
  }

  // ── Artifact data (Phase 10) ─────────────────────────────────────────────

  /**
   * Upserts a single artifact data key on the engagement.
   * E.g. updateArtifactData(id, 'sow', { fields: {...}, htmlPreview: '...' })
   * The key lives at engagement.artifactData[key] and is free-form so new
   * artifact types can be added without schema migrations.
   */
  function updateArtifactData(engagementId, key, data) {
    applyAndSave(engagementId, eng => ({
      ...eng,
      artifactData: {
        ...(eng.artifactData ?? {}),
        [key]: data,
      },
    }));
  }

  // ── Attachments (Phase 9) ────────────────────────────────────────────────

  /**
   * Add a new attachment record to an engagement.
   * Pass in the full attachment object (id, filename, url, storageKey, size,
   * type, category, uploadedBy, uploadedAt, isClientVisible).
   * To swap in a real backend, upload the file first, then call this with the
   * resulting storageKey / remote URL.
   */
  function addAttachment(engagementId, attachment) {
    applyAndSave(engagementId, eng => ({
      ...eng,
      attachments: [...(eng.attachments ?? []), attachment],
    }));
  }

  function removeAttachment(engagementId, attachmentId) {
    applyAndSave(engagementId, eng => ({
      ...eng,
      attachments: (eng.attachments ?? []).filter(a => a.id !== attachmentId),
    }));
  }

  // ── Use Case Library integration ─────────────────────────────────────────

  /** Add a use case ID to the engagement's candidateUseCases list (idempotent). */
  function addCandidateUseCase(engagementId, useCaseId) {
    applyAndSave(engagementId, eng => {
      const existing = eng.candidateUseCases ?? [];
      if (existing.includes(useCaseId)) return eng;
      return { ...eng, candidateUseCases: [...existing, useCaseId] };
    });
  }

  /** Remove a use case ID from the engagement's candidateUseCases list. */
  function removeCandidateUseCase(engagementId, useCaseId) {
    applyAndSave(engagementId, eng => ({
      ...eng,
      candidateUseCases: (eng.candidateUseCases ?? []).filter(id => id !== useCaseId),
    }));
  }

  // ── Engagement field updates ─────────────────────────────────────────────

  function updateEngagementFields(engagementId, fields) {
    applyAndSave(engagementId, eng => ({ ...eng, ...fields }));
  }

  // ── Status override (Phase 6) ────────────────────────────────────────────

  // override: 'Draft' | 'Active' | 'On Hold' | 'Completed' | null (null = Auto)
  function setStatusOverride(engagementId, override) {
    applyAndSave(engagementId, eng => ({
      ...eng,
      statusOverride: override ?? null,
    }));
  }

  // ── Outputs (Phase 4) ────────────────────────────────────────────────────

  // Upserts an output record by documentType (replaces if same type already exists)
  function saveOutput(engagementId, outputMeta) {
    applyAndSave(engagementId, eng => ({
      ...eng,
      outputs: [
        ...(eng.outputs ?? []).filter(o => o.documentType !== outputMeta.documentType),
        outputMeta,
      ],
    }));
  }

  // ── Read ─────────────────────────────────────────────────────────────────

  function getEngagement(id) {
    return engagements.find(e => e.id === id);
  }

  return (
    <EngagementsContext.Provider value={{
      engagements,
      loading,
      addEngagement,
      updateWorkflowStep,
      updateFormData,
      updateTemplateStatus,
      addNote,
      updateNote,
      addDecision,
      updateDecision,
      addRisk,
      updateRisk,
      saveOutput,
      setStatusOverride,
      updateEngagementFields,
      addAttachment,
      removeAttachment,
      updateArtifactData,
      addCandidateUseCase,
      removeCandidateUseCase,
      getEngagement,
    }}>
      {children}
    </EngagementsContext.Provider>
  );
}

export function useEngagementsContext() {
  return useContext(EngagementsContext);
}
