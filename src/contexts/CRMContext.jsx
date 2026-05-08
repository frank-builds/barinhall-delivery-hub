/**
 * Sprint D2 + D3 — CRM-lite context.
 *
 * Loads accounts, contacts, and opportunities for the signed-in user on every
 * auth-state change, exposes lookups + cross-record relations, and (D3) provides
 * mutators for create/edit and opportunity notes.
 *
 * Mutator pattern mirrors `EngagementsContext.applyAndSave`: optimistic local
 * update, then fire-and-forget upsert via the corresponding repo. Errors are
 * logged to the console (matching engagement behaviour); a future D5+ pass may
 * add toast-based retry.
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
import { fetchAccounts,      saveAccount }      from '../lib/crmAccountsApi.js';
import { fetchContacts,      saveContact }      from '../lib/crmContactsApi.js';
import { fetchOpportunities, saveOpportunity }  from '../lib/crmOpportunitiesApi.js';
import { fetchLeads,         saveLead, bulkSaveLeads } from '../lib/crmLeadsApi.js';
import {
  emptyAccount,
  emptyContact,
  emptyOpportunity,
  emptyLead,
} from '../data/crmTypes.js';
import { DEFAULT_STAGE } from '../data/crmStages.js';

// ── Default value (signed-out / loading) ─────────────────────────────────────

const NOOP = () => {};

const EMPTY_VALUE = {
  accounts:      [],
  contacts:      [],
  opportunities: [],
  leads:         [],
  loading:       true,
  error:         null,
  schemaMissing: false,
  reload:        NOOP,

  // Lookups (single-record)
  getAccount:      () => null,
  getContact:      () => null,
  getOpportunity:  () => null,
  getLead:         () => null,

  // Lookups (relations)
  getContactsForAccount:      () => [],
  getOpportunitiesForAccount: () => [],
  getOpportunitiesForContact: () => [],
  findLeadDuplicates:         () => ({ leads: [], contacts: [] }),

  // ── D3 mutators (no-op when context isn't initialised) ──
  addAccount:              () => null,
  updateAccount:           NOOP,
  addContact:              () => null,
  updateContact:           NOOP,
  addOpportunity:          () => null,
  updateOpportunity:       NOOP,
  addOpportunityNote:      NOOP,
  updateOpportunityNote:   NOOP,

  // ── D4 mutators ──
  addLead:           () => null,
  updateLead:        NOOP,
  bulkAddLeads:      async () => ({ created: 0, failed: 0, errors: [] }),
  addLeadNote:       NOOP,
  updateLeadNote:    NOOP,
};

const CRMContext = createContext(EMPTY_VALUE);

// ── Provider ────────────────────────────────────────────────────────────────

export function CRMProvider({ children }) {
  const { user } = useAuth();

  const [accounts,      setAccounts]      = useState([]);
  const [contacts,      setContacts]      = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [leads,         setLeads]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [schemaMissing, setSchemaMissing] = useState(false);

  const load = useCallback(async (userId) => {
    if (!userId) {
      setAccounts([]);
      setContacts([]);
      setOpportunities([]);
      setLeads([]);
      setLoading(false);
      setError(null);
      setSchemaMissing(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSchemaMissing(false);

    try {
      // Fire all four in parallel — the four tables are independent.
      const [a, c, o, l] = await Promise.all([
        fetchAccounts(userId),
        fetchContacts(userId),
        fetchOpportunities(userId),
        fetchLeads(userId),
      ]);
      setAccounts(a);
      setContacts(c);
      setOpportunities(o);
      setLeads(l);
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
  const getLead        = useCallback(id => leads.find(l => l.id === id) ?? null, [leads]);

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

  /**
   * D4 — find leads + contacts whose email matches the given email
   * (case-insensitive exact match). Used by the duplicate banner on lead
   * detail and by the import-preview dedup logic.
   *
   * @param {string} email
   * @param {string=} excludeLeadId — exclude this lead id from the result
   * @returns {{ leads: Lead[], contacts: Contact[] }}
   */
  const findLeadDuplicates = useCallback((email, excludeLeadId = null) => {
    const norm = (email ?? '').trim().toLowerCase();
    if (!norm) return { leads: [], contacts: [] };
    return {
      leads: leads.filter(l =>
        (l.email ?? '').trim().toLowerCase() === norm && l.id !== excludeLeadId
      ),
      contacts: contacts.filter(c =>
        (c.email ?? '').trim().toLowerCase() === norm
      ),
    };
  }, [leads, contacts]);

  // ── D3 mutators ────────────────────────────────────────────────────────
  //
  // applyAndSave: optimistic local update + fire-and-forget upsert.
  // Mirrors EngagementsContext.applyAndSave exactly. Errors log to console;
  // optimistic state is preserved (matches engagement behaviour for now).

  function applyAndSave(setter, saveApi, recordId, updater) {
    setter(prev => {
      const next = prev.map(r => r.id === recordId ? updater(r) : r);
      const updated = next.find(r => r.id === recordId);
      if (updated && user) saveApi(updated, user.id).catch(console.error);
      return next;
    });
  }

  // ── Accounts ──

  const addAccount = useCallback((fields) => {
    const account = emptyAccount(fields);
    setAccounts(prev => [account, ...prev]);
    if (user) saveAccount(account, user.id).catch(console.error);
    return account.id;
  }, [user]);

  const updateAccount = useCallback((id, patch) => {
    applyAndSave(setAccounts, saveAccount, id, prev => ({
      ...prev,
      ...patch,
      id: prev.id, // never let id change
      updatedAt: new Date().toISOString(),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Contacts ──

  const addContact = useCallback((fields) => {
    const contact = emptyContact(fields);
    setContacts(prev => [contact, ...prev]);
    if (user) saveContact(contact, user.id).catch(console.error);
    return contact.id;
  }, [user]);

  const updateContact = useCallback((id, patch) => {
    applyAndSave(setContacts, saveContact, id, prev => ({
      ...prev,
      ...patch,
      id: prev.id,
      updatedAt: new Date().toISOString(),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Opportunities ──

  const addOpportunity = useCallback((fields) => {
    const opportunity = emptyOpportunity({
      stage:    DEFAULT_STAGE,
      notesLog: [],
      ...fields,
    });
    setOpportunities(prev => [opportunity, ...prev]);
    if (user) saveOpportunity(opportunity, user.id).catch(console.error);
    return opportunity.id;
  }, [user]);

  const updateOpportunity = useCallback((id, patch) => {
    applyAndSave(setOpportunities, saveOpportunity, id, prev => ({
      ...prev,
      ...patch,
      id: prev.id,
      updatedAt: new Date().toISOString(),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Opportunity notes (embedded array on the opportunity record) ──
  //
  // Same shape as engagement notes: { id, date, author, content }. Reuses
  // NotesLog.jsx unchanged.

  const addOpportunityNote = useCallback((opportunityId, fields) => {
    const note = {
      id:      crypto.randomUUID(),
      date:    new Date().toISOString(),
      author:  fields.author ?? '',
      content: fields.content ?? '',
    };
    applyAndSave(setOpportunities, saveOpportunity, opportunityId, prev => ({
      ...prev,
      notesLog:  [...(prev.notesLog ?? []), note],
      updatedAt: new Date().toISOString(),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateOpportunityNote = useCallback((opportunityId, noteId, fields) => {
    applyAndSave(setOpportunities, saveOpportunity, opportunityId, prev => ({
      ...prev,
      notesLog: (prev.notesLog ?? []).map(n =>
        n.id === noteId ? { ...n, ...fields } : n
      ),
      updatedAt: new Date().toISOString(),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── D4 — Leads ──

  const addLead = useCallback((fields) => {
    const lead = emptyLead({
      createdBy: user?.email ?? '',
      ...fields,
    });
    setLeads(prev => [lead, ...prev]);
    if (user) saveLead(lead, user.id).catch(console.error);
    return lead.id;
  }, [user]);

  const updateLead = useCallback((id, patch) => {
    applyAndSave(setLeads, saveLead, id, prev => ({
      ...prev,
      ...patch,
      id: prev.id,
      updatedAt: new Date().toISOString(),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /**
   * D4 — bulk insert from import flow. Materializes records via emptyLead
   * (so each gets a fresh uuid + createdAt), then upserts them in parallel.
   * On success, prepends to local state. Returns counts for the UI.
   *
   * @param {Partial<Lead>[]} fieldsArray
   * @returns {Promise<{ created: number, failed: number, errors: string[] }>}
   */
  const bulkAddLeads = useCallback(async (fieldsArray) => {
    if (!user || !Array.isArray(fieldsArray) || fieldsArray.length === 0) {
      return { created: 0, failed: 0, errors: [] };
    }
    const newLeads = fieldsArray.map(fields => emptyLead({
      createdBy: user.email ?? '',
      ...fields,
    }));
    const result = await bulkSaveLeads(newLeads, user.id);
    if (result.created > 0) {
      // Prepend only the leads that didn't fail. We don't know exactly which
      // failed here, so on partial failure we re-fetch to be safe.
      if (result.failed === 0) {
        setLeads(prev => [...newLeads, ...prev]);
      } else {
        // Partial failure — reload from DB to reconcile.
        try {
          const fresh = await fetchLeads(user.id);
          setLeads(fresh);
        } catch (err) {
          console.error('Failed to reload leads after partial bulk import:', err);
        }
      }
    }
    return result;
  }, [user]);

  const addLeadNote = useCallback((leadId, fields) => {
    const note = {
      id:      crypto.randomUUID(),
      date:    new Date().toISOString(),
      author:  fields.author ?? '',
      content: fields.content ?? '',
    };
    applyAndSave(setLeads, saveLead, leadId, prev => ({
      ...prev,
      notesLog:  [...(prev.notesLog ?? []), note],
      updatedAt: new Date().toISOString(),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateLeadNote = useCallback((leadId, noteId, fields) => {
    applyAndSave(setLeads, saveLead, leadId, prev => ({
      ...prev,
      notesLog: (prev.notesLog ?? []).map(n =>
        n.id === noteId ? { ...n, ...fields } : n
      ),
      updatedAt: new Date().toISOString(),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Memoised value ─────────────────────────────────────────────────────

  const value = useMemo(() => ({
    accounts,
    contacts,
    opportunities,
    leads,
    loading,
    error,
    schemaMissing,
    reload,

    getAccount,
    getContact,
    getOpportunity,
    getLead,
    getContactsForAccount,
    getOpportunitiesForAccount,
    getOpportunitiesForContact,
    findLeadDuplicates,

    addAccount,
    updateAccount,
    addContact,
    updateContact,
    addOpportunity,
    updateOpportunity,
    addOpportunityNote,
    updateOpportunityNote,

    addLead,
    updateLead,
    bulkAddLeads,
    addLeadNote,
    updateLeadNote,
  }), [
    accounts, contacts, opportunities, leads,
    loading, error, schemaMissing, reload,
    getAccount, getContact, getOpportunity, getLead,
    getContactsForAccount, getOpportunitiesForAccount, getOpportunitiesForContact,
    findLeadDuplicates,
    addAccount, updateAccount,
    addContact, updateContact,
    addOpportunity, updateOpportunity,
    addOpportunityNote, updateOpportunityNote,
    addLead, updateLead, bulkAddLeads, addLeadNote, updateLeadNote,
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
