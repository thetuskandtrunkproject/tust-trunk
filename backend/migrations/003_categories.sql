-- =============================================================================
-- Migration 003: Categories
-- =============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL UNIQUE,
  slug        TEXT        NOT NULL UNIQUE,
  description TEXT        NOT NULL DEFAULT '',
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: keep updated_at current
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Insert some default categories
INSERT INTO categories (name, slug, description) VALUES 
('T-Shirts', 't-shirts', 'Casual t-shirts'),
('Shirts', 'shirts', 'Formal and casual shirts'),
('Hoodies', 'hoodies', 'Winter hoodies and sweatshirts'),
('Jeans', 'jeans', 'Denim jeans'),
('Dresses', 'dresses', 'Women dresses')
ON CONFLICT DO NOTHING;

-- Modify products table to use category_id instead of free-text category
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE RESTRICT;

-- Attempt to link existing products if they match by name (case-insensitive)
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE lower(p.category) = lower(c.name) OR lower(p.category) = lower(c.slug);

-- For any product that still has no category, link to the first available category as a fallback
UPDATE products
SET category_id = (SELECT id FROM categories LIMIT 1)
WHERE category_id IS NULL;

-- Now make it NOT NULL and drop the old text column
ALTER TABLE products ALTER COLUMN category_id SET NOT NULL;
ALTER TABLE products DROP COLUMN IF EXISTS category;

-- Update the indexes
DROP INDEX IF EXISTS idx_products_category;
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
