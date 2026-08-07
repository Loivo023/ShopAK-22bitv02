import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ordersApi } from "../api/ordersApi";
import { useAuth } from "../auth/useAuth";
import { formatUSD, formatVND } from "../utils/currency";
import RouteProgress from "../Components/RouteProgress";

const STATUS_META = {
  PLACED: { color: "#8a8378", bg: "#f0e4d8", label: "Placed" },
  PROCESSING: { color: "#b8863f", bg: "#f5ecd8", label: "Processing" },
  SHIPPED: { color: "#7a6bb0", bg: "#ece8f5", label: "Shipped" },
  COMPLETED: { color: "#5a7d5a", bg: "#eaf1ea", label: "Completed" },
  CANCELED: { color: "#c14f2f", bg: "#fdf0eb", label: "Canceled" },
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
        <p style={{ fontFamily: "Georgia, serif" }}>Loading order...</p>
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
  if (!order) return null;

  const meta = STATUS_META[order.status] || {
    color: "#5c574d",
    bg: "#ece6dc",
    label: order.status,
  };
  const itemsEditable =
    isAdmin && EDITABLE_ITEM_STATUSES.includes(order.status);
  const nextOptions = NEXT_STATUS_OPTIONS[order.status] || [];
  <RouteProgress status={order.status} />;

  return (
    <div style={{ backgroundColor: "#faf7f2", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "48px 32px 90px",
        }}
      >
        <Link
          to={isAdmin ? "/admin/orders" : "/orders"}
          style={{
            color: "#8a8378",
            textDecoration: "none",
            fontSize: "0.85rem",
          }}
        >
          ← Back to Orders
        </Link>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginTop: "18px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "2rem",
                fontWeight: "400",
                color: "#2b2825",
                margin: 0,
              }}
            >
              Order #{order.id}
            </h1>
            <p
              style={{
                color: "#a39c8f",
                fontSize: "0.85rem",
                margin: "6px 0 0",
              }}
            >
              {new Date(order.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <span
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: "0.82rem",
              fontWeight: "600",
              color: meta.color,
              backgroundColor: meta.bg,
            }}
          >
            {meta.label}
          </span>
        </div>

        {(order.status === "COMPLETED" || order.status === "CANCELED") && (
          <div
            style={{
              marginTop: "18px",
              padding: "12px 18px",
              borderRadius: "14px",
              backgroundColor: "#f0e4d8",
              color: "#8a8378",
              fontSize: "0.84rem",
            }}
          >
            🔒 This order is {order.status.toLowerCase()} and can no longer be
            modified.
          </div>
        )}

        {order.shipping_provider === "GHN" && order.tracking_code ? (
          <p style={{ fontSize: "0.86rem", color: "#5c574d" }}>
            Mã vận đơn GHN:{" "}
            <a
              href={`https://tracking.ghn.vn/?b=${order.tracking_code}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#c1662f" }}
            >
              {order.tracking_code}
            </a>
          </p>
        ) : (
          <p style={{ fontSize: "0.86rem", color: "#5c574d" }}>
            Shipping provider: ShopAK
          </p>
        )}

        {order.tracking_number && (
          <div
            style={{
              marginTop: "18px",
              padding: "20px",
              borderRadius: "18px",
              border: "1px solid #ece6dc",
              backgroundColor: "#fff",
            }}
          >
            <p
              style={{
                margin: "0 0 12px",
                fontWeight: "600",
                color: "#2b2825",
                fontSize: "0.9rem",
              }}
            >
              📦 Shipping Info
            </p>
            <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
              <div>
                <p style={{ margin: 0, color: "#a39c8f", fontSize: "0.76rem" }}>
                  Carrier
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    color: "#2b2825",
                    fontWeight: "500",
                  }}
                >
                  {order.carrier}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, color: "#a39c8f", fontSize: "0.76rem" }}>
                  Tracking Number
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    color: "#2b2825",
                    fontWeight: "500",
                  }}
                >
                  {order.tracking_number}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, color: "#a39c8f", fontSize: "0.76rem" }}>
                  Shipped At
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    color: "#2b2825",
                    fontWeight: "500",
                  }}
                >
                  {order.shipped_at
                    ? new Date(order.shipped_at).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {order.shipping_address && (
          <p
            style={{ marginTop: "16px", fontSize: "0.86rem", color: "#5c574d" }}
          >
            <strong style={{ color: "#2b2825" }}>Ship to:</strong>{" "}
            {order.shipping_address}
          </p>
        )}

        <div style={{ marginTop: "20px" }}>
          <p
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#c1662f",
            }}
          >
            {formatUSD(order.total_amount)}
          </p>
          <p
            style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#a39c8f" }}
          >
            {formatVND(order.total_amount)}
          </p>
        </div>

        {isAdmin && (
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              borderRadius: "18px",
              border: "1px solid #ece6dc",
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: "600",
                color: "#2b2825",
                fontSize: "0.9rem",
              }}
            >
              Admin Actions
            </p>

            {actionError && (
              <div
                style={{
                  padding: "10px 14px",
                  backgroundColor: "#fdf0eb",
                  borderRadius: "12px",
                  color: "#c14f2f",
                  fontSize: "0.84rem",
                }}
              >
                {actionError}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {order.status === "PROCESSING" && !showShipForm && (
                <button
                  onClick={() => setShowShipForm(true)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#7a6bb0",
                    color: "#fff",
                    border: "none",
                    borderRadius: "30px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
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
                    padding: "10px 20px",
                    borderRadius: "30px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    backgroundColor:
                      s === "CANCELED"
                        ? "transparent"
                        : STATUS_META[s]?.color || "#2b2825",
                    color: s === "CANCELED" ? "#c14f2f" : "#fff",
                    border: s === "CANCELED" ? "1px solid #c14f2f" : "none",
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
                  padding: "16px",
                  backgroundColor: "#ece8f5",
                  borderRadius: "14px",
                }}
              >
                <input
                  placeholder="Carrier (e.g. GHTK, Viettel Post)"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  required
                  style={{
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "1px solid #ece6dc",
                    fontSize: "0.85rem",
                  }}
                />
                <input
                  placeholder="Tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  required
                  style={{
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "1px solid #ece6dc",
                    fontSize: "0.85rem",
                  }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="submit"
                    disabled={shipping}
                    style={{
                      padding: "9px 18px",
                      backgroundColor: "#7a6bb0",
                      color: "#fff",
                      border: "none",
                      borderRadius: "30px",
                      cursor: "pointer",
                      fontSize: "0.82rem",
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
                      padding: "9px 18px",
                      backgroundColor: "#fff",
                      color: "#5c574d",
                      border: "1px solid #ece6dc",
                      borderRadius: "30px",
                      cursor: "pointer",
                      fontSize: "0.82rem",
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
              marginTop: "20px",
              padding: "13px 30px",
              backgroundColor: "#2b2825",
              color: "#faf7f2",
              borderRadius: "30px",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: "0.88rem",
            }}
          >
            Pay Now
          </Link>
        )}

        <h3
          style={{
            fontFamily: "Georgia, serif",
            fontWeight: "400",
            color: "#2b2825",
            fontSize: "1.15rem",
            marginTop: "36px",
            marginBottom: "16px",
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
                backgroundColor: "#fff",
                borderRadius: "14px",
                padding: "14px 18px",
                border: "1px solid #ece6dc",
              }}
            >
              <p
                style={{
                  margin: 0,
                  flex: 1,
                  color: "#2b2825",
                  fontSize: "0.9rem",
                }}
              >
                {item.product_name}
              </p>
              <p
                style={{
                  margin: 0,
                  width: "90px",
                  textAlign: "center",
                  color: "#a39c8f",
                  fontSize: "0.85rem",
                }}
              >
                {formatUSD(item.product_price)}
              </p>

              <div style={{ width: "100px", textAlign: "center" }}>
                {itemsEditable ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={() =>
                        handleAdminUpdateQuantity(item.id, item.quantity - 1)
                      }
                      style={{
                        width: "26px",
                        height: "26px",
                        border: "1px solid #ece6dc",
                        borderRadius: "50%",
                        backgroundColor: "#fff",
                        color: "#2b2825",
                        cursor: "pointer",
                      }}
                    >
                      −
                    </button>
                    <span style={{ color: "#2b2825" }}>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleAdminUpdateQuantity(item.id, item.quantity + 1)
                      }
                      style={{
                        width: "26px",
                        height: "26px",
                        border: "1px solid #ece6dc",
                        borderRadius: "50%",
                        backgroundColor: "#fff",
                        color: "#2b2825",
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span style={{ color: "#a39c8f", fontSize: "0.85rem" }}>
                    {item.quantity}
                  </span>
                )}
              </div>

              <p
                style={{
                  margin: 0,
                  width: "90px",
                  textAlign: "right",
                  fontWeight: "600",
                  color: "#2b2825",
                  fontSize: "0.9rem",
                }}
              >
                {formatUSD(item.line_total)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
