-- Migration 014: Add details JSONB to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Notify PostgREST to reload the schema cache so the API recognizes the new column
NOTIFY pgrst, 'reload schema';
