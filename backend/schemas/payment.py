from pydantic import BaseModel
from typing import Optional

class CreateSessionRequest(BaseModel):
    order_id: int

class SessionUrlResponse(BaseModel):
    url: str

class ApproveUrlResponse(BaseModel):
    approve_url: str

class ConfirmPaymentRequest(BaseModel):
    order_id: int
    provider: str   # "stripe" | "paypal" | "vnpay"