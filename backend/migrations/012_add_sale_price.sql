-- Add sale_price to product_variants

ALTER TABLE public.product_variants
ADD COLUMN sale_price INTEGER NULL;

COMMENT ON COLUMN public.product_variants.sale_price IS 'Optional sale price in paise. Null means no active sale.';
