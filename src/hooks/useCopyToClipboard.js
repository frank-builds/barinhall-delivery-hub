// useCopyToClipboard — shared clipboard hook with a transient "copied" flag.
//
// Replaces the duplicated pattern of:
//
//   const [copied, setCopied] = useState(false);
//   function handleCopy() {
//     navigator.clipboard.writeText(text).then(() => {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     });
//   }
//
// Usage:
//   const { copy, copied, error } = useCopyToClipboard();
//   <button onClick={() => copy(textToCopy)}>{copied ? '✓ Copied' : 'Copy'}</button>
//
// `copy` returns a Promise<boolean> (true on success, false on failure) so
// callers can chain or branch on the result. Failures are surfaced through
// `error` and never thrown — graceful degradation in environments without
// the Clipboard API (older browsers, insecure contexts).
//
// Optional config:
//   useCopyToClipboard({ resetMs: 1500 })  // default 2000

import { useCallback, useState } from 'react';

const DEFAULT_RESET_MS = 2000;

export function useCopyToClipboard({ resetMs = DEFAULT_RESET_MS } = {}) {
  const [copied, setCopied] = useState(false);
  const [error,  setError]  = useState(null);

  const copy = useCallback(async (text) => {
    if (typeof text !== 'string') {
      setError(new Error('useCopyToClipboard: copy() requires a string'));
      return false;
    }
    try {
      await navigator.clipboard.writeText(text);
      setError(null);
      setCopied(true);
      setTimeout(() => setCopied(false), resetMs);
      return true;
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      setError(err);
      return false;
    }
  }, [resetMs]);

  return { copy, copied, error };
}
