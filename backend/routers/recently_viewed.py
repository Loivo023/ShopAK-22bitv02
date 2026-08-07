from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from database import get_db
from models.extras import RecentlyViewedDB
from models.product import ProductDB
from schemas.extras import WishlistProductRead
from auth.deps import get_current_user

router = APIRouter(prefix="/recently-viewed", tags=["recently-viewed"])


@router.post("/{product_id}", status_code=201)
def track_view(product_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    db.add(RecentlyViewedDB(user_id=user.id, product_id=product_id))
    db.commit()
    return {"message": "Tracked"}


@router.get("", response_model=List[WishlistProductRead])
def get_recently_viewed(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = (
        db.query(ProductDB, RecentlyViewedDB.viewed_at)
        .join(RecentlyViewedDB, RecentlyViewedDB.product_id == ProductDB.id)
        .filter(RecentlyViewedDB.user_id == user.id)
        .order_by(desc(RecentlyViewedDB.viewed_at))
        .limit(50)
        .all()
    )
    seen, result = set(), []
    for p, _ in rows:
        if p.id in seen:
            continue
        seen.add(p.id)
        result.append(WishlistProductRead(product_id=p.id, name=p.name, price=p.price, imageUrl=p.image_path, category=p.category))
        if len(result) >= 8:
            break
    return result