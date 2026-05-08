-- ============================================================
-- Sprint D2 — CRM-lite tables, RLS policies, indexes, and seed
-- ============================================================
--
-- Apply this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Idempotent — safe to re-run.
--
-- Domain: three pre-engagement object types
--   crm_accounts        — companies in the pipeline
--   crm_contacts        — people associated with an account
--   crm_opportunities   — pipeline deals tied to an account (and optionally a contact)
--
-- Storage shape mirrors the existing `engagements` table: each row carries
-- the JSONB record in a `data` column, plus per-user scoping (`user_id`)
-- and FK columns for relational integrity.
--
-- After applying this migration, optionally apply the demo seed at the
-- bottom of this file (uncomment the marked block) to populate sample
-- records.
-- ============================================================

-- ── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.crm_accounts (
  id          uuid        PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  data        jsonb       NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id          uuid        PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users (id)        ON DELETE CASCADE,
  account_id  uuid                 REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
  data        jsonb       NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_opportunities (
  id                  uuid        PRIMARY KEY,
  user_id             uuid        NOT NULL REFERENCES auth.users (id)         ON DELETE CASCADE,
  account_id          uuid        NOT NULL REFERENCES public.crm_accounts(id)  ON DELETE CASCADE,
  primary_contact_id  uuid                 REFERENCES public.crm_contacts(id)  ON DELETE SET NULL,
  data                jsonb       NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Rationale on FK ON DELETE behaviour:
--   contacts.account_id → SET NULL: deleting an account leaves orphaned contacts
--                                   instead of cascading. Sales hygiene > tidiness.
--   opportunities.account_id → CASCADE: an opportunity has no meaning without
--                                       its account. If the account goes, the deal goes.
--   opportunities.primary_contact_id → SET NULL: deleting a contact shouldn't
--                                                 erase deal history.

-- ── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS crm_accounts_user_idx        ON public.crm_accounts (user_id);
CREATE INDEX IF NOT EXISTS crm_contacts_user_idx        ON public.crm_contacts (user_id);
CREATE INDEX IF NOT EXISTS crm_contacts_account_idx     ON public.crm_contacts (account_id);
CREATE INDEX IF NOT EXISTS crm_opportunities_user_idx   ON public.crm_opportunities (user_id);
CREATE INDEX IF NOT EXISTS crm_opportunities_acct_idx   ON public.crm_opportunities (account_id);
CREATE INDEX IF NOT EXISTS crm_opportunities_contact_idx ON public.crm_opportunities (primary_contact_id);

-- ── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.crm_accounts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;

-- ── Policies: per-user owner can do anything to their own rows ──────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'crm_accounts' AND policyname = 'self-rw'
  ) THEN
    CREATE POLICY "self-rw"
      ON public.crm_accounts
      FOR ALL
      TO authenticated
      USING      (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'crm_contacts' AND policyname = 'self-rw'
  ) THEN
    CREATE POLICY "self-rw"
      ON public.crm_contacts
      FOR ALL
      TO authenticated
      USING      (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'crm_opportunities' AND policyname = 'self-rw'
  ) THEN
    CREATE POLICY "self-rw"
      ON public.crm_opportunities
      FOR ALL
      TO authenticated
      USING      (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- ── Policies: platform_admin can read/write any row ─────────────────────────
--
-- These subqueries reference public.user_profiles, a different table from the
-- one the policy guards, so no recursion risk (unlike the user_profiles
-- admin-all policy that had to be removed). Safe to keep here.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'crm_accounts' AND policyname = 'admin-all'
  ) THEN
    CREATE POLICY "admin-all"
      ON public.crm_accounts
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles p
          WHERE p.user_id = auth.uid() AND p.role = 'platform_admin' AND p.is_active = true
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_profiles p
          WHERE p.user_id = auth.uid() AND p.role = 'platform_admin' AND p.is_active = true
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'crm_contacts' AND policyname = 'admin-all'
  ) THEN
    CREATE POLICY "admin-all"
      ON public.crm_contacts
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles p
          WHERE p.user_id = auth.uid() AND p.role = 'platform_admin' AND p.is_active = true
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_profiles p
          WHERE p.user_id = auth.uid() AND p.role = 'platform_admin' AND p.is_active = true
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'crm_opportunities' AND policyname = 'admin-all'
  ) THEN
    CREATE POLICY "admin-all"
      ON public.crm_opportunities
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles p
          WHERE p.user_id = auth.uid() AND p.role = 'platform_admin' AND p.is_active = true
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_profiles p
          WHERE p.user_id = auth.uid() AND p.role = 'platform_admin' AND p.is_active = true
        )
      );
  END IF;
