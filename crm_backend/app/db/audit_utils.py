from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.all_models import AuditLog, User
from app.models.enums import AuditAction

async def create_audit_log(
    db: AsyncSession,
    user: User,
    action: AuditAction,
    target_model: str,
    target_id: int,
    changes: dict
):
    """
    Создает запись в логе аудита.
    """
    audit_entry = AuditLog(
        action=action,
        user_id=user.id,
        target_model=target_model,
        target_id=target_id,
        changes=changes
    )
    db.add(audit_entry)
    await db.commit()
    await db.refresh(audit_entry)