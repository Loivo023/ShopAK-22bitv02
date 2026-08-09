from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc
from typing import List

from database import get_db
from models.extras import ChatMessageDB
from models.user import UserDB
from models.order import OrderDB
from schemas.extras import ChatMessageCreate, ChatMessageRead
from auth.deps import get_current_user, require_admin
from services.chatbot import get_bot_reply


router = APIRouter(prefix="/chat", tags=["chat"])


# ============================================================
# HELPER
# ============================================================

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

def _get_conversation_user(channel: str, db: Session):
    """
    Get the user associated with a support/shipper channel.

    Examples:
        support:5  -> customer ID 5
        shipper:12 -> shipper ID 12
    """

    parts = channel.split(":")

    if len(parts) != 2:
        return None

    kind, owner_id = parts

    try:
        owner_id = int(owner_id)
    except ValueError:
        return None

    if kind not in ("support", "shipper"):
        return None

    return db.query(UserDB).filter(UserDB.id == owner_id).first()


# ============================================================
# CHANNEL ACCESS
# ============================================================

def _check_channel_access(
    channel: str,
    user,
    db: Session,
):
    """
    Supported channels:

    bot:<user_id>
        Customer/shipper can access their own bot conversation.
        Admin can access everything.

    support:<customer_id>
        Customer can access their own support conversation.
        Admin can access all customer support conversations.

    shipper:<shipper_id>
        Shipper can access their own admin conversation.
        Admin can access all shipper conversations.

    order:<order_id>
        Customer can access their own order conversation.
        Assigned shipper can access the order conversation.
        Admin can access everything.
    """

    # --------------------------------------------------------
    # ADMIN CAN ACCESS EVERYTHING
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # BOT
    # --------------------------------------------------------

    if kind == "bot":
        if owner_id == user.id:
            return

        raise HTTPException(
            status_code=403,
            detail="Not allowed on this bot channel",
        )

    # --------------------------------------------------------
    # CUSTOMER -> ADMIN
    # --------------------------------------------------------

    if kind == "support":
        if user.role == "CUSTOMER" and owner_id == user.id:
            return

        raise HTTPException(
            status_code=403,
            detail="Not allowed on this support channel",
        )

    # --------------------------------------------------------
    # ADMIN -> SHIPPER
    # --------------------------------------------------------

    if kind == "shipper":
        if user.role == "SHIPPER" and owner_id == user.id:
            return

        raise HTTPException(
            status_code=403,
            detail="Not allowed on this shipper channel",
        )

    # --------------------------------------------------------
    # CUSTOMER <-> SHIPPER
    # --------------------------------------------------------

    if kind == "order":

        order = (
            db.query(OrderDB)
            .filter(OrderDB.id == owner_id)
            .first()
        )

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found",
            )

        # Customer who owns the order
        if user.role == "CUSTOMER":
            if order.user_id == user.id:
                return

            raise HTTPException(
                status_code=403,
                detail="You are not allowed to access this order chat",
            )

        # Shipper assigned to this order
        if user.role == "SHIPPER":
            if order.shipper_id == user.id:
                return

            raise HTTPException(
                status_code=403,
                detail="You are not the assigned shipper for this order",
            )

        raise HTTPException(
            status_code=403,
            detail="Not allowed on this order channel",
        )

    raise HTTPException(
        status_code=400,
        detail="Unknown channel type",
    )


# ============================================================
# BOT
# ============================================================

@router.get(
    "/bot/{user_id}",
    response_model=List[ChatMessageRead],
)
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


@router.post(
    "/bot",
    response_model=ChatMessageRead,
    status_code=201,
)
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

    _check_channel_access(
        payload.channel,
        user,
        db,
    )

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
# ADMIN - CUSTOMER SUPPORT LIST
# ============================================================

