import { useEffect, useRef, useState } from "react";
import { chatApi } from "../../api/extrasApi";

const AdminSupportChatPage = ({ listType = "support" }) => {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const fetchList = async () => {
    const data =
      listType === "support"
        ? await chatApi.getSupportList()
        : await chatApi.getShipperList();
    setConversations(data);
  };

  useEffect(() => {
    fetchList();
    const i = setInterval(fetchList, 6000);
    return () => clearInterval(i);
  }, [listType]);

  useEffect(() => {
    if (!selected) return;
    const fetchMsgs = () => chatApi.getMessages(selected).then(setMessages);
    fetchMsgs();
    const i = setInterval(fetchMsgs, 4000);
    return () => clearInterval(i);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selected) return;
    await chatApi.sendMessage(selected, input);
    setInput("");
    chatApi.getMessages(selected).then(setMessages);
  };

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "800",
          color: "#14162b",
          marginBottom: "20px",
        }}
      >
        {listType === "support" ? "Customer Support" : "Shipper Messages"}
      </h1>

      <div style={{ display: "flex", gap: "16px", height: "560px" }}>
        <div
          style={{
            width: "260px",
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #eef0f5",
            overflowY: "auto",
          }}
        >
          {conversations.length === 0 && (
            <p
              style={{ padding: "16px", color: "#8b8fa3", fontSize: "0.85rem" }}
            >
              No conversations yet.
            </p>
          )}
          {conversations.map((c) => (
            <div
              key={c.channel}
              onClick={() => setSelected(c.channel)}
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #f0f1f5",
                cursor: "pointer",
                backgroundColor:
                  selected === c.channel ? "#eef2ff" : "transparent",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontWeight: "600",
                  color: "#14162b",
                  fontSize: "0.85rem",
                }}
              >
                {c.channel}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.78rem",
                  color: "#a0a3b5",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {c.last_message}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #eef0f5",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {selected ? (
            <>
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      justifyContent:
                        m.sender_role === "ADMIN" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "9px 14px",
                        borderRadius: "14px",
                        fontSize: "0.85rem",
                        backgroundColor:
                          m.sender_role === "ADMIN" ? "#4f46e5" : "#f1f2f6",
                        color: m.sender_role === "ADMIN" ? "#fff" : "#14162b",
                      }}
                    >
                      {m.message}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  padding: "14px",
                  borderTop: "1px solid #f0f1f5",
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Reply..."
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #e4e6ee",
                    fontSize: "0.85rem",
                  }}
                />
                <button
                  onClick={handleSend}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#4f46e5",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                  }}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p style={{ margin: "auto", color: "#a0a3b5" }}>
              Select a conversation
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportChatPage;
