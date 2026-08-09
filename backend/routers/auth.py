from datetime import timedelta, datetime, timezone

import os
import hashlib
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import UserDB
from schemas.auth import (RegisterRequest, LoginRequest, TokenResponse, AuthUser, ForgotPasswordRequest, ResetPasswordRequest,)
from auth.security import hash_password, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from services.password_reset import (generate_reset_token, hash_reset_token,)
from services.email_service import send_password_reset_email

router = APIRouter(tags=["auth"])

@router.post("/register", response_model=AuthUser, status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(UserDB).filter(UserDB.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    hashed = hash_password(payload.password)

    new_user = UserDB(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=hashed,
        role=payload.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return AuthUser(
        id=new_user.id, email=new_user.email,
        full_name=new_user.full_name, role=new_user.role,
    )

@router.post("/login", response_model=TokenResponse)
def login_user(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(UserDB)
        .filter(UserDB.email == payload.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        payload.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token_expires = timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role,
        },
        expires_delta=access_token_expires,
    )

    return TokenResponse(
        access_token=token,
        user=AuthUser(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
        ),
    )


@router.post("/forgot-password")
def forgot_password(
    email: str,
    db: Session = Depends(get_db),
):
    user = (
        db.query(UserDB)
        .filter(UserDB.email == email)
        .first()
    )

    # Don't reveal whether an email exists
    if not user:
        return {
            "message": (
                "If an account with that email exists, "
                "a password reset link has been sent."
            )
        }

    token = secrets.token_urlsafe(32)

    user.reset_token = token
    user.reset_token_expires = (
        datetime.now(timezone.utc) + timedelta(minutes=30)
    )

    db.commit()

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )

    reset_url = (
        f"{frontend_url}/reset-password"
        f"?token={token}"
    )

    send_password_reset_email(
        recipient_email=user.email,
        reset_url=reset_url,
    )

    return {
        "message": (
            "If an account with that email exists, "
            "a password reset link has been sent."
        )
    }


@router.post("/reset-password")
def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db),
):
    user = (
        db.query(UserDB)
        .filter(UserDB.reset_token == token)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token.",
        )

    if (
        not user.reset_token_expires
        or user.reset_token_expires
        < datetime.now(timezone.utc)
    ):
        user.reset_token = None
        user.reset_token_expires = None
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token.",
        )

    if len(new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters.",
        )

    user.password_hash = hash_password(new_password)

    # Token can only be used once
    user.reset_token = None
    user.reset_token_expires = None

    db.commit()

    return {
        "message": "Your password has been reset successfully."
    }