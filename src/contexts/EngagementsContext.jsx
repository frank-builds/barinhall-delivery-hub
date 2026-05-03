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
    const steps = (DEFAULT_WORKFLOWS[fields.serviceType] ?? []).map(label => ({
      id: crypto.randomUUID(),
      label,
      done: false,
    }));

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
      getEngagement,
    }}>
      {children}
    </EngagementsContext.Provider>
  );
}

export function useEngagementsContext() {
  return useContext(EngagementsContext);
}
