import { useEffect, useState } from "react";
import { inventoryApi } from "../../api/inventoryApi";

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [i, l] = await Promise.all([
        inventoryApi.getAll(),
        inventoryApi.getLogs(),
      ]);
      setItems(i);
      setLogs(l);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAdjust = async (productId) => {
    if (!amount || !reason) return;
    try {
      await inventoryApi.adjust(productId, parseInt(amount), reason);
      setAdjusting(null);
      setAmount("");
      setReason("");
      fetchAll();
    } catch (err) {
      alert("Failed to adjust stock.");
    }
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
        Inventory
      </h1>

      {loading ? (
        <p style={{ color: "#8b8fa3" }}>Loading...</p>
      ) : (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div
            style={{
              flex: "2 1 480px",
              background: "#fff",
              borderRadius: "16px",
              border: "1px solid #eef0f5",
              overflow: "hidden",
            }}
          >
            {items.map((item, idx) => (
              <div
                key={item.product_id}
                style={{
                  padding: "14px 18px",
                  borderBottom:
                    idx === items.length - 1 ? "none" : "1px solid #f0f1f5",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{ margin: 0, fontWeight: "600", color: "#14162b" }}
                    >
                      {item.product_name}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.78rem",
                        color: "#a0a3b5",
                      }}
                    >
                      {item.category}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "700",
                        color: item.stock_quantity < 10 ? "#dc2626" : "#14162b",
                      }}
                    >
                      {item.stock_quantity} units
                    </span>
                    <button
                      onClick={() =>
                        setAdjusting(
                          adjusting === item.product_id
                            ? null
                            : item.product_id,
                        )
                      }
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "1px solid #e4e6ee",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      Adjust
                    </button>
                  </div>
                </div>
                {adjusting === item.product_id && (
                  <div
                    style={{ display: "flex", gap: "8px", marginTop: "10px" }}
                  >
                    <input
                      type="number"
                      placeholder="+/- amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{
                        width: "120px",
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid #e4e6ee",
                        fontSize: "0.8rem",
                      }}
                    />
                    <input
                      placeholder="Reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid #e4e6ee",
                        fontSize: "0.8rem",
                      }}
                    />
                    <button
                      onClick={() => handleAdjust(item.product_id)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#4f46e5",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              flex: "1 1 280px",
              background: "#fff",
              borderRadius: "16px",
              border: "1px solid #eef0f5",
              padding: "18px",
            }}
          >
            <p
              style={{
                margin: "0 0 14px",
                fontWeight: "700",
                color: "#14162b",
                fontSize: "0.95rem",
              }}
            >
              Recent Activity
            </p>
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                style={{ marginBottom: "10px", fontSize: "0.8rem" }}
              >
                <p style={{ margin: 0, color: "#14162b" }}>
                  {log.product_name}{" "}
                  <span
                    style={{
                      color: log.change_amount > 0 ? "#16a34a" : "#dc2626",
                      fontWeight: "700",
                    }}
                  >
                    {log.change_amount > 0 ? "+" : ""}
                    {log.change_amount}
                  </span>
                </p>
                <p style={{ margin: 0, color: "#a0a3b5" }}>{log.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
