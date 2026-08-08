from datetime import datetime

from fastapi import (APIRouter, Depends, HTTPException, UploadFile, File,)
from sqlalchemy.orm import Session

from database import get_db
from models.order import OrderDB
from models.payment import PaymentDB
from schemas.shipper import (DeliveryFailureRequest, ShipperStatusUpdate, CodCollectRequest, CodCollectResponse,)
from schemas.order import OrderRead, OrderItemRead
from auth.deps import require_shipper
from sqlalchemy import desc
from typing import List

import os
import uuid


router = APIRouter(prefix="/shipper", tags=["shipper"])


def _to_order_read(order: OrderDB, db: Session) -> OrderRead:
    payment = (
        db.query(PaymentDB)
        .filter(PaymentDB.order_id == order.id)
        .order_by(PaymentDB.id.desc())
        .first()
    )

    return OrderRead(
        id=order.id,
        status=order.status,
        payment_status=order.payment_status,
        payment_provider=payment.provider if payment else None,

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

        delivery_failure_reason=order.delivery_failure_reason,
        delivery_proof_url=order.delivery_proof_url,
        delivered_at=str(order.delivered_at) if order.delivered_at else None,

        customer_name=order.user.full_name if order.user else None,
        customer_email=order.user.email if order.user else None,
        customer_phone=order.user.phone if order.user else None,

        items=[
            OrderItemRead(
                id=oi.id,
                product_id=oi.product_id,
                product_name=oi.product_name,
                product_price=oi.product_price,
                quantity=oi.quantity,
                line_total=oi.line_total,
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
    return [_to_order_read(o, db) for o in orders]


# ── Đơn đã được shipper hiện tại nhận ──
@router.get("/my-deliveries", response_model=List[OrderRead])
def get_my_deliveries(db: Session = Depends(get_db), user=Depends(require_shipper)):
    orders = (
        db.query(OrderDB)
        .filter(OrderDB.shipper_id == user.id)
        .order_by(desc(OrderDB.created_at))
        .all()
    )
    return [_to_order_read(o, db) for o in orders]


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
    return _to_order_read(order, db)

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

    return _to_order_read(order, db)

@router.patch("/{order_id}/status", response_model=OrderRead)
def update_delivery_status(
    order_id: int,
    payload: ShipperStatusUpdate,
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

    # Only the assigned shipper can update the order
    if user.role != "ADMIN" and order.shipper_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not assigned to this order",
        )

    # Allowed status transitions
    valid_from_status = {
        "SHIPPED": {"PROCESSING"},
        "COMPLETED": {"SHIPPED"},
        "FAILED": {"SHIPPED"},
    }

    if order.status not in valid_from_status.get(
        payload.status,
        set(),
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot change status from "
                f"{order.status} to {payload.status}."
            ),
        )

    # ---------------------------------
    # SHIPPED
    # ---------------------------------
    if payload.status == "SHIPPED":
        order.status = "SHIPPED"
        order.shipped_at = datetime.utcnow()

    # ---------------------------------
    # COMPLETED
    # ---------------------------------
    elif payload.status == "COMPLETED":
        cod_payment = (
            db.query(PaymentDB)
            .filter(
                PaymentDB.order_id == order.id,
                PaymentDB.provider == "cod",
            )
            .order_by(PaymentDB.id.desc())
            .first()
        )

        # COD must be collected before completing delivery
        if cod_payment and order.payment_status != "PAID":
            raise HTTPException(
                status_code=400,
                detail="COD payment must be collected before completing the delivery.",
            )

        order.status = "COMPLETED"
        order.delivered_at = datetime.utcnow()

    # ---------------------------------
    # FAILED
    # ---------------------------------
    elif payload.status == "FAILED":
        order.status = "FAILED"

    db.commit()
    db.refresh(order)

    return _to_order_read(order, db)

@router.post(
    "/{order_id}/cod/collect",
    response_model=CodCollectResponse,
)
def collect_cod_payment(
    order_id: int,
    payload: CodCollectRequest,
    db: Session = Depends(get_db),
    user=Depends(require_shipper),
):
    # ---------------------------------
    # Find order
    # ---------------------------------

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

    # ---------------------------------
    # Check shipper assignment
    # ---------------------------------

    if user.role != "ADMIN" and order.shipper_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not assigned to this order",
        )

    # ---------------------------------
    # COD must be collected during
    # the delivery stage
    # ---------------------------------

    if order.status != "SHIPPED":
        raise HTTPException(
            status_code=400,
            detail=(
                "COD can only be collected when "
                "the order is out for delivery."
            ),
        )

    # ---------------------------------
    # Find COD payment
    # ---------------------------------

    payment = (
        db.query(PaymentDB)
        .filter(
            PaymentDB.order_id == order.id,
            PaymentDB.provider == "cod",
        )
        .order_by(PaymentDB.id.desc())
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=400,
            detail="This order is not a COD order.",
        )

    # ---------------------------------
    # Already collected
    # ---------------------------------

    if (
        order.payment_status == "PAID"
        or payment.status == "SUCCEEDED"
    ):
        return CodCollectResponse(
            message="COD payment has already been collected.",
            order_id=order.id,
            amount_collected=payment.amount,
            payment_status=order.payment_status,
            order_status=order.status,
        )

    # ---------------------------------
    # Validate collected amount
    # ---------------------------------

    expected_amount = float(payment.amount)
    received_amount = float(payload.amount_received)

    if abs(received_amount - expected_amount) > 0.01:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Incorrect COD amount. "
                f"Expected {expected_amount:.2f}."
            ),
        )

    # ---------------------------------
    # Mark payment as collected
    # ---------------------------------

    payment.status = "SUCCEEDED"

    # Store the actual collected amount
    payment.amount = received_amount

    # Create a simple COD reference
    payment.provider_session_id = (
        f"COD-{order.id}-"
        f"{int(datetime.utcnow().timestamp())}"
    )

    # ---------------------------------
    # Update order payment status
    # ---------------------------------

    order.payment_status = "PAID"

    db.commit()
    db.refresh(order)
    db.refresh(payment)

    return CodCollectResponse(
        message="COD payment collected successfully.",
        order_id=order.id,
        amount_collected=received_amount,
        payment_status=order.payment_status,
        order_status=order.status,
    )

