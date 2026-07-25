import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../api/ordersApi";

const statusColor = {
  PLACED: "#1976d2",
  PROCESSING: "#f59e0b",
  SHIPPED: "#8e24aa",
  COMPLETED: "#2e7d32",
  CANCELED: "#e53935",
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await ordersApi.getMyOrders();
        setOrders(data);
      } catch (err) {
        setError("Failed to load order history.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading)
    return (
      <p style={{ padding: "24px", textAlign: "center", color: "#888" }}>
        Loading orders...
      </p>
    );
  if (error)
    return (
      <p style={{ padding: "24px", textAlign: "center", color: "red" }}>
        {error}
      </p>
    );

  if (orders.length === 0) {
    return (
      <section style={{ padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ color: "#111", marginBottom: "8px" }}>Order History</h2>
        <p style={{ color: "#888" }}>You have not placed any orders yet.</p>
      </section>
    );
  }

  return (
    <section
      style={{ padding: "24px 16px", maxWidth: "900px", margin: "0 auto" }}
    >
      <h2 style={{ color: "#111", marginBottom: "20px" }}>Order History</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {orders.map((o) => (
          <div
            key={o.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "14px 16px",
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: "500", color: "#111" }}>
                Order #{o.id}
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "0.85rem",
                  color: "#888",
                }}
              >
                {new Date(o.created_at).toLocaleString()}
              </p>
            </div>

            <span
              style={{
                padding: "3px 12px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: "600",
                color: "#fff",
                backgroundColor: statusColor[o.status] || "#757575",
              }}
            >
              {o.status}
            </span>

            <p style={{ margin: 0, fontWeight: "bold", color: "#1976d2" }}>
              ${o.total_amount.toFixed(2)}
            </p>

            <Link
              to={`/orders/${o.id}`}
              style={{
                padding: "6px 16px",
                backgroundColor: "#1976d2",
                color: "#fff",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: "500",
              }}
            >
              View
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OrderHistoryPage;
