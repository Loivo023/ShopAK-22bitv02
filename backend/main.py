from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import mimetypes

from database import engine, Base
from models.product import ProductDB
from models.user import UserDB
from models.order import OrderDB, OrderItemDB
from models.payment import PaymentDB
from routers.products import router as products_router
from routers.users import router as users_router
from routers.auth import router as auth_router
from routers.orders import router as orders_router
from routers.payments import router as payments_router
from routers.admin_stats import router as admin_stats_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ShopAK API", version="2.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)

os.makedirs("data_images", exist_ok=True)
app.mount("/images", StaticFiles(directory="data_images"), name="images")

app.include_router(products_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(orders_router)
app.include_router(payments_router)
app.include_router(admin_stats_router)

@app.get("/")
def root():
    return {"message": "ShopAK API v2 running with PostgreSQL"}

@app.get("/images/{filename}")
def get_image(filename: str):
    path = f"data_images/{filename}"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Image not found")
    content_type, _ = mimetypes.guess_type(path)
    return FileResponse(path, media_type=content_type or "application/octet-stream")