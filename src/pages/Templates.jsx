import { SERVICES } from '../data/services.js';
import { ServiceWorkflowCard } from '../components/ServiceWorkflowCard.jsx';

export function Templates() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Template Library</h1>
        <p className="text-sm text-gray-500 mt-1">
          Delivery playbooks for each service type. Expand a service, then expand any step to see
          the full procedure, talk track, required inputs, output artifact, and definition of done.
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
