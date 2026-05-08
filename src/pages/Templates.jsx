import { SERVICES } from '../data/services.js';
import { ServiceWorkflowCard } from '../components/ServiceWorkflowCard.jsx';

export function Templates() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1>Playbook Library</h1>
        <p className="text-sm text-slate-500 mt-1">
          Delivery playbooks for {SERVICES.length} service types. Expand a service to browse steps,
          then expand any step to see the full procedure, talk track, required inputs,
          output artifact, and definition of done.
        </p>
      </div>
      <div className="space-y-3">
        {SERVICES.map(service => (
          <ServiceWorkflowCard key={service.key} service={service} />
        ))}
      </div>
    </div>
  );
}
