from pydantic import BaseModel, Field
from typing import Optional


class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(
        None,
        max_length=1000,
    )


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(
        None,
        ge=1,
        le=5,
    )

    comment: Optional[str] = Field(
        None,
        max_length=1000,
    )


class ReviewRead(BaseModel):
    id: int
    user_id: int
    product_id: int

    customer_name: Optional[str] = None

    rating: int
    comment: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True