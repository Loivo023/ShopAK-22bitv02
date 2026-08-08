from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, desc

from database import get_db
from models.product import ProductDB
from models.order import OrderDB, OrderItemDB
from models.user import UserDB
from schemas.admin_stats import OverviewStats, MonthlyRevenue, TopProductsResponse, TopProduct
from auth.deps import require_admin

router = APIRouter(prefix="/admin/stats", tags=["admin-stats"], dependencies=[Depends(require_admin)])


# ── GET /admin/stats/overview ──
@router.get("/overview", response_model=OverviewStats)
def get_overview(db: Session = Depends(get_db)):
    total_products = db.query(func.count(ProductDB.id)).scalar() or 0
    total_orders   = db.query(func.count(OrderDB.id)).scalar() or 0
    total_users    = db.query(func.count(UserDB.id)).scalar() or 0

    total_revenue = (
        db.query(func.sum(OrderDB.total_amount))
        .filter(OrderDB.payment_status == "PAID")
        .scalar()
    ) or 0.0

    pending_orders = (
        db.query(func.count(OrderDB.id))
        .filter(OrderDB.status.in_(["PLACED", "PROCESSING"]))
        .scalar()
    ) or 0

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_users_30d = (
        db.query(func.count(UserDB.id))
        .filter(UserDB.created_at >= thirty_days_ago)
        .scalar()
    ) or 0

    return OverviewStats(
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=float(total_revenue),
        total_users=total_users,
        pending_orders=pending_orders,
        new_users_30d=new_users_30d,
    )


# ── GET /admin/stats/monthly-revenue ──
@router.get("/monthly-revenue", response_model=MonthlyRevenue)
def get_monthly_revenue(
    db: Session = Depends(get_db),
    from_date: Optional[str] = Query(None, alias="from"),
    to_date:   Optional[str] = Query(None, alias="to"),
):
    query = db.query(
        extract("year", OrderDB.created_at).label("year"),
        extract("month", OrderDB.created_at).label("month"),
        func.sum(OrderDB.total_amount).label("revenue"),
    ).filter(OrderDB.payment_status == "PAID")

    if from_date:
        query = query.filter(OrderDB.created_at >= from_date)
    if to_date:
        query = query.filter(OrderDB.created_at <= to_date)

    results = (
        query.group_by("year", "month")
        .order_by("year", "month")
        .all()
    )

    # Nếu không filter, chỉ lấy 12 tháng gần nhất
    if not from_date and not to_date:
        results = results[-12:]

    months = [f"{int(r.year):04d}-{int(r.month):02d}" for r in results]
    revenues = [float(r.revenue) for r in results]

    return MonthlyRevenue(months=months, revenues=revenues)


# ── GET /admin/stats/top-products ──
@router.get("/top-products", response_model=TopProductsResponse)
def get_top_products(db: Session = Depends(get_db), limit: int = Query(5, ge=1, le=20)):
    results = (
        db.query(
            OrderItemDB.product_id,
            OrderItemDB.product_name,
            func.sum(OrderItemDB.quantity).label("total_quantity"),
            func.sum(OrderItemDB.line_total).label("total_revenue"),
        )
        .join(OrderDB, OrderDB.id == OrderItemDB.order_id)
        .filter(OrderDB.payment_status == "PAID")
        .group_by(OrderItemDB.product_id, OrderItemDB.product_name)
        .order_by(desc("total_revenue"))
        .limit(limit)
        .all()
    )

    products = [
        TopProduct(
            product_id=r.product_id,
            product_name=r.product_name,
            total_quantity=int(r.total_quantity),
            total_revenue=float(r.total_revenue),
        )
        for r in results
    ]

    return TopProductsResponse(products=products)