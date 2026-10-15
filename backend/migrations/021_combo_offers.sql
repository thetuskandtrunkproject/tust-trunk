-- =============================================================================
-- Migration 021: Category-Based Combo Offers
-- =============================================================================

CREATE TABLE IF NOT EXISTS combo_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL CHECK (min_quantity >= 1),
    sequence_type VARCHAR(20) NOT NULL CHECK (sequence_type IN ('even', 'odd')),
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('flat', 'percent')),
    discount_value INTEGER NOT NULL CHECK (discount_value > 0), -- Paise for flat discount per product, OR integer percentage (1-100) for percent
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_combo_offers_category_id ON combo_offers(category_id);
CREATE INDEX IF NOT EXISTS idx_combo_offers_active ON combo_offers(is_active);

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS trg_combo_offers_updated_at ON combo_offers;
CREATE TRIGGER trg_combo_offers_updated_at
  BEFORE UPDATE ON combo_offers
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
