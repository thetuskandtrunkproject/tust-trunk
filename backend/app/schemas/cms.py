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
    slides: List[HeroSlide] = []

class HomeProductsData(BaseModel):
    title: str = "New In"
    subtitle: str = "The latest additions to our collection."
    textColor: str = "#2D283E"
    buttonText: str = "View all"
    buttonLink: str = "/shop"
    productIds: List[str] = []

class HomeProductsUpdate(BaseModel):
    value: HomeProductsData

class CMSSettingsResponse(BaseModel):
    key: str
    value: Any

class HeroBannerUpdate(BaseModel):
    value: HeroBannerData

class CategoryTile(BaseModel):
    id: str
    image: str = ""
    label: str = ""
    link: str = ""

class CategoryTilesData(BaseModel):
    title: str = "Playful & "
    titleAccent: str = "Breathable"
    subtitle: str = "Made with skin-friendly fabrics, perfect for India's climate. Explore our vibrant new arrivals designed for everyday adventures."
    textColor: str = "#2D283E"
    sweepTextColor: str = "#FFFFFF"
    baseBgColor: str = "#FAF7F9"
    sweepBgColor: str = "linear-gradient(135deg, #FF6B8B 0%, #E03B8B 50%, #845EC2 100%)"
    waveColor1: str = "#70A6FF"
    waveColor2: str = "#845EC2"
    waveColor3: str = "#FFD93D"
    tiles: List[CategoryTile] = []

class CategoryTilesUpdate(BaseModel):
    value: CategoryTilesData
