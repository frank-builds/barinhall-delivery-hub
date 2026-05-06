// PDF export utility for Barinhall Delivery Hub.
//
// Two export paths:
//   exportElementToPdf    — captures a live React-rendered DOM element
//                           (handles Tailwind, reads computed styles via html2canvas)
//   exportHtmlStringToPdf — renders an inline-styled HTML string off-screen,
//                           captures it, then removes it (used for SOW, StructuredDocument)
//
// Page layout: US Letter portrait with 20 mm margins on all sides.
//
// Usage:
//   import { exportElementToPdf, exportHtmlStringToPdf, makePdfFilename } from '../lib/exportPdf.js';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// ── Page layout constants ─────────────────────────────────────────────────────
//
//  US Letter:  215.9 mm wide × 279.4 mm tall  (8.5" × 11")
//  Margins:     20 mm on every side            (≈ 0.79")
//  Content box: 175.9 mm wide × 239.4 mm tall  (≈ 6.92" × 9.42")
//
const MARGIN   = 20;                          // mm — applied uniformly to all edges
const PAGE_FMT = 'letter';                    // jsPDF built-in: 215.9 × 279.4 mm

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a safe, dated filename for a PDF download */
export function makePdfFilename(...parts) {
  const date = new Date().toISOString().slice(0, 10);
  return (
    [...parts, date]
      .filter(Boolean)
      .join(' - ')
      .replace(/[/\\:*?"<>|]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 120) + '.pdf'
  );
}

/** Escape HTML for safe embedding in generated HTML strings */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Core PDF builder ──────────────────────────────────────────────────────────

/**
 * Convert a canvas to a margined, multi-page US Letter PDF and trigger download.
 *
 * Layout math
 * ───────────
 *   pageW  = 215.9 mm,  pageH = 279.4 mm          (US Letter)
 *   MX     = MARGIN mm,  MT = MB = MARGIN mm
 *   availW = pageW − 2×MX   (content column width)
 *   availH = pageH − MT − MB (content column height per page)
 *
 *   imgW = availW                                  (fills content column)
 *   imgH = (canvas.height / canvas.width) × availW (preserves aspect ratio)
 *
 * Tiling (page N, 0-based)
 * ─────────────────────────
 *   x = MX
 *   y = MT − N × availH
 *
 *   The full-height image is placed on every page at a progressively more
 *   negative y, so each page's content box (y: MT → MT+availH) reveals a
 *   different vertical slice.  White filled rectangles are painted over all
 *   four margin strips after the image to mask any bleed cleanly.
 */
function canvasToPdf(canvas, filename) {
  const pdf   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: PAGE_FMT });
  const pageW = pdf.internal.pageSize.getWidth();   // 215.9 mm
  const pageH = pdf.internal.pageSize.getHeight();  // 279.4 mm

  const MX     = MARGIN;
  const MT     = MARGIN;
  const MB     = MARGIN;
  const availW = pageW - 2 * MX;   // 175.9 mm
  const availH = pageH - MT - MB;  // 239.4 mm

  // Scale image to fill the content column; preserve aspect ratio
  const imgW    = availW;
  const imgH    = (canvas.height / canvas.width) * availW;
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  let pageNum  = 0;
  let consumed = 0; // mm of image height placed on previous pages

  while (consumed < imgH) {
    if (pageNum > 0) pdf.addPage();

    // Place the full image, offset so the correct slice sits inside the margin box
    pdf.addImage(imgData, 'JPEG', MX, MT - consumed, imgW, imgH);

    // ── Mask margin bleed with white fills ──
    // Any part of the image that extends into margin zones is hidden by these
    // four white rectangles, which are painted on top of the image.
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0,           0,           pageW, MT,    'F'); // top margin strip
    pdf.rect(0,           pageH - MB,  pageW, MB,    'F'); // bottom margin strip
    pdf.rect(0,           0,           MX,    pageH, 'F'); // left margin strip
    pdf.rect(pageW - MX,  0,           MX,    pageH, 'F'); // right margin strip

    consumed += availH;
    pageNum++;
  }

  pdf.save(filename);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Export a live React-rendered DOM element as a PDF.
 *
 * html2canvas reads computed styles, so Tailwind classes render correctly.
 * Uses scrollHeight / scrollWidth to capture content beyond the visible viewport.
 * Elements with data-html2canvas-ignore="true" are excluded from the capture.
 *
 * @param {HTMLElement} element  - The DOM node to export
 * @param {string}      filename - Output filename (should end in .pdf)
 */
