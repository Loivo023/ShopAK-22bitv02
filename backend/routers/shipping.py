import httpx
from fastapi import APIRouter, Depends, HTTPException

import config
from services.shipping.factory import get_shipping_strategy
from schemas.order import ShippingFeeRequest, ShippingFeeResponse
from auth.deps import get_current_user

router = APIRouter(prefix="/shipping", tags=["shipping"])


@router.post("/calculate-fee", response_model=ShippingFeeResponse)
def calculate_fee(payload: ShippingFeeRequest, user=Depends(get_current_user)):
    strategy = get_shipping_strategy(payload.shipping_provider)
    try:
        fee = strategy.calculate_fee(payload.to_district_id, payload.to_ward_code, payload.weight)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to calculate fee: {str(e)}")
    return ShippingFeeResponse(fee=fee)


# ── GHN master data — proxy để frontend không cần lộ token, dùng cho dropdown ──
@router.get("/ghn/provinces")
def get_provinces(user=Depends(get_current_user)):
    resp = httpx.get(
        f"{config.GHN_API_URL}/master-data/province",
        headers={"Token": config.GHN_API_TOKEN},
    )
    resp.raise_for_status()
    return resp.json()["data"]


@router.get("/ghn/districts")
def get_districts(province_id: int, user=Depends(get_current_user)):
    resp = httpx.get(
        f"{config.GHN_API_URL}/master-data/district",
        headers={"Token": config.GHN_API_TOKEN},
        params={"province_id": province_id},
    )
    resp.raise_for_status()
    return resp.json()["data"]


@router.get("/ghn/wards")
def get_wards(district_id: int, user=Depends(get_current_user)):
    resp = httpx.get(
        f"{config.GHN_API_URL}/master-data/ward",
        headers={"Token": config.GHN_API_TOKEN},
        params={"district_id": district_id},
    )
    resp.raise_for_status()
    return resp.json()["data"]