// Renders the markdown dialect produced by templateMappings.js generators.
// NOT a general-purpose markdown parser — supports exactly what the generators emit:
//   headings (# ## ###), tables (| col |), bullet lists (- item),
//   **bold**, _italic_, `code`, --- dividers, and plain paragraphs.
//
// Usage:
//   import { renderMarkdownBlocks } from '../lib/markdownRenderer.jsx';
//   <div>{renderMarkdownBlocks(markdownString)}</div>

// ── Inline parser ─────────────────────────────────────────────────────────────
// Returns a string OR an array of strings/React elements.
export function renderInline(text, keyPrefix = 'i') {
  if (!text || text === '—') return text ?? '—';

  // Regex matches **bold**, _italic_, `code` in order of appearance
  const TOKEN_RE = /(\*\*(.+?)\*\*|_(.+?)_|`(.+?)`)/g;
  const parts = [];
  let last = 0;
  let idx  = 0;
  let m;

  while ((m = TOKEN_RE.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));

    if (m[0].startsWith('**'))
      parts.push(
        <strong key={`${keyPrefix}-b${idx++}`} className="font-semibold text-slate-900">
          {m[2]}
        </strong>
      );
    else if (m[0].startsWith('_'))
      parts.push(
        <em key={`${keyPrefix}-em${idx++}`} className="italic text-slate-500">
          {m[3]}
        </em>
      );
    else
      parts.push(
        <code key={`${keyPrefix}-c${idx++}`} className="text-xs bg-slate-100 text-indigo-700 border border-slate-200 px-1 py-0.5 rounded font-mono">
          {m[4]}
        </code>
      );

    last = m.index + m[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));

  if (parts.length === 0) return text;
  if (parts.length === 1) return parts[0];
  return parts;
}

// ── Block renderer ────────────────────────────────────────────────────────────
// Converts a markdown string into an array of React elements.
export function renderMarkdownBlocks(markdown) {
  if (!markdown) return [];

  const lines = markdown.split('\n');
  const elements = [];
  let i   = 0;
  let key = 0;
  const K = () => key++;

  while (i < lines.length) {
    const raw     = lines[i];
    const trimmed = raw.trim();

    // ── H1 ──
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={K()}>
          {renderInline(trimmed.slice(2), key)}
        </h1>
      );
      i++; continue;
    }

    // ── H2 ──
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={K()} className="mt-7 mb-3 pb-2 border-b border-slate-200">
          {renderInline(trimmed.slice(3), key)}
        </h2>
      );
      i++; continue;
    }

    // ── H3 ──
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={K()} className="mt-5 mb-2">
          {renderInline(trimmed.slice(4), key)}
        </h3>
      );
      i++; continue;
    }

    // ── HR / divider ──
    if (trimmed === '---') {
      elements.push(<hr key={K()} className="border-slate-200 my-5" />);
      i++; continue;
    }

    // ── Table — collect all consecutive | lines ──
    if (trimmed.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      // Row 0 = headers, Row 1 = separator (|---|), Row 2+ = data rows
      const parseRow = (l) =>
        l.split('|').slice(1, -1).map(c => c.trim());

      const headers  = parseRow(tableLines[0]);
      const dataRows = tableLines.slice(2).map(parseRow);
      const k = K();

      elements.push(
        <div key={k} className="overflow-x-auto mb-4 rounded-lg border border-slate-200">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {headers.map((h, j) => (
                  <th
                    key={j}
                    className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {renderInline(h, `${k}-h${j}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr
                  key={ri}
                  className={`border-b border-slate-100 last:border-0 ${ri % 2 === 1 ? 'bg-slate-50/40' : ''}`}
                >
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2.5 text-slate-700 align-top leading-snug">
                      {renderInline(cell, `${k}-r${ri}c${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // ── Bullet list — collect consecutive "- " lines ──
    if (trimmed.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      const k = K();
      elements.push(
        <ul key={k} className="mb-4 space-y-1.5">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="mt-[7px] flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="leading-relaxed">{renderInline(item, `${k}-li${j}`)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Indented continuation (2-space prefix, e.g. sub-text under a list item) ──
    if (raw.startsWith('  ') && trimmed) {
      elements.push(
        <p key={K()} className="text-sm text-slate-500 pl-5 -mt-2 mb-3 leading-snug">
          {renderInline(trimmed, key)}
        </p>
      );
      i++; continue;
    }

    // ── Empty line — skip ──
    if (!trimmed) {
      i++; continue;
    }

    // ── Plain paragraph (handles **Key:** Value inline bold patterns) ──
    elements.push(
      <p key={K()} className="text-sm text-slate-700 mb-3 leading-relaxed">
        {renderInline(trimmed, key)}
      </p>
    );
    i++;
  }

  return elements;
}
