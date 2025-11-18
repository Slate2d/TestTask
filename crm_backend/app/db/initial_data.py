from sqlmodel import Session, select
from app.core.config import settings
from app.core.security import get_password_hash
from app.db.database import sync_engine
from app.models.all_models import User
from app.models.enums import UserRole

def create_first_user():
    with Session(sync_engine) as session:
        
        admin_user = session.exec(select(User).where(User.login == "admin")).first()
        
        if not admin_user:
            print("Creating superuser 'admin' with password 'adminpass'")
            admin_user = User(
                login="admin",
                hashed_password=get_password_hash("adminpass"),
                role=UserRole.ADMIN
            )
            session.add(admin_user)
            session.commit()
        
        
        normal_user = session.exec(select(User).where(User.login == "user")).first()
        
        if not normal_user:
            print("Creating user 'user' with password 'userpass'")
            normal_user = User(
                login="user",
                hashed_password=get_password_hash("userpass"),
                role=UserRole.USER
            )
            session.add(normal_user)
            session.commit()

if __name__ == "__main__":
    print("Loading initial data...")
    create_first_user()
    print("Initial data loaded.")