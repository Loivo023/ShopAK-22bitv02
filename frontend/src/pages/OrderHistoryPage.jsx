import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../api/ordersApi";
import { formatUSD, formatVND } from "../utils/currency";

const STATUS_META = {
  PLACED: { color: "#8a8378", bg: "#f0e4d8", label: "Placed" },
  PROCESSING: { color: "#b8863f", bg: "#f5ecd8", label: "Processing" },
  SHIPPED: { color: "#7a6bb0", bg: "#ece8f5", label: "Shipped" },
  COMPLETED: { color: "#5a7d5a", bg: "#eaf1ea", label: "Completed" },
  CANCELED: { color: "#c14f2f", bg: "#fdf0eb", label: "Canceled" },
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
      <div
        style={{
          textAlign: "center",
          padding: "100px 24px",
          color: "#a39c8f",
          backgroundColor: "#faf7f2",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid #ece6dc",
            borderTop: "3px solid #c1662f",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontFamily: "Georgia, serif" }}>Loading orders...</p>
      </div>
    );

  if (error)
    return (
      <p
        style={{
          padding: "80px 24px",
          textAlign: "center",
          color: "#c14f2f",
          backgroundColor: "#faf7f2",
        }}
      >
        {error}
      </p>
    );

  if (orders.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "#faf7f2",
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 24px",
        }}
      >
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "1.8rem",
            fontWeight: "400",
            color: "#2b2825",
            marginBottom: "10px",
          }}
        >
          No Orders Yet
        </h2>
        <p style={{ color: "#a39c8f", marginBottom: "28px" }}>
          You haven't placed any orders.
        </p>
        <Link
          to="/products"
          style={{
            padding: "13px 30px",
            backgroundColor: "#2b2825",
            color: "#faf7f2",
            borderRadius: "30px",
            textDecoration: "none",
            fontSize: "0.88rem",
            fontWeight: "500",
          }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#faf7f2", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "48px 32px 90px",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#c1662f",
            fontWeight: "600",
            margin: "0 0 8px",
          }}
        >
          Order History
        </p>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "2.1rem",
            fontWeight: "400",
            color: "#2b2825",
            margin: "0 0 32px",
          }}
        >
          Your Orders
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {orders.map((o) => {
            const meta = STATUS_META[o.status] || {
              color: "#5c574d",
              bg: "#ece6dc",
              label: o.status,
            };
            return (
              <Link
                key={o.id}
                to={`/orders/${o.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#fff",
                  borderRadius: "18px",
                  padding: "20px 24px",
                  border: "1px solid #ece6dc",
                  textDecoration: "none",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: "600",
                      color: "#2b2825",
                      fontSize: "0.95rem",
                    }}
                  >
                    Order #{o.id}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "0.8rem",
                      color: "#a39c8f",
                    }}
                  >
                    {new Date(o.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <span
                  style={{
                    padding: "5px 14px",
                    borderRadius: "20px",
                    fontSize: "0.76rem",
                    fontWeight: "600",
                    color: meta.color,
                    backgroundColor: meta.bg,
                  }}
                >
                  {meta.label}
                </span>

                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontWeight: "600", color: "#2b2825" }}>
                    {formatUSD(o.total_amount)}
                  </p>
                  <p
                    style={{ margin: 0, fontSize: "0.74rem", color: "#a39c8f" }}
                  >
                    {formatVND(o.total_amount)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
