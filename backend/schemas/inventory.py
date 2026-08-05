from pydantic import BaseModel, Field

class InventoryAdjustment(BaseModel):
    product_id:     int
    change_amount:  int
    reason:         str = Field(..., min_length=3, max_length=100)

class InventoryItemRead(BaseModel):
    product_id:      int
    product_name:    str
    stock_quantity:  int
    category:        str

class InventoryLogRead(BaseModel):
    id:             int
    product_id:     int
    product_name:   str
    change_amount:  int
    reason:         str
    created_at:     str

    class Config:
        from_attributes = True