from pydantic import BaseModel, Field
from typing import Optional, List


# ── Wishlist ──
class WishlistProductRead(BaseModel):
    product_id: int
    name:       str
    price:      float
    imageUrl:   str
    category:   str


# ── Voucher ──
class VoucherApply(BaseModel):
    code:          str
    order_amount:  float

class VoucherResult(BaseModel):
    valid:           bool
    message:         str
    discount_amount: float = 0
    free_shipping:   bool = False

class VoucherCreate(BaseModel):
    code:              str = Field(..., min_length=3, max_length=30)
    discount_type:     str  # PERCENT | FIXED | FREESHIP
    discount_value:    float = 0
    min_order_amount:  float = 0
    max_uses:          Optional[int] = None

class VoucherRead(BaseModel):
    id:                int
    code:              str
    discount_type:     str
    discount_value:    float
    min_order_amount:  float
    max_uses:          Optional[int]
    used_count:        int
    active:            bool

    class Config:
        from_attributes = True


# ── Address ──
class AddressCreate(BaseModel):
    label:        str = "Home"
    full_address: str = Field(..., min_length=5)
    phone:        Optional[str] = None
    is_default:   bool = False

class AddressRead(BaseModel):
    id:           int
    label:        str
    full_address: str
    phone:        Optional[str]
    is_default:   bool

    class Config:
        from_attributes = True


# ── Profile ──
class ProfileUpdate(BaseModel):
    full_name:  Optional[str] = None
    phone:      Optional[str] = None
    avatar_url: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password:      str = Field(..., min_length=6)


# ── Chat ──
class ChatMessageCreate(BaseModel):
    channel: str
    message: str = Field(..., min_length=1)

class ChatMessageRead(BaseModel):
    id:          int
    channel:     str
    sender_id:   Optional[int]
    sender_role: str
    message:     str
    is_bot:      bool
    created_at:  str

    class Config:
        from_attributes = True