/**
 * Sprint D3 — /crm/pipeline — column-per-stage view of all opportunities.
 *
 * 9 columns laid out horizontally (overflow-x-auto, matching KanbanBoard.jsx).
 * Each card has a "Move to…" select gated by crm.write.
 */
import { useState } from 'react';
import { useCRM } from '../../hooks/useCRM.js';
import { CRM_STAGES } from '../../data/crmStages.js';
import { PermissionGate } from '../../components/PermissionGate.jsx';
import { OpportunityCard } from '../../components/crm/OpportunityCard.jsx';
import { OpportunityFormModal } from '../../components/crm/OpportunityFormModal.jsx';

export function Pipeline() {
  const { opportunities, loading } = useCRM();
  const [showCreate, setShowCreate] = useState(false);

  if (loading) {
    return <p className="text-sm text-slate-400 py-10 text-center">Loading pipeline…</p>;
  }

  const isEmpty = opportunities.length === 0;

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">
          Pipeline
          <span className="ml-2 text-sm font-normal text-slate-400 tabular-nums">
            {opportunities.length}
          </span>
        </h2>
        <PermissionGate perm="crm.write">
          <button
            onClick={() => setShowCreate(true)}
            className="bh-btn-primary text-sm"
          >
            + New opportunity
          </button>
        </PermissionGate>
      </div>

      {/* ── Empty state ── */}
      {isEmpty && (
        <div className="bh-card px-5 py-10 text-center">
          <p className="text-sm text-slate-400 mb-2">No opportunities yet.</p>
          <p className="text-xs text-slate-400">
            Click <strong>+ New opportunity</strong> to add the first deal, or apply the demo seed
            in <code className="font-mono text-xs">0002_crm_lite.sql</code>.
          </p>
        </div>
      )}

      {/* ── Columns ── */}
      {!isEmpty && (
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="flex gap-3 min-w-max">
            {CRM_STAGES.map(stage => {
              const cards = opportunities.filter(o => o.stage === stage.key);
              return (
                <div
                  key={stage.key}
                  className="flex flex-col w-64 rounded-lg border border-slate-200 bg-slate-50 p-3 flex-shrink-0"
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      {stage.label}
                    </span>
                    <span className="text-xs text-slate-400 font-medium tabular-nums">
                      {cards.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2">
                    {cards.map(o => (
                      <OpportunityCard key={o.id} opportunity={o} />
                    ))}
                    {cards.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-6 italic">
                        No opportunities
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Create modal ── */}
      <OpportunityFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}
