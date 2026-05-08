/**
 * Sprint D4 — minimal, dependency-free CSV parser.
 *
 * Sufficient for the lead-import use case. Handles:
 *   - Header row (first non-empty line)
 *   - Quoted fields with embedded commas, newlines, and escaped quotes ("")
 *   - Cross-platform line endings (\r\n, \n)
 *   - Trailing whitespace and blank lines (skipped)
 *
 * Limits intentionally:
 *   - Does NOT handle Excel-specific edge cases (formula cells, BOM detection
 *     beyond UTF-8, region-specific delimiters).
 *   - Always uses comma as the delimiter.
 *
 * Return shape:
 *   {
 *     headers: string[],          // lower-cased, trimmed
 *     rows:    Record<string, string>[],
 *     errors:  { line: number, message: string }[],
 *   }
 *
 * Each row is a header→value object using the lower-cased headers as keys
 * so callers can write `row.email` regardless of the input column casing.
 */

/**
 * Parses CSV text into rows of header→value records.
 *
 * @param {string} text
 * @returns {{ headers: string[], rows: Record<string, string>[], errors: { line: number, message: string }[] }}
 */
export function parseCsv(text) {
  const errors = [];
  if (typeof text !== 'string' || text.trim() === '') {
    return { headers: [], rows: [], errors: [{ line: 0, message: 'Empty input.' }] };
  }

  // Strip a UTF-8 BOM if present
  const cleaned = text.replace(/^﻿/, '');

  const records = [];
  let field = '';
  let row   = [];
  let inQuotes = false;
  let lineNo   = 1;

  for (let i = 0; i < cleaned.length; i++) {
    const ch   = cleaned[i];
    const next = cleaned[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        // Escaped double-quote inside quoted field
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (ch === '\r' && next === '\n') {
      // CRLF → record terminator
      row.push(field);
      records.push({ line: lineNo, fields: row });
      row = [];
      field = '';
      i++; // consume the \n
      lineNo++;
      continue;
    }
    if (ch === '\n' || ch === '\r') {
      row.push(field);
      records.push({ line: lineNo, fields: row });
      row = [];
      field = '';
      lineNo++;
      continue;
    }

    field += ch;
  }

  // Flush trailing field/row if input didn't end with a newline
  if (field !== '' || row.length > 0) {
    row.push(field);
    records.push({ line: lineNo, fields: row });
  }

  if (inQuotes) {
    errors.push({ line: lineNo, message: 'Unterminated quoted field at end of input.' });
  }

  // Drop completely-empty records (lines that were just whitespace/newlines)
  const nonEmpty = records.filter(
    r => r.fields.some(f => String(f).trim() !== '')
  );

  if (nonEmpty.length === 0) {
    return { headers: [], rows: [], errors: [{ line: 0, message: 'No data rows found.' }] };
  }

  // First non-empty line = header row
  const headerRecord = nonEmpty.shift();
  const headers = headerRecord.fields.map(h => String(h).trim().toLowerCase());

  if (headers.length === 0 || headers.every(h => h === '')) {
    return { headers: [], rows: [], errors: [{ line: headerRecord.line, message: 'Header row is empty.' }] };
  }

  const rows = nonEmpty.map(r => {
    const obj = {};
    headers.forEach((h, idx) => {
      if (!h) return; // skip empty header columns
      obj[h] = (r.fields[idx] ?? '').toString().trim();
    });
    return obj;
  });

  return { headers, rows, errors };
}
