from fastapi import APIRouter, Depends, HTTPException, Body, File, UploadFile, Response
from supabase import Client
from ..core.database import get_db_client
from ..dependencies.auth import get_current_admin
from ..schemas.cms import HeroBannerData, HeroBannerUpdate, CategoryTilesData, CategoryTilesUpdate, HomeProductsData, HomeProductsUpdate, AboutPageData, AboutPageUpdate, FooterData, FooterUpdate, ShopSettingsData, ShopSettingsUpdate
from ..services import cms_service
import uuid

router = APIRouter(prefix="/cms", tags=["CMS"])

# Cache-Control header value for public CMS read endpoints.
# CMS content changes rarely — 5 min cache + 10 min stale-while-revalidate
# means a CDN/browser only calls Supabase once per ~15 min instead of on every page load.
_CMS_CACHE = "public, max-age=300, stale-while-revalidate=600"

@router.get("/hero", response_model=HeroBannerData)
def get_hero_banner(response: Response, db: Client = Depends(get_db_client)):
    """Fetch the hero banner configuration. Publicly accessible."""
    response.headers["Cache-Control"] = _CMS_CACHE
    return cms_service.get_setting(db, "hero")


@router.put("/hero", response_model=HeroBannerData)
def update_hero_banner(
    data: HeroBannerUpdate,
    db: Client = Depends(get_db_client),
    admin: dict = Depends(get_current_admin)
):
    """Update the hero banner configuration. Requires admin."""
    # Convert Pydantic model to dict
    val = data.value.model_dump()
    return cms_service.update_setting(db, "hero", val)

@router.post("/hero/reset", response_model=HeroBannerData)
def reset_hero_banner(
    db: Client = Depends(get_db_client),
    admin: dict = Depends(get_current_admin)
):
    """Reset the hero banner to its default template. Requires admin."""
    # Read the saved default, or use hardcoded fallback
    default_val = cms_service.get_setting(db, "hero_default")
    if not default_val:
        default_val = cms_service.DEFAULT_HERO
    return cms_service.update_setting(db, "hero", default_val)

@router.post("/hero/set_default", response_model=HeroBannerData)
def set_default_hero_banner(
    data: HeroBannerUpdate,
    db: Client = Depends(get_db_client),
    admin: dict = Depends(get_current_admin)
):
    """Set the current configuration as the new default template. Requires admin."""
    val = data.value.model_dump()
    cms_service.update_setting(db, "hero_default", val)
    return cms_service.update_setting(db, "hero", val)

@router.get("/category-tiles", response_model=CategoryTilesData)
def get_category_tiles(response: Response, db: Client = Depends(get_db_client)):
    response.headers["Cache-Control"] = _CMS_CACHE
    return cms_service.get_setting(db, "category_tiles")

@router.put("/category-tiles")
def update_category_tiles(
    data: CategoryTilesUpdate,
    db: Client = Depends(get_db_client),
    admin: dict = Depends(get_current_admin)
):
    try:
        val = data.value.model_dump()
        return cms_service.update_setting(db, "category_tiles", val)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e) + "\n" + traceback.format_exc())

@router.post("/category-tiles/reset", response_model=CategoryTilesData)
def reset_category_tiles(
    db: Client = Depends(get_db_client),
    admin: dict = Depends(get_current_admin)
):
    default_val = cms_service.get_setting(db, "category_tiles_default")
    if not default_val:
        default_val = cms_service.DEFAULT_CATEGORY_TILES
    return cms_service.update_setting(db, "category_tiles", default_val)

@router.post("/category-tiles/set_default", response_model=CategoryTilesData)
def set_default_category_tiles(
    data: CategoryTilesUpdate,
    db: Client = Depends(get_db_client),
    admin: dict = Depends(get_current_admin)
):
    val = data.value.model_dump()
    cms_service.update_setting(db, "category_tiles_default", val)
    return cms_service.update_setting(db, "category_tiles", val)

@router.get("/home-products", response_model=HomeProductsData)
def get_home_products(response: Response, db: Client = Depends(get_db_client)):
    response.headers["Cache-Control"] = _CMS_CACHE
    return cms_service.get_setting(db, "home_products")

