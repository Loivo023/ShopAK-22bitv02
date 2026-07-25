from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

class OrderItemCreate(BaseModel):
    product_id: int
    name:       str
    price:      float
    quantity:   int = Field(..., gt=0)

class CheckoutRequest(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: Optional[str] = None

class OrderItemRead(BaseModel):
    id:            int
    product_id:    int
    product_name:  str
    product_price: float
    quantity:      int
    line_total:    float

    class Config:
        from_attributes = True

class OrderRead(BaseModel):
    id:               int
    status:           str
    total_amount:     float
    created_at:       str
    shipping_address: Optional[str] = None
    carrier:          Optional[str] = None
    tracking_number:  Optional[str] = None
    shipped_at:       Optional[str] = None
    items:            List[OrderItemRead]

    class Config:
        from_attributes = True

class OrderSummary(BaseModel):
    id:           int
    status:       str
    total_amount: float
    created_at:   str

    class Config:
        from_attributes = True


ALLOWED_STATUSES = ["PLACED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELED"]

class OrderStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ALLOWED_STATUSES:
            raise ValueError(f"Invalid status: {v}")
        return v

class OrderItemQuantityUpdate(BaseModel):
    item_id:  int
    quantity: int = Field(..., gt=0)

class ShipOrderRequest(BaseModel):
    carrier:         str = Field(..., min_length=2, max_length=50)
    tracking_number: str = Field(..., min_length=2, max_length=100)