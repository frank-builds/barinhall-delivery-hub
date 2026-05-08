/**
 * Sprint D2 — convenience re-export of the CRMContext hook.
 *
 * Usage:
 *   import { useCRM } from '../hooks/useCRM.js';
 *   const { accounts, loading, getAccount } = useCRM();
 */
export { useCRMContext as useCRM } from '../contexts/CRMContext.jsx';
