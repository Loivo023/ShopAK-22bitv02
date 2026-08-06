from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from database import get_db
from models.order import OrderDB, OrderItemDB
from schemas.order import (
    CheckoutRequest, OrderRead, OrderItemRead, OrderSummary,
    OrderStatusUpdate, OrderItemQuantityUpdate, ShipOrderRequest,
)
from auth.deps import get_current_user, require_admin
from services.shipping.factory import get_shipping_strategy

router = APIRouter(prefix="/orders", tags=["orders"])

EDITABLE_ITEM_STATUSES = {"PLACED", "PROCESSING"}

ALLOWED_TRANSITIONS = {
    "PLACED":     {"PROCESSING", "CANCELED"},
    "PROCESSING": {"CANCELED"},
    "SHIPPED":    {"COMPLETED", "FAILED"},
    "COMPLETED":  set(),
    "CANCELED":   set(),
    "FAILED":     {"PROCESSING"},
}


def _to_order_read(order: OrderDB) -> OrderRead:
    return OrderRead(
        id=order.id,
        status=order.status,
        payment_status=order.payment_status,
        total_amount=order.total_amount,
        created_at=str(order.created_at),
        shipping_address=order.shipping_address,
        shipping_provider=order.shipping_provider,
        tracking_code=order.tracking_code,
        shipping_fee=order.shipping_fee,
        shipper_id=order.shipper_id,
        carrier=order.carrier,
        tracking_number=order.tracking_number,
        shipped_at=str(order.shipped_at) if order.shipped_at else None,
        items=[
            OrderItemRead(
                id=oi.id, product_id=oi.product_id,
                product_name=oi.product_name, product_price=oi.product_price,
                quantity=oi.quantity, line_total=oi.line_total,
            )
            for oi in order.items
        ],
    )


@router.post("/checkout", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def checkout_order(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    items_total = 0.0
    for item in payload.items:
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail="Invalid item quantity")
        items_total += item.price * item.quantity

    tracking_code = None

    try:
        order = OrderDB(
            user_id=user.id,
            status="PLACED",
            payment_status="PENDING",
            total_amount=items_total + (payload.shipping_fee / 25400),
            shipping_address=payload.shipping_address,
            shipping_provider=payload.shipping_provider,
            shipping_fee=payload.shipping_fee,
        )
        db.add(order)
        db.flush()

        for item in payload.items:
            db.add(OrderItemDB(
                order_id=order.id,
                product_id=item.product_id,
                product_name=item.name,
                product_price=item.price,
                quantity=item.quantity,
                line_total=item.price * item.quantity,
            ))

        # Nếu chọn GHN, gọi API tạo đơn thật để lấy mã vận đơn
        if payload.shipping_provider == "GHN":
            if not (payload.to_name and payload.to_phone and payload.to_district_id and payload.to_ward_code):
                raise HTTPException(
                    status_code=400,
                    detail="GHN requires to_name, to_phone, to_district_id, to_ward_code",
                )
            db.flush()  # đảm bảo order.items đã có trong session
            strategy = get_shipping_strategy("GHN")
            tracking_code = strategy.create_order(
                order, payload.to_name, payload.to_phone,
                payload.shipping_address, payload.to_district_id, payload.to_ward_code,
            )
            order.tracking_code = tracking_code

        db.commit()
        db.refresh(order)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Checkout failed: {str(e)}")

    return _to_order_read(order)


@router.get("/my", response_model=List[OrderSummary])
def get_my_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    orders = db.query(OrderDB).filter(OrderDB.user_id == user.id).order_by(desc(OrderDB.created_at)).all()
    return [
        OrderSummary(id=o.id, status=o.status, payment_status=o.payment_status, total_amount=o.total_amount, created_at=str(o.created_at))
        for o in orders
    ]


@router.get("/admin/all", response_model=List[OrderSummary], dependencies=[Depends(require_admin)])
def get_all_orders_for_admin(db: Session = Depends(get_db)):
    orders = db.query(OrderDB).order_by(desc(OrderDB.created_at)).all()
    return [
        OrderSummary(id=o.id, status=o.status, payment_status=o.payment_status, total_amount=o.total_amount, created_at=str(o.created_at))
        for o in orders
    ]


@router.get("/{order_id}", response_model=OrderRead)
def get_order_by_id(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != user.id and user.role not in ("ADMIN", "SHIPPER"):
        raise HTTPException(status_code=403, detail="Not allowed")
    return _to_order_read(order)


@router.patch("/{order_id}/status", response_model=OrderRead, dependencies=[Depends(require_admin)])
def admin_update_order_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if payload.status == "SHIPPED":
        raise HTTPException(status_code=400, detail="Use POST /orders/{id}/ship or shipper endpoints to mark as shipped.")

    allowed_next = ALLOWED_TRANSITIONS.get(order.status, set())
    if payload.status not in allowed_next:
        raise HTTPException(status_code=400, detail=f"Cannot change status from {order.status} to {payload.status}.")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return _to_order_read(order)


@router.post("/{order_id}/ship", response_model=OrderRead, dependencies=[Depends(require_admin)])
def admin_ship_order(order_id: int, payload: ShipOrderRequest, db: Session = Depends(get_db)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "PROCESSING":
        raise HTTPException(status_code=400, detail=f"Order must be PROCESSING before shipping (current: {order.status}).")

    order.status          = "SHIPPED"
    order.carrier          = payload.carrier
    order.tracking_number  = payload.tracking_number

    from datetime import datetime
    order.shipped_at = datetime.utcnow()

    db.commit()
    db.refresh(order)
    return _to_order_read(order)


@router.patch("/{order_id}/items/quantity", response_model=OrderRead, dependencies=[Depends(require_admin)])
def admin_update_order_item_quantity(order_id: int, payload: OrderItemQuantityUpdate, db: Session = Depends(get_db)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status not in EDITABLE_ITEM_STATUSES:
        raise HTTPException(status_code=400, detail=f"Cannot modify items once order is {order.status}.")

    item = db.query(OrderItemDB).filter(OrderItemDB.id == payload.item_id, OrderItemDB.order_id == order_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")

    item.quantity   = payload.quantity
    item.line_total = item.quantity * item.product_price
    order.total_amount = sum(oi.line_total for oi in order.items) + order.shipping_fee

    db.commit()
    db.refresh(order)
    return _to_order_read(order)