-- Migration 011: Order status management and stock restoration
-- Contains ONLY the update_order_status() RPC.

CREATE OR REPLACE FUNCTION update_order_status(
    p_order_id UUID,
    p_new_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_status TEXT;
    v_item RECORD;
BEGIN
    -- Get current status with lock
    SELECT status INTO v_current_status
    FROM orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION USING 
            ERRCODE = 'C1004',
            MESSAGE = 'Order not found.';
    END IF;

    IF v_current_status = p_new_status THEN
        RETURN; -- No-op
    END IF;

    -- State machine validation
    -- Processing → Shipped, Cancelled, requires_review
    -- Shipped → Out for Delivery, Delivered, Cancelled
    -- Out for Delivery → Delivered, Cancelled
    -- Delivered → (none)
    -- Cancelled → Processing
    -- requires_review → Processing, Cancelled

    IF v_current_status = 'Delivered' THEN
        RAISE EXCEPTION USING 
            ERRCODE = 'C1005',
            MESSAGE = 'Cannot transition from Delivered status.';
    END IF;

    IF v_current_status = 'Processing' AND p_new_status NOT IN ('Shipped', 'Cancelled', 'requires_review') THEN
        RAISE EXCEPTION USING ERRCODE = 'C1006', MESSAGE = 'Invalid transition from Processing to ' || p_new_status;
    END IF;

    IF v_current_status = 'Shipped' AND p_new_status NOT IN ('Out for Delivery', 'Delivered', 'Cancelled') THEN
        RAISE EXCEPTION USING ERRCODE = 'C1006', MESSAGE = 'Invalid transition from Shipped to ' || p_new_status;
    END IF;

    IF v_current_status = 'Out for Delivery' AND p_new_status NOT IN ('Delivered', 'Cancelled') THEN
        RAISE EXCEPTION USING ERRCODE = 'C1006', MESSAGE = 'Invalid transition from Out for Delivery to ' || p_new_status;
    END IF;

    IF v_current_status = 'Cancelled' AND p_new_status NOT IN ('Processing') THEN
        RAISE EXCEPTION USING ERRCODE = 'C1006', MESSAGE = 'Invalid transition from Cancelled to ' || p_new_status;
    END IF;

    IF v_current_status = 'requires_review' AND p_new_status NOT IN ('Processing', 'Cancelled') THEN
        RAISE EXCEPTION USING ERRCODE = 'C1006', MESSAGE = 'Invalid transition from requires_review to ' || p_new_status;
    END IF;

    -- Process stock restoration if cancelling from Processing
    IF p_new_status = 'Cancelled' AND v_current_status = 'Processing' THEN
        FOR v_item IN SELECT variant_id, quantity FROM order_items WHERE order_id = p_order_id LOOP
            IF v_item.variant_id IS NOT NULL THEN
                UPDATE product_variants
                SET stock = stock + v_item.quantity
                WHERE id = v_item.variant_id;
            END IF;
        END LOOP;
    END IF;

    -- Update the order status
    UPDATE orders
    SET status = p_new_status,
        updated_at = NOW()
    WHERE id = p_order_id;
    
END;
$$;
