from fastapi import APIRouter, Depends, HTTPException

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