@router.get("/admin/support-list")
def list_support_conversations(
    db: Session = Depends(get_db),
    user=Depends(require_admin),
):
    """
    List all customer support conversations with customer information.
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

        conversation_user = _get_conversation_user(channel, db)

        result.append(
            {
                "channel": channel,
                "user_id": conversation_user.id if conversation_user else None,
                "name": conversation_user.full_name if conversation_user else "Unknown Customer",
                "email": conversation_user.email if conversation_user else None,
                "phone": conversation_user.phone if conversation_user else None,
                "role": conversation_user.role if conversation_user else "CUSTOMER",
                "last_message": last.message if last else "",
                "last_at": str(last.created_at) if last else "",
            }
        )

    result.sort(
        key=lambda x: x["last_at"],
        reverse=True,
    )

    return result


# ============================================================
# ADMIN - SHIPPER CHAT LIST
# ============================================================

@router.get("/admin/shipper-list")
def list_shipper_conversations(
    db: Session = Depends(get_db),
    user=Depends(require_admin),
):
    """
    List all shipper conversations with shipper information.
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

        conversation_user = _get_conversation_user(channel, db)

        result.append(
            {
                "channel": channel,
                "user_id": conversation_user.id if conversation_user else None,
                "name": conversation_user.full_name if conversation_user else "Unknown Shipper",
                "email": conversation_user.email if conversation_user else None,
                "phone": conversation_user.phone if conversation_user else None,
                "role": conversation_user.role if conversation_user else "SHIPPER",
                "last_message": last.message if last else "",
                "last_at": str(last.created_at) if last else "",
            }
        )

    result.sort(
        key=lambda x: x["last_at"],
        reverse=True,
    )

    return result


# ============================================================
# CUSTOMER <-> SHIPPER
# ============================================================

@router.get(
    "/order/{order_id}",
    response_model=List[ChatMessageRead],
)
def get_order_chat(
    order_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    Get chat messages for an order.

    CUSTOMER:
        Must own the order.

    SHIPPER:
        Must be assigned to the order.

    ADMIN:
        Can access everything.
    """

    channel = f"order:{order_id}"

    _check_channel_access(
        channel,
        user,
        db,
    )

    msgs = (
        db.query(ChatMessageDB)
        .filter(ChatMessageDB.channel == channel)
        .order_by(asc(ChatMessageDB.created_at))
        .all()
    )

    return [_to_read(m) for m in msgs]


# ============================================================
# SEND CUSTOMER <-> SHIPPER MESSAGE
# ============================================================

@router.post(
    "/order",
    response_model=ChatMessageRead,
    status_code=201,
)
def send_order_chat_message(
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    Send a message between customer and assigned shipper.

    Expected channel:

        order:<order_id>
    """

    if not payload.channel.startswith("order:"):
        raise HTTPException(
            status_code=400,
            detail="Order chat requires an order:<order_id> channel",
        )

    _check_channel_access(
        payload.channel,
        user,
        db,
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
# GENERAL CHAT MESSAGE
# ============================================================

@router.post(
    "",
    response_model=ChatMessageRead,
    status_code=201,
)
def send_message(
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    Send a normal support/shipper chat message.
    """

    _check_channel_access(
        payload.channel,
        user,
        db,
    )

    # Bot messages must use /bot endpoint
    if payload.channel.startswith("bot:"):
        raise HTTPException(
            status_code=400,
            detail="Use /chat/bot for bot messages",
        )

    # Order messages can use /chat/order
    if payload.channel.startswith("order:"):
        raise HTTPException(
            status_code=400,
            detail="Use /chat/order for order messages",
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

@router.get(
    "/{channel}",
    response_model=List[ChatMessageRead],
)
def get_messages(
    channel: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    Get messages for support: or shipper: channels.
    """

    _check_channel_access(
        channel,
        user,
        db,
    )

    # Bot history should use dedicated endpoint
    if channel.startswith("bot:"):
        raise HTTPException(
            status_code=400,
            detail="Use /chat/bot/{user_id} for bot history",
        )

    # Order history should use dedicated endpoint
    if channel.startswith("order:"):
        raise HTTPException(
            status_code=400,
            detail="Use /chat/order/{order_id} for order history",
        )

    msgs = (
        db.query(ChatMessageDB)
        .filter(ChatMessageDB.channel == channel)
        .order_by(asc(ChatMessageDB.created_at))
        .all()
    )

    return [_to_read(m) for m in msgs]