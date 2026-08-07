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
        id=m.id, channel=m.channel, sender_id=m.sender_id,
        sender_role=m.sender_role, message=m.message, is_bot=m.is_bot, created_at=str(m.created_at),
    )


def _check_channel_access(channel: str, user):
    """support:<customer_id> — chỉ customer đó hoặc admin. shipper:<shipper_id> — chỉ shipper đó hoặc admin."""
    if user.role == "ADMIN":
        return
    parts = channel.split(":")
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Invalid channel")
    kind, owner_id = parts
    if kind == "support" and user.role == "CUSTOMER" and int(owner_id) == user.id:
        return
    if kind == "shipper" and user.role == "SHIPPER" and int(owner_id) == user.id:
        return
    raise HTTPException(status_code=403, detail="Not allowed on this channel")


@router.get("/{channel}", response_model=List[ChatMessageRead])
def get_messages(channel: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    _check_channel_access(channel, user)
    msgs = db.query(ChatMessageDB).filter(ChatMessageDB.channel == channel).order_by(asc(ChatMessageDB.created_at)).all()
    return [_to_read(m) for m in msgs]


@router.post("", response_model=ChatMessageRead, status_code=201)
def send_message(payload: ChatMessageCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    _check_channel_access(payload.channel, user)
    msg = ChatMessageDB(channel=payload.channel, sender_id=user.id, sender_role=user.role, message=payload.message, is_bot=False)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return _to_read(msg)


@router.post("/bot", response_model=ChatMessageRead, status_code=201)
def send_to_bot(payload: ChatMessageCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Channel dạng bot:<user_id> — luôn cùng chủ tài khoản."""
    user_msg = ChatMessageDB(channel=payload.channel, sender_id=user.id, sender_role=user.role, message=payload.message, is_bot=False)
    db.add(user_msg)
    db.flush()

    bot_reply = get_bot_reply(payload.message)
    bot_msg = ChatMessageDB(channel=payload.channel, sender_id=None, sender_role="BOT", message=bot_reply, is_bot=True)
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)
    return _to_read(bot_msg)


@router.get("/admin/support-list")
def list_support_conversations(db: Session = Depends(get_db), user=Depends(require_admin)):
    """Danh sách channel support:<id> có tin nhắn, kèm tin nhắn cuối."""
    channels = (
        db.query(ChatMessageDB.channel)
        .filter(ChatMessageDB.channel.like("support:%"))
        .distinct()
        .all()
    )
    result = []
    for (channel,) in channels:
        last = db.query(ChatMessageDB).filter(ChatMessageDB.channel == channel).order_by(ChatMessageDB.created_at.desc()).first()
        result.append({"channel": channel, "last_message": last.message if last else "", "last_at": str(last.created_at) if last else ""})
    return result


@router.get("/admin/shipper-list")
def list_shipper_conversations(db: Session = Depends(get_db), user=Depends(require_admin)):
    channels = (
        db.query(ChatMessageDB.channel)
        .filter(ChatMessageDB.channel.like("shipper:%"))
        .distinct()
        .all()
    )
    result = []
    for (channel,) in channels:
        last = db.query(ChatMessageDB).filter(ChatMessageDB.channel == channel).order_by(ChatMessageDB.created_at.desc()).first()
        result.append({"channel": channel, "last_message": last.message if last else "", "last_at": str(last.created_at) if last else ""})
    return result