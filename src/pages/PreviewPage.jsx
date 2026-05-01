import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEngagements } from '../hooks/useEngagements.js';
import { getFormDef } from '../data/formDefinitions.js';
import { generateMarkdown } from '../data/templateMappings.js';

export function PreviewPage() {
  const { id, formKey } = useParams();
  const { getEngagement } = useEngagements();
  const engagement = getEngagement(id);

  const [copied, setCopied] = useState(false);

  if (!engagement) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-3">Engagement not found.</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm">← Dashboard</Link>
      </div>
    );
  }

  const formDef = getFormDef(engagement.serviceType, formKey);

  if (!formDef) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-3">Template not found.</p>
        <Link to={`/engagements/${id}`} className="text-indigo-600 hover:underline text-sm">← Back to engagement</Link>
      </div>
    );
  }

  const markdown = generateMarkdown(formKey, engagement);

  function handleCopy() {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
        <Link to="/" className="hover:text-gray-600">Dashboard</Link>
        <span>/</span>
        <Link to={`/engagements/${id}`} className="hover:text-gray-600">{engagement.clientName}</Link>
        <span>/</span>
        <span className="text-gray-600">{formDef.label} — Preview</span>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{formDef.label}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generated markdown · {engagement.clientName}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/engagements/${id}/forms/${formKey}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Edit Form
          </Link>
          <button
            onClick={handleCopy}
            className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white">
        <pre className="p-5 text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
          {markdown}
        </pre>
      </div>
    </div>
  );
}
