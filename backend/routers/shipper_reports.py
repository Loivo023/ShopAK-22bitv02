from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.order import OrderDB
from auth.deps import require_shipper

router = APIRouter(prefix="/shipper/reports", tags=["shipper-reports"])


@router.get("/overview")
def shipper_overview(db: Session = Depends(get_db), user=Depends(require_shipper)):
    total_delivered = db.query(func.count(OrderDB.id)).filter(OrderDB.shipper_id == user.id, OrderDB.status == "COMPLETED").scalar() or 0
    total_failed = db.query(func.count(OrderDB.id)).filter(OrderDB.shipper_id == user.id, OrderDB.status == "FAILED").scalar() or 0
    total_in_progress = db.query(func.count(OrderDB.id)).filter(OrderDB.shipper_id == user.id, OrderDB.status == "SHIPPED").scalar() or 0
    total_earnings = db.query(func.sum(OrderDB.shipping_fee)).filter(OrderDB.shipper_id == user.id, OrderDB.status == "COMPLETED").scalar() or 0

    return {
        "total_delivered": total_delivered,
        "total_failed": total_failed,
        "total_in_progress": total_in_progress,
        "total_earnings": float(total_earnings),
    }