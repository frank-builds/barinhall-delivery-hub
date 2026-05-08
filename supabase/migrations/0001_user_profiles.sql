-- ============================================================
-- Sprint D1 — user_profiles table, RLS policies, and indexes
-- ============================================================
--
-- Apply this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- The migration is idempotent: each statement is safe to re-run.
--
-- After running, also apply the D1.1 seed snippet at the bottom of this file
-- to promote Frank's account to platform_admin in the database.
-- (The VITE_PLATFORM_ADMIN_EMAIL env-var override covers dev until you do this.)
-- ============================================================

-- ── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id      uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role         text        NOT NULL DEFAULT 'internal_consultant',
  email        text,                              -- denormalised for admin sorting
  display_name text,
  org          text,
  is_active    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now() -- app-managed; no trigger in D1
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS user_profiles_role_idx
  ON public.user_profiles (role);

CREATE INDEX IF NOT EXISTS user_profiles_email_idx
  ON public.user_profiles (email NULLS LAST);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 1. Authenticated users can read their own row.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'self-read'
  ) THEN
    CREATE POLICY "self-read"
      ON public.user_profiles
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- 2. Authenticated users can insert only a default internal_consultant row for themselves.
--    (The CHECK constraint blocks self-promotion via insert.)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'self-insert-default'
  ) THEN
    CREATE POLICY "self-insert-default"
      ON public.user_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (
        user_id = auth.uid()
        AND role = 'internal_consultant'
      );
  END IF;
END $$;

-- 3. platform_admin users can read, insert, update, and delete any profile.
--    Uses a subquery so we don't need a separate function; safe for D1 scale.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'admin-all'
  ) THEN
    CREATE POLICY "admin-all"
      ON public.user_profiles
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.user_profiles admin_row
          WHERE admin_row.user_id   = auth.uid()
            AND admin_row.role      = 'platform_admin'
            AND admin_row.is_active = true
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.user_profiles admin_row
          WHERE admin_row.user_id   = auth.uid()
            AND admin_row.role      = 'platform_admin'
            AND admin_row.is_active = true
        )
      );
  END IF;
END $$;

-- ── Generic seed (optional, commented out) ───────────────────────────────────
--
-- Replace <email> and <role> with real values, then uncomment and run.
--
-- INSERT INTO public.user_profiles (user_id, role, email, display_name, is_active)
-- SELECT id, '<role>', email, email, TRUE
--   FROM auth.users
--  WHERE email = '<email>'
-- ON CONFLICT (user_id)
-- DO UPDATE SET role = EXCLUDED.role, is_active = TRUE, updated_at = NOW();

-- ── Sprint D1.1 — promote Frank to platform_admin ────────────────────────────
--
-- Apply this once Frank has signed in at least once (so the auth.users row
-- exists). Idempotent — safe to re-run.
--
-- Paste this block into the Supabase SQL editor and run when ready to make
-- the promotion permanent (removes dependency on VITE_PLATFORM_ADMIN_EMAIL).

INSERT INTO public.user_profiles (user_id, role, email, display_name, is_active)
SELECT id, 'platform_admin', email, email, TRUE
  FROM auth.users
 WHERE email = 'frank.barilone.jr@outlook.com'
ON CONFLICT (user_id)
DO UPDATE SET role = EXCLUDED.role, is_active = TRUE, updated_at = NOW();
