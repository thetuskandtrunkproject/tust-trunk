from fastapi import HTTPException
from supabase import Client
from datetime import datetime

# Default hero settings fallback
DEFAULT_HERO = {
    "title": "For Every Little You",
    "titleAccent": "& Every You",
    "subtitle": "Everyday comfort, elevated for modern life.",
    "cta": "Shop Now",
    "ctaLink": "/shop",
    "align": "left",
    "accentColor": "#FF6B6B",
    "textColor": "#1a1a1a",
    "hasOverlay": False,
    "promoRibbonText": "Free shipping on orders over ₹3000",
    "slides": [
        {
            "id": "1",
            "img": "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=2000&auto=format&fit=crop",
            "hasOverlay": False
        },
        {
            "id": "2",
            "img": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=2000&auto=format&fit=crop",
            "hasOverlay": False
        },
        {
            "id": "3",
            "img": "https://images.unsplash.com/photo-1471286174890-9c112ffeca76?q=80&w=2000&auto=format&fit=crop",
            "hasOverlay": False
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
    "buttonText": "View Complete Collection",
    "buttonLink": "/shop?sort=newest",
    "buttonTextColor": "#2D283E",
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

DEFAULT_ABOUT_PAGE = {
    "textColor": "#2D283E",
    "sweepTextColor": "#FF6B8B",
    "introHeadline": "Everyday essentials, crafted with care.",
    "introSubline": "We believe that what you wear every day matters most. That's why we focus on exceptional comfort, timeless design, and sustainable quality.",
    "storyHeadline": "Our Story",
    "storyParagraphs": [
        "The Tusk & Trunk was born out of a simple frustration: why is it so hard to find well-made, comfortable basics that don't cost a fortune or fall apart after a few washes? We set out to change that.",
        "Starting with just a single perfect t-shirt, we've slowly grown into a full collection of everyday wear for men, women, and kids. We don't believe in fast fashion trends. Instead, we obsess over the details—the exact weight of the cotton, the perfect drape of a linen shirt, and the durability of our stitching.",
        "Our name represents strength (tusk) and rootedness (trunk). It's a reminder to stay grounded in quality and build things that are meant to last."
    ],
    "valuesHeadline": "What we stand for",
    "valuesSubline": "The core principles that guide everything we make.",
    "values": [
        {"icon": "leaf", "label": "Premium Fabrics", "description": "We source the finest, most breathable materials to ensure all-day comfort.", "bgColor": "bg-sky-soft/30", "iconBgColor": "bg-sky"},
        {"icon": "heart", "label": "Thoughtful Design", "description": "Timeless silhouettes that flatter without restricting your movement.", "bgColor": "bg-mint/10", "iconBgColor": "bg-mint"},
        {"icon": "shield-check", "label": "Made to Last", "description": "Durability is a feature. Our clothes are stitched to withstand real life.", "bgColor": "bg-sunshine/10", "iconBgColor": "bg-sunshine"}
    ],
    "brandHeadline": "Behind the brand",
    "brandParagraphs": [
        "Every piece in our collection starts in our small studio, where we obsess over fit, form, and function. We work closely with ethical manufacturing partners who share our commitment to fair labor and sustainable practices.",
        "When you wear The Tusk & Trunk, you're not just wearing a garment—you're wearing months of careful prototyping and testing."
    ],
    "brandImage1": "https://images.unsplash.com/photo-1558769132-cb1fac08404a?q=80&w=1000&auto=format&fit=crop",
    "brandImage2": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop",
    "ctaHeadline": "Experience the difference",
    "ctaSubline": "Explore our latest arrivals and find your new everyday favorites.",
    "ctaButtonText": "Shop the collection",
    "ctaButtonLink": "/shop",
    "ctaBgColor": "#8ce2c5",
    "ctaButtonBgColor": "#E03B8B",
    "ctaButtonTextColor": "#FFFFFF"
}

DEFAULT_FOOTER = {
    "tagline": "Everyday essentials, crafted with care. Comfort and quality for your whole family.",
    "socialLinks": {
        "instagram": "",
        "whatsapp": "",
        "facebook": "",
        "youtube": ""
    }
}

DEFAULT_SHOP_SETTINGS = {
    "companyName": "The Tusk & Trunk",
    "gstNumber": "",
    "businessWebsite": "",
    "primaryPhone": "",
    "secondaryPhone": "",
    "businessEmail": "",
    "supportEmail": "",
    "addressLine": "",
    "city": "",
    "state": "",
    "country": "India",
    "pincode": "",
    "whatsappNumber": "",
    "instagramUrl": "",
    "facebookUrl": "",
    "youtubeUrl": "",
    "maintenanceMode": False,
    "maintenanceMessage": "We're making things better! We'll be back shortly.",
    "maintenanceTimerEnd": "",
    "gstEnabled": False,
    "gstPercentage": 5,
    "homeStatePincodePrefixes": "60,61,62,63,64",
    "shippingChargeHomeState": 60,
    "shippingChargeOtherStates": 80,
    "freeShippingEnabled": True,
    "freeShippingThreshold": 3000
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
            if key == 'about_page' or key == 'about_page_default':
                return DEFAULT_ABOUT_PAGE
            if key == 'footer':
                return DEFAULT_FOOTER
            if key == 'shop_settings':
                return DEFAULT_SHOP_SETTINGS
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
        if key == 'about_page' or key == 'about_page_default':
            return DEFAULT_ABOUT_PAGE
        if key == 'footer':
            return DEFAULT_FOOTER
        if key == 'shop_settings':
            return DEFAULT_SHOP_SETTINGS
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
