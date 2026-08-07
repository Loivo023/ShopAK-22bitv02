from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.extras import VoucherDB
from schemas.extras import VoucherApply, VoucherResult, VoucherCreate, VoucherRead
from auth.deps import get_current_user, require_admin

router = APIRouter(prefix="/vouchers", tags=["vouchers"])


@router.post("/apply", response_model=VoucherResult)
def apply_voucher(payload: VoucherApply, db: Session = Depends(get_db), user=Depends(get_current_user)):
    v = db.query(VoucherDB).filter(VoucherDB.code == payload.code.upper(), VoucherDB.active == True).first()
    if not v:
        return VoucherResult(valid=False, message="Voucher not found or inactive.")
    if v.expires_at and v.expires_at < datetime.utcnow():
        return VoucherResult(valid=False, message="Voucher has expired.")
    if v.max_uses is not None and v.used_count >= v.max_uses:
        return VoucherResult(valid=False, message="Voucher usage limit reached.")
    if payload.order_amount < v.min_order_amount:
        return VoucherResult(valid=False, message=f"Minimum order amount is ${v.min_order_amount:.2f}.")

    if v.discount_type == "PERCENT":
        return VoucherResult(valid=True, message="Voucher applied!", discount_amount=payload.order_amount * v.discount_value / 100)
    if v.discount_type == "FIXED":
        return VoucherResult(valid=True, message="Voucher applied!", discount_amount=min(v.discount_value, payload.order_amount))
    if v.discount_type == "FREESHIP":
        return VoucherResult(valid=True, message="Free shipping applied!", free_shipping=True)
    return VoucherResult(valid=False, message="Unknown voucher type.")


@router.get("", response_model=List[VoucherRead], dependencies=[Depends(require_admin)])
def list_vouchers(db: Session = Depends(get_db)):
    return db.query(VoucherDB).all()


@router.post("", response_model=VoucherRead, status_code=201, dependencies=[Depends(require_admin)])
def create_voucher(payload: VoucherCreate, db: Session = Depends(get_db)):
    existing = db.query(VoucherDB).filter(VoucherDB.code == payload.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Voucher code already exists")
    v = VoucherDB(**{**payload.dict(), "code": payload.code.upper()})
    db.add(v)
    db.commit()
    db.refresh(v)
    return v


@router.delete("/{voucher_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_voucher(voucher_id: int, db: Session = Depends(get_db)):
    v = db.query(VoucherDB).filter(VoucherDB.id == voucher_id).first()
    if v:
        db.delete(v)
        db.commit()