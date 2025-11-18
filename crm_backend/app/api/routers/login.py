from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core import security
from app.core.config import settings
from app.db.database import get_session
from app.models.all_models import User

router = APIRouter()

@router.post("/token")
async def login_for_access_token(
    db: AsyncSession = Depends(get_session), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    Стандартный эндпоинт для получения JWT токена по логину и паролю.
    """
    user = (await db.exec(select(User).where(User.login == form_data.username))).first()
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.login}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}