from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class PaymentDB(Base):
    __tablename__ = "payments"

    id                  = Column(Integer, primary_key=True, index=True)
    order_id            = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    provider            = Column(String(20), nullable=False)   # stripe, paypal, vnpay
    amount              = Column(Float, nullable=False)
    currency            = Column(String(10), nullable=False, default="USD")
    status              = Column(String(20), nullable=False, default="PENDING")
    provider_session_id = Column(String(255), nullable=True)
    created_at          = Column(DateTime(timezone=True), server_default=func.now())