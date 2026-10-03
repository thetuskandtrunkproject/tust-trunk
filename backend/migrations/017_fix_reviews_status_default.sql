-- =============================================================================
-- Migration 017: Emergency fix — product_reviews.status DEFAULT
-- =============================================================================
--
-- PROBLEM (found in audit, 2026-10-03):
--   Migration 016 created product_reviews with:
--     status VARCHAR(20) NOT NULL DEFAULT 'approved'
--
--   The application-layer POST handler overrides this to 'pending' when
--   inserting new reviews, so the moderation gate works in practice.
--   However, the DB-level default is 'approved', meaning any direct INSERT
--   that omits the status field (SQL console, future code path, migration
--   script, test fixture, bypass of the Python layer) will publish a review
--   immediately and silently, skipping moderation.
--
-- FIX:
--   Change the column DEFAULT to 'pending' so the schema and application
--   intent agree. The CHECK constraint (approved/pending/rejected) is
--   already in place and is not modified here.
--
-- SCOPE: single ALTER TABLE, no data migration required.
--   Existing rows already have an explicit status value; changing the
--   DEFAULT does not affect any existing row.
-- =============================================================================

ALTER TABLE product_reviews
    ALTER COLUMN status SET DEFAULT 'pending';
