from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import mimetypes

from database import engine, Base
from models.product import ProductDB
from models.user import UserDB
from routers.products import router as products_router
from routers.users import router as users_router

# ─────────────────────────────────────────────
# Tạo tables tự động
# ─────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ShopAK API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

os.makedirs("data_images", exist_ok=True)
app.mount("/images", StaticFiles(directory="data_images"), name="images")

app.include_router(products_router)
app.include_router(users_router)

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