from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class InventoryLogDB(Base):
    __tablename__ = "inventory_logs"

    id             = Column(Integer, primary_key=True, index=True)
    product_id     = Column(Integer, ForeignKey("products.id"), nullable=False)
    change_amount  = Column(Integer, nullable=False)   # +50 nhập kho, -3 xuất kho
    reason         = Column(String(100), nullable=False)
    created_by     = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())