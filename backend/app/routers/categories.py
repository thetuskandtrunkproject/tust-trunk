from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List

from app.schemas.categories import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services import categories_service
from app.dependencies.auth import get_current_admin
from app.core.database import get_db_client

router = APIRouter(prefix="/admin/categories", tags=["Admin Categories"])

@router.get("", response_model=List[CategoryResponse])
def list_categories(
    request: Request,
    admin: dict = Depends(get_current_admin),
    db=Depends(get_db_client)
):
    """List all categories."""
    return categories_service.list_categories(db)


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: str,
    request: Request,
    admin: dict = Depends(get_current_admin),
    db=Depends(get_db_client)
):
    """Get a single category by ID."""
    return categories_service.get_category(db, category_id)


@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(
    data: CategoryCreate,
    request: Request,
    admin: dict = Depends(get_current_admin),
    db=Depends(get_db_client)
):
    """Create a new category."""
    return categories_service.create_category(db, data)


@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: str,
    data: CategoryUpdate,
    request: Request,
    admin: dict = Depends(get_current_admin),
    db=Depends(get_db_client)
):
    """Update a category."""
    return categories_service.update_category(db, category_id, data)


@router.delete("/{category_id}", response_model=CategoryResponse)
def delete_category(
    category_id: str,
    request: Request,
    admin: dict = Depends(get_current_admin),
    db=Depends(get_db_client)
):
    """Delete a category. Fails if products are attached to it."""
    return categories_service.delete_category(db, category_id)
