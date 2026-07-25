import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../api/ordersApi";

const STATUS_META = {
  PLACED: { color: "#1976d2", label: "Placed" },
  PROCESSING: { color: "#f59e0b", label: "Processing" },
  SHIPPED: { color: "#8e24aa", label: "Shipped" },
  COMPLETED: { color: "#2e7d32", label: "Completed" },
  CANCELED: { color: "#e53935", label: "Canceled" },
};

const FILTERS = [
  "All",
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELED",
];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await ordersApi.getAllForAdmin();
        setOrders(data);
      } catch (err) {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = orders
    .filter((o) => filter === "All" || o.status === filter)
    .filter(
      (o) => search.trim() === "" || String(o.id).includes(search.trim()),
    );

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

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      <h2 style={{ color: "#14162b", marginBottom: "4px", fontSize: "1.4rem" }}>
        Orders
      </h2>
      <p style={{ color: "#8b8fa3", marginBottom: "20px", fontSize: "0.9rem" }}>
        Manage and track all customer orders.
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <input
          type="text"
          placeholder="Search by order #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #e4e6ee",
            fontSize: "0.88rem",
            minWidth: "180px",
          }}
        />
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: "#f5f6fb",
            padding: "4px",
            borderRadius: "10px",
            flexWrap: "wrap",
          }}
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.78rem",
                fontWeight: "700",
                cursor: "pointer",
                backgroundColor: filter === f ? "#14162b" : "transparent",
                color: filter === f ? "#fff" : "#8b8fa3",
              }}
            >
              {f === "All" ? "All" : STATUS_META[f]?.label}
            </button>
          ))}
        </div>
      </div>

      <p
        style={{ color: "#8b8fa3", fontSize: "0.85rem", marginBottom: "12px" }}
      >
        Showing {filtered.length} of {orders.length} orders
      </p>

      {filtered.length === 0 ? (
        <p style={{ color: "#a0a3b5", textAlign: "center", padding: "40px 0" }}>
          No orders match your filters.
        </p>
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
                  fontWeight: "600",
                  color: "#14162b",
                  minWidth: "90px",
                }}
              >
                #{o.id}
              </p>
              <span
                style={{
                  padding: "3px 12px",
                  borderRadius: "20px",
                  fontSize: "0.76rem",
                  fontWeight: "700",
                  color: "#fff",
                  backgroundColor:
                    (STATUS_META[o.status] || {}).color || "#757575",
                }}
              >
                {(STATUS_META[o.status] || {}).label || o.status}
              </span>
              <p style={{ margin: 0, fontWeight: "700", color: "#4f46e5" }}>
                ${o.total_amount.toFixed(2)}
              </p>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#a0a3b5" }}>
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
                  fontSize: "0.82rem",
                  fontWeight: "600",
                }}
              >
                Manage
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
