from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

class OrderItemCreate(BaseModel):
    product_id: int
    name:       str
    price:      float
    quantity:   int = Field(..., gt=0)

class CheckoutRequest(BaseModel):
    items: List[OrderItemCreate]

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
    id:           int
    status:       str
    total_amount: float
    created_at:   str
    items:        List[OrderItemRead]

    class Config:
        from_attributes = True

class OrderSummary(BaseModel):
    id:           int
    status:       str
    total_amount: float
    created_at:   str

    class Config:
        from_attributes = True


# ── Admin schemas ──
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