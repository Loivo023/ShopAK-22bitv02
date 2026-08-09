from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base


class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="CUSTOMER")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    avatar_url = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)

    # Password reset
    reset_token_hash = Column(String(64), nullable=True, index=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)