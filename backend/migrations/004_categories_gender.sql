-- =============================================================================
-- Migration 004: Add Gender to Categories
-- =============================================================================

ALTER TABLE categories ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT 'Unisex';
