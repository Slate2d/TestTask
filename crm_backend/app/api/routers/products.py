from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.api.deps import get_current_user, get_current_admin_user, get_session
from app.db.audit_utils import create_audit_log
from app.models.all_models import Product, ProductCreate, ProductRead, ProductUpdate, User, Client
from app.models.enums import AuditAction, ProductStatus

router = APIRouter()

@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    *,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    product_in: ProductCreate
):
    client = (await db.exec(select(Client).where(Client.id == product_in.client_id))).first()
    if not client:
        raise HTTPException(status_code=404, detail=f"Client with id {product_in.client_id} not found.")

    db_product = Product.model_validate(product_in)
    
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    
    
    await create_audit_log(
        db, current_user, AuditAction.CREATE, "Product", db_product.id,
        
        {"new_data": db_product.model_dump(mode='json', exclude={'client'})}
    )
    
    return db_product

@router.get("/", response_model=List[ProductRead])
async def get_products_list(
    *,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    status: ProductStatus = Query(None, description="Фильтр по статусу"),
    name: str = Query(None, description="Фильтр по названию (частичное совпадение)"),
    client_id: int = Query(None, description="Фильтр по ID клиента")
):
    query = select(Product)
    if status:
        query = query.where(Product.status == status)
    if name:
        query = query.where(Product.name.ilike(f"%{name}%"))
    if client_id:
        query = query.where(Product.client_id == client_id)
        
    products = (await db.exec(query.offset(skip).limit(limit))).all()
    return products

@router.put("/{product_id}", response_model=ProductRead)
async def update_product(
    *,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    product_id: int,
    product_in: ProductUpdate
):
    db_product = (await db.exec(select(Product).where(Product.id == product_id))).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    product_data = product_in.model_dump(exclude_unset=True)
    
    old_data = db_product.model_dump(mode='json', exclude={'client'})
    
    for key, value in product_data.items():
        setattr(db_product, key, value)
    
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    
    
    await create_audit_log(
        db, current_user, AuditAction.UPDATE, "Product", db_product.id,
        
        {"old_data": old_data, "new_data": db_product.model_dump(mode='json', exclude={'client'})}
    )
    
    return db_product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    *,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_admin_user), 
    product_id: int
):
    db_product = (await db.exec(select(Product).where(Product.id == product_id))).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    
    await create_audit_log(
        db, current_user, AuditAction.DELETE, "Product", db_product.id,
        
        {"deleted_data": db_product.model_dump(mode='json', exclude={'client'})}
    )

    await db.delete(db_product)
    await db.commit()
    
    return