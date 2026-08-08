from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc
from typing import List

from database import get_db
from models.extras import ChatMessageDB
from schemas.extras import ChatMessageCreate, ChatMessageRead
from auth.deps import get_current_user, require_admin
from services.chatbot import get_bot_reply


router = APIRouter(prefix="/chat", tags=["chat"])


def _to_read(m: ChatMessageDB) -> ChatMessageRead:
    return ChatMessageRead(
        id=m.id,
        channel=m.channel,
        sender_id=m.sender_id,
        sender_role=m.sender_role,
        message=m.message,
        is_bot=m.is_bot,
        created_at=str(m.created_at),
    )


def _check_channel_access(channel: str, user):
    """
    Supported channels:

    bot:<user_id>
        Customer/shipper can access their own bot conversation.

    support:<customer_id>
        Customer can access their own support conversation.
        Admin can access all support conversations.

    shipper:<shipper_id>
        Shipper can access their own conversation.
        Admin can access all shipper conversations.
    """

    # Admin can access every channel
    if user.role == "ADMIN":
        return

    parts = channel.split(":")

    if len(parts) != 2:
        raise HTTPException(
            status_code=400,
            detail="Invalid channel format. Expected type:id",
        )

    kind, owner_id = parts

    try:
        owner_id = int(owner_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid channel owner ID",
        )

    # FAQ / AI Bot
    if kind == "bot":
        if owner_id == user.id:
            return

        raise HTTPException(
            status_code=403,
            detail="Not allowed on this bot channel",
        )

    # Customer support
    if kind == "support":
        if user.role == "CUSTOMER" and owner_id == user.id:
            return

        raise HTTPException(
            status_code=403,
            detail="Not allowed on this support channel",
        )

    # Shipper support
    if kind == "shipper":
        if user.role == "SHIPPER" and owner_id == user.id:
            return

        raise HTTPException(
            status_code=403,
            detail="Not allowed on this shipper channel",
        )

    raise HTTPException(
        status_code=400,
        detail="Unknown channel type",
    )


# ============================================================
# BOT
# ============================================================

@router.get("/bot/{user_id}", response_model=List[ChatMessageRead])
def get_bot_messages(
    user_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    Get the current user's FAQ bot conversation.
    """

    if user.role != "ADMIN" and user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Not allowed to access this bot conversation",
        )

    channel = f"bot:{user_id}"

    msgs = (
        db.query(ChatMessageDB)
        .filter(ChatMessageDB.channel == channel)
        .order_by(asc(ChatMessageDB.created_at))
        .all()
    )

    return [_to_read(m) for m in msgs]


@router.post("/bot", response_model=ChatMessageRead, status_code=201)
def send_to_bot(
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    Send a message to the FAQ bot.

    Expected channel:

        bot:<user_id>
    """

    _check_channel_access(payload.channel, user)

    # Make sure this is actually a bot channel
    if not payload.channel.startswith("bot:"):
        raise HTTPException(
            status_code=400,
            detail="Bot endpoint requires a bot:<user_id> channel",
        )

    # Save user's message
    user_msg = ChatMessageDB(
        channel=payload.channel,
        sender_id=user.id,
        sender_role=user.role,
        message=payload.message,
        is_bot=False,
    )

    db.add(user_msg)
    db.flush()

    # Generate bot response
    bot_reply = get_bot_reply(payload.message)

    # Save bot response
    bot_msg = ChatMessageDB(
        channel=payload.channel,
        sender_id=None,
        sender_role="BOT",
        message=bot_reply,
        is_bot=True,
    )

    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)

    return _to_read(bot_msg)


# ============================================================
# ADMIN SUPPORT LIST
# ============================================================

@router.get("/admin/support-list")
def list_support_conversations(
    db: Session = Depends(get_db),
    user=Depends(require_admin),
):
    """
    List all customer support conversations.
    """

    channels = (
        db.query(ChatMessageDB.channel)
        .filter(ChatMessageDB.channel.like("support:%"))
        .distinct()
        .all()
    )

    result = []

    for (channel,) in channels:
        last = (
            db.query(ChatMessageDB)
            .filter(ChatMessageDB.channel == channel)
            .order_by(ChatMessageDB.created_at.desc())
            .first()
        )

        result.append(
            {
                "channel": channel,
                "last_message": last.message if last else "",
                "last_at": str(last.created_at) if last else "",
            }
        )

    return result


# ============================================================
# ADMIN SHIPPER LIST
# ============================================================

@router.get("/admin/shipper-list")
def list_shipper_conversations(
    db: Session = Depends(get_db),
    user=Depends(require_admin),
):
    """
    List all shipper conversations.
    """

    channels = (
        db.query(ChatMessageDB.channel)
        .filter(ChatMessageDB.channel.like("shipper:%"))
        .distinct()
        .all()
    )

    result = []

    for (channel,) in channels:
        last = (
            db.query(ChatMessageDB)
            .filter(ChatMessageDB.channel == channel)
            .order_by(ChatMessageDB.created_at.desc())
            .first()
        )

        result.append(
            {
                "channel": channel,
                "last_message": last.message if last else "",
                "last_at": str(last.created_at) if last else "",
            }
        )

    return result


# ============================================================
# GENERAL CHAT MESSAGE
# ============================================================

@router.post("", response_model=ChatMessageRead, status_code=201)
def send_message(
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    Send a normal support/shipper chat message.
    """

    _check_channel_access(payload.channel, user)

    # Bot messages must use /bot endpoint
    if payload.channel.startswith("bot:"):
        raise HTTPException(
            status_code=400,
            detail="Use /chat/bot for bot messages",
        )

    msg = ChatMessageDB(
        channel=payload.channel,
        sender_id=user.id,
        sender_role=user.role,
        message=payload.message,
        is_bot=False,
    )

    db.add(msg)
    db.commit()
    db.refresh(msg)

    return _to_read(msg)


# ============================================================
# GENERAL CHAT HISTORY
# ============================================================

@router.get("/{channel}", response_model=List[ChatMessageRead])
def get_messages(
    channel: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    Get messages for support:<id> or shipper:<id> channels.
    """

    _check_channel_access(channel, user)

    # Bot history should use the dedicated bot endpoint.
    if channel.startswith("bot:"):
        raise HTTPException(
            status_code=400,
            detail="Use /chat/bot/{user_id} for bot history",
        )

    msgs = (
        db.query(ChatMessageDB)
        .filter(ChatMessageDB.channel == channel)
        .order_by(asc(ChatMessageDB.created_at))
        .all()
    )

    return [_to_read(m) for m in msgs]