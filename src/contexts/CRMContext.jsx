/**
 * Sprint D2 — CRM-lite context.
 *
 * Loads accounts, contacts, and opportunities for the signed-in user on every
 * auth-state change, exposes lookups + cross-record relations, and surfaces a
 * single `loading`/`error` state for the consumer.
 *
 * No mutators in D2 — D3 will add `addAccount`, `updateOpportunity`, etc. The
 * shape of this provider matches `EngagementsContext` so D3 changes are
 * additive.
 *
 * If the CRM tables don't exist yet (the user hasn't applied
 * 0002_crm_lite.sql), every fetch fails with a Postgres "relation does not
 * exist" error. We surface a single friendly error in that case so the CRM
 * pages can show an actionable empty/error state instead of crashing.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext.jsx';
import { fetchAccounts }      from '../lib/crmAccountsApi.js';
import { fetchContacts }      from '../lib/crmContactsApi.js';
import { fetchOpportunities } from '../lib/crmOpportunitiesApi.js';

// ── Default value (signed-out / loading) ─────────────────────────────────────

const EMPTY_VALUE = {
  accounts:      [],
  contacts:      [],
  opportunities: [],
  loading:       true,
  error:         null,
  schemaMissing: false,
  reload:        () => {},

  // Lookups (single-record)
  getAccount:      () => null,
  getContact:      () => null,
  getOpportunity:  () => null,

  // Lookups (relations)
  getContactsForAccount:      () => [],
  getOpportunitiesForAccount: () => [],
  getOpportunitiesForContact: () => [],
};

const CRMContext = createContext(EMPTY_VALUE);

// ── Provider ────────────────────────────────────────────────────────────────

export function CRMProvider({ children }) {
  const { user } = useAuth();

  const [accounts,      setAccounts]      = useState([]);
  const [contacts,      setContacts]      = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [schemaMissing, setSchemaMissing] = useState(false);

  const load = useCallback(async (userId) => {
    if (!userId) {
      setAccounts([]);
      setContacts([]);
      setOpportunities([]);
      setLoading(false);
      setError(null);
      setSchemaMissing(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSchemaMissing(false);

    try {
      // Fire all three in parallel — the three tables are independent.
      const [a, c, o] = await Promise.all([
        fetchAccounts(userId),
        fetchContacts(userId),
        fetchOpportunities(userId),
      ]);
      setAccounts(a);
      setContacts(c);
      setOpportunities(o);
    } catch (err) {
      // Distinguish "tables don't exist yet" from other DB errors so the UI
      // can show a helpful "apply the migration" message vs a generic error.
      const msg = err?.message ?? String(err);
      const isSchemaMissing =
        /relation .* does not exist/i.test(msg) ||
        err?.code === '42P01';
      setSchemaMissing(isSchemaMissing);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(user?.id);
  }, [user?.id, load]);

  const reload = useCallback(() => load(user?.id), [load, user?.id]);

  // ── Lookups ────────────────────────────────────────────────────────────

  const getAccount     = useCallback(id => accounts.find(a => a.id === id) ?? null, [accounts]);
  const getContact     = useCallback(id => contacts.find(c => c.id === id) ?? null, [contacts]);
  const getOpportunity = useCallback(id => opportunities.find(o => o.id === id) ?? null, [opportunities]);

  const getContactsForAccount = useCallback(
    accountId => contacts.filter(c => c.accountId === accountId),
    [contacts]
  );

  const getOpportunitiesForAccount = useCallback(
    accountId => opportunities.filter(o => o.accountId === accountId),
    [opportunities]
  );

  const getOpportunitiesForContact = useCallback(
    contactId => opportunities.filter(o => o.primaryContactId === contactId),
    [opportunities]
  );

  // ── Memoised value ─────────────────────────────────────────────────────

  const value = useMemo(() => ({
    accounts,
    contacts,
    opportunities,
    loading,
    error,
    schemaMissing,
    reload,
    getAccount,
    getContact,
    getOpportunity,
    getContactsForAccount,
    getOpportunitiesForAccount,
    getOpportunitiesForContact,
  }), [
    accounts, contacts, opportunities,
    loading, error, schemaMissing, reload,
    getAccount, getContact, getOpportunity,
    getContactsForAccount, getOpportunitiesForAccount, getOpportunitiesForContact,
  ]);

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
}

// ── Context hook ────────────────────────────────────────────────────────────

export function useCRMContext() {
  return useContext(CRMContext);
}
