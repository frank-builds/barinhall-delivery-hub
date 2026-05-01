// Browser-safe zip export for an engagement's generated outputs.
// Builds folder structure in memory with JSZip, then triggers a download.

import JSZip from 'jszip';
import { generateDocument } from './outputGenerators.js';
import { SERVICE_FILE_LABELS, getOutputDef } from '../data/outputDefinitions.js';
import { makeFolderName } from './outputNaming.js';

export async function exportEngagementZip(engagement) {
  const outputs = engagement.outputs ?? [];
  if (outputs.length === 0) throw new Error('No generated outputs to export.');

  const zip = new JSZip();
  const serviceLabel = SERVICE_FILE_LABELS[engagement.serviceType] ?? engagement.serviceType;
  const exportDate   = new Date().toISOString().slice(0, 10);
  const folderName   = makeFolderName(engagement.clientName, serviceLabel, exportDate);

  const root          = zip.folder(folderName);
  const outputsFolder = root.folder('outputs');

  for (const output of outputs) {
    const content = generateDocument(output.documentType, engagement);
    outputsFolder.file(output.filename, content);
  }

  // Per-engagement manifest
  const manifest = {
    engagementId:  engagement.id,
    clientName:    engagement.clientName,
    company:       engagement.company,
    serviceType:   engagement.serviceType,
    owner:         engagement.owner,
    exportedAt:    new Date().toISOString(),
    outputCount:   outputs.length,
    outputs: outputs.map(o => ({
      documentType: o.documentType,
      filename:     o.filename,
      generatedAt:  o.generatedAt,
    })),
  };
  root.file('MANIFEST.json', JSON.stringify(manifest, null, 2));

  const blob    = await zip.generateAsync({ type: 'blob' });
  const url     = URL.createObjectURL(blob);
  const anchor  = document.createElement('a');
  anchor.href     = url;
  anchor.download = `${folderName}.zip`;
  anchor.click();
  URL.revokeObjectURL(url);
}
