from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    email:     EmailStr
    full_name: str          = Field(..., min_length=3, max_length=100)
    role:      Optional[str] = "customer"

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserRead(BaseModel):
    id:        int
    email:     EmailStr
    full_name: str
    role:      str

    class Config:
        from_attributes = True