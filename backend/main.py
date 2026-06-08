from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
def root():
    return {
        "message": "Welcome to ShopAK API"
    }

class Product(BaseModel):
    id: int
    name: str
    price: float
    description: str | None = None

@app.get("/about")
def about():
    return {
        "project": "ShopAK",
        "version": "1.0"
    }

PRODUCT_DATA = [
    {
        "id": 1,
        "name": "laptop"
    },
    {
        "id": 2,
        "name": "Mouse"
    }
]

@app.get("/products")
def get_all_product():
    return PRODUCT_DATA