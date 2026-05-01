export function WorkflowChecklist({ engagementId, steps, onToggle }) {
  const done = steps.filter(s => s.done).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Workflow</h3>
        <span className="text-sm text-gray-500">{done}/{steps.length} complete</span>
      </div>
      <ul className="space-y-2">
        {steps.map((step, idx) => (
          <li key={step.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              id={`${engagementId}-${step.id}`}
              checked={step.done}
              onChange={e => onToggle(step.id, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label
              htmlFor={`${engagementId}-${step.id}`}
              className={`text-sm cursor-pointer select-none ${step.done ? 'line-through text-gray-400' : 'text-gray-700'}`}
            >
              <span className="text-gray-400 mr-1">{idx + 1}.</span>
              {step.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
