from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any

class HeroSlide(BaseModel):
    id: str
    img: str
    hasOverlay: bool = False
    title: str = ""
    titleAccent: str = ""
    subtitle: str = ""
    cta: str = ""
    ctaLink: str = ""
    align: str = "left"
    accentColor: str = "#FF6B6B"
    textColor: str = "#FFFFFF"

class HeroBannerData(BaseModel):
    promoRibbonText: str = ""
    slides: List[HeroSlide] = []

class CMSSettingsResponse(BaseModel):
    key: str
    value: Any

class HeroBannerUpdate(BaseModel):
    value: HeroBannerData
