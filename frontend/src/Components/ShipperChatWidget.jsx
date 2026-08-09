import { useEffect, useRef, useState } from "react";
import { chatApi } from "../api/extrasApi";
import { useAuth } from "../auth/useAuth";

const ShipperChatWidget = () => {
  const { user, role, isAuthenticated } = useAuth();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("admin");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);

  const userId = user?.id;

  const channel = tab === "bot" ? `bot:${userId}` : `shipper:${userId}`;

  const fetchMessages = async () => {
    if (!isAuthenticated || !userId) return;

    try {
      setError("");

      let data;

      if (tab === "bot") {
        data = await chatApi.getBotMessages(userId);
      } else {
        data = await chatApi.getMessages(channel);
      }

      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load chat:", err);
      setMessages([]);
      setError(err?.response?.data?.detail || "Unable to load messages.");
    }
  };

  useEffect(() => {
    if (!open || !isAuthenticated || !userId) return;

    fetchMessages();

    const interval = setInterval(fetchMessages, 4000);

    return () => clearInterval(interval);
  }, [open, tab, isAuthenticated, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const changeTab = (newTab) => {
    setTab(newTab);
    setMessages([]);
    setError("");
  };

  const handleSend = async () => {
    const text = input.trim();

    if (!text || sending || !userId) return;

    setSending(true);
    setInput("");
    setError("");

    try {
      if (tab === "bot") {
        await chatApi.sendToBot(channel, text);
      } else {
        await chatApi.sendMessage(channel, text);
      }

      await fetchMessages();
    } catch (err) {
      console.error("Failed to send chat message:", err);

      setError(err?.response?.data?.detail || "Unable to send your message.");

      setInput(text);
    } finally {
      setSending(false);
    }
  };

  // Only show this widget to SHIPPERS.
  if (!isAuthenticated || role !== "SHIPPER") {
    return null;
  }

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setOpen((value) => !value)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 300,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#059669",
          color: "#fff",
          border: "none",
          fontSize: "1.4rem",
          cursor: "pointer",
          boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
        }}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "24px",
            zIndex: 300,
            width: "340px",
            maxWidth: "90vw",
            height: "460px",
            backgroundColor: "#fff",
            borderRadius: "18px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              background: "linear-gradient(135deg, #059669, #047857)",
              color: "#fff",
            }}
          >
            <div
              style={{
                fontWeight: "700",
                fontSize: "0.95rem",
              }}
            >
              Shipper Chat
            </div>

            <div
              style={{
                fontSize: "0.72rem",
                opacity: 0.8,
                marginTop: "2px",
              }}
            >
              Contact admin or use the FAQ bot
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #ece6dc",
            }}
          >
            <button
              onClick={() => changeTab("admin")}
              style={tabStyle(tab === "admin")}
            >
              Admin
            </button>

            <button
              onClick={() => changeTab("bot")}
              style={tabStyle(tab === "bot")}
            >
              FAQ Bot
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {error && (
              <div
                style={{
                  padding: "8px 10px",
                  borderRadius: "10px",
                  backgroundColor: "#fff1f0",
                  color: "#c0392b",
                  fontSize: "0.75rem",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            {messages.length === 0 && !error && (
              <p
                style={{
                  textAlign: "center",
                  color: "#a39c8f",
                  fontSize: "0.82rem",
                  marginTop: "20px",
                }}
              >
                {tab === "admin"
                  ? "Send a message to the administrator."
                  : "Ask me about shipping, orders, payments..."}
              </p>
            )}

            {messages.map((m) => {
              const isMine = m.sender_id === user?.id && !m.is_bot;

              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: isMine ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "8px 12px",
                      borderRadius: "14px",
                      fontSize: "0.82rem",
                      backgroundColor: isMine ? "#059669" : "#f0f4f2",
                      color: isMine ? "#fff" : "#1f2937",
                      wordBreak: "break-word",
                    }}
                  >
                    {m.message}
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "12px",
              borderTop: "1px solid #ece6dc",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              disabled={sending}
              placeholder={
                tab === "admin" ? "Message admin..." : "Ask the FAQ bot..."
              }
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: "20px",
                border: "1px solid #ece6dc",
                fontSize: "0.82rem",
                outline: "none",
              }}
            />

            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              style={{
                padding: "9px 16px",
                borderRadius: "20px",
                border: "none",
                backgroundColor: sending || !input.trim() ? "#aaa" : "#059669",
                color: "#fff",
                cursor: sending || !input.trim() ? "not-allowed" : "pointer",
                fontSize: "0.82rem",
              }}
            >
              {sending ? "..." : "→"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const tabStyle = (active) => ({
  flex: 1,
  padding: "11px 0",
  border: "none",
  backgroundColor: active ? "#fff" : "#fafafa",
  color: active ? "#059669" : "#9ca3af",
  fontWeight: active ? "700" : "500",
  fontSize: "0.82rem",
  cursor: "pointer",
  borderBottom: active ? "2px solid #059669" : "2px solid transparent",
});

export default ShipperChatWidget;
