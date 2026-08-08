from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from database import get_db
from models.order import OrderDB
from schemas.order import OrderRead, OrderItemRead, ShipperStatusUpdate
from auth.deps import require_shipper

router = APIRouter(prefix="/shipper", tags=["shipper"])


def _to_order_read(order: OrderDB) -> OrderRead:
    return OrderRead(
        id=order.id, status=order.status, payment_status=order.payment_status,
        total_amount=order.total_amount, created_at=str(order.created_at),
        shipping_address=order.shipping_address, shipping_provider=order.shipping_provider,
        tracking_code=order.tracking_code, shipping_fee=order.shipping_fee,
        shipper_id=order.shipper_id, carrier=order.carrier,
        tracking_number=order.tracking_number,
        shipped_at=str(order.shipped_at) if order.shipped_at else None,
        customer_name=order.user.full_name if order.user else None,
        customer_email=order.user.email if order.user else None,
        customer_phone=order.user.phone if order.user else None,
        items=[
            OrderItemRead(
                id=oi.id, product_id=oi.product_id, product_name=oi.product_name,
                product_price=oi.product_price, quantity=oi.quantity, line_total=oi.line_total,
            )
            for oi in order.items
        ],
    )


# ── Đơn IN_HOUSE, đã PROCESSING, chưa có shipper nhận ──
@router.get("/available", response_model=List[OrderRead])
def get_available_deliveries(db: Session = Depends(get_db), user=Depends(require_shipper)):
    orders = (
        db.query(OrderDB)
        .filter(
            OrderDB.shipping_provider == "IN_HOUSE",
            OrderDB.status == "PROCESSING",
            OrderDB.shipper_id.is_(None),
        )
        .order_by(desc(OrderDB.created_at))
        .all()
    )
    return [_to_order_read(o) for o in orders]


# ── Đơn đã được shipper hiện tại nhận ──
@router.get("/my-deliveries", response_model=List[OrderRead])
def get_my_deliveries(db: Session = Depends(get_db), user=Depends(require_shipper)):
    orders = (
        db.query(OrderDB)
        .filter(OrderDB.shipper_id == user.id)
        .order_by(desc(OrderDB.created_at))
        .all()
    )
    return [_to_order_read(o) for o in orders]


@router.post("/{order_id}/accept", response_model=OrderRead)
def accept_delivery(order_id: int, db: Session = Depends(get_db), user=Depends(require_shipper)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.shipping_provider != "IN_HOUSE":
        raise HTTPException(status_code=400, detail="Only IN_HOUSE orders can be accepted by shipper")
    if order.status != "PROCESSING":
        raise HTTPException(status_code=400, detail="Order is not ready for pickup")
    if order.shipper_id is not None:
        raise HTTPException(status_code=400, detail="Order already accepted by another shipper")

    order.shipper_id = user.id
    db.commit()
    db.refresh(order)
    return _to_order_read(order)

@router.get("/{order_id}", response_model=OrderRead)
def get_delivery_detail(
    order_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_shipper),
):
    order = (
        db.query(OrderDB)
        .filter(OrderDB.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    # A shipper can only view:
    # 1. Their own shipment
    # 2. An available IN_HOUSE shipment
    if order.shipper_id != user.id:
        if not (
            order.shipping_provider == "IN_HOUSE"
            and order.status == "PROCESSING"
            and order.shipper_id is None
        ):
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to view this delivery",
            )

    return _to_order_read(order)

@router.patch("/{order_id}/status", response_model=OrderRead)
def update_delivery_status(order_id: int, payload: ShipperStatusUpdate, db: Session = Depends(get_db), user=Depends(require_shipper)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if user.role != "ADMIN" and order.shipper_id != user.id:
        raise HTTPException(status_code=403, detail="You are not assigned to this order")

    valid_from_status = {
        "SHIPPED":   {"PROCESSING"},
        "COMPLETED": {"SHIPPED"},
        "FAILED":    {"SHIPPED"},
    }
    if order.status not in valid_from_status.get(payload.status, set()):
        raise HTTPException(status_code=400, detail=f"Cannot change status from {order.status} to {payload.status}.")

    order.status = payload.status
    if payload.status == "SHIPPED":
        from datetime import datetime
        order.shipped_at = datetime.utcnow()

    db.commit()
    db.refresh(order)
    return _to_order_read(order)