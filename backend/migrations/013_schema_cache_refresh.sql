-- =============================================================================
-- Migration 013: Fix Schema Cache & Gender Column
-- =============================================================================

-- Ensure gender column exists
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT 'Unisex';

-- Force Supabase's PostgREST API to refresh its schema cache 
-- so it can see newly added columns (like gender and sale_price)
NOTIFY pgrst, 'reload schema';
