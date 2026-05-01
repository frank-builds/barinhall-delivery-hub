const STATUS_STYLES = {
  'Not Started': 'bg-gray-100 text-gray-500',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  'Complete':    'bg-green-100 text-green-700',
};

export function TemplateBadge({ status }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}