@router.put("/home-products", response_model=HomeProductsData)
def update_home_products(
    data: HomeProductsUpdate,
    db: Client = Depends(get_db_client),
    admin: dict = Depends(get_current_admin)
):
    try:
        val = data.value.model_dump()
        return cms_service.update_setting(db, "home_products", val)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e) + "\n" + traceback.format_exc())

@router.post("/home-products/reset", response_model=HomeProductsData)
def reset_home_products(
    db: Client = Depends(get_db_client),
    admin: dict = Depends(get_current_admin)
):
    default_val = cms_service.get_setting(db, "home_products_default")
    return cms_service.update_setting(db, "home_products", default_val)

@router.post("/home-products/set_default", response_model=HomeProductsData)
def set_default_home_products(
    data: HomeProductsUpdate,
    db: Client = Depends(get_db_client),
    admin: dict = Depends(get_current_admin)
):
    val = data.value.model_dump()
    cms_service.update_setting(db, "home_products_default", val)
    return cms_service.update_setting(db, "home_products", val)

@router.get("/about-page", response_model=AboutPageData)
def get_about_page(response: Response, db: Client = Depends(get_db_client)):
    response.headers["Cache-Control"] = _CMS_CACHE
    return cms_service.get_setting(db, "about_page")

@router.put("/about-page", response_model=AboutPageData)
def update_about_page(
    data: AboutPageUpdate,
    db: Client = Depends(get_db_client),
    admin: dict = Depends(get_current_admin)
):
    try:
        val = data.value.model_dump()
        return cms_service.update_setting(db, "about_page", val)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e) + "\n" + traceback.format_exc())

@router.post("/about-page/reset", response_model=AboutPageData)
def reset_about_page(
    db: Client = Depends(get_db_client),
    admin: dict = Depends(get_current_admin)
):
    default_val = cms_service.get_setting(db, "about_page_default")
    return cms_service.update_setting(db, "about_page", default_val)

@router.post("/about-page/set_default", response_model=AboutPageData)
def set_default_about_page(
    data: AboutPageUpdate,
    db: Client = Depends(get_db_client),
    admin: dict = Depends(get_current_admin)
):
    val = data.value.model_dump()
    cms_service.update_setting(db, "about_page_default", val)
    return cms_service.update_setting(db, "about_page", val)

@router.get("/footer", response_model=FooterData)
def get_footer(response: Response, db: Client = Depends(get_db_client)):
    response.headers["Cache-Control"] = _CMS_CACHE
    return cms_service.get_setting(db, "footer")

@router.put("/footer", response_model=FooterData)
def update_footer(
    data: FooterUpdate,
    db: Client = Depends(get_db_client),
    admin: dict = Depends(get_current_admin)
):
    try:
        val = data.value.model_dump()
        return cms_service.update_setting(db, "footer", val)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e) + "\n" + traceback.format_exc())

@router.get("/shop-settings", response_model=ShopSettingsData)
def get_shop_settings(response: Response, db: Client = Depends(get_db_client)):
    response.headers["Cache-Control"] = _CMS_CACHE
    return cms_service.get_setting(db, "shop_settings")

@router.put("/shop-settings", response_model=ShopSettingsData)
def update_shop_settings(
    data: ShopSettingsUpdate,
    db: Client = Depends(get_db_client),
    admin: dict = Depends(get_current_admin)
):
    try:
        val = data.value.model_dump()
        return cms_service.update_setting(db, "shop_settings", val)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e) + "\n" + traceback.format_exc())

@router.post("/upload-image")
async def upload_cms_image(
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin),
    db: Client = Depends(get_db_client)
):
    """Upload an image to the product-images bucket for CMS use."""
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Must be an image")
            
        file_ext = file.filename.split('.')[-1]
        filename = f"cms/{uuid.uuid4()}.{file_ext}"
        
        file_bytes = await file.read()
        if len(file_bytes) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image must be < 5MB")
            
        res = db.storage.from_('product-images').upload(
            path=filename,
            file=file_bytes,
            file_options={"content-type": file.content_type}
        )
        
        public_url = db.storage.from_('product-images').get_public_url(filename)
        return {"url": public_url}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

