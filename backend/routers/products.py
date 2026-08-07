from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models.product import ProductDB
from schemas.products import ProductCreate, ProductUpdate, ProductRead
from auth.deps import require_admin

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=List[ProductRead])
def list_products(
    category: Optional[str] = Query(None),
    search:   Optional[str] = Query(None),
    sort:     Optional[str] = Query(None),  # "newest" | "bestselling" | None
    page:     int = Query(1, ge=1),
    size:     int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(ProductDB)
    if category:
        query = query.filter(ProductDB.category.ilike(category))
    if search:
        query = query.filter(ProductDB.name.ilike(f"%{search}%"))

    if sort == "newest":
        query = query.order_by(ProductDB.id.desc())
    elif sort == "bestselling":
        from models.order import OrderItemDB
        from sqlalchemy import func
        sold = (
            db.query(OrderItemDB.product_id, func.sum(OrderItemDB.quantity).label("total_sold"))
            .group_by(OrderItemDB.product_id).subquery()
        )
        query = query.outerjoin(sold, sold.c.product_id == ProductDB.id).order_by(sold.c.total_sold.desc().nullslast())

    offset = (page - 1) * size
    products = query.offset(offset).limit(size).all()
    return [ProductRead(id=p.id, name=p.name, price=p.price, category=p.category, description=p.description, imageUrl=p.image_path) for p in products]


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductRead(
        id=product.id, name=product.name, price=product.price,
        category=product.category, description=product.description,
        imageUrl=product.image_path,
    )


@router.post(
    "",
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    new_product = ProductDB(
        name=payload.name, price=payload.price,
        category=payload.category, description=payload.description,
        image_path=payload.imageUrl,
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return ProductRead(
        id=new_product.id, name=new_product.name, price=new_product.price,
        category=new_product.category, description=new_product.description,
        imageUrl=new_product.image_path,
    )


@router.put("/{product_id}", response_model=ProductRead, dependencies=[Depends(require_admin)])
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if payload.name        is not None: product.name        = payload.name
    if payload.price       is not None: product.price       = payload.price
    if payload.category    is not None: product.category    = payload.category
    if payload.description is not None: product.description = payload.description
    if payload.imageUrl    is not None: product.image_path  = payload.imageUrl

    db.commit()
    db.refresh(product)
    return ProductRead(
        id=product.id, name=product.name, price=product.price,
        category=product.category, description=product.description,
        imageUrl=product.image_path,
    )


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()