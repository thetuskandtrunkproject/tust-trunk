-- =============================================================================
-- Migration 002: Product Catalog
-- Module: Product Catalog (Admin CRUD)
-- Tables: products, product_variants
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper: updated_at trigger function (reused by both tables)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- TABLE: products
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
  -- Primary key: UUID, never exposed in public URLs (slug is used there)
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Human-readable product name
  name            TEXT        NOT NULL,

  -- URL-safe slug for /products/$slug — globally unique enforced at DB level
  slug            TEXT        NOT NULL,

  -- Long-form description. Defaults to '' so API always returns a string, never NULL
  description     TEXT        NOT NULL DEFAULT '',

  -- Constrained to valid values at DB level — any value outside this is rejected
  gender          TEXT        NOT NULL CHECK (gender IN ('Women', 'Kids')),

  -- Free text for v1 (OQ-1 resolved: no categories table in this pass)
  category        TEXT        NOT NULL,

  -- Array of Supabase Storage public URLs.
  -- Path pattern: products/{product_id}/{uuid4}-{original_filename}
  -- Bucket: product-images
  images          TEXT[]      NOT NULL DEFAULT '{}',

  -- Free-text tags for storefront filtering (e.g. 'new', 'sale')
  tags            TEXT[]      NOT NULL DEFAULT '{}',

  -- Status controls storefront visibility. Defaults to Draft so new products
  -- are never accidentally live. Constrained at DB level.
  status          TEXT        NOT NULL DEFAULT 'Draft'
                  CHECK (status IN ('Active', 'Draft', 'Archived')),

  -- Audit columns
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Which admin user created this product. FK to our users table from Module 1.
  -- ON DELETE RESTRICT: you cannot delete the admin user row while they own products.
  created_by      UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT
);

-- Globally unique slug constraint (separate from PK)
CREATE UNIQUE INDEX IF NOT EXISTS uidx_products_slug ON products(slug);

-- Admin list view: single-column filter indexes
CREATE INDEX IF NOT EXISTS idx_products_status     ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_gender     ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);

-- Admin list view: composite index for the most common combined filter
CREATE INDEX IF NOT EXISTS idx_products_status_gender ON products(status, gender);

-- Admin/storefront: sort by most recently updated
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC);

-- Trigger: keep updated_at current on every row update
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- TABLE: product_variants
-- =============================================================================
CREATE TABLE IF NOT EXISTS product_variants (
  -- Primary key: this UUID is the "sellable unit" identifier.
  -- Cart line items and order line items will reference this id in later modules.
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FK to parent product. 
  -- ON DELETE RESTRICT (not CASCADE): a product cannot be hard-deleted while
  -- variants exist. Since orders will reference variant ids, hard deletion would
  -- orphan historical order data. Soft-delete (status=Archived) is the only 
  -- supported deletion path.
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE RESTRICT,

  -- SKU must be globally unique across the ENTIRE catalog — not just within one 
  -- product. Enforced by DB UNIQUE constraint (app-level checks alone are 
  -- insufficient for concurrent inserts).
  sku         TEXT        NOT NULL,

  -- Free text size (OQ-3 resolved). Validated non-empty in Pydantic schema.
  size        TEXT        NOT NULL,

  -- Price in paise (smallest currency unit). Avoids floating-point issues.
  -- Stored per-variant — each variant is independently priced.
  -- CHECK (price > 0): zero-price variants are not valid sellable units.
  price       INTEGER     NOT NULL CHECK (price > 0),

  -- Stock quantity. CHECK prevents negative stock at the DB level regardless
  -- of application bugs. Defaults to 0 (no stock on creation).
  stock       INTEGER     NOT NULL DEFAULT 0 CHECK (stock >= 0),

  -- Allows disabling a single variant (e.g. a size permanently discontinued)
  -- without archiving the whole product.
  is_active   BOOLEAN     NOT NULL DEFAULT true,

  -- Audit columns
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Globally unique SKU constraint
CREATE UNIQUE INDEX IF NOT EXISTS uidx_variants_sku ON product_variants(sku);

-- Most common query: fetch all variants for a product
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);

-- Storefront (Module 3): efficient in-stock filtering per product.
-- Partial index: only indexes rows where stock > 0, keeping it small.
CREATE INDEX IF NOT EXISTS idx_variants_product_instock
  ON product_variants(product_id, stock)
  WHERE stock > 0 AND is_active = true;

-- Trigger: keep updated_at current on every row update
CREATE TRIGGER trg_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- END OF MIGRATION 002
-- =============================================================================
