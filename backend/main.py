import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import mimetypes
from dotenv import load_dotenv

load_dotenv()

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
from routers.shipping import router as shipping_router
from routers.shipper import router as shipper_router
from routers.fleet import router as fleet_router
from routers.inventory import router as inventory_router
from routers.shipper_reports import router as shipper_reports_router


Base.metadata.create_all(bind=engine)

# Chỉ bật Swagger docs khi ENVIRONMENT=development (mặc định production, ẩn docs)
is_dev = os.getenv("ENVIRONMENT", "production") == "development"

app = FastAPI(
    title="ShopAK API",
    version="3.0.0",
    docs_url="/docs" if is_dev else None,
    redoc_url="/redoc" if is_dev else None,
    openapi_url="/openapi.json" if is_dev else None,
)

# Đọc allowed origins từ env, phân tách bằng dấu phẩy
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
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
app.include_router(shipping_router)
app.include_router(shipper_router)
app.include_router(fleet_router)
app.include_router(inventory_router)
app.include_router(shipper_reports_router)


@app.get("/")
def root():
    return {"message": "ShopAK API v3 running in production"}


@app.get("/images/{filename}")
def get_image(filename: str):
    path = f"data_images/{filename}"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Image not found")
    content_type, _ = mimetypes.guess_type(path)
    return FileResponse(path, media_type=content_type or "application/octet-stream")


@app.get("/debug-cors")
def debug_cors():
    return {"allowed_origins": allowed_origins}