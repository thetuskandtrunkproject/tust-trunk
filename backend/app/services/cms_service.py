from fastapi import HTTPException
from supabase import Client
from datetime import datetime

# Default hero settings fallback
DEFAULT_HERO = {
    "promoRibbonText": "Free shipping on orders over ₹3000",
    "slides": [
        {
            "id": "1",
            "img": "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=2000&auto=format&fit=crop",
            "hasOverlay": False,
            "title": "For Every Little You",
            "titleAccent": "& Every You",
            "subtitle": "Everyday comfort, elevated for modern life.",
            "cta": "Shop Now",
            "ctaLink": "/shop",
            "align": "left",
            "accentColor": "#FF6B6B",
            "textColor": "#1a1a1a"
        },
        {
            "id": "2",
            "img": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=2000&auto=format&fit=crop",
            "hasOverlay": True,
            "title": "New Season,",
            "titleAccent": "New Styles",
            "subtitle": "Soft fabrics, playful prints — designed for little adventures & big smiles.",
            "cta": "Explore New Arrivals",
            "ctaLink": "/shop?sort=newest",
            "align": "left",
            "accentColor": "#FF6B6B",
            "textColor": "#FFFFFF"
        },
        {
            "id": "3",
            "img": "https://images.unsplash.com/photo-1471286174890-9c112ffeca76?q=80&w=2000&auto=format&fit=crop",
            "hasOverlay": True,
            "title": "Little Clothes,",
            "titleAccent": "Big Moments",
            "subtitle": "Curated collections that grow with your family. Because every outfit tells a story.",
            "cta": "Shop Collection",
            "ctaLink": "/shop",
            "align": "right",
            "accentColor": "#7EC8E3",
            "textColor": "#FFFFFF"
        }
    ]
}

DEFAULT_CATEGORY_TILES = {
    "title": "Playful & ",
    "titleAccent": "Breathable",
    "subtitle": "Made with skin-friendly fabrics, perfect for India's climate. Explore our vibrant new arrivals designed for everyday adventures.",
    "textColor": "#2D283E",
    "sweepTextColor": "#FFFFFF",
    "baseBgColor": "#FAF7F9",
    "sweepBgColor": "linear-gradient(135deg, #FF6B8B 0%, #E03B8B 50%, #845EC2 100%)",
    "waveColor1": "#70A6FF",
    "waveColor2": "#845EC2",
    "waveColor3": "#FFD93D",
    "tiles": [
        {"id": "women", "image": "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop", "label": "Women", "link": "/shop?category=Women"},
        {"id": "kids", "image": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop", "label": "Kids", "link": "/shop?category=Kids"},
        {"id": "new", "image": "https://images.unsplash.com/photo-1471286174890-9c112ffeca76?q=80&w=600&auto=format&fit=crop", "label": "New In", "link": "/shop?sort=newest"}
    ]
}

DEFAULT_HOME_PRODUCTS = {
    "title": "New In",
    "subtitle": "The latest additions to our collection.",
    "textColor": "#2D283E",
    "buttonText": "View all",
    "buttonLink": "/shop",
    "productIds": []
}

def get_setting(db: Client, key: str) -> dict:
    """Get a CMS setting by key."""
    try:
        res = db.table('site_settings').select('value').eq('key', key).execute()
        if not res.data:
            if key == 'hero':
                return DEFAULT_HERO
            if key == 'category_tiles' or key == 'category_tiles_default':
                return DEFAULT_CATEGORY_TILES
            if key == 'home_products' or key == 'home_products_default':
                return DEFAULT_HOME_PRODUCTS
            return {}
        return res.data[0]['value']
    except Exception as e:
        print(f"Error fetching setting {key}: {e}")
        if key == 'hero' or key == 'hero_default':
            return DEFAULT_HERO
        if key == 'category_tiles' or key == 'category_tiles_default':
            return DEFAULT_CATEGORY_TILES
        if key == 'home_products' or key == 'home_products_default':
            return DEFAULT_HOME_PRODUCTS
        return {}

def update_setting(db: Client, key: str, value: dict) -> dict:
    """Update or insert a CMS setting."""
    try:
        res = db.table('site_settings').upsert({
            'key': key,
            'value': value,
            'updated_at': datetime.utcnow().isoformat()
        }).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to save setting")
        return res.data[0]['value']
    except Exception as e:
        # If table doesn't exist yet, we will just raise a 500
        raise HTTPException(status_code=500, detail=str(e))
