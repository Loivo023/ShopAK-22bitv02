from pydantic import BaseModel, Field
from typing import Optional
from pydantic import BaseModel, Field


class DeliveryFailureRequest(BaseModel):
    reason: str = Field(
        ...,
        min_length=1,
        max_length=255
    )

class ShipperStatusUpdate(BaseModel):
    status: str


class CodCollectRequest(BaseModel):
    amount_received: float = Field(gt=0)
    note: Optional[str] = None


class CodCollectResponse(BaseModel):
    message: str
    order_id: int
    amount_collected: float
    payment_status: str
    order_status: str