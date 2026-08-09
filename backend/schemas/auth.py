from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class RegisterRequest(BaseModel):
    email:     EmailStr
    full_name: str = Field(..., min_length=3, max_length=100)
    password:  str = Field(..., min_length=6)
    role: Optional[str] = "CUSTOMER"

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str = Field(..., min_length=6)

class AuthUser(BaseModel):
    id:        int
    email:     EmailStr
    full_name: str
    role:      str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=128)

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         AuthUser