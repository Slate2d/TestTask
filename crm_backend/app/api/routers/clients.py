from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.api.deps import get_current_user, get_current_admin_user, get_session
from app.db.audit_utils import create_audit_log
from app.models.all_models import Client, ClientCreate, ClientRead, ClientUpdate, User
from app.models.enums import AuditAction

router = APIRouter()

@router.post("/", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
async def create_client(
    *,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    client_in: ClientCreate
):
    """
    Вкладка 1: Создание клиента.
    """
    existing_client = (await db.exec(select(Client).where(Client.phone == client_in.phone))).first()
    if existing_client:
        raise HTTPException(status_code=400, detail="Phone number already registered.")

    db_client = Client.model_validate(client_in, update={"created_by_id": current_user.id})
    
    db.add(db_client)
    await db.commit()
    await db.refresh(db_client)
    
    
    await create_audit_log(
        db, current_user, AuditAction.CREATE, "Client", db_client.id, 
        
        {"new_data": db_client.model_dump(mode='json', exclude={'creator', 'products'})}
    )
    
    return db_client

@router.get("/{client_id}", response_model=ClientRead)
async def get_client_by_id(
    *,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user), 
    client_id: int
):
    """
    Получение одного клиента по ID
    """
    client = (await db.exec(select(Client).where(Client.id == client_id))).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.get("/", response_model=List[ClientRead])
async def get_clients_list(
    *,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    full_name: str = Query(None, description="Поиск по ФИО (частичное совпадение)"),
    phone: str = Query(None, description="Поиск по телефону (частичное совпадение)")
):
    query = select(Client)
    if full_name:
        query = query.where(Client.full_name.ilike(f"%{full_name}%"))
    if phone:
        query = query.where(Client.phone.ilike(f"%{phone}%"))
        
    clients = (await db.exec(query.offset(skip).limit(limit))).all()
    return clients

@router.put("/{client_id}", response_model=ClientRead)
async def update_client(
    *,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    client_id: int,
    client_in: ClientUpdate
):
    db_client = (await db.exec(select(Client).where(Client.id == client_id))).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")

    client_data = client_in.model_dump(exclude_unset=True)
    
    old_data = db_client.model_dump(mode='json', exclude={'creator', 'products'})
    
    for key, value in client_data.items():
        setattr(db_client, key, value)
    
    db.add(db_client)
    await db.commit()
    await db.refresh(db_client)
    
    
    await create_audit_log(
        db, current_user, AuditAction.UPDATE, "Client", db_client.id,
        
        {"old_data": old_data, "new_data": db_client.model_dump(mode='json', exclude={'creator', 'products'})}
    )
    
    return db_client

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    *,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_admin_user), 
    client_id: int
):
    db_client = (await db.exec(select(Client).where(Client.id == client_id))).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    
    await create_audit_log(
        db, current_user, AuditAction.DELETE, "Client", db_client.id,
        
        {"deleted_data": db_client.model_dump(mode='json', exclude={'creator', 'products'})}
    )

    await db.delete(db_client)
    await db.commit()
    
    return

@router.patch("/{client_id}/toggle_active", response_model=ClientRead)
async def toggle_client_active_status(
    *,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_admin_user), 
    client_id: int,
    is_active: bool
):
    db_client = (await db.exec(select(Client).where(Client.id == client_id))).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")

    old_status = db_client.is_active
    db_client.is_active = is_active
    
    db.add(db_client)
    await db.commit()
    await db.refresh(db_client)
    
    
    action = AuditAction.DISABLE if not is_active else AuditAction.ENABLE
    await create_audit_log(
        db, current_user, action, "Client", db_client.id,
        {"old_status": old_status, "new_status": is_active}
    )
    
    return db_client