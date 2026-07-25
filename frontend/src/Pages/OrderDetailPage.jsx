import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ordersApi } from "../api/ordersApi";
import { useAuth } from "../auth/useAuth";

const STATUS_META = {
  PLACED: { color: "#1976d2", label: "Placed" },
  PROCESSING: { color: "#f59e0b", label: "Processing" },
  SHIPPED: { color: "#8e24aa", label: "Shipped" },
  COMPLETED: { color: "#2e7d32", label: "Completed" },
  CANCELED: { color: "#e53935", label: "Canceled" },
};

const NEXT_STATUS_OPTIONS = {
  PLACED: ["PROCESSING", "CANCELED"],
  PROCESSING: ["CANCELED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELED: [],
};

const EDITABLE_ITEM_STATUSES = ["PLACED", "PROCESSING"];

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showShipForm, setShowShipForm] = useState(false);
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipping, setShipping] = useState(false);
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

  const handleStatusChange = async (newStatus) => {
    setActionError("");
    try {
      const updated = await ordersApi.adminUpdateStatus(order.id, newStatus);
      setOrder(updated);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setActionError(
        typeof detail === "string" ? detail : "Failed to update status.",
      );
    }
  };

  const handleShip = async (e) => {
    e.preventDefault();
    setShipping(true);
    setActionError("");
    try {
      const updated = await ordersApi.shipOrder(
        order.id,
        carrier,
        trackingNumber,
      );
      setOrder(updated);
      setShowShipForm(false);
      setCarrier("");
      setTrackingNumber("");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setActionError(
        typeof detail === "string" ? detail : "Failed to ship order.",
      );
    } finally {
      setShipping(false);
    }
  };

  const handleAdminUpdateQuantity = async (itemId, newQty) => {
    if (newQty <= 0) return;
    setActionError("");
    try {
      const updated = await ordersApi.adminUpdateItemQuantity(
        order.id,
        itemId,
        newQty,
      );
      setOrder(updated);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setActionError(
        typeof detail === "string" ? detail : "Failed to update quantity.",
      );
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

  const meta = STATUS_META[order.status] || {
    color: "#757575",
    label: order.status,
  };
  const itemsEditable =
    isAdmin && EDITABLE_ITEM_STATUSES.includes(order.status);
  const nextOptions = NEXT_STATUS_OPTIONS[order.status] || [];

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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: "16px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h2 style={{ color: "#111", margin: 0 }}>Order #{order.id}</h2>
          <p style={{ color: "#888", fontSize: "0.9rem", margin: "4px 0 0" }}>
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <span
          style={{
            padding: "5px 14px",
            borderRadius: "20px",
            fontSize: "0.85rem",
            fontWeight: "700",
            color: "#fff",
            backgroundColor: meta.color,
          }}
        >
          {meta.label}
        </span>
      </div>

      {(order.status === "COMPLETED" || order.status === "CANCELED") && (
        <div
          style={{
            marginTop: "16px",
            padding: "10px 14px",
            borderRadius: "8px",
            backgroundColor: "#f5f5f5",
            color: "#666",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🔒 This order is {order.status.toLowerCase()} and can no longer be
          modified.
        </div>
      )}

      {order.tracking_number && (
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            borderRadius: "10px",
            border: "1px solid #eee",
            backgroundColor: "#fafbff",
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: "600",
              color: "#111",
              fontSize: "0.92rem",
            }}
          >
            📦 Shipping Info
          </p>
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "10px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={{ margin: 0, color: "#888", fontSize: "0.78rem" }}>
                Carrier
              </p>
              <p
                style={{ margin: "2px 0 0", color: "#111", fontWeight: "500" }}
              >
                {order.carrier}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, color: "#888", fontSize: "0.78rem" }}>
                Tracking Number
              </p>
              <p
                style={{ margin: "2px 0 0", color: "#111", fontWeight: "500" }}
              >
                {order.tracking_number}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, color: "#888", fontSize: "0.78rem" }}>
                Shipped At
              </p>
              <p
                style={{ margin: "2px 0 0", color: "#111", fontWeight: "500" }}
              >
                {order.shipped_at
                  ? new Date(order.shipped_at).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      {order.shipping_address && (
        <div style={{ marginTop: "12px", fontSize: "0.88rem", color: "#666" }}>
          <strong style={{ color: "#111" }}>Ship to:</strong>{" "}
          {order.shipping_address}
        </div>
      )}

      <p
        style={{
          marginTop: "16px",
          fontWeight: "bold",
          color: "#1976d2",
          fontSize: "1.2rem",
        }}
      >
        Total: ${order.total_amount.toFixed(2)}
      </p>

      {isAdmin && (
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            borderRadius: "10px",
            border: "1px solid #eee",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: "600",
              color: "#111",
              fontSize: "0.9rem",
            }}
          >
            Admin Actions
          </p>

          {actionError && (
            <div
              style={{
                padding: "8px 12px",
                backgroundColor: "#fff3f3",
                border: "1px solid #f5c2c2",
                borderRadius: "6px",
                color: "#c0392b",
                fontSize: "0.85rem",
              }}
            >
              {actionError}
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {order.status === "PROCESSING" && !showShipForm && (
              <button
                onClick={() => setShowShipForm(true)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#8e24aa",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  fontWeight: "500",
                }}
              >
                📦 Mark as Shipped
              </button>
            )}

            {nextOptions.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                style={{
                  padding: "8px 16px",
                  backgroundColor:
                    s === "CANCELED"
                      ? "#fff"
                      : STATUS_META[s]?.color || "#1976d2",
                  color: s === "CANCELED" ? "#e53935" : "#fff",
                  border: s === "CANCELED" ? "1px solid #e53935" : "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  fontWeight: "500",
                }}
              >
                {s === "CANCELED"
                  ? "Cancel Order"
                  : `Mark as ${STATUS_META[s]?.label}`}
              </button>
            ))}
          </div>

          {showShipForm && (
            <form
              onSubmit={handleShip}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                padding: "14px",
                backgroundColor: "#faf5ff",
                borderRadius: "8px",
              }}
            >
              <input
                placeholder="Carrier (e.g. GHTK, Viettel Post)"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                required
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "0.88rem",
                }}
              />
              <input
                placeholder="Tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                required
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "0.88rem",
                }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="submit"
                  disabled={shipping}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#8e24aa",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    opacity: shipping ? 0.7 : 1,
                  }}
                >
                  {shipping ? "Shipping..." : "Confirm Shipment"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowShipForm(false)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#fff",
                    color: "#666",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {!isAdmin && order.status === "PLACED" && (
        <Link
          to={`/orders/${order.id}/payment`}
          style={{
            display: "inline-block",
            marginTop: "16px",
            padding: "10px 24px",
            backgroundColor: "#1976d2",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          Pay Now
        </Link>
      )}

      <h3
        style={{
          color: "#111",
          fontSize: "1.05rem",
          marginTop: "28px",
          marginBottom: "12px",
        }}
      >
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
              {itemsEditable ? (
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
