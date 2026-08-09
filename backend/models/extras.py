from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from database import Base


class WishlistItemDB(Base):
    __tablename__ = "wishlist_items"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RecentlyViewedDB(Base):
    __tablename__ = "recently_viewed"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    viewed_at  = Column(DateTime(timezone=True), server_default=func.now())


class VoucherDB(Base):
    __tablename__ = "vouchers"
    id                = Column(Integer, primary_key=True, index=True)
    code              = Column(String(30), unique=True, nullable=False)
    discount_type     = Column(String(20), nullable=False)  # PERCENT, FIXED, FREESHIP
    discount_value    = Column(Float, nullable=False, default=0)
    min_order_amount  = Column(Float, nullable=False, default=0)
    max_uses          = Column(Integer, nullable=True)
    used_count        = Column(Integer, nullable=False, default=0)
    expires_at        = Column(DateTime(timezone=True), nullable=True)
    active            = Column(Boolean, nullable=False, default=True)
    created_at        = Column(DateTime(timezone=True), server_default=func.now())


class AddressDB(Base):
    __tablename__ = "addresses"
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    label         = Column(String(50), nullable=False, default="Home")
    full_address  = Column(String(255), nullable=False)
    phone         = Column(String(20), nullable=True)
    is_default    = Column(Boolean, nullable=False, default=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())


class ChatMessageDB(Base):
    __tablename__ = "chat_messages"
    id          = Column(Integer, primary_key=True, index=True)
    channel     = Column(String(30), nullable=False, index=True)  # "support:5" | "shipper:12"
    sender_id   = Column(Integer, ForeignKey("users.id"), nullable=True)
    sender_role = Column(String(20), nullable=False)
    message     = Column(Text, nullable=False)
    is_bot      = Column(Boolean, nullable=False, default=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

class ReviewDB(Base):
    __tablename__ = "product_reviews"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "product_id",
            name="uq_product_review_user_product",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
        index=True,
    )

    rating = Column(
        Integer,
        nullable=False,
    )

    comment = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )