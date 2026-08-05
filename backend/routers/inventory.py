from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from database import get_db
from models.product import ProductDB
from models.inventory import InventoryLogDB
from schemas.inventory import InventoryAdjustment, InventoryItemRead, InventoryLogRead
from auth.deps import get_current_user

router = APIRouter(prefix="/inventory", tags=["inventory"])


def _check_access(user):
    if user.role not in ("ADMIN", "SHIPPER"):
        raise HTTPException(status_code=403, detail="Not allowed")


@router.get("", response_model=List[InventoryItemRead])
def list_inventory(db: Session = Depends(get_db), user=Depends(get_current_user)):
    _check_access(user)
    products = db.query(ProductDB).all()
    return [
        InventoryItemRead(product_id=p.id, product_name=p.name, stock_quantity=p.stock_quantity, category=p.category)
        for p in products
    ]


@router.post("/adjust", response_model=InventoryItemRead)
def adjust_stock(payload: InventoryAdjustment, db: Session = Depends(get_db), user=Depends(get_current_user)):
    _check_access(user)
    product = db.query(ProductDB).filter(ProductDB.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_stock = product.stock_quantity + payload.change_amount
    if new_stock < 0:
        raise HTTPException(status_code=400, detail="Stock cannot go below 0")

    product.stock_quantity = new_stock
    db.add(InventoryLogDB(
        product_id=product.id, change_amount=payload.change_amount,
        reason=payload.reason, created_by=user.id,
    ))
    db.commit()
    db.refresh(product)

    return InventoryItemRead(product_id=product.id, product_name=product.name, stock_quantity=product.stock_quantity, category=product.category)


@router.get("/logs", response_model=List[InventoryLogRead])
def get_logs(db: Session = Depends(get_db), user=Depends(get_current_user)):
    _check_access(user)
    logs = (
        db.query(InventoryLogDB, ProductDB.name)
        .join(ProductDB, ProductDB.id == InventoryLogDB.product_id)
        .order_by(desc(InventoryLogDB.created_at))
        .limit(50)
        .all()
    )
    return [
        InventoryLogRead(id=log.id, product_id=log.product_id, product_name=name, change_amount=log.change_amount, reason=log.reason, created_at=str(log.created_at))
        for log, name in logs
    ]