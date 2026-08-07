import { useEffect, useRef, useState } from "react";
import { chatApi } from "../api/extrasApi";
import { useAuth } from "../auth/useAuth";

const ChatWidget = () => {
  const { user, role, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("bot"); // "bot" | "support"
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const channel = tab === "bot" ? `bot:${user?.id}` : `support:${user?.id}`;

  const fetchMessages = async () => {
    if (!isAuthenticated) return;
    const data = await chatApi.getMessages(channel);
    setMessages(data);
  };

  useEffect(() => {
    if (!open || !isAuthenticated) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [open, tab, isAuthenticated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    const text = input;
    setInput("");
    try {
      if (tab === "bot") {
        await chatApi.sendToBot(channel, text);
      } else {
        await chatApi.sendMessage(channel, text);
      }
      fetchMessages();
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated || role === "ADMIN") return null;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 300,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#2b2825",
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
          <div style={{ display: "flex", borderBottom: "1px solid #ece6dc" }}>
            <button
              onClick={() => setTab("bot")}
              style={tabStyle(tab === "bot")}
            >
              FAQ Bot
            </button>
            <button
              onClick={() => setTab("support")}
              style={tabStyle(tab === "support")}
            >
              Support
            </button>
          </div>

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
            {messages.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  color: "#a39c8f",
                  fontSize: "0.82rem",
                  marginTop: "20px",
                }}
              >
                {tab === "bot"
                  ? "Ask me about shipping, payments, orders..."
                  : "Send a message to our support team."}
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
                      backgroundColor: isMine ? "#2b2825" : "#f0e4d8",
                      color: isMine ? "#fff" : "#2b2825",
                    }}
                  >
                    {m.message}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

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
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: "20px",
                border: "1px solid #ece6dc",
                fontSize: "0.82rem",
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                padding: "9px 16px",
                borderRadius: "20px",
                border: "none",
                backgroundColor: "#2b2825",
                color: "#fff",
                cursor: "pointer",
                fontSize: "0.82rem",
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const tabStyle = (active) => ({
  flex: 1,
  padding: "12px 0",
  border: "none",
  backgroundColor: active ? "#fff" : "#faf7f2",
  color: active ? "#2b2825" : "#a39c8f",
  fontWeight: active ? "600" : "400",
  fontSize: "0.82rem",
  cursor: "pointer",
  borderBottom: active ? "2px solid #c1662f" : "none",
});

export default ChatWidget;
