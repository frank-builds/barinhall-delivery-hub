// usePdfExport — shared PDF export hook.
//
// Wraps the two public functions in lib/exportPdf.js with a single busy/error
// state machine so consumers don't re-implement the try/catch/finally each time.
//
// Usage:
//   const { exportElement, exportHtmlString, busy, error } = usePdfExport();
//
//   await exportElement(ref.current, makePdfFilename('Weekly Digest'));
//   await exportHtmlString(generateHtml(form), filename);
//
//   <button onClick={...} disabled={busy}>{busy ? 'Generating…' : 'Download PDF'}</button>
//   {error && <span className="text-xs text-red-600">{error}</span>}
//
// Errors auto-clear after 5 seconds. The hook never throws — failures are
// surfaced through the `error` state.

import { useCallback, useState } from 'react';
import { exportElementToPdf, exportHtmlStringToPdf } from '../lib/exportPdf.js';

const ERROR_RESET_MS = 5000;
const DEFAULT_ERROR  = 'PDF export failed — please try again.';

export function usePdfExport() {
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState('');

  const run = useCallback(async (action) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (err) {
      console.error('PDF export failed:', err);
      setError(DEFAULT_ERROR);
      setTimeout(() => setError(''), ERROR_RESET_MS);
    } finally {
      setBusy(false);
    }
  }, []);

  const exportElement = useCallback(
    (element, filename) => run(() => exportElementToPdf(element, filename)),
    [run],
  );

  const exportHtmlString = useCallback(
    (html, filename, options) => run(() => exportHtmlStringToPdf(html, filename, options)),
    [run],
  );

  return { exportElement, exportHtmlString, busy, error };
}
