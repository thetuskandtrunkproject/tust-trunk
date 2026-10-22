-- =============================================================================
-- Migration 022: Update Combo Offers Sequence Type to Support Table Multiples
-- =============================================================================

-- Drop the previous check constraint that restricted sequence_type to ('even', 'odd')
ALTER TABLE IF EXISTS combo_offers 
  DROP CONSTRAINT IF EXISTS combo_offers_sequence_type_check;

-- Add updated check constraint allowing 'multiple', 'table', 'even', 'odd'
ALTER TABLE IF EXISTS combo_offers 
  ADD CONSTRAINT combo_offers_sequence_type_check 
  CHECK (sequence_type IN ('multiple', 'table', 'even', 'odd'));

-- Update existing records to 'multiple'
UPDATE combo_offers SET sequence_type = 'multiple' WHERE sequence_type IN ('even', 'odd');

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
