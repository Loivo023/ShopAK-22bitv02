from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.extras import WishlistItemDB
from models.product import ProductDB
from schemas.extras import WishlistProductRead
from auth.deps import get_current_user

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.get("", response_model=List[WishlistProductRead])
def get_wishlist(db: Session = Depends(get_db), user=Depends(get_current_user)):
    items = (
        db.query(ProductDB)
        .join(WishlistItemDB, WishlistItemDB.product_id == ProductDB.id)
        .filter(WishlistItemDB.user_id == user.id)
        .all()
    )
    return [
        WishlistProductRead(product_id=p.id, name=p.name, price=p.price, imageUrl=p.image_path, category=p.category)
        for p in items
    ]


@router.post("/{product_id}", status_code=201)
def add_to_wishlist(product_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    existing = db.query(WishlistItemDB).filter(WishlistItemDB.user_id == user.id, WishlistItemDB.product_id == product_id).first()
    if existing:
        return {"message": "Already in wishlist"}
    db.add(WishlistItemDB(user_id=user.id, product_id=product_id))
    db.commit()
    return {"message": "Added to wishlist"}


@router.delete("/{product_id}", status_code=204)
def remove_from_wishlist(product_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    item = db.query(WishlistItemDB).filter(WishlistItemDB.user_id == user.id, WishlistItemDB.product_id == product_id).first()
    if item:
        db.delete(item)
        db.commit()