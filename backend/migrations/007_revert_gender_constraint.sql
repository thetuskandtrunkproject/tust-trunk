-- =============================================================================
-- Migration 007: Revert Gender Constraint and Cleanup
-- =============================================================================

DO $$
DECLARE
    invalid_products_count int;
    con_name text;
BEGIN
    -- 1. Safety check: ensure no products currently have 'Men' or 'Unisex'
    SELECT count(*) INTO invalid_products_count
    FROM products
    WHERE gender NOT IN ('Women', 'Kids');
    
    IF invalid_products_count > 0 THEN
        RAISE EXCEPTION 'Cannot revert gender constraint: % products exist with invalid genders.', invalid_products_count;
    END IF;

    -- 2. Safely find and drop the current gender constraint on products
    SELECT conname INTO con_name
    FROM pg_constraint
    WHERE conrelid = 'products'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%gender%';
      
    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE products DROP CONSTRAINT ' || quote_ident(con_name);
    END IF;

    -- 3. Re-add the strict two-option constraint
    ALTER TABLE products ADD CONSTRAINT products_gender_check CHECK (gender IN ('Women', 'Kids'));

    -- 4. Drop the unauthorized categories.gender column
    -- Rationale: A single category (e.g., "T-Shirts") naturally applies to multiple genders 
    -- (both Women and Kids). Since gender is defined at the product level, restricting a 
    -- category to a single gender forces category duplication ("Women T-Shirts", "Kids T-Shirts") 
    -- and breaks normalization. It is not needed and should be dropped.
    ALTER TABLE categories DROP COLUMN IF EXISTS gender;
    
END $$;
