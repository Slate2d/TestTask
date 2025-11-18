from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.api.deps import get_current_admin_user, get_session
from app.models.all_models import AuditLog, AuditLogRead, User

router = APIRouter()

@router.get("/", response_model=List[AuditLogRead])
async def get_audit_logs(
    *,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_admin_user), # Только админы
    skip: int = 0,
    limit: int = 100
):
    """
    Вкладка 5: Логи аудита (только для Админов).
    """
    query = select(AuditLog).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit)
    logs = (await db.exec(query)).all()
    
    # Чтобы корректно отобразить пользователя, нужен selectinload
    # Но для простоты вернем так, SQLModel 
    # В реальном проекте тут нужен joinload/selectinload
    # Но SQLModel v0.0.14+ должен справляться
    
    # Убедимся, что связи загружены (может потребовать доработки)
    results = []
    for log in logs:
        # Это ленивая загрузка, которая в async не очень
        # В идеале - переписать запрос с join
        user = await db.get(User, log.user_id) 
        log_read = AuditLogRead.model_validate(log)
        log_read.user = user
        results.append(log_read)
        
    return results