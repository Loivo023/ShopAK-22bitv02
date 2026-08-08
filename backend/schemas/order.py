from pydantic import BaseModel, Field, field_validator
from typing import List, Optional


class OrderItemCreate(BaseModel):
    product_id: int
    name:       str
    price:      float
    quantity:   int = Field(..., gt=0)


class CheckoutRequest(BaseModel):
    items:              List[OrderItemCreate]
    shipping_address:   str
    shipping_provider:  str = "IN_HOUSE"        # "IN_HOUSE" | "GHN"
    shipping_fee:       float = 0
    to_name:            Optional[str] = None
    to_phone:           Optional[str] = None
    to_district_id:     Optional[int] = None
    to_ward_code:        Optional[str] = None

    @field_validator("shipping_provider")
    @classmethod
    def validate_provider(cls, v: str) -> str:
        if v not in ["IN_HOUSE", "GHN"]:
            raise ValueError("shipping_provider must be IN_HOUSE or GHN")
        return v


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
    id: int
    status: str
    payment_status: str
    payment_provider: Optional[str] = None
    total_amount: float
    created_at: str

    shipping_address: Optional[str] = None
    shipping_provider: str

    tracking_code: Optional[str] = None
    shipping_fee: float

    shipper_id: Optional[int] = None

    carrier: Optional[str] = None
    tracking_number: Optional[str] = None
    shipped_at: Optional[str] = None

    delivery_failure_reason: Optional[str] = None
    delivery_proof_url: Optional[str] = None
    delivered_at: Optional[str] = None

    # Customer information
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None

    items: List[OrderItemRead]

    class Config:
        from_attributes = True

class AdminOrderRead(BaseModel):
    id: int

    user_id: int
    customer_name: str | None = None
    customer_email: str | None = None
    customer_phone: str | None = None

    status: str
    payment_status: str

    total_amount: float
    shipping_fee: float

    shipping_provider: str | None = None
    tracking_code: str | None = None

    shipper_id: int | None = None
    shipper_name: str | None = None
    shipper_email: str | None = None
    shipper_phone: str | None = None

    carrier: str | None = None
    tracking_number: str | None = None
    shipped_at: str | None = None

    created_at: str

class OrderSummary(BaseModel):
    id:             int
    status:         str
    payment_status: str
    total_amount:   float
    created_at:     str

    class Config:
        from_attributes = True


ALLOWED_STATUSES = ["PLACED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELED", "FAILED"]

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


# ── Shipping fee calculation ──
class ShippingFeeRequest(BaseModel):
    shipping_provider: str
    to_district_id:    Optional[int] = None
    to_ward_code:       Optional[str] = None
    weight:            int = 500  # gram

class ShippingFeeResponse(BaseModel):
    fee: float


# ── Shipper actions ──
SHIPPER_ALLOWED_STATUSES = ["SHIPPED", "COMPLETED", "FAILED"]

class ShipperStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in SHIPPER_ALLOWED_STATUSES:
            raise ValueError(f"Shipper can only set status to: {SHIPPER_ALLOWED_STATUSES}")
        return v