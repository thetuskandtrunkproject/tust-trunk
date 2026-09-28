-- =============================================================================
-- Migration 005: Fix Product Gender Constraint
-- =============================================================================

-- Safely find and drop the existing check constraint on the gender column
DO $$
DECLARE
    con_name text;
BEGIN
    SELECT conname INTO con_name
    FROM pg_constraint
    WHERE conrelid = 'products'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%gender%';
      
    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE products DROP CONSTRAINT ' || quote_ident(con_name);
    END IF;
END $$;

-- Add the updated constraint that includes all 4 options
ALTER TABLE products ADD CONSTRAINT products_gender_check CHECK (gender IN ('Men', 'Women', 'Kids', 'Unisex'));
