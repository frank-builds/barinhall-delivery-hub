const STATUS_STYLES = {
  Draft:      'bg-gray-100 text-gray-600',
  Active:     'bg-green-100 text-green-700',
  'On Hold':  'bg-yellow-100 text-yellow-700',
  Completed:  'bg-blue-100 text-blue-700',
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
