from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.user import UserDB
from models.extras import AddressDB
from schemas.extras import ProfileUpdate, PasswordChange, AddressCreate, AddressRead
from schemas.user import UserRead
from auth.deps import get_current_user
from auth.security import verify_password, hash_password

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=UserRead)
def get_me(user=Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserRead)
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if payload.full_name is not None: user.full_name = payload.full_name
    if payload.phone is not None: user.phone = payload.phone
    if payload.avatar_url is not None: user.avatar_url = payload.avatar_url
    db.commit()
    db.refresh(user)
    return user


@router.post("/change-password")
def change_password(payload: PasswordChange, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated"}


@router.get("/addresses", response_model=List[AddressRead])
def get_addresses(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(AddressDB).filter(AddressDB.user_id == user.id).all()


@router.post("/addresses", response_model=AddressRead, status_code=201)
def add_address(payload: AddressCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if payload.is_default:
        db.query(AddressDB).filter(AddressDB.user_id == user.id).update({"is_default": False})
    addr = AddressDB(user_id=user.id, **payload.dict())
    db.add(addr)
    db.commit()
    db.refresh(addr)
    return addr


@router.delete("/addresses/{address_id}", status_code=204)
def delete_address(address_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    addr = db.query(AddressDB).filter(AddressDB.id == address_id, AddressDB.user_id == user.id).first()
    if addr:
        db.delete(addr)
        db.commit()