from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class OrderDB(Base):
    __tablename__ = "orders"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status           = Column(String(20), nullable=False, default="PLACED")
    total_amount     = Column(Float, nullable=False)
    shipping_address = Column(String(255), nullable=True)
    carrier          = Column(String(50), nullable=True)
    tracking_number  = Column(String(100), nullable=True)
    shipped_at       = Column(DateTime(timezone=True), nullable=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())

    user  = relationship("UserDB", backref="orders")
    items = relationship("OrderItemDB", back_populates="order", cascade="all, delete-orphan")


class OrderItemDB(Base):
    __tablename__ = "order_items"

    id            = Column(Integer, primary_key=True, index=True)
    order_id      = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    product_id    = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name  = Column(String(100), nullable=False)
    product_price = Column(Float, nullable=False)
    quantity      = Column(Integer, nullable=False)
    line_total    = Column(Float, nullable=False)

    order = relationship("OrderDB", back_populates="items")