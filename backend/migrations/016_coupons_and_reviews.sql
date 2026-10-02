-- =============================================================================
-- Migration 016: Coupons and Reviews (Module 9)
-- =============================================================================

-- =============================================================================
-- COUPONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percent', 'flat', 'free_shipping')),
    discount_value INTEGER NOT NULL, -- percentage amount OR flat amount in paise
    min_cart_value_paise INTEGER,
    max_discount_cap_paise INTEGER,
    total_usage_limit INTEGER,
    per_user_limit INTEGER,
    usage_count INTEGER NOT NULL DEFAULT 0,
    scope VARCHAR(50) NOT NULL DEFAULT 'store_wide',
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    guest_email VARCHAR(255),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    discount_amount_paise INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON coupon_redemptions(coupon_id, user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_email ON coupon_redemptions(coupon_id, guest_email);

-- Add coupon fields to checkout sessions and orders
ALTER TABLE checkout_sessions
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS discount_paise INTEGER NOT NULL DEFAULT 0;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS discount_paise INTEGER NOT NULL DEFAULT 0;

-- =============================================================================
-- REVIEWS
-- =============================================================================

CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    guest_email VARCHAR(255),
    reviewer_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    body_text TEXT NOT NULL,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(product_id, user_id),
    UNIQUE(product_id, guest_email)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);


-- =============================================================================
-- REVISED commit_order RPC
-- =============================================================================

CREATE OR REPLACE FUNCTION commit_order(
  p_razorpay_order_id   TEXT,
  p_razorpay_payment_id TEXT,
  p_triggered_by        TEXT
) RETURNS json AS $$
DECLARE
  v_session             checkout_sessions%ROWTYPE;
  v_item                JSONB;
  v_variant_id          UUID;
  v_quantity            INTEGER;
  v_stock               INTEGER;
  v_order_id            UUID;
  v_order_number        TEXT;
  v_status              TEXT    := 'Processing';
  v_stock_sufficient    BOOLEAN := TRUE;
  v_existing_order_id   UUID;
  v_existing_order_num  TEXT;
  v_coupon_id           UUID;
BEGIN

  PERFORM pg_advisory_xact_lock(hashtext(p_razorpay_payment_id));

  SELECT id, order_number
  INTO v_existing_order_id, v_existing_order_num
  FROM orders
  WHERE razorpay_payment_id = p_razorpay_payment_id;

  IF FOUND THEN
    RETURN json_build_object(
      'order_id',         v_existing_order_id,
      'order_number',     v_existing_order_num,
      'status',           (SELECT status FROM orders WHERE id = v_existing_order_id),
      'total_paise',      (SELECT total_paise FROM orders WHERE id = v_existing_order_id),
      'requires_review',  (SELECT status = 'requires_review' FROM orders WHERE id = v_existing_order_id),
      'already_committed', TRUE
    );
  END IF;

  SELECT * INTO v_session
  FROM checkout_sessions
  WHERE razorpay_order_id = p_razorpay_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Checkout session not found for razorpay_order_id: %', p_razorpay_order_id
      USING ERRCODE = 'C1001';
  END IF;

  IF v_session.expires_at < now() THEN
    RAISE EXCEPTION 'Checkout session has expired'
      USING ERRCODE = 'C1002';
  END IF;

  IF v_session.used_at IS NOT NULL THEN
    RAISE EXCEPTION 'Checkout session already used'
      USING ERRCODE = 'C1003';
  END IF;

  FOR v_item IN
    SELECT value FROM jsonb_array_elements(v_session.validated_items) AS value
    ORDER BY (value->>'variant_id')::text
  LOOP
    v_variant_id := (v_item->>'variant_id')::UUID;
    SELECT stock INTO v_stock
    FROM product_variants
    WHERE id = v_variant_id
    FOR UPDATE;

    IF NOT FOUND OR v_stock < (v_item->>'quantity')::INTEGER THEN
      v_stock_sufficient := FALSE;
    END IF;
  END LOOP;

  v_order_number := 'ORD-TT-' || LPAD(nextval('order_number_seq')::text, 3, '0');

  IF v_stock_sufficient THEN
    FOR v_item IN SELECT value FROM jsonb_array_elements(v_session.validated_items) AS value
    LOOP
      UPDATE product_variants
      SET stock = stock - (v_item->>'quantity')::INTEGER,
          updated_at = now()
      WHERE id = (v_item->>'variant_id')::UUID;
    END LOOP;
    v_status := 'Processing';
  ELSE
    v_status := 'requires_review';
  END IF;

  INSERT INTO orders (
    user_id,
    guest_email,
    guest_phone,
    order_number,
    status,
    shipping_address,
    subtotal_paise,
    delivery_fee_paise,
    total_paise,
    coupon_code,
    discount_paise,
    razorpay_order_id,
    razorpay_payment_id
  )
  VALUES (
    v_session.user_id,
    v_session.contact->>'email',
    v_session.contact->>'phone',
    v_order_number,
    v_status,
    v_session.shipping,
    v_session.subtotal_paise,
    v_session.delivery_fee_paise,
    v_session.total_paise,
    v_session.coupon_code,
    v_session.discount_paise,
    p_razorpay_order_id,
    p_razorpay_payment_id
  )
  RETURNING id INTO v_order_id;

  -- Create order_items
  FOR v_item IN SELECT value FROM jsonb_array_elements(v_session.validated_items) AS value
  LOOP
    INSERT INTO order_items (
      order_id,
      variant_id,
      sku_snapshot,
      product_name_snapshot,
      size_snapshot,
      quantity,
      price_at_purchase
    )
    VALUES (
      v_order_id,
      (v_item->>'variant_id')::UUID,
      v_item->>'sku_snapshot',
      v_item->>'product_name_snapshot',
      v_item->>'size_snapshot',
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price_paise')::INTEGER
    );
  END LOOP;

  -- Handle Coupon Redemption Logging
  IF v_stock_sufficient AND v_session.coupon_code IS NOT NULL THEN
    SELECT id INTO v_coupon_id FROM coupons WHERE code = v_session.coupon_code;
    IF FOUND THEN
      INSERT INTO coupon_redemptions (
        coupon_id,
        user_id,
        guest_email,
        order_id,
        discount_amount_paise
      ) VALUES (
        v_coupon_id,
        v_session.user_id,
        CASE WHEN v_session.user_id IS NULL THEN v_session.contact->>'email' ELSE NULL END,
        v_order_id,
        v_session.discount_paise
      );
      
      UPDATE coupons SET usage_count = usage_count + 1 WHERE id = v_coupon_id;
    END IF;
  END IF;

  IF v_session.user_id IS NOT NULL AND v_stock_sufficient THEN
    DELETE FROM cart_items WHERE user_id = v_session.user_id;
  END IF;

  UPDATE checkout_sessions
  SET used_at = now()
  WHERE id = v_session.id;

  RETURN json_build_object(
    'order_id',          v_order_id,
    'order_number',      v_order_number,
    'status',            v_status,
    'total_paise',       v_session.total_paise,
    'requires_review',   (v_status = 'requires_review'),
    'already_committed', FALSE
  );

END;
$$ LANGUAGE plpgsql;
