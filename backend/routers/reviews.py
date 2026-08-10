from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List

from database import get_db
from models.extras import ReviewDB
from models.order import OrderDB, OrderItemDB
from models.product import ProductDB
from models.user import UserDB
from schemas.review import ReviewCreate, ReviewUpdate, ReviewRead
from auth.deps import get_current_user, require_admin


router = APIRouter(
    prefix="/reviews",
    tags=["reviews"],
)


def _to_review_read(review: ReviewDB, db: Session) -> ReviewRead:
    user = (
        db.query(UserDB)
        .filter(UserDB.id == review.user_id)
        .first()
    )

    return ReviewRead(
        id=review.id,
        user_id=review.user_id,
        product_id=review.product_id,
        customer_name=user.full_name if user else None,
        rating=review.rating,
        comment=review.comment,
        created_at=str(review.created_at),
        updated_at=(
            str(review.updated_at)
            if review.updated_at
            else None
        ),
    )


# ============================================================
# GET PRODUCT REVIEWS
# ============================================================

@router.get(
    "/product/{product_id}",
    response_model=List[ReviewRead],
)
def get_product_reviews(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = (
        db.query(ProductDB)
        .filter(ProductDB.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    reviews = (
        db.query(ReviewDB)
        .filter(ReviewDB.product_id == product_id)
        .order_by(desc(ReviewDB.created_at))
        .all()
    )

    return [
        _to_review_read(review, db)
        for review in reviews
    ]


# ============================================================
# GET PRODUCT RATING SUMMARY
# ============================================================

@router.get("/product/{product_id}/summary")
def get_product_rating_summary(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = (
        db.query(ProductDB)
        .filter(ProductDB.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    result = (
        db.query(
            func.count(ReviewDB.id),
            func.avg(ReviewDB.rating),
        )
        .filter(
            ReviewDB.product_id == product_id
        )
        .first()
    )

    review_count = result[0] or 0
    average_rating = float(result[1]) if result[1] else 0

    return {
        "product_id": product_id,
        "review_count": review_count,
        "average_rating": round(
            average_rating,
            1,
        ),
    }


# ============================================================
# CREATE REVIEW
# ============================================================

@router.post(
    "",
    response_model=ReviewRead,
    status_code=201,
)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    product = (
        db.query(ProductDB)
        .filter(ProductDB.id == payload.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    # Check whether customer already reviewed this product
    existing_review = (
        db.query(ReviewDB)
        .filter(
            ReviewDB.user_id == user.id,
            ReviewDB.product_id == payload.product_id,
        )
        .first()
    )

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="You have already reviewed this product.",
        )

    # Customer must have completed an order containing this product
    purchased = (
        db.query(OrderItemDB)
        .join(
            OrderDB,
            OrderDB.id == OrderItemDB.order_id,
        )
        .filter(
            OrderDB.user_id == user.id,
            OrderDB.status == "COMPLETED",
            OrderItemDB.product_id == payload.product_id,
        )
        .first()
    )

    if not purchased:
        raise HTTPException(
            status_code=403,
            detail="You can only review products from completed orders.",
        )

    review = ReviewDB(
        user_id=user.id,
        product_id=payload.product_id,
        rating=payload.rating,
        comment=payload.comment,
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return _to_review_read(review, db)


# ============================================================
# UPDATE MY REVIEW
# ============================================================

@router.patch(
    "/{review_id}",
    response_model=ReviewRead,
)
def update_review(
    review_id: int,
    payload: ReviewUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    review = (
        db.query(ReviewDB)
        .filter(ReviewDB.id == review_id)
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found",
        )

    if review.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Not allowed to edit this review.",
        )

    if payload.rating is not None:
        review.rating = payload.rating

    if payload.comment is not None:
        review.comment = payload.comment

    db.commit()
    db.refresh(review)

    return _to_review_read(review, db)


# ============================================================
# DELETE REVIEW
# ============================================================

@router.delete(
    "/{review_id}",
    status_code=204,
)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    review = (
        db.query(ReviewDB)
        .filter(ReviewDB.id == review_id)
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found",
        )

    if review.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Not allowed to delete this review.",
        )

    db.delete(review)
    db.commit()

    return None

# ============================================================
# ADMIN - GET ALL REVIEWS
# ============================================================

@router.get(
    "/admin/all",
    response_model=List[ReviewRead],
)
def get_all_reviews(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    reviews = (
        db.query(ReviewDB)
        .order_by(desc(ReviewDB.created_at))
        .all()
    )

    return [
        _to_review_read(review, db)
        for review in reviews
    ]


# ============================================================
# ADMIN - DELETE ANY REVIEW
# ============================================================

@router.delete(
    "/admin/{review_id}",
    status_code=204,
)
def admin_delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    review = (
        db.query(ReviewDB)
        .filter(ReviewDB.id == review_id)
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found",
        )

    db.delete(review)
    db.commit()

    return None