import datetime
from typing import Optional, List, Any
from sqlmodel import Field, SQLModel, Relationship, JSON, Column
from app.models.enums import UserRole, ClientSex, ProductStatus, AuditAction

# --- Модели Пользователей (для аутентификации и RBAC) ---

class UserBase(SQLModel):
    login: str = Field(unique=True, index=True)
    role: UserRole = Field(default=UserRole.USER)

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    
    # Связи
    created_clients: List["Client"] = Relationship(back_populates="creator")
    audit_logs: List["AuditLog"] = Relationship(back_populates="user")

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

# --- Модели Клиентов (Вкладка 1 и 2) ---

class ClientBase(SQLModel):
    full_name: str = Field(index=True)
    phone: str = Field(unique=True, index=True)
    sex: ClientSex
    is_active: bool = Field(default=True)

class Client(ClientBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    
    created_by_id: int = Field(foreign_key="user.id")
    creator: User = Relationship(back_populates="created_clients")
    
    products: List["Product"] = Relationship(back_populates="client")

# Схемы для API
class ClientCreate(ClientBase):
    pass

class ClientUpdate(SQLModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    sex: Optional[ClientSex] = None
    is_active: Optional[bool] = None

class ClientRead(ClientBase):
    id: int
    created_at: datetime.datetime
    created_by_id: int

class ClientReadWithDetails(ClientRead):
    creator: UserRead
    products: List["ProductRead"] = []


# --- Модели Товаров (Вкладка 3 и 4) ---

class ProductBase(SQLModel):
    name: str = Field(index=True)
    status: ProductStatus = Field(default=ProductStatus.IN_STOCK)

class Product(ProductBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    
    client_id: int = Field(foreign_key="client.id")
    client: Client = Relationship(back_populates="products")

# Схемы для API
class ProductCreate(ProductBase):
    client_id: int

class ProductUpdate(SQLModel):
    name: Optional[str] = None
    status: Optional[ProductStatus] = None

class ProductRead(ProductBase):
    id: int
    created_at: datetime.datetime
    client_id: int


# --- Модели Логирования (Вкладка 5) ---

class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow, index=True)
    action: AuditAction
    
    user_id: int = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="audit_logs")
    
    target_model: str # "Client" или "Product"
    target_id: int
    
    # Сохраняем "до" и "после" в JSON
    changes: dict[str, Any] = Field(sa_column=Column(JSON))

class AuditLogRead(SQLModel):
    id: int
    timestamp: datetime.datetime
    action: AuditAction
    user_id: int
    target_model: str
    target_id: int
    changes: dict[str, Any]
    user: UserRead