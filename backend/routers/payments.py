import hmac
import hashlib
import urllib.parse
from datetime import datetime

import httpx
import stripe
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import config
from database import get_db
from models.order import OrderDB
from models.payment import PaymentDB
from schemas.payment import CreateSessionRequest, SessionUrlResponse, ApproveUrlResponse, ConfirmPaymentRequest
from auth.deps import get_current_user

router = APIRouter(prefix="/payments", tags=["payments"])

stripe.api_key = config.STRIPE_SECRET_KEY


def _get_order_for_payment(order_id: int, db: Session, user) -> OrderDB:
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not allowed")
    if order.status == "PAID":
        raise HTTPException(status_code=400, detail="Order already paid")
    return order

# ─────────────────────────────────────────────
# COD
# ─────────────────────────────────────────────

@router.post("/cod/create")
def create_cod_payment(
    payload: CreateSessionRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = _get_order_for_payment(
        payload.order_id,
        db,
        user,
    )

    # ---------------------------------
    # Prevent duplicate COD payment
    # ---------------------------------

    existing = (
        db.query(PaymentDB)
        .filter(
            PaymentDB.order_id == order.id,
            PaymentDB.provider == "cod",
        )
        .order_by(PaymentDB.id.desc())
        .first()
    )

    if existing:
        return {
            "message": "COD payment already exists",
            "order_id": order.id,
            "payment_id": existing.id,
            "status": existing.status,
            "amount": existing.amount,
        }

    # ---------------------------------
    # Create COD payment
    # ---------------------------------

    payment = PaymentDB(
        order_id=order.id,
        provider="cod",
        amount=order.total_amount,
        currency="USD",
        status="PENDING",
        provider_session_id=f"COD-PENDING-{order.id}",
    )

    db.add(payment)

    # COD does not mean paid yet.
    # Customer pays when receiving the order.

    order.payment_status = "PENDING"

    db.commit()
    db.refresh(payment)

    return {
        "message": "COD payment created",
        "order_id": order.id,
        "payment_id": payment.id,
        "provider": payment.provider,
        "amount": payment.amount,
        "currency": payment.currency,
        "status": payment.status,
    }

# ─────────────────────────────────────────────
# STRIPE
# ─────────────────────────────────────────────
@router.post("/stripe/create-session", response_model=SessionUrlResponse)
def create_stripe_session(
    payload: CreateSessionRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = _get_order_for_payment(payload.order_id, db, user)

    line_items = [
        {
            "price_data": {
                "currency": "usd",
                "product_data": {"name": item.product_name},
                "unit_amount": int(item.product_price * 100),
            },
            "quantity": item.quantity,
        }
        for item in order.items
    ]

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=line_items,
            success_url=f"{config.STRIPE_SUCCESS_URL}?order_id={order.id}",
            cancel_url=f"{config.STRIPE_CANCEL_URL}?order_id={order.id}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

    payment = PaymentDB(
        order_id=order.id, provider="stripe", amount=order.total_amount,
        currency="USD", status="PENDING", provider_session_id=session.id,
    )
    db.add(payment)
    db.commit()

    return SessionUrlResponse(url=session.url)


# ─────────────────────────────────────────────
# PAYPAL
# ─────────────────────────────────────────────
def _get_paypal_access_token() -> str:
    resp = httpx.post(
        f"{config.PAYPAL_BASE_URL}/v1/oauth2/token",
        auth=(config.PAYPAL_CLIENT_ID, config.PAYPAL_CLIENT_SECRET),
        data={"grant_type": "client_credentials"},
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


@router.post("/paypal/create-order", response_model=ApproveUrlResponse)
def create_paypal_order(
    payload: CreateSessionRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = _get_order_for_payment(payload.order_id, db, user)

    try:
        access_token = _get_paypal_access_token()
        resp = httpx.post(
            f"{config.PAYPAL_BASE_URL}/v2/checkout/orders",
            headers={"Authorization": f"Bearer {access_token}"},
            json={
                "intent": "CAPTURE",
                "purchase_units": [{
                    "amount": {
                        "currency_code": "USD",
                        "value": f"{order.total_amount:.2f}",
                    },
                    "custom_id": str(order.id),
                }],
                "application_context": {
                    "return_url": f"{config.PAYPAL_RETURN_URL}?order_id={order.id}",
                    "cancel_url": f"{config.PAYPAL_CANCEL_URL}?order_id={order.id}",
                },
            },
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PayPal error: {str(e)}")

    approve_url = next((l["href"] for l in data["links"] if l["rel"] == "approve"), None)
    if not approve_url:
        raise HTTPException(status_code=500, detail="No approve link returned by PayPal")

    payment = PaymentDB(
        order_id=order.id, provider="paypal", amount=order.total_amount,
        currency="USD", status="PENDING", provider_session_id=data["id"],
    )
    db.add(payment)
    db.commit()

    return ApproveUrlResponse(approve_url=approve_url)

@router.post("/paypal/capture-order")
def capture_paypal_order(
    payload: dict,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    paypal_order_id = payload.get("paypal_order_id")
    order_id = payload.get("order_id")

    order = _get_order_for_payment(order_id, db, user)

    try:
        access_token = _get_paypal_access_token()
        resp = httpx.post(
            f"{config.PAYPAL_BASE_URL}/v2/checkout/orders/{paypal_order_id}/capture",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PayPal capture error: {str(e)}")

    if data.get("status") != "COMPLETED":
        raise HTTPException(status_code=400, detail="Payment not completed")

    order.status = "PAID"

    payment = (
        db.query(PaymentDB)
        .filter(PaymentDB.order_id == order.id, PaymentDB.provider == "paypal")
        .order_by(PaymentDB.id.desc())
        .first()
    )
    if payment:
        payment.status = "SUCCEEDED"

    db.commit()

    return {"message": "Payment captured", "order_id": order.id, "status": order.status}



# ─────────────────────────────────────────────
# VNPAY
# ─────────────────────────────────────────────
def _build_vnpay_signature(params: dict) -> tuple[str, str]:
    # Loại bỏ các giá trị None/rỗng trước khi build
    filtered_params = {k: v for k, v in params.items() if v is not None and v != ""}
    sorted_params = sorted(filtered_params.items())

    # Build query string dùng đúng chuẩn urlencode của VNPay (quote_plus, giữ dấu cách thành +)
    query_string = urllib.parse.urlencode(sorted_params, quote_via=urllib.parse.quote_plus)

    signature = hmac.new(
        config.VNPAY_HASH_SECRET.encode("utf-8"),
        query_string.encode("utf-8"),
        hashlib.sha512,
    ).hexdigest()

    return query_string, signature


@router.post("/vnpay/create-url", response_model=SessionUrlResponse)
def create_vnpay_url(
    payload: CreateSessionRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = _get_order_for_payment(payload.order_id, db, user)

    txn_ref = f"{order.id}-{int(datetime.utcnow().timestamp())}"

    params = {
    "vnp_Version": "2.1.0",
    "vnp_Command": "pay",
    "vnp_TmnCode": config.VNPAY_TMN_CODE,
    "vnp_Amount": str(int(order.total_amount * 100)),  # ép về string
    "vnp_CurrCode": "VND",
    "vnp_TxnRef": txn_ref,
    "vnp_OrderInfo": f"Payment for order {order.id}",
    "vnp_OrderType": "other",
    "vnp_Locale": "vn",
    "vnp_ReturnUrl": f"{config.VNPAY_RETURN_URL}?order_id={order.id}",
    "vnp_IpAddr": "127.0.0.1",
    "vnp_CreateDate": datetime.utcnow().strftime("%Y%m%d%H%M%S"),
    }

    query_string, signature = _build_vnpay_signature(params)
    full_url = f"{config.VNPAY_BASE_URL}?{query_string}&vnp_SecureHash={signature}"

    payment = PaymentDB(
        order_id=order.id, provider="vnpay", amount=order.total_amount,
        currency="VND", status="PENDING", provider_session_id=txn_ref,
    )
    db.add(payment)
    db.commit()

    return SessionUrlResponse(url=full_url)


# ─────────────────────────────────────────────
# CONFIRM (mock webhook — dùng chung cho cả 3 cổng)
# ─────────────────────────────────────────────
@router.post("/confirm")
def confirm_payment(
    payload: ConfirmPaymentRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = db.query(OrderDB).filter(OrderDB.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not allowed")

    if order.payment_status == "PAID":
        return {"message": "Order already paid", "order_id": order.id, "status": order.status}

    order.payment_status = "PAID"
    if order.status == "PLACED":
        order.status = "PROCESSING"

    payment = (
        db.query(PaymentDB)
        .filter(PaymentDB.order_id == order.id, PaymentDB.provider == payload.provider)
        .order_by(PaymentDB.id.desc())
        .first()
    )
    if payment:
        payment.status = "SUCCEEDED"

    db.commit()

    return {"message": "Payment confirmed", "order_id": order.id, "status": order.status, "provider": payload.provider}