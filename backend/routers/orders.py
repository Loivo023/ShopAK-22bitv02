from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from database import get_db
from models.order import OrderDB, OrderItemDB
from schemas.order import (
    CheckoutRequest, OrderRead, OrderItemRead, OrderSummary,
    OrderStatusUpdate, OrderItemQuantityUpdate,
)
from auth.deps import get_current_user, require_admin

router = APIRouter(prefix="/orders", tags=["orders"])


def _to_order_read(order: OrderDB) -> OrderRead:
    return OrderRead(
        id=order.id,
        status=order.status,
        total_amount=order.total_amount,
        created_at=str(order.created_at),
        items=[
            OrderItemRead(
                id=oi.id, product_id=oi.product_id,
                product_name=oi.product_name, product_price=oi.product_price,
                quantity=oi.quantity, line_total=oi.line_total,
            )
            for oi in order.items
        ],
    )


# ── POST /orders/checkout ──
@router.post("/checkout", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def checkout_order(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_amount = 0.0
    for item in payload.items:
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail="Invalid item quantity")
        total_amount += item.price * item.quantity

    try:
        order = OrderDB(user_id=user.id, status="PLACED", total_amount=total_amount)
        db.add(order)
        db.flush()

        for item in payload.items:
            order_item = OrderItemDB(
                order_id=order.id,
                product_id=item.product_id,
                product_name=item.name,
                product_price=item.price,
                quantity=item.quantity,
                line_total=item.price * item.quantity,
            )
            db.add(order_item)

        db.commit()
        db.refresh(order)
    except Exception:
        db.rollback()
        raise

    return _to_order_read(order)


# ── GET /orders/my ──
@router.get("/my", response_model=List[OrderSummary])
def get_my_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    orders = (
        db.query(OrderDB)
        .filter(OrderDB.user_id == user.id)
        .order_by(desc(OrderDB.created_at))
        .all()
    )
    return [
        OrderSummary(id=o.id, status=o.status, total_amount=o.total_amount, created_at=str(o.created_at))
        for o in orders
    ]


# ── GET /orders/admin/all — ĐẶT TRƯỚC /{order_id} để tránh route conflict ──
@router.get("/admin/all", response_model=List[OrderSummary], dependencies=[Depends(require_admin)])
def get_all_orders_for_admin(db: Session = Depends(get_db)):
    orders = db.query(OrderDB).order_by(desc(OrderDB.created_at)).all()
    return [
        OrderSummary(id=o.id, status=o.status, total_amount=o.total_amount, created_at=str(o.created_at))
        for o in orders
    ]


# ── GET /orders/{order_id} ──
@router.get("/{order_id}", response_model=OrderRead)
def get_order_by_id(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not allowed")

    return _to_order_read(order)


# ── PATCH /orders/{order_id}/status — ADMIN only ──
@router.patch("/{order_id}/status", response_model=OrderRead, dependencies=[Depends(require_admin)])
def admin_update_order_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = payload.status
    db.commit()
    db.refresh(order)

    return _to_order_read(order)


# ── PATCH /orders/{order_id}/items/quantity — ADMIN only ──
@router.patch("/{order_id}/items/quantity", response_model=OrderRead, dependencies=[Depends(require_admin)])
def admin_update_order_item_quantity(order_id: int, payload: OrderItemQuantityUpdate, db: Session = Depends(get_db)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    item = db.query(OrderItemDB).filter(
        OrderItemDB.id == payload.item_id,
        OrderItemDB.order_id == order_id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")

    item.quantity   = payload.quantity
    item.line_total = item.quantity * item.product_price
    order.total_amount = sum(oi.line_total for oi in order.items)

    db.commit()
    db.refresh(order)

    return _to_order_read(order)