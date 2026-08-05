from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional

class UserBase(BaseModel):
    email:     EmailStr
    full_name: str          = Field(..., min_length=3, max_length=100)
    role:      Optional[str] = "CUSTOMER"

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserRead(BaseModel):
    id:        int
    email:     EmailStr
    full_name: str
    role:      str

    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in ["ADMIN", "CUSTOMER", "SHIPPER"]:
            raise ValueError("Role must be ADMIN, CUSTOMER, or SHIPPER")
        return v