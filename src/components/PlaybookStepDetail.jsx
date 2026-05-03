// Renders the rich detail card for a single playbook step.
// Receives a step object from PLAYBOOKS and renders all populated sections.
// Sections that are null/empty are omitted cleanly.

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children, accent = false }) {
  return (
    <div className={accent ? 'rounded-md bg-indigo-50 border border-indigo-100 px-3 py-2.5' : ''}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${accent ? 'text-indigo-500' : 'text-gray-400'}`}>
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Talk track block ──────────────────────────────────────────────────────────
function TalkTrackBlock({ items }) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
        Talk Track / Script
      </p>
      {items.map((item, i) => (
        <div key={i}>
          <p className="text-xs font-semibold text-amber-800 mb-0.5">{item.label}</p>
          <p className="text-xs text-amber-700 whitespace-pre-wrap leading-relaxed">{item.content}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function PlaybookStepDetail({ step }) {
  return (
    <div className="mt-3 space-y-4 text-sm">

      {/* Objective */}
      <p className="text-gray-600 italic leading-relaxed">{step.objective}</p>

      {/* Meta strip: duration + owner */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="text-gray-400">⏱</span> {step.duration}
        </span>
        <span className="flex items-center gap-1">
          <span className="text-gray-400">👤</span> {step.ownerRole}
        </span>
      </div>

      {/* Required Inputs */}
      {step.requiredInputs?.length > 0 && (
        <Section title="Required Inputs">
          <ul className="space-y-1">
            {step.requiredInputs.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="mt-0.5 text-gray-300 flex-shrink-0">▸</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Procedure */}
      {step.procedure?.length > 0 && (
        <Section title="Procedure">
          <ol className="space-y-1.5">
            {step.procedure.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="flex-shrink-0 w-4 h-4 mt-0.5 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Talk Track / Agenda */}
      {step.talkTrack?.length > 0 && (
        <TalkTrackBlock items={step.talkTrack} />
      )}

      {/* Output Artifact */}
      {step.outputArtifact && (
        <Section title="Output Artifact" accent>
          <p className="text-xs text-indigo-800 font-medium">{step.outputArtifact}</p>
        </Section>
      )}

      {/* Definition of Done */}
      {step.acceptanceCriteria?.length > 0 && (
        <Section title="Definition of Done">
          <ul className="space-y-1">
            {step.acceptanceCriteria.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="flex-shrink-0 text-green-500 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

    </div>
  );
}
