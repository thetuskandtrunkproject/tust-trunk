from fastapi import APIRouter, Depends, HTTPException, Body
from supabase import Client
from ..core.database import get_db_client
from ..dependencies.auth import get_current_admin
from ..schemas.cms import HeroBannerData, HeroBannerUpdate
from ..services import cms_service

router = APIRouter(prefix="/cms", tags=["CMS"])

@router.get("/hero", response_model=HeroBannerData)
def get_hero_banner(db: Client = Depends(get_db_client)):
    """Fetch the hero banner configuration. Publicly accessible."""
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
