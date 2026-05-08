-- Sprint D1 — Admin / RBAC foundation
--
-- Adds the user_profiles table that backs the in-app admin module. Each row
-- maps a Supabase auth user to an application role (see src/data/roles.js)
-- and an active flag.
--
-- Apply this migration before using the /admin module in production. The app
-- gracefully falls back when the table is missing (dev mode), but real role
-- assignments require the table to exist.
--
-- updated_at is APP-MANAGED in D1 — every mutation in src/lib/userProfilesApi.js
-- sets it explicitly. No ON UPDATE trigger is added in this sprint. If drift
-- becomes an issue, D2 should add a `before update` trigger to set
-- updated_at = now() automatically.

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id      UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT        NOT NULL DEFAULT 'internal_consultant',
  email        TEXT,             -- denormalised from auth.users at provision time
  display_name TEXT,
  org          TEXT,
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sorted listings in the admin UI rely on this column. Cheap covering index.
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON public.user_profiles (email);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ── Policies ────────────────────────────────────────────────────────────────

-- Each user can read their own row. Required by AuthzContext bootstrap.
DROP POLICY IF EXISTS "self read" ON public.user_profiles;
CREATE POLICY "self read"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Each user can lazy-provision their OWN row at the default role on first
-- sign-in. They cannot grant themselves a higher role through this path —
-- the WITH CHECK clause pins the inserted role to the default.
DROP POLICY IF EXISTS "self insert default" ON public.user_profiles;
CREATE POLICY "self insert default"
  ON public.user_profiles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'internal_consultant'
    AND is_active = TRUE
  );

-- Platform admins can read and write any row. The subquery references the
-- same table, which works because RLS does not recursively gate within the
-- same statement when the policy is satisfied.
DROP POLICY IF EXISTS "admin all" ON public.user_profiles;
CREATE POLICY "admin all"
  ON public.user_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'platform_admin'
        AND p.is_active
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'platform_admin'
        AND p.is_active
    )
  );

-- ── Bootstrap seed (uncomment + edit) ───────────────────────────────────────
--
-- Run this once after the migration to give a known account platform_admin.
-- The matching auth user must already exist (sign them up first via the app).
--
-- INSERT INTO public.user_profiles (user_id, role, display_name, is_active)
-- SELECT id, 'platform_admin', email, TRUE
--   FROM auth.users
--  WHERE email = 'admin@barinhall.test'
-- ON CONFLICT (user_id)
-- DO UPDATE SET role = EXCLUDED.role, is_active = EXCLUDED.is_active;
