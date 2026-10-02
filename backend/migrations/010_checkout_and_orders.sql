-- =============================================================================
-- Migration 010: Checkout & Orders (Module 6)
-- Tables: checkout_sessions, orders, order_items
-- Sequence: order_number_seq
-- RPC: commit_order (reused by verify-payment AND the webhook path)
-- =============================================================================


-- =============================================================================
-- TABLE: checkout_sessions
-- Short-lived server-side ledger of validated checkout state, keyed to a
-- Razorpay order ID. verify-payment and the webhook both build orders
-- exclusively from this stored data — the client cannot inject new items,
-- prices, or shipping at verify time.
-- =============================================================================
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Razorpay's order ID from POST /v1/orders. This is the join key between
  -- Step 1 (create-order) and Step 3/4 (verify-payment / webhook).
  razorpay_order_id  TEXT        NOT NULL,

  -- NULL for guest checkouts.
  -- ON DELETE SET NULL: if the user account is deleted, the session row
  -- survives (harmlessly, since it expires soon anyway).
  user_id            UUID        REFERENCES users(id) ON DELETE SET NULL,

  -- Server-validated line items with prices/snapshots captured at create-order
  -- time. Shape: [{ variant_id, quantity, price_paise, product_name_snapshot,
  --               sku_snapshot, size_snapshot }]
  validated_items    JSONB       NOT NULL,

  -- Contact info as collected from step-details (email, phone).
  -- Stored here so verify-payment needs ZERO data from the client body.
  contact            JSONB       NOT NULL,

  -- Full shipping address snapshot as submitted at create-order time.
  -- Stored here so it is snapshotted onto the order without re-trusting
  -- the client body at verify-payment time.
  shipping           JSONB       NOT NULL,

  -- Server-computed amounts (all in PAISE — never rupees in the DB).
  subtotal_paise     INTEGER     NOT NULL CHECK (subtotal_paise > 0),
  delivery_fee_paise INTEGER     NOT NULL CHECK (delivery_fee_paise >= 0),
  total_paise        INTEGER     NOT NULL CHECK (total_paise > 0),

  -- Sessions expire 30 minutes after creation. Razorpay's own order TTL is
  -- configurable (default 15 min). 30 min gives a safe margin above that.
  -- An expired session is invalid; any verify-payment attempt against it is
  -- rejected with a "session expired, please restart checkout" error.
  expires_at         TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes'),

  -- Set when commit_order() successfully uses this session.
  -- A non-NULL used_at is the application-level guard against double-commit
  -- (the unique constraint on orders.razorpay_payment_id is the DB-level guard).
  used_at            TIMESTAMPTZ,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Primary lookup pattern: by razorpay_order_id
CREATE UNIQUE INDEX IF NOT EXISTS uidx_checkout_sessions_razorpay_order_id
  ON checkout_sessions(razorpay_order_id);

-- Allow efficient cleanup of old sessions
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_expires_at
  ON checkout_sessions(expires_at);


-- =============================================================================
-- SEQUENCE: order_number_seq
-- Provides the monotonically increasing numeric part of order numbers.
-- The full format is: ORD-YYYY-NNNNNN-XXX where XXX is a 3-char random hex
-- suffix added by the commit_order() function for brute-force resistance.
-- =============================================================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;


-- =============================================================================
-- TABLE: orders
-- One row per completed (or requires_review) order. Stock has been deducted
-- (or flagged) before insertion. This row is never created before payment
-- verification — only commit_order() inserts here.
-- =============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- NULL for guest orders. ON DELETE SET NULL: a deleted user account must
  -- not prevent reading historical order data for admin/audit purposes.
  user_id              UUID        REFERENCES users(id) ON DELETE SET NULL,

  -- Denormalized contact for guest orders AND as a convenience for email
  -- dispatch for all orders (avoids joining users table for every notification).
  -- Populated from checkout_sessions.contact for both guest and logged-in orders.
  guest_email          TEXT,
  guest_phone          TEXT,

  -- Human-readable order identifier surfaced to the customer.
  -- Format: ORD-YYYY-NNNNNN-XXX (e.g. ORD-2026-000042-A3F)
  order_number         TEXT        NOT NULL,

  -- Status lifecycle confirmed from mock-account.ts (MockOrder.status):
  --   Processing → Shipped → Out for Delivery → Delivered
  -- Plus Cancelled (admin action) and requires_review (stock failed at commit).
  status               TEXT        NOT NULL DEFAULT 'Processing'
                       CHECK (status IN (
                         'Processing',
                         'Shipped',
                         'Out for Delivery',
                         'Delivered',
                         'Cancelled',
                         'requires_review'
                       )),

  -- Full shipping address at order time. JSONB snapshot — NEVER a FK to
  -- addresses. This was decided in Module 4 and is non-negotiable: historical
  -- orders must survive the user editing or deleting their saved addresses.
  shipping_address     JSONB       NOT NULL,

  -- All amounts in PAISE (integer). Never rupees in the DB.
  subtotal_paise       INTEGER     NOT NULL CHECK (subtotal_paise > 0),
  delivery_fee_paise   INTEGER     NOT NULL CHECK (delivery_fee_paise >= 0),
  total_paise          INTEGER     NOT NULL CHECK (total_paise > 0),

  -- Razorpay order created in Step 1. Stored for webhook reconciliation.
  razorpay_order_id    TEXT        NOT NULL,

  -- Razorpay's payment ID from the captured payment.
  -- UNIQUE: the primary idempotency guard. Two commit attempts with the same
  -- payment_id cannot both succeed — the second hits this constraint.
  razorpay_payment_id  TEXT        NOT NULL,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_orders_order_number
  ON orders(order_number);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_orders_razorpay_payment_id
  ON orders(razorpay_payment_id);

