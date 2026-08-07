FAQ_RULES = [
    (["shipping", "ship", "delivery", "giao hàng"], "We offer In-house delivery (15,000₫ flat fee) and Giao Hàng Nhanh (GHN). You can choose your preferred method at checkout."),
    (["return", "refund", "hoàn", "trả hàng"], "You can request a return within 7 days of delivery. Please contact our support team with your order number."),
    (["payment", "pay", "thanh toán"], "We accept Stripe (credit card), PayPal, and VNPay for secure online payments."),
    (["track", "tracking", "theo dõi", "đơn hàng"], "You can track your order status in the 'Orders' section of your account, or on the Order Detail page."),
    (["cancel", "hủy"], "You can cancel an order while it's still in 'Placed' or 'Processing' status from your Order Detail page."),
    (["voucher", "discount", "giảm giá", "mã"], "You can apply voucher codes at checkout in your Cart. Try WELCOME10 for 10% off!"),
    (["hello", "hi", "chào", "xin chào"], "Hello! 👋 How can I help you today? Ask me about shipping, payments, returns, or orders."),
]

DEFAULT_REPLY = "I'm not sure about that yet. For further help, please use the 'Chat with Support' option to talk to our team directly."


def get_bot_reply(message: str) -> str:
    lower = message.lower()
    for keywords, reply in FAQ_RULES:
        if any(kw in lower for kw in keywords):
            return reply
    return DEFAULT_REPLY