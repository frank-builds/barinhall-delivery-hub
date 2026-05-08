/**
 * Sprint D1 — convenience re-export of the AuthzContext hook.
 * Import this instead of the context directly to keep import paths stable.
 *
 * Usage:
 *   import { useAuthz } from '../hooks/useAuthz.js';
 *   const { can, role, loading } = useAuthz();
 */
export { useAuthzContext as useAuthz } from '../contexts/AuthzContext.jsx';
