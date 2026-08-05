import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { formatUSD } from "../../utils/currency";

const STATUS_COLOR = {
  PLACED: "#8b8fa3",
  PROCESSING: "#d97706",
  SHIPPED: "#7c3aed",
  COMPLETED: "#16a34a",
  CANCELED: "#dc2626",
  FAILED: "#dc2626",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    axiosClient
      .get("/orders/admin/all")
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "ALL"
      ? orders.filter(
          (o) => o.shipping_provider === "IN_HOUSE" || o.status !== "PLACED",
        )
      : orders.filter((o) => o.status === filter);

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
        All Orders
      </h1>

      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {["ALL", "PROCESSING", "SHIPPED", "COMPLETED", "FAILED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "7px 16px",
              borderRadius: "20px",
              border: "none",
              fontSize: "0.8rem",
              fontWeight: "600",
              cursor: "pointer",
              backgroundColor: filter === s ? "#14162b" : "#eceef4",
              color: filter === s ? "#fff" : "#8b8fa3",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#8b8fa3" }}>Loading...</p>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #eef0f5",
            overflow: "hidden",
          }}
        >
          {filtered.map((o, idx) => (
            <div
              key={o.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom:
                  idx === filtered.length - 1 ? "none" : "1px solid #f0f1f5",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontWeight: "700",
                  color: "#14162b",
                  minWidth: "80px",
                }}
              >
                #{o.id}
              </p>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: "700",
                  padding: "3px 12px",
                  borderRadius: "20px",
                  backgroundColor: (STATUS_COLOR[o.status] || "#8b8fa3") + "22",
                  color: STATUS_COLOR[o.status] || "#8b8fa3",
                }}
              >
                {o.status}
              </span>
              <p style={{ margin: 0, fontWeight: "700", color: "#4f46e5" }}>
                {formatUSD(o.total_amount)}
              </p>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#a0a3b5" }}>
                {new Date(o.created_at).toLocaleDateString()}
              </p>
              <Link
                to={`/admin/orders/${o.id}`}
                style={{
                  padding: "6px 16px",
                  backgroundColor: "#14162b",
                  color: "#fff",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                }}
              >
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
