from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
def root():
    return {
        "message": "Welcome to ShopAK API"
    }
PRODUCTS_DATA = [
    {
        "id": 1,   
        "name": "Keyboard",
    },
    {
        "id": 2,
        "name": "Mouse",
    },
    {
        "id": 3,
        "name": "Monitor",
    }
]

@app.get("/products")
def get_products():
    return PRODUCTS_DATA

@app.get("/products/{product_id}")
def get_product_by_id(product_id: int):
    for item in PRODUCTS_DATA:
        if item["id"] == product_id:
            return item
    return {"error": "Product not found"}