export async function exportElementToPdf(element, filename) {
  if (!element) throw new Error('exportElementToPdf: element is null');

  // Wait for webfonts (Inter from Google Fonts) before capturing
  await document.fonts.ready;

  const canvas = await html2canvas(element, {
    scale:        2,        // 2× scale for crisp retina output
    useCORS:      true,     // allow local images (barinhall-logo.png)
    allowTaint:   false,
    logging:      false,
    backgroundColor: '#ffffff',
    width:        element.scrollWidth,
    height:       element.scrollHeight,  // full content, not viewport-clipped
    windowWidth:  1280,                  // simulate wide viewport for max-w-* classes
    windowHeight: element.scrollHeight,
  });

  canvasToPdf(canvas, filename);
}

/**
 * Export a raw inline-styled HTML string as a PDF.
 *
 * Injects the HTML into a hidden off-screen container, captures it with
 * html2canvas, generates the PDF, then removes the container.
 *
 * @param {string} htmlString   - Fully self-contained HTML (inline styles preferred)
 * @param {string} filename     - Output filename
 * @param {object} options
 * @param {number} options.renderWidth - Width in px to render at (default 900)
 */
export async function exportHtmlStringToPdf(htmlString, filename, { renderWidth = 900 } = {}) {
  await document.fonts.ready;

  const wrap = document.createElement('div');
  wrap.setAttribute('aria-hidden', 'true');
  wrap.setAttribute('data-pdf-offscreen', 'true');
  Object.assign(wrap.style, {
    position:   'fixed',
    top:        '0px',
    left:       `${-(renderWidth + 300)}px`,  // fully off-screen to the left
    width:      `${renderWidth}px`,
    background: '#ffffff',
    overflow:   'visible',
    zIndex:     '-9999',
    padding:    '0',
    margin:     '0',
  });
  wrap.innerHTML = htmlString;
  document.body.appendChild(wrap);

  // Allow the browser one animation frame to complete layout
  await new Promise(r => setTimeout(r, 150));

  try {
    const canvas = await html2canvas(wrap, {
      scale:        2,
      useCORS:      true,
      allowTaint:   false,
      logging:      false,
      backgroundColor: '#ffffff',
      width:        renderWidth,
      windowWidth:  renderWidth,
    });
    canvasToPdf(canvas, filename);
  } finally {
    document.body.removeChild(wrap);
  }
}

// ── Branded HTML generators for off-screen export ────────────────────────────

/**
 * Generate a branded, inline-styled HTML document from StructuredDocument data.
 * Passed to exportHtmlStringToPdf to produce a clean PDF without Tailwind.
 *
 * @param {string}   title    - Document title
 * @param {Array}    sections - Array of { heading, content } objects
 * @param {object}   meta     - Optional { clientName, company }
 */
export function generateStructuredDocHtml(title, sections, { clientName = '', company = '' } = {}) {
  const today     = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const clientLine = [clientName, company].filter(Boolean).join(' · ');

  const bodyHtml = sections
    .map(s => `
      <div style="margin-bottom:24px;page-break-inside:avoid">
        <h2 style="font-size:13px;font-weight:700;color:#1e1b4b;border-bottom:2px solid #e0e7ff;padding-bottom:5px;margin:0 0 9px;letter-spacing:0;text-transform:none">
          ${esc(s.heading)}
        </h2>
        <p style="font-size:13px;line-height:1.75;margin:0;white-space:pre-wrap;color:#374151">
          ${esc(s.content?.trim() || '—')}
        </p>
      </div>
    `)
    .join('');

  return `
<div style="font-family:Georgia,serif;max-width:760px;margin:0 auto;color:#111827;font-size:14px;line-height:1.7;padding:28px 36px 36px">
  <!-- Cover block -->
  <div style="border-bottom:4px solid #4338ca;padding-bottom:18px;margin-bottom:30px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <img src="/barinhall-logo.png" alt="Barinhall"
           style="height:26px;width:auto;object-fit:contain"
           onerror="this.style.display='none'" />
      <p style="font-size:11px;color:#6b7280;margin:0">Confidential · ${esc(today)}</p>
    </div>
    <h1 style="font-size:22px;font-weight:800;margin:0 0 4px;color:#1e1b4b;font-family:inherit">
      ${esc(title)}
    </h1>
    ${clientLine
      ? `<p style="font-size:12px;color:#6b7280;margin:4px 0 0">${esc(clientLine)}</p>`
      : ''}
  </div>

  <!-- Sections -->
  ${bodyHtml}

  <!-- Footer -->
  <p style="margin-top:36px;padding-top:10px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;line-height:1.5">
    Generated by Barinhall Delivery Hub
  </p>
</div>`;
}
