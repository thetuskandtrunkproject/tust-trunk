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

class AboutValue(BaseModel):
    icon: str = "leaf"
    label: str = ""
    description: str = ""

class AboutPageData(BaseModel):
    introHeadline: str = "Everyday essentials, crafted with care."
    introSubline: str = "We believe that what you wear every day matters most. That's why we focus on exceptional comfort, timeless design, and sustainable quality."
    storyHeadline: str = "Our Story"
    storyParagraphs: List[str] = []
    valuesHeadline: str = "What we stand for"
    valuesSubline: str = "The core principles that guide everything we make."
    values: List[AboutValue] = []
    brandHeadline: str = "Behind the brand"
    brandParagraphs: List[str] = []
    brandImage1: str = "https://images.unsplash.com/photo-1558769132-cb1fac08404a?q=80&w=1000&auto=format&fit=crop"
    brandImage2: str = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop"
    ctaHeadline: str = "Experience the difference"
    ctaSubline: str = "Explore our latest arrivals and find your new everyday favorites."
    ctaButtonText: str = "Shop the collection"
    ctaButtonLink: str = "/shop"
    ctaBgColor: str = "#8ce2c5"
    ctaButtonBgColor: str = "#E03B8B"
    ctaButtonTextColor: str = "#FFFFFF"

class AboutPageUpdate(BaseModel):
    value: AboutPageData

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
    buttonText: str = "View Complete Collection"
    buttonLink: str = "/shop?sort=newest"
    buttonTextColor: str = "#2D283E"
    tiles: List[CategoryTile] = []

class CategoryTilesUpdate(BaseModel):
    value: CategoryTilesData