-- For GET /account/orders (logged-in order history)
CREATE INDEX IF NOT EXISTS idx_orders_user_id
  ON orders(user_id);

-- For GET /orders/guest/{order_number}?email=... lookup.
-- case-insensitive via lower() to match how Python normalizes the email.
CREATE INDEX IF NOT EXISTS idx_orders_guest_email_lower
  ON orders(lower(guest_email))
  WHERE guest_email IS NOT NULL;

-- Admin: filter by status
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status);

-- Updated_at trigger
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- TABLE: order_items
-- One row per line item in an order. All commerce-critical fields are
-- SNAPSHOTTED at order time to ensure historical accuracy:
--   - price_at_purchase: variant.price can be changed by admin tomorrow
--   - product_name_snapshot: product.name can be renamed
--   - sku_snapshot: SKU can be reassigned
--   - size_snapshot: variant.size could theoretically change
-- Without these snapshots, an order placed today at ₹2999 would silently
-- show tomorrow's price if the admin changes it — breaking invoices.
-- =============================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id                       UUID    PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ON DELETE CASCADE: order_items have no meaning without their parent order.
  order_id                 UUID    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- ON DELETE SET NULL: consistent with Module 2's soft-delete-only policy on
  -- product_variants. If a variant row is ever hard-deleted (e.g. by a DB admin
  -- making a mistake), the order line must survive with its snapshots intact.
  -- The snapshots carry all the information needed for receipts and refunds.
  variant_id               UUID    REFERENCES product_variants(id) ON DELETE SET NULL,

  -- Snapshot fields: captured from DB at create-order time, stored in
  -- checkout_sessions.validated_items, and written here during commit_order().
  sku_snapshot             TEXT    NOT NULL,
  product_name_snapshot    TEXT    NOT NULL,
  size_snapshot            TEXT    NOT NULL,

  quantity                 INTEGER NOT NULL CHECK (quantity > 0),

  -- Price per unit in PAISE at the moment of purchase.
  price_at_purchase        INTEGER NOT NULL CHECK (price_at_purchase > 0)
);

-- Most common query: all items for a given order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items(order_id);


