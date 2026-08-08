from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class OrderDB(Base):
    __tablename__ = "orders"

    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status            = Column(String(20), nullable=False, default="PLACED")
    payment_status    = Column(String(20), nullable=False, default="PENDING")
    total_amount      = Column(Float, nullable=False)
    shipping_address  = Column(String(255), nullable=True)
    shipping_provider = Column(String(20), nullable=False, default="IN_HOUSE")
    tracking_code     = Column(String(100), nullable=True)
    shipping_fee      = Column(Float, nullable=False, default=0)
    shipper_id        = Column(Integer, ForeignKey("users.id"), nullable=True)
    carrier            = Column(String(50), nullable=True)
    tracking_number    = Column(String(100), nullable=True)
    shipped_at          = Column(DateTime(timezone=True), nullable=True)
    delivery_failure_reason = Column(String(255), nullable=True)
    created_at          = Column(DateTime(timezone=True), server_default=func.now())

    user    = relationship("UserDB", foreign_keys=[user_id], backref="orders")
    shipper = relationship("UserDB", foreign_keys=[shipper_id])
    items   = relationship("OrderItemDB", back_populates="order", cascade="all, delete-orphan")


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