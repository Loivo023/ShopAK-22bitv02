from pydantic import BaseModel
from typing import List

class OverviewStats(BaseModel):
    total_products: int
    total_orders: int
    total_revenue: float
    total_users: int
    pending_orders: int
    new_users_30d: int

class MonthlyRevenue(BaseModel):
    months: List[str]
    revenues: List[float]

class TopProduct(BaseModel):
    product_id: int
    product_name: str
    total_quantity: int
    total_revenue: float

class TopProductsResponse(BaseModel):
    products: List[TopProduct]