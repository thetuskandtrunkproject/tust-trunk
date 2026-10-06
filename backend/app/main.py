import json
import logging
import firebase_admin
from firebase_admin import credentials
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.routers.auth import router as auth_router
from app.routers.auth import limiter as auth_limiter
from app.routers.products import router as products_router
from app.routers.products import limiter as products_limiter
from app.routers.categories import router as categories_router
from app.routers.public_catalog import router as public_catalog_router
from app.routers.addresses import router as addresses_router
from app.routers.cart import router as cart_router
from app.routers.wishlist import router as wishlist_router
from app.routers.checkout import checkout_router, orders_router
from app.routers.orders import router as user_orders_router
from app.routers.admin_orders import router as admin_orders_router
from app.routers.dashboard import router as admin_dashboard_router
from app.routers.admin_customers import router as admin_customers_router
from app.routers.cms import router as cms_router
from app.routers.reviews import router as reviews_router
from app.routers.admin_reviews import router as admin_reviews_router
from app.routers.admin_coupons import router as admin_coupons_router
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Firebase Admin SDK
    if not firebase_admin._apps:
        try:
            if settings.FIREBASE_SERVICE_ACCOUNT_JSON and settings.FIREBASE_SERVICE_ACCOUNT_JSON != "{}":
                cred_dict = json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin initialized successfully.")
            else:
                logger.warning("FIREBASE_SERVICE_ACCOUNT_JSON is empty or invalid. Firebase auth will fail.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin: {e}")
    yield
    # Shutdown
    pass

app = FastAPI(title="The Tusk and Trunk API", lifespan=lifespan)

app.state.limiter = auth_limiter  # slowapi expects a single state.limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

default_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://thetuskandtrunk.com",
    "https://www.thetuskandtrunk.com",
    "https://tust-trunk.vercel.app",
]

origins_set = set(default_origins)

if settings.FRONTEND_URL:
    raw_urls = [url.strip() for url in settings.FRONTEND_URL.replace(';', ',').split(',') if url.strip()]
    for url in raw_urls:
        url = url.rstrip('/')
        if not url.startswith('http://') and not url.startswith('https://'):
            origins_set.add(f"https://{url}")
            origins_set.add(f"http://{url}")
        else:
            origins_set.add(url)

origins_list = list(origins_set)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*thetuskandtrunk\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(categories_router)
app.include_router(public_catalog_router)
app.include_router(addresses_router)
app.include_router(cart_router)
app.include_router(wishlist_router)
app.include_router(checkout_router)
app.include_router(orders_router)
app.include_router(user_orders_router)
app.include_router(admin_orders_router)
app.include_router(admin_dashboard_router)
app.include_router(admin_customers_router)
app.include_router(cms_router)
app.include_router(reviews_router)
app.include_router(admin_reviews_router)
app.include_router(admin_coupons_router)
@app.get("/health", tags=["system"])
def health_check():
    return {"status": "ok"}
