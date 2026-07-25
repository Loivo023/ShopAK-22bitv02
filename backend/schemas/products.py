from pydantic import BaseModel, Field
from typing import Optional

class ProductBase(BaseModel):
    name:        str   = Field(..., min_length=3, max_length=100)
    price:       float = Field(..., gt=0)
    category:    str   = Field(..., min_length=3, max_length=50)
    description: str   = Field(..., min_length=5)

class ProductCreate(ProductBase):
    imageUrl: str

class ProductUpdate(BaseModel):
    name:        Optional[str]   = Field(None, min_length=3, max_length=100)
    price:       Optional[float] = Field(None, gt=0)
    category:    Optional[str]   = Field(None, min_length=3, max_length=50)
    description: Optional[str]   = Field(None, min_length=5)
    imageUrl:    Optional[str]   = None

class ProductRead(BaseModel):
    id:          int
    name:        str
    price:       float
    category:    str
    description: str
    imageUrl:    str

    class Config:
        from_attributes = True