-- Add sale_start_date and sale_end_date to product_variants (Already exists)

-- ALTER TABLE public.product_variants
-- ADD COLUMN sale_start_date TIMESTAMPTZ NULL,
-- ADD COLUMN sale_end_date TIMESTAMPTZ NULL;

-- Function to search and filter public products (updated to include sale_price)
CREATE OR REPLACE FUNCTION search_public_products(
    search_term text DEFAULT NULL,
    filter_gender text DEFAULT NULL,
    filter_category text DEFAULT NULL,
    filter_sizes text[] DEFAULT NULL,
    min_price int DEFAULT NULL, -- in paise
    max_price int DEFAULT NULL, -- in paise
    filter_tag text DEFAULT NULL,
    sort_by text DEFAULT 'newest',
    page_num int DEFAULT 1,
    page_size int DEFAULT 24
)
RETURNS TABLE (
    total_count bigint,
    product_data json
) LANGUAGE plpgsql AS $$
DECLARE
    effective_page_size int;
    effective_page_num int;
BEGIN
    effective_page_size := LEAST(GREATEST(page_size, 1), 48);
    effective_page_num := GREATEST(page_num, 1);

    RETURN QUERY
    WITH active_variants AS (
        SELECT 
            v.product_id,
            MIN(
                CASE 
                    WHEN v.sale_price IS NOT NULL AND 
                         (v.sale_start_date IS NULL OR v.sale_start_date <= now()) AND 
                         (v.sale_end_date IS NULL OR v.sale_end_date >= now())
                    THEN v.sale_price 
                    ELSE v.price 
                END
            ) as min_variant_price,
            MAX(
                CASE 
                    WHEN v.sale_price IS NOT NULL AND 
                         (v.sale_start_date IS NULL OR v.sale_start_date <= now()) AND 
                         (v.sale_end_date IS NULL OR v.sale_end_date >= now())
                    THEN v.sale_price 
                    ELSE v.price 
                END
            ) as max_variant_price,
            MAX(v.price) as original_price,
            array_agg(DISTINCT v.size) as available_sizes,
            SUM(v.stock) as total_stock
        FROM product_variants v
        WHERE v.is_active = true AND v.stock > 0
        GROUP BY v.product_id
    ),
    filtered_products AS (
        SELECT 
            p.id,
            p.slug,
            p.name,
            p.gender,
            c.name as category_name,
            c.slug as category_slug,
            p.images,
            p.tags,
            p.created_at,
            av.min_variant_price,
            av.max_variant_price,
            av.original_price,
            av.available_sizes,
            av.total_stock
        FROM products p
        JOIN categories c ON p.category_id = c.id
        JOIN active_variants av ON p.id = av.product_id
        WHERE p.status = 'Active'
          AND c.is_active = true
          AND (filter_gender IS NULL OR p.gender = filter_gender)
          AND (filter_category IS NULL OR lower(c.name) = lower(filter_category) OR lower(c.slug) = lower(filter_category))
          AND (filter_tag IS NULL OR p.tags @> ARRAY[filter_tag])
          AND (search_term IS NULL OR p.name ILIKE '%' || search_term || '%' OR c.name ILIKE '%' || search_term || '%')
          AND (min_price IS NULL OR av.max_variant_price >= min_price)
          AND (max_price IS NULL OR av.min_variant_price <= max_price)
          AND (filter_sizes IS NULL OR filter_sizes && av.available_sizes)
    ),
    total_count_cte AS (
        SELECT count(*) as count FROM filtered_products
    ),
    sorted_products AS (
        SELECT * FROM filtered_products
        ORDER BY 
            CASE WHEN sort_by = 'price-asc' THEN min_variant_price END ASC,
            CASE WHEN sort_by = 'price-desc' THEN max_variant_price END DESC,
            created_at DESC
        LIMIT effective_page_size
        OFFSET (effective_page_num - 1) * effective_page_size
    )
    SELECT 
        tc.count,
        json_build_object(
            'id', sp.id,
            'slug', sp.slug,
            'name', sp.name,
            'gender', sp.gender,
            'category', sp.category_name,
            'images', sp.images,
            'tags', sp.tags,
            'min_price', sp.min_variant_price,
            'max_price', sp.max_variant_price,
            'original_price', sp.original_price,
            'available_sizes', sp.available_sizes,
            'total_stock', sp.total_stock
        )
    FROM sorted_products sp
    CROSS JOIN total_count_cte tc;
END;
$$;

-- Notify postgrest to reload schema cache
NOTIFY pgrst, 'reload schema';
