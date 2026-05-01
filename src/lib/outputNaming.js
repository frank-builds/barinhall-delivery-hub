// Filesystem-safe naming utilities for generated output files and folders.

// Strips characters that are unsafe in filenames; collapses whitespace to underscores.
export function toFsSafe(str) {
  return String(str)
    .trim()
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .replace(/\s+/g, '_');
}

// Produces: ClientName_ServiceLabel_DocTypeLabel_YYYY-MM-DD.md
export function makeFilename(clientName, serviceLabel, docTypeLabel, date) {
  const d = String(date).slice(0, 10);
  return `${toFsSafe(clientName)}_${toFsSafe(serviceLabel)}_${toFsSafe(docTypeLabel)}_${d}.md`;
}

// Produces the top-level zip folder name: ClientName_ServiceLabel_YYYY-MM-DD
export function makeFolderName(clientName, serviceLabel, date) {
  const d = String(date).slice(0, 10);
  return `${toFsSafe(clientName)}_${toFsSafe(serviceLabel)}_${d}`;
}
