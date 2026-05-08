-- ============================================================
-- Sprint D4 — CRM-lite leads table, RLS policies, indexes, seed
-- ============================================================
--
-- Apply this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Idempotent — safe to re-run.
--
-- Adds the `crm_leads` table for top-of-funnel intake. Storage shape mirrors
-- the existing CRM tables exactly: per-user scope via `user_id`, free-form
-- record stored in JSONB `data` column, app-managed timestamps.
--
-- Why a separate table (not a flag on crm_opportunities):
--   - Leads have intake-specific fields (source, fitRating, companySize) that
--     don't belong on opportunity records.
--   - Dedup on email is meaningful for leads, not for deals.
--   - The natural D5 hand-off (Lead → Opportunity promotion) becomes a clean,
--     explicit data-model transition rather than a stage flip.
--
-- After applying this migration, optionally apply the demo seed at the
-- bottom (uncomment the marked block) to populate sample lead records.
-- ============================================================

-- ── Table ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.crm_leads (
  id          uuid        PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  data        jsonb       NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS crm_leads_user_idx
  ON public.crm_leads (user_id);

-- Expression index on lower(email) accelerates dedup queries that lookup an
-- email case-insensitively. Matches the dedup logic in the JS layer.
CREATE INDEX IF NOT EXISTS crm_leads_email_idx
  ON public.crm_leads (lower(data->>'email'));

-- ── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- Owner can do anything with their own rows.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'crm_leads' AND policyname = 'self-rw'
  ) THEN
    CREATE POLICY "self-rw"
      ON public.crm_leads
      FOR ALL
      TO authenticated
      USING      (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Platform admins can read/write any row. Subquery references user_profiles
-- (a different table from the one this policy guards) so no recursion risk.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'crm_leads' AND policyname = 'admin-all'
  ) THEN
    CREATE POLICY "admin-all"
      ON public.crm_leads
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
-- Uncomment the block below to populate 4 sample leads on Frank's account
-- spanning multiple sources/fit ratings/sizes. Useful for visual verification
-- of the scoring rules. Idempotent (fixed UUIDs + ON CONFLICT DO NOTHING).
--
-- Records inserted:
--   1 referral / hot / enterprise        → expected score: 95 (hot tier)
--   1 inbound / warm / mid-market        → expected score: 65 (warm tier)
--   1 outbound / cold / smb              → expected score: 35 (cold tier)
--   1 partner / hot / startup            → expected score: 80 (hot tier)

/*
DO $$
DECLARE
  v_user_id  uuid;
  v_lead_1   uuid := '44444444-4444-4444-4444-444444444441';
  v_lead_2   uuid := '44444444-4444-4444-4444-444444444442';
  v_lead_3   uuid := '44444444-4444-4444-4444-444444444443';
  v_lead_4   uuid := '44444444-4444-4444-4444-444444444444';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'frank.barilone.jr@outlook.com';
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Could not find auth user — sign in first.';
  END IF;

  INSERT INTO public.crm_leads (id, user_id, data) VALUES
    (v_lead_1, v_user_id, jsonb_build_object(
      'id',                      v_lead_1,
      'name',                    'Sarah Linden',
      'email',                   'sarah.linden@globex.example',
      'company',                 'Globex Manufacturing',
      'title',                   'VP Operations',
      'phone',                   '+1 415-555-0184',
      'source',                  'referral',
      'status',                  'qualified',
      'fitRating',               'hot',
      'industry',                'Industrial manufacturing',
      'companySize',             'enterprise',
      'tags',                    jsonb_build_array('priority', 'q3-target'),
      'notes',                   'Introduced by an existing client. Budget pre-approved.',
      'notesLog',                jsonb_build_array(),
      'promotedToOpportunityId', NULL,
      'createdBy',               'frank.barilone.jr@outlook.com',
      'createdAt',               now()::text,
      'updatedAt',               now()::text
    )),
    (v_lead_2, v_user_id, jsonb_build_object(
      'id',                      v_lead_2,
      'name',                    'Marcus Reilly',
      'email',                   'marcus@harbor-co.example',
      'company',                 'Harbor & Co',
      'title',                   'Director of Strategy',
      'phone',                   '',
      'source',                  'inbound',
      'status',                  'new',
      'fitRating',               'warm',
      'industry',                'Professional services',
      'companySize',             'mid-market',
      'tags',                    jsonb_build_array('content-marketing'),
      'notes',                   'Filled out the contact form after reading the Q2 case study.',
      'notesLog',                jsonb_build_array(),
      'promotedToOpportunityId', NULL,
      'createdBy',               'frank.barilone.jr@outlook.com',
      'createdAt',               now()::text,
      'updatedAt',               now()::text
    )),
    (v_lead_3, v_user_id, jsonb_build_object(
      'id',                      v_lead_3,
      'name',                    'Yuki Tanaka',
      'email',                   'ytanaka@small-craft.example',
      'company',                 'Small Craft Co',
      'title',                   'Owner',
      'phone',                   '',
      'source',                  'outbound',
      'status',                  'new',
      'fitRating',               'cold',
      'industry',                '',
      'companySize',             'smb',
      'tags',                    jsonb_build_array('cold-list-q2'),
      'notes',                   'Cold outreach. No response yet.',
      'notesLog',                jsonb_build_array(),
      'promotedToOpportunityId', NULL,
      'createdBy',               'frank.barilone.jr@outlook.com',
      'createdAt',               now()::text,
      'updatedAt',               now()::text
    )),
    (v_lead_4, v_user_id, jsonb_build_object(
      'id',                      v_lead_4,
      'name',                    'Olivia Chen',
      'email',                   'olivia@sprout-labs.example',
      'company',                 'Sprout Labs',
      'title',                   'Founder',
      'phone',                   '+1 206-555-0145',
      'source',                  'partner',
      'status',                  'qualified',
      'fitRating',               'hot',
      'industry',                'AI tooling',
      'companySize',             'startup',
      'tags',                    jsonb_build_array('partner-intro'),
      'notes',                   'Routed via a partner accelerator. Active interest in pilot.',
      'notesLog',                jsonb_build_array(),
      'promotedToOpportunityId', NULL,
      'createdBy',               'frank.barilone.jr@outlook.com',
      'createdAt',               now()::text,
      'updatedAt',               now()::text
    ))
  ON CONFLICT (id) DO NOTHING;
END $$;
*/
