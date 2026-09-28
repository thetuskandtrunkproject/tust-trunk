-- =============================================================================
-- Migration 008: Account Addresses
-- =============================================================================

CREATE TABLE IF NOT EXISTS addresses (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        text NOT NULL,
    address1    text NOT NULL,
    address2    text,
    city        text NOT NULL,
    state       text NOT NULL,
    pincode     char(6) NOT NULL,
    is_default  boolean NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Partial unique index to enforce exactly one default address per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_default_per_user
    ON addresses (user_id)
    WHERE is_default = true;

-- Constraints
ALTER TABLE addresses ADD CONSTRAINT addresses_pincode_numeric
    CHECK (pincode ~ '^[0-9]{6}$');

ALTER TABLE addresses ADD CONSTRAINT addresses_name_not_empty
    CHECK (length(trim(name)) > 0);

ALTER TABLE addresses ADD CONSTRAINT addresses_address1_not_empty
    CHECK (length(trim(address1)) > 0);

ALTER TABLE addresses ADD CONSTRAINT addresses_city_not_empty
    CHECK (length(trim(city)) > 0);

ALTER TABLE addresses ADD CONSTRAINT addresses_state_not_empty
    CHECK (length(trim(state)) > 0);

-- Trigger for updated_at
CREATE TRIGGER set_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- RPC for setting a default address atomically
CREATE OR REPLACE FUNCTION set_default_address(p_user_id uuid, p_address_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only proceed if the address exists and belongs to the user
    IF NOT EXISTS (SELECT 1 FROM addresses WHERE id = p_address_id AND user_id = p_user_id) THEN
        RETURN false;
    END IF;
    
    -- Clear previous default
    UPDATE addresses SET is_default = false WHERE user_id = p_user_id AND is_default = true;
    -- Set new default
    UPDATE addresses SET is_default = true WHERE id = p_address_id AND user_id = p_user_id;
    
    RETURN true;
END;
$$;

-- RPC for deleting an address and auto-promoting the latest remaining address if the deleted one was the default
CREATE OR REPLACE FUNCTION delete_address_and_auto_promote(p_user_id uuid, p_address_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    was_default boolean;
    latest_address_id uuid;
BEGIN
    -- Check if it exists and get its default status, locking the row
    SELECT is_default INTO was_default FROM addresses WHERE id = p_address_id AND user_id = p_user_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Delete the address
    DELETE FROM addresses WHERE id = p_address_id AND user_id = p_user_id;
    
    -- If it was default, auto-promote the most recently created one
    IF was_default THEN
        SELECT id INTO latest_address_id FROM addresses WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
        
        IF latest_address_id IS NOT NULL THEN
            UPDATE addresses SET is_default = true WHERE id = latest_address_id AND user_id = p_user_id;
        END IF;
    END IF;
    
    RETURN true;
END;
$$;