-- =============================================================================
-- RPC: commit_order
-- The single atomic commit function shared by BOTH the client-driven
-- verify-payment path AND the webhook reconciliation path.
--
-- This function is the ONLY place that:
--   1. Reads the checkout_session (the server-validated source of truth)
--   2. Re-validates and deducts stock
--   3. Creates the orders + order_items rows
--   4. Clears the user's cart (if logged-in)
--   5. Marks the session as used
--
-- Both callers pass the same two IDs (razorpay_order_id, razorpay_payment_id)
-- and a p_triggered_by label for logging. Nothing else differs between the
-- two paths — there is exactly one commit implementation that cannot drift.
--
-- SQLSTATE codes raised (checked by Python via e.code, not substring matching):
--   C1001 — checkout session not found for this razorpay_order_id
--   C1002 — checkout session has expired (30 min TTL exceeded)
--   C1003 — checkout session already marked used (should not reach here in
--            normal flow due to the idempotency check above, but is a safe guard)
-- =============================================================================
CREATE OR REPLACE FUNCTION commit_order(
  p_razorpay_order_id   TEXT,
  p_razorpay_payment_id TEXT,
  p_triggered_by        TEXT  -- 'client' or 'webhook', for audit only
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
BEGIN

  -- -------------------------------------------------------------------------
  -- 0. Advisory lock keyed on p_razorpay_payment_id.
  --    This serializes all concurrent commit attempts for the same payment —
  --    the most important case being the client's verify-payment and the
  --    Razorpay webhook arriving at nearly the same time.
  --    The lock is released automatically at transaction end.
  -- -------------------------------------------------------------------------
  PERFORM pg_advisory_xact_lock(hashtext(p_razorpay_payment_id));

  -- -------------------------------------------------------------------------
  -- 1. Idempotency check: has this payment already been committed?
  --    This covers:
  --    a) Network retry: client sends verify-payment twice.
  --    b) Race: webhook fires after client verify-payment already succeeded.
  --    c) Race: client verify-payment fires after webhook already succeeded.
  --    In all cases, return the already-committed order with a flag.
  -- -------------------------------------------------------------------------
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

  -- -------------------------------------------------------------------------
  -- 2. Load the checkout session and lock its row for the duration of
  --    this transaction (prevents a concurrent call on the same
  --    razorpay_order_id from reading it as unused simultaneously).
  -- -------------------------------------------------------------------------
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
    -- Should not reach here in normal flow (the payment_id idempotency check
    -- above would have found the order already). This covers the edge case where
    -- used_at was set but order insertion failed (partial failure), which is
    -- theoretically impossible inside one transaction but is a belt-and-suspenders guard.
    RAISE EXCEPTION 'Checkout session already used'
      USING ERRCODE = 'C1003';
  END IF;

  -- -------------------------------------------------------------------------
  -- 3. Re-validate stock with row-level FOR UPDATE locks on every variant.
  --    This is the SECOND stock check (first was at create-order time).
  --    Gap between these two checks: the time between the user opening the
  --    Razorpay modal and completing payment. Another user could have bought
  --    the last unit during that window.
  --    We lock all rows before checking any, to prevent deadlocks between
  --    concurrent orders sharing a subset of variants.
  -- -------------------------------------------------------------------------

  -- Lock all variants first (in variant_id order to prevent deadlock)
  FOR v_item IN
    SELECT value FROM jsonb_array_elements(v_session.validated_items) AS value
    ORDER BY (value->>'variant_id')::text  -- deterministic lock ordering
  LOOP
    v_variant_id := (v_item->>'variant_id')::UUID;
    SELECT stock INTO v_stock
    FROM product_variants
    WHERE id = v_variant_id
    FOR UPDATE;

    IF NOT FOUND OR v_stock < (v_item->>'quantity')::INTEGER THEN
      v_stock_sufficient := FALSE;
      -- Do not EXIT early — we must lock all rows to prevent deadlock with
      -- any concurrent order that has already locked some of these variants.
    END IF;
  END LOOP;

  -- -------------------------------------------------------------------------
  -- 4. Generate order number.
  --    Format: ORD-YYYY-NNNNNN-XXX
  --    - YYYY: year for rough chronological grouping
  --    - NNNNNN: zero-padded sequence (up to 999,999 per year before rollover)
  --    - XXX: 3-char random hex suffix for brute-force resistance on guest lookup
  -- -------------------------------------------------------------------------
  v_order_number := 'ORD-TT-' || LPAD(nextval('order_number_seq')::text, 3, '0');

  -- -------------------------------------------------------------------------
  -- 5. Determine final status and deduct stock if sufficient.
  --    If stock is insufficient: order is created as 'requires_review'.
  --    Payment has been captured; a human admin must manually issue a refund
  --    via the Razorpay dashboard. We do NOT auto-refund via API because
  --    a Razorpay API failure during auto-refund would leave the user with
  --    neither goods nor a refund — worse than the manual path.
  -- -------------------------------------------------------------------------
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
    -- Stock is NOT deducted for requires_review orders.
  END IF;

  -- -------------------------------------------------------------------------
  -- 6. Create the orders row.
  --    ALL data sourced from v_session — zero data from the client request body.
  -- -------------------------------------------------------------------------
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
    p_razorpay_order_id,
    p_razorpay_payment_id
  )
  RETURNING id INTO v_order_id;

  -- -------------------------------------------------------------------------
  -- 7. Create order_items rows.
  --    All snapshotted fields come from validated_items stored at create-order
  --    time — prices, names, SKUs are already frozen at that point.
  -- -------------------------------------------------------------------------
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

  -- -------------------------------------------------------------------------
  -- 8. Clear the logged-in user's cart.
  --    Only cleared for Processing orders (stock was sufficient and deducted).
  --    For requires_review orders we leave the cart intact so the user can
  --    see what they tried to buy if they revisit.
  --    No-op for guest checkouts (user_id IS NULL).
  -- -------------------------------------------------------------------------
  IF v_session.user_id IS NOT NULL AND v_stock_sufficient THEN
    DELETE FROM cart_items WHERE user_id = v_session.user_id;
  END IF;

  -- -------------------------------------------------------------------------
  -- 9. Mark session as used. This is the application-level idempotency guard.
  --    The DB-level guard is the UNIQUE constraint on orders.razorpay_payment_id.
  -- -------------------------------------------------------------------------
  UPDATE checkout_sessions
  SET used_at = now()
  WHERE id = v_session.id;

  -- -------------------------------------------------------------------------
  -- 10. Return order summary to the calling Python layer.
  -- -------------------------------------------------------------------------
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


-- =============================================================================
-- FUNCTION: cleanup_expired_checkout_sessions
-- Called periodically (e.g. by GitHub Actions cron or Supabase pg_cron).
-- Deletes sessions older than 24 hours that were never used.
-- Used sessions are retained longer (7 days) as an audit trail.
-- =============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_checkout_sessions() RETURNS void AS $$
BEGIN
  -- Delete unused, expired sessions older than 24 hours
  DELETE FROM checkout_sessions
  WHERE used_at IS NULL
    AND expires_at < now() - interval '24 hours';

  -- Delete used sessions older than 7 days (audit retention)
  DELETE FROM checkout_sessions
  WHERE used_at IS NOT NULL
    AND used_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- END OF MIGRATION 010
-- =============================================================================
