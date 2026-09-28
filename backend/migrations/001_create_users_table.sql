-- ============================================================
-- MIGRATION 001: Create users table
-- Module: Auth
-- Purpose: Link Firebase UID to app-side profile data.
--          Firebase stores: password hash, email (primary), OAuth tokens.
--          We store: everything the app needs that Firebase does NOT own.
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  -- Internal surrogate PK. Never exposed in URLs; used for FK references
  -- inside the DB (orders, addresses). UUID prevents enumeration attacks.
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The Firebase UID (e.g. "abc123XYZ"). This is the bridge between
  -- Firebase Auth and our database. Every verified ID token carries this.
  -- UNIQUE + NOT NULL: one DB row per Firebase account.
  firebase_uid      TEXT        NOT NULL UNIQUE,

  -- Stored here (not Firebase) so we can do DB-level lookups
  -- (e.g. admin searches by email, order receipts). Firebase is the
  -- authoritative source; we mirror it and keep it in sync on profile update.
  -- NOT NULL because every Firebase account has an email.
  email             TEXT        NOT NULL UNIQUE,

  -- Display name. Populated on first sync after signup / Google OAuth.
  -- Nullable: Google accounts will have it; email/password accounts may not
  -- until the user fills in their profile.
  full_name         TEXT,

  -- Phone number. NOT collected by Firebase for email/password signup.
  -- User fills this in on the /account/settings page.
  -- Nullable: optional field.
  phone             TEXT,

  -- App-level role. Controls access to /admin/* routes on the backend.
  -- 'customer' is the default for all self-registered users.
  -- 'admin' must be set manually by a super-admin (no self-promotion endpoint).
  -- CHECK constraint avoids arbitrary role strings.
  role              TEXT        NOT NULL DEFAULT 'customer'
                    CHECK (role IN ('customer', 'admin')),

  -- Whether the user's Firebase email has been verified.
  -- Synced from the Firebase token claim `email_verified`.
  -- Used to gate certain actions (e.g. block unverified users from checkout if policy requires).
  -- Note: Firebase is the ground truth; this is a convenience cache.
  email_verified    BOOLEAN     NOT NULL DEFAULT FALSE,

  -- ISO 3166-1 alpha-2 country code or free-text locale, for future
  -- localisation / shipping defaults. Nullable, not needed at launch.
  -- Kept here as a placeholder per the mock data (Mumbai, India context).
  -- OPEN QUESTION: confirm if this field is needed at launch.
  -- locale           TEXT,

  -- Soft-delete flag. Allows account deactivation without destroying order history FKs.
  -- A deleted user cannot log in (enforced in application code, not here).
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,

  -- Audit timestamps. Using TIMESTAMPTZ (timezone-aware) is mandatory
  -- for a multi-timezone app (Indian users, potential international).
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Primary lookup path: every authenticated request resolves firebase_uid → row.
-- Already covered by the UNIQUE constraint (which creates a btree index),
-- but explicit declaration makes intent clear.
-- (Supabase/PostgreSQL creates this index automatically from the UNIQUE constraint.)

-- Secondary lookup: admin searches users by email.
-- Already covered by the UNIQUE constraint on email.

-- If full-text search on name is needed later, add a GIN index then.
-- Not added now to keep the schema lean.


-- ============================================================
-- TRIGGER: auto-update updated_at on row modification
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- RLS is DISABLED for this project (Firebase Auth UIDs are not
-- available to Supabase's auth.uid() context). All access control
-- is enforced in FastAPI application code using the service-role key.
-- Do NOT enable RLS here — it would have no effect without the
-- Supabase Auth session context and could create a false sense of security.
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;


-- ============================================================
-- COMMENTS (for Supabase Table Editor visibility)
-- ============================================================
COMMENT ON TABLE  public.users                IS 'App-side user profiles linked to Firebase Auth UIDs.';
COMMENT ON COLUMN public.users.id             IS 'Internal UUID primary key. Not exposed in public URLs.';
COMMENT ON COLUMN public.users.firebase_uid   IS 'Firebase Auth UID from the ID token. Primary join key with Firebase.';
COMMENT ON COLUMN public.users.email          IS 'Mirrored from Firebase. Kept in sync on profile updates.';
COMMENT ON COLUMN public.users.full_name      IS 'Display name. Nullable until user fills profile.';
COMMENT ON COLUMN public.users.phone          IS 'Optional phone number from /account/settings.';
COMMENT ON COLUMN public.users.role           IS 'App role: customer (default) or admin. Set manually by super-admin.';
COMMENT ON COLUMN public.users.email_verified IS 'Mirrors Firebase email_verified claim. Cached for DB queries.';
COMMENT ON COLUMN public.users.is_active      IS 'Soft-delete flag. False = account deactivated.';
COMMENT ON COLUMN public.users.created_at     IS 'UTC timestamp of first profile sync after Firebase signup.';
COMMENT ON COLUMN public.users.updated_at     IS 'UTC timestamp of last profile update. Auto-maintained by trigger.';