@router.patch(
    "/{order_id}/failure",
    response_model=OrderRead
)
def mark_delivery_failed(
    order_id: int,
    payload: DeliveryFailureRequest,
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
            detail="Order not found"
        )

    # Only assigned shipper can update
    if user.role != "ADMIN" and order.shipper_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not assigned to this order"
        )

    # Delivery can only fail while out for delivery
    if order.status != "SHIPPED":
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot mark order as FAILED "
                f"from {order.status}"
            )
        )

    order.status = "FAILED"
    order.delivery_failure_reason = payload.reason

    db.commit()
    db.refresh(order)

    return _to_order_read(order, db)

@router.post(
    "/{order_id}/proof",
    response_model=OrderRead
)
async def upload_delivery_proof(
    order_id: int,
    file: UploadFile = File(...),
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
            detail="Order not found"
        )

    if user.role != "ADMIN" and order.shipper_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not assigned to this order"
        )

    if order.status not in {"SHIPPED", "COMPLETED"}:
        raise HTTPException(
            status_code=400,
            detail=(
                "Delivery proof can only be uploaded "
                "while the order is SHIPPED or COMPLETED."
            )
        )

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, and WEBP images are allowed."
        )

    contents = await file.read()

    # 5 MB maximum
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image must be smaller than 5 MB."
        )

    extension = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }[file.content_type]

    filename = (
        f"delivery_proof_{order_id}_"
        f"{uuid.uuid4().hex}{extension}"
    )

    os.makedirs("data_images", exist_ok=True)

    file_path = os.path.join(
        "data_images",
        filename
    )

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    order.delivery_proof_url = f"/images/{filename}"

    db.commit()
    db.refresh(order)

    return _to_order_read(order, db)