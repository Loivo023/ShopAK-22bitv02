import json
import os
import shutil
import uuid
import mimetypes
from typing import List, Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

# ─────────────────────────────────────────────
# App setup
# ─────────────────────────────────────────────
app = FastAPI(title="ShopAK Product API", version="1.1.0")

origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

os.makedirs("data_images", exist_ok=True)
os.makedirs("data", exist_ok=True)
app.mount("/images", StaticFiles(directory="data_images"), name="images")

# ─────────────────────────────────────────────
# Pydantic Schemas
# ─────────────────────────────────────────────
class Product(BaseModel):
    id:          int
    name:        str             = Field(..., min_length=3, max_length=100)
    price:       float           = Field(..., gt=0)
    category:    str             = Field(..., min_length=3, max_length=50)
    description: str             = Field(..., min_length=5)
    imagePath:   str
    costPrice:   Optional[float] = None

class ProductCreate(BaseModel):
    name:        str             = Field(..., min_length=3, max_length=100)
    price:       float           = Field(..., gt=0)
    category:    str             = Field(..., min_length=3, max_length=50)
    description: str             = Field(..., min_length=5)
    imageUrl:    Optional[str]   = None

class ProductUpdate(BaseModel):
    name:        Optional[str]   = Field(None, min_length=3, max_length=100)
    price:       Optional[float] = Field(None, gt=0)
    category:    Optional[str]   = Field(None, min_length=3, max_length=50)
    description: Optional[str]   = Field(None, min_length=5)
    imageUrl:    Optional[str]   = None

class ProductPublic(BaseModel):
    id:          int
    name:        str
    price:       float
    category:    str
    description: str
    imageUrl:    str

class ProductListResponse(BaseModel):
    total: int
    page:  int
    size:  int
    items: List[ProductPublic]

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────
DATA_FILE = "data/products.json"
BASE_URL  = "http://localhost:8000"

def load_products() -> list:
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_products(products: list) -> None:
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

def next_id(products: list) -> int:
    return max((p["id"] for p in products), default=0) + 1

def to_public(p: dict) -> dict:
    image_url = p.get("imageUrl") or ""
    if not image_url and p.get("imagePath"):
        filename  = os.path.basename(p["imagePath"])
        image_url = f"{BASE_URL}/images/{filename}"
    return {
        "id":          p["id"],
        "name":        p["name"],
        "price":       p["price"],
        "category":    p["category"],
        "description": p["description"],
        "imageUrl":    image_url,
    }

def save_upload(file: UploadFile, product_id: int) -> str:
    ext      = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{product_id}_{uuid.uuid4().hex[:8]}{ext}"
    path     = f"data_images/{filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return path

def delete_image(image_path: str) -> None:
    if image_path and os.path.exists(image_path):
        os.remove(image_path)

# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "ShopAK API is running", "version": "1.1.0"}


# ── GET /products — filter + search + pagination (merged) ──
@app.get("/products", response_model=ProductListResponse)
def get_products(
    category:  Optional[str]   = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, gt=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, gt=0, description="Maximum price"),
    search:    Optional[str]   = Query(None, description="Search by name or description"),
    page:      int             = Query(1,  ge=1,         description="Page number"),
    size:      int             = Query(10, ge=1, le=100, description="Items per page"),
):
    products = load_products()

    # Filter by category
    if category:
        products = [
            p for p in products
            if p["category"].lower() == category.lower()
        ]

    # Filter by price range
    if min_price is not None:
        products = [p for p in products if p["price"] >= min_price]
    if max_price is not None:
        products = [p for p in products if p["price"] <= max_price]

    # Search by name or description
    if search:
        keyword  = search.lower()
        products = [
            p for p in products
            if keyword in p["name"].lower()
            or keyword in p["description"].lower()
        ]

    # Paginate
    total      = len(products)
    start      = (page - 1) * size
    end        = start + size
    page_items = products[start:end]

    return ProductListResponse(
        total=total,
        page=page,
        size=size,
        items=[to_public(p) for p in page_items],
    )


# ── GET /products/{id} ──────────────────────────────────────
@app.get("/products/{product_id}", response_model=ProductPublic)
def get_product(product_id: int):
    products = load_products()
    product  = next((p for p in products if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return to_public(product)


# ── POST /products ──────────────────────────────────────────
@app.post("/products", response_model=ProductPublic, status_code=201)
async def create_product(
    name:        str                  = Form(...),
    price:       float                = Form(...),
    category:    str                  = Form(...),
    description: str                  = Form(...),
    imageUrl:    Optional[str]        = Form(None),
    image_file:  Optional[UploadFile] = File(None),
):

    if price <= 0:
        raise HTTPException(status_code=422, detail="Price must be greater than 0.")
    if len(name) < 3:
        raise HTTPException(status_code=422, detail="Name must be at least 3 characters.")
    if len(category) < 3:
        raise HTTPException(status_code=422, detail="Category must be at least 3 characters.")
    if len(description) < 5:
        raise HTTPException(status_code=422, detail="Description must be at least 5 characters.")
    if not image_file and not imageUrl:
        raise HTTPException(status_code=422, detail="Image is required: provide image_file or imageUrl.")

    products   = load_products()
    product_id = next_id(products)

    image_path     = ""
    image_url_save = ""
    if image_file:
        image_path = save_upload(image_file, product_id)
    else:
        image_url_save = imageUrl

    new_product = {
        "id":          product_id,
        "name":        name,
        "price":       price,
        "category":    category,
        "description": description,
        "imagePath":   image_path,
        "imageUrl":    image_url_save,
        "costPrice":   None,
    }
    products.append(new_product)
    save_products(products)
    return to_public(new_product)


# ── PUT /products/{id} ─────────────────────────────────────
@app.put("/products/{product_id}", response_model=ProductPublic)
async def update_product(
    product_id:  int,
    name:        Optional[str]        = Form(None),
    price:       Optional[float]      = Form(None),
    category:    Optional[str]        = Form(None),
    description: Optional[str]        = Form(None),
    imageUrl:    Optional[str]        = Form(None),
    image_file:  Optional[UploadFile] = File(None),
):
    products = load_products()
    index    = next((i for i, p in enumerate(products) if p["id"] == product_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="Product not found")

    product = products[index]

    if name        is not None: product["name"]        = name
    if price       is not None: product["price"]       = price
    if category    is not None: product["category"]    = category
    if description is not None: product["description"] = description

    if image_file:
        delete_image(product.get("imagePath", ""))
        product["imagePath"] = save_upload(image_file, product_id)
        product["imageUrl"]  = ""
    elif imageUrl is not None:
        delete_image(product.get("imagePath", ""))
        product["imagePath"] = ""
        product["imageUrl"]  = imageUrl

    products[index] = product
    save_products(products)
    return to_public(product)


# ── DELETE /products/{id} ──────────────────────────────────
@app.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int):
    products = load_products()
    index    = next((i for i, p in enumerate(products) if p["id"] == product_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="Product not found")

    delete_image(products[index].get("imagePath", ""))
    products.pop(index)
    save_products(products)


# ── GET /images/{filename} ─────────────────────────────────
@app.get("/images/{filename}")
def get_image(filename: str):
    path = f"data_images/{filename}"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Image not found")
    content_type, _ = mimetypes.guess_type(path)
    return FileResponse(path, media_type=content_type or "application/octet-stream")