END $$;

-- ============================================================
-- Demo seed data — OPTIONAL
-- ============================================================
--
-- Uncomment the block below and run separately to populate sample CRM
-- records on Frank's account. Idempotent on re-run (uses fixed UUIDs and
-- ON CONFLICT DO NOTHING).
--
-- Records inserted:
--   2 accounts        (Acme Robotics, Northwind Logistics)
--   4 contacts        (2 per account)
--   3 opportunities   (covering inbound, discovery_completed, proposal_sent)

/*
DO $$
DECLARE
  v_user_id    uuid;

  -- Fixed UUIDs so re-running is idempotent
  v_acct_acme  uuid := '11111111-1111-1111-1111-111111111111';
  v_acct_nw    uuid := '11111111-1111-1111-1111-111111111112';

  v_ctc_acme1  uuid := '22222222-2222-2222-2222-222222222221';
  v_ctc_acme2  uuid := '22222222-2222-2222-2222-222222222222';
  v_ctc_nw1    uuid := '22222222-2222-2222-2222-222222222223';
  v_ctc_nw2    uuid := '22222222-2222-2222-2222-222222222224';

  v_opp_1      uuid := '33333333-3333-3333-3333-333333333331';
  v_opp_2      uuid := '33333333-3333-3333-3333-333333333332';
  v_opp_3      uuid := '33333333-3333-3333-3333-333333333333';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'frank.barilone.jr@outlook.com';
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Could not find auth user — sign in first.';
  END IF;

  -- ── Accounts ─────────────────────────────────────────────────────────
  INSERT INTO public.crm_accounts (id, user_id, data) VALUES
    (v_acct_acme, v_user_id, jsonb_build_object(
      'id',         v_acct_acme,
      'name',       'Acme Robotics',
      'industry',   'Industrial automation',
      'website',    'https://acme-robotics.example',
      'hqLocation', 'Pittsburgh, PA',
      'sizeBand',   'Mid-market',
      'notes',      'Inbound from a Q3 LinkedIn post. Looking at autonomous QA.',
      'createdAt',  now()::text,
      'updatedAt',  now()::text
    )),
    (v_acct_nw,   v_user_id, jsonb_build_object(
      'id',         v_acct_nw,
      'name',       'Northwind Logistics',
      'industry',   'Logistics & supply chain',
      'website',    'https://northwind.example',
      'hqLocation', 'Chicago, IL',
      'sizeBand',   'Enterprise',
      'notes',      'Referred by a former colleague. CFO sponsoring a cost-takeout initiative.',
      'createdAt',  now()::text,
      'updatedAt',  now()::text
    ))
  ON CONFLICT (id) DO NOTHING;

  -- ── Contacts ─────────────────────────────────────────────────────────
  INSERT INTO public.crm_contacts (id, user_id, account_id, data) VALUES
    (v_ctc_acme1, v_user_id, v_acct_acme, jsonb_build_object(
      'id',        v_ctc_acme1,
      'name',      'Marisol Vega',
      'email',     'marisol.vega@acme-robotics.example',
      'phone',     '+1 412-555-0102',
      'title',     'VP, Operations',
      'accountId', v_acct_acme,
      'notes',     'Day-to-day champion for the QA project.',
      'createdAt', now()::text,
      'updatedAt', now()::text
    )),
    (v_ctc_acme2, v_user_id, v_acct_acme, jsonb_build_object(
      'id',        v_ctc_acme2,
      'name',      'Daniel Park',
      'email',     'daniel.park@acme-robotics.example',
      'phone',     '+1 412-555-0118',
      'title',     'Director, Engineering',
      'accountId', v_acct_acme,
      'notes',     'Technical evaluator. Skeptical, fair.',
      'createdAt', now()::text,
      'updatedAt', now()::text
    )),
    (v_ctc_nw1,   v_user_id, v_acct_nw,   jsonb_build_object(
      'id',        v_ctc_nw1,
      'name',      'Priya Anand',
      'email',     'priya.anand@northwind.example',
      'phone',     '+1 312-555-0203',
      'title',     'Chief Financial Officer',
      'accountId', v_acct_nw,
      'notes',     'Sponsor. Wants 10–12% TCO reduction by FY-end.',
      'createdAt', now()::text,
      'updatedAt', now()::text
    )),
    (v_ctc_nw2,   v_user_id, v_acct_nw,   jsonb_build_object(
      'id',        v_ctc_nw2,
      'name',      'James Calloway',
      'email',     'james.calloway@northwind.example',
      'phone',     '+1 312-555-0214',
      'title',     'VP, Procurement',
      'accountId', v_acct_nw,
      'notes',     'Procurement lead. Will run the eval process.',
      'createdAt', now()::text,
      'updatedAt', now()::text
    ))
  ON CONFLICT (id) DO NOTHING;

  -- ── Opportunities ────────────────────────────────────────────────────
  INSERT INTO public.crm_opportunities
    (id, user_id, account_id, primary_contact_id, data) VALUES
    (v_opp_1, v_user_id, v_acct_acme, v_ctc_acme1, jsonb_build_object(
      'id',                v_opp_1,
      'name',              'Acme — Autonomous QA pilot',
      'accountId',         v_acct_acme,
      'primaryContactId',  v_ctc_acme1,
      'stage',             'discovery_completed',
      'expectedValue',     180000,
      'expectedCloseDate', '2026-08-15',
      'owner',             'Frank Barilone',
      'source',            'Inbound — LinkedIn',
      'notes',             'Discovery wrapped last Tuesday. Drafting proposal next.',
      'createdAt',         now()::text,
      'updatedAt',         now()::text
    )),
    (v_opp_2, v_user_id, v_acct_nw, v_ctc_nw1, jsonb_build_object(
      'id',                v_opp_2,
      'name',              'Northwind — Cost-takeout assessment',
      'accountId',         v_acct_nw,
      'primaryContactId',  v_ctc_nw1,
      'stage',             'proposal_sent',
      'expectedValue',     420000,
      'expectedCloseDate', '2026-07-30',
      'owner',             'Frank Barilone',
      'source',            'Referral',
      'notes',             'Proposal sent Mon. Expecting feedback by EOW.',
      'createdAt',         now()::text,
      'updatedAt',         now()::text
    )),
    (v_opp_3, v_user_id, v_acct_acme, NULL, jsonb_build_object(
      'id',                v_opp_3,
      'name',              'Acme — Phase 2 rollout (TBD)',
      'accountId',         v_acct_acme,
      'primaryContactId',  NULL,
      'stage',             'inbound',
      'expectedValue',     NULL,
      'expectedCloseDate', '',
      'owner',             'Frank Barilone',
      'source',            'Internal expansion',
      'notes',             'Tentative follow-on if pilot succeeds.',
      'createdAt',         now()::text,
      'updatedAt',         now()::text
    ))
  ON CONFLICT (id) DO NOTHING;
END $$;
*/
