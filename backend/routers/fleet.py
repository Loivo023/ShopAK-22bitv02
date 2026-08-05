from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.vehicle import VehicleDB
from schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleRead
from auth.deps import require_admin, get_current_user

router = APIRouter(prefix="/fleet", tags=["fleet"])


@router.get("", response_model=List[VehicleRead])
def list_vehicles(db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role not in ("ADMIN", "SHIPPER"):
        raise HTTPException(status_code=403, detail="Not allowed")
    return db.query(VehicleDB).all()


@router.post("", response_model=VehicleRead, status_code=201, dependencies=[Depends(require_admin)])
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    existing = db.query(VehicleDB).filter(VehicleDB.plate_number == payload.plate_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Plate number already exists")
    vehicle = VehicleDB(**payload.dict())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.patch("/{vehicle_id}", response_model=VehicleRead, dependencies=[Depends(require_admin)])
def update_vehicle(vehicle_id: int, payload: VehicleUpdate, db: Session = Depends(get_db)):
    vehicle = db.query(VehicleDB).filter(VehicleDB.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if payload.status is not None:
        vehicle.status = payload.status
    if payload.assigned_shipper_id is not None:
        vehicle.assigned_shipper_id = payload.assigned_shipper_id
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(VehicleDB).filter(VehicleDB.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()