from sqlmodel import create_engine, SQLModel



from sqlalchemy.ext.asyncio import create_async_engine

from sqlmodel.ext.asyncio.session import AsyncSession


from sqlalchemy.orm import sessionmaker
from app.core.config import settings


async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True, 
    future=True
)


sync_engine = create_engine(settings.SYNC_DATABASE_URL, echo=True)


AsyncSessionLocal = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

async def get_session() -> AsyncSession:
    """
    Dependency для получения асинхронной сессии БД.
    """
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    """
    Инициализация таблиц (Alembic делает это лучше)
    """
    async with async_engine.begin() as conn:
        
        await conn.run_sync(SQLModel.metadata.create_all)