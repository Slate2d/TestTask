import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class ClientSex(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class ProductStatus(str, enum.Enum):
    IN_STOCK = "in_stock"
    OUT_OF_STOCK = "out_of_stock"
    ON_ORDER = "on_order"

class AuditAction(str, enum.Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    DISABLE = "disable"
    ENABLE = "enable"