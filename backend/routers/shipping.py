import httpx
from fastapi import APIRouter, Depends, HTTPException

import config
from services.shipping.factory import get_shipping_strategy
from schemas.order import ShippingFeeRequest, ShippingFeeResponse
from auth.deps import (get_current_user)

router = APIRouter(prefix="/shipping", tags=["shipping"])


# =====================================================
# CALCULATE SHIPPING FEE
# =====================================================

@router.post(
    "/calculate-fee",
    response_model=ShippingFeeResponse
)
def calculate_fee(
    payload: ShippingFeeRequest,
    user=Depends(get_current_user),
):

    strategy = get_shipping_strategy(
        payload.shipping_provider
    )

    try:

        fee = strategy.calculate_fee(
            payload.to_district_id,
            payload.to_ward_code,
            payload.weight,
        )

        return ShippingFeeResponse(
            fee=fee
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=f"Failed to calculate fee: {str(e)}"
        )


# =====================================================
# GHN PROVINCES
# =====================================================
@router.get("/ghn/provinces")
def get_provinces(
    user=Depends(get_current_user),
):

    if not config.GHN_API_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="GHN_API_TOKEN is not configured"
        )

    try:

        response = httpx.get(
            f"{config.GHN_API_URL}/master-data/province",
            headers={
                "Token": config.GHN_API_TOKEN,
                "Content-Type": "application/json",
            },
            timeout=15.0,
        )

        response.raise_for_status()

        data = response.json()

        if data.get("code") != 200:
            raise HTTPException(
                status_code=400,
                detail=data.get(
                    "message",
                    "GHN API error"
                ),
            )

        return data.get("data", [])

    except httpx.HTTPStatusError as e:

        raise HTTPException(
            status_code=502,
            detail=(
                f"GHN returned "
                f"{e.response.status_code}: "
                f"{e.response.text}"
            ),
        )

    except httpx.RequestError as e:

        raise HTTPException(
            status_code=502,
            detail=(
                f"Could not connect to GHN: {str(e)}"
            ),
        )


# =====================================================
# GHN DISTRICTS
# =====================================================

@router.get("/ghn/districts")
def get_districts(
    province_id: int,
    user=Depends(get_current_user),
):

    try:

        response = httpx.get(
            f"{config.GHN_API_URL}/master-data/district",
            headers={
                "Token": config.GHN_API_TOKEN,
                "Content-Type": "application/json",
            },
            params={
                "province_id": province_id
            },
            timeout=15.0,
        )

        response.raise_for_status()

        data = response.json()

        if data.get("code") != 200:
            raise HTTPException(
                status_code=400,
                detail=data.get(
                    "message",
                    "GHN API error"
                ),
            )

        return data.get("data", [])

    except httpx.HTTPStatusError as e:

        raise HTTPException(
            status_code=502,
            detail=(
                f"GHN returned "
                f"{e.response.status_code}: "
                f"{e.response.text}"
            ),
        )

    except httpx.RequestError as e:

        raise HTTPException(
            status_code=502,
            detail=(
                f"Could not connect to GHN: {str(e)}"
            ),
        )


# =====================================================
# GHN WARDS
# =====================================================

@router.get("/ghn/wards")
def get_wards(
    district_id: int,
    user=Depends(get_current_user),
):

    try:

        response = httpx.get(
            f"{config.GHN_API_URL}/master-data/ward",
            headers={
                "Token": config.GHN_API_TOKEN,
                "Content-Type": "application/json",
            },
            params={
                "district_id": district_id
            },
            timeout=15.0,
        )

        response.raise_for_status()

        data = response.json()

        if data.get("code") != 200:
            raise HTTPException(
                status_code=400,
                detail=data.get(
                    "message",
                    "GHN API error"
                ),
            )

        return data.get("data", [])

    except httpx.HTTPStatusError as e:

        raise HTTPException(
            status_code=502,
            detail=(
                f"GHN returned "
                f"{e.response.status_code}: "
                f"{e.response.text}"
            ),
        )

    except httpx.RequestError as e:

        raise HTTPException(
            status_code=502,
            detail=(
                f"Could not connect to GHN: {str(e)}"
            ),
        )