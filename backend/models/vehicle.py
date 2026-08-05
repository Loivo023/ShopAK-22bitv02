from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class VehicleDB(Base):
    __tablename__ = "vehicles"

    id                    = Column(Integer, primary_key=True, index=True)
    plate_number          = Column(String(20), unique=True, nullable=False)
    vehicle_type          = Column(String(30), nullable=False)  # Motorbike, Van, Truck
    capacity_kg           = Column(Float, nullable=False, default=0)
    status                = Column(String(20), nullable=False, default="AVAILABLE")  # AVAILABLE, IN_USE, MAINTENANCE
    assigned_shipper_id   = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at            = Column(DateTime(timezone=True), server_default=func.now())

    assigned_shipper = relationship("UserDB")