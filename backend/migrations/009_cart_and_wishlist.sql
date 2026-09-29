-- =============================================================================
-- Migration 009: Cart & Wishlist
-- Module: Cart & Wishlist (Module 5)
-- Tables: cart_items, wishlist_items
-- =============================================================================

-- =============================================================================
-- TABLE: cart_items
-- =============================================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  variant_id  UUID        NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity    INTEGER     NOT NULL CHECK (quantity > 0 AND quantity <= 10),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- A user cannot have multiple rows for the same variant. 
  -- Upserts will merge quantities.
  UNIQUE (user_id, variant_id)
);

-- Index for retrieving a user's cart efficiently
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- Trigger: keep updated_at current
CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- TABLE: wishlist_items
-- =============================================================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- A user cannot wishlist the same product multiple times.
  UNIQUE (user_id, product_id)
);

-- Index for retrieving a user's wishlist efficiently
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);

-- =============================================================================
-- RPC: upsert_cart_item
-- Atomically adds/updates a cart item and returns cap information.
-- =============================================================================
CREATE OR REPLACE FUNCTION upsert_cart_item(
  p_user_id UUID,
  p_variant_id UUID,
  p_requested_qty INTEGER,
  p_is_update BOOLEAN
) RETURNS json AS $$
DECLARE
  v_stock INTEGER;
  v_is_active BOOLEAN;
  v_product_status TEXT;
  v_existing_qty INTEGER;
  v_target_qty INTEGER;
  v_final_qty INTEGER;
  v_capped_reason TEXT := NULL;
BEGIN
  -- 0. Acquire a session-level advisory transaction lock keyed on the
  --    (user_id, variant_id) pair. This serializes ALL concurrent calls
  --    for the same user+variant — including the brand-new-row case where
  --    SELECT ... FOR UPDATE has nothing to lock yet.
  --    The lock is automatically released at transaction end.
  PERFORM pg_advisory_xact_lock(
    hashtext(p_user_id::text || '::' || p_variant_id::text)
  );

  -- 1. Get variant stock and status
  SELECT pv.stock, pv.is_active, p.status
  INTO v_stock, v_is_active, v_product_status
  FROM product_variants pv
  JOIN products p ON p.id = pv.product_id
  WHERE pv.id = p_variant_id;

  IF NOT FOUND THEN
    -- CART001: variant does not exist
    RAISE EXCEPTION 'Variant not found'
      USING ERRCODE = 'C0001';
  END IF;

  IF v_is_active = FALSE OR v_product_status != 'Active' THEN
    -- CART002: variant or parent product is inactive/archived
    RAISE EXCEPTION 'Product is not active'
      USING ERRCODE = 'C0002';
  END IF;

  -- 2. Get existing cart row quantity (if any). No FOR UPDATE needed now —
  --    the advisory lock above already serializes concurrent access.
  SELECT quantity INTO v_existing_qty
  FROM cart_items
  WHERE user_id = p_user_id AND variant_id = p_variant_id;

  -- 3. Compute target quantity
  IF p_is_update THEN
    -- PATCH: replace, not accumulate
    v_target_qty := p_requested_qty;
  ELSE
    -- POST add/merge: accumulate on top of whatever is already there
    v_target_qty := COALESCE(v_existing_qty, 0) + p_requested_qty;
  END IF;

  -- 4. Apply caps (both stock and hard max of 10)
  v_final_qty := LEAST(v_target_qty, v_stock, 10);

  -- Determine which cap triggered (stock wins when both would apply)
  IF v_final_qty < v_target_qty THEN
    IF v_final_qty = v_stock THEN
      v_capped_reason := 'insufficient_stock';
    ELSE
      v_capped_reason := 'max_quantity_limit';
    END IF;
  END IF;

  IF v_final_qty <= 0 THEN
    -- CART003: stock is zero, cannot add
    RAISE EXCEPTION 'Insufficient stock'
      USING ERRCODE = 'C0003';
  END IF;

  -- 5. Atomic upsert
  INSERT INTO cart_items (user_id, variant_id, quantity)
  VALUES (p_user_id, p_variant_id, v_final_qty)
  ON CONFLICT (user_id, variant_id)
  DO UPDATE SET quantity = v_final_qty, updated_at = now();

  -- 6. Return cap details for the Python layer to surface to the frontend
  RETURN json_build_object(
    'variant_id', p_variant_id,
    'requested_quantity', p_requested_qty,
    'target_quantity', v_target_qty,
    'actual_quantity', v_final_qty,
    'capped_reason', v_capped_reason
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- END OF MIGRATION 009
-- =============================================================================
