import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ordersApi } from "../api/ordersApi";
import { useAuth } from "../auth/useAuth";

const ALLOWED_STATUSES = [
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELED",
];

const statusColor = {
  PLACED: "#1976d2",
  PROCESSING: "#f59e0b",
  SHIPPED: "#8e24aa",
  COMPLETED: "#2e7d32",
  CANCELED: "#e53935",
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await ordersApi.getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      const updated = await ordersApi.adminUpdateStatus(order.id, newStatus);
      setOrder(updated);
    } catch {
      alert("Failed to update status");
    }
  };

  const handleAdminUpdateQuantity = async (itemId, newQty) => {
    if (newQty <= 0) return;
    try {
      const updated = await ordersApi.adminUpdateItemQuantity(
        order.id,
        itemId,
        newQty,
      );
      setOrder(updated);
    } catch {
      alert("Failed to update quantity");
    }
  };

  if (loading)
    return (
      <p style={{ padding: "24px", textAlign: "center", color: "#888" }}>
        Loading order...
      </p>
    );
  if (error)
    return (
      <p style={{ padding: "24px", textAlign: "center", color: "red" }}>
        {error}
      </p>
    );
  if (!order) return null;

  return (
    <section
      style={{ padding: "24px 16px", maxWidth: "800px", margin: "0 auto" }}
    >
      <Link
        to={isAdmin ? "/admin/orders" : "/orders"}
        style={{
          color: "#1976d2",
          textDecoration: "none",
          fontSize: "0.95rem",
        }}
      >
        ← Back to Orders
      </Link>

      <h2 style={{ color: "#111", marginTop: "16px", marginBottom: "4px" }}>
        Order #{order.id}
      </h2>
      <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "16px" }}>
        {new Date(order.created_at).toLocaleString()}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div>
          <span style={{ color: "#000000", fontSize: "0.9rem" }}>Status: </span>
          {isAdmin ? (
            <select
              value={order.status}
              onChange={handleStatusChange}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontSize: "0.9rem",
                color: "#ffffff",
              }}
            >
              {ALLOWED_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          ) : (
            <span
              style={{
                padding: "3px 12px",
                borderRadius: "20px",
                fontSize: "0.82rem",
                fontWeight: "600",
                color: "#fff",
                backgroundColor: statusColor[order.status] || "#757575",
              }}
            >
              {order.status}
            </span>
          )}
        </div>

        <p
          style={{
            margin: 0,
            fontWeight: "bold",
            color: "#1976d2",
            fontSize: "1.1rem",
          }}
        >
          Total: ${order.total_amount.toFixed(2)}
        </p>
      </div>

      <h3 style={{ color: "#111", fontSize: "1.05rem", marginBottom: "12px" }}>
        Items
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {order.items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "12px 16px",
            }}
          >
            <p style={{ margin: 0, flex: 1, color: "#111" }}>
              {item.product_name}
            </p>
            <p
              style={{
                margin: 0,
                width: "80px",
                textAlign: "center",
                color: "#666",
              }}
            >
              ${item.product_price.toFixed(2)}
            </p>

            <div style={{ width: "100px", textAlign: "center" }}>
              {isAdmin ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <button
                    onClick={() =>
                      handleAdminUpdateQuantity(item.id, item.quantity - 1)
                    }
                    style={{
                      width: "24px",
                      height: "24px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      backgroundColor: "#fff",
                      color: "#000",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleAdminUpdateQuantity(item.id, item.quantity + 1)
                    }
                    style={{
                      width: "24px",
                      height: "24px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      backgroundColor: "#fff",
                      color: "#000",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    +
                  </button>
                </div>
              ) : (
                <span style={{ color: "#666" }}>{item.quantity}</span>
              )}
            </div>

            <p
              style={{
                margin: 0,
                width: "80px",
                textAlign: "right",
                fontWeight: "bold",
                color: "#111",
              }}
            >
              ${item.line_total.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OrderDetailPage;
