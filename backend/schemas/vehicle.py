from pydantic import BaseModel, Field
from typing import Optional

class VehicleCreate(BaseModel):
    plate_number: str = Field(..., min_length=3, max_length=20)
    vehicle_type: str
    capacity_kg:  float = Field(..., gt=0)

class VehicleUpdate(BaseModel):
    status:                Optional[str] = None
    assigned_shipper_id:   Optional[int] = None

class VehicleRead(BaseModel):
    id:                   int
    plate_number:         str
    vehicle_type:         str
    capacity_kg:          float
    status:                str
    assigned_shipper_id:   Optional[int] = None

    class Config:
        from_attributes = True