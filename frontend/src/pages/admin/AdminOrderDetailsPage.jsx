import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { formatUSD } from "../../utils/currency";

const STATUS_META = {
  PLACED: { color: "#8b8fa3", bg: "#f1f2f6" },
  PROCESSING: { color: "#d97706", bg: "#fef3c7" },
  SHIPPED: { color: "#7c3aed", bg: "#ede9fe" },
  COMPLETED: { color: "#16a34a", bg: "#dcfce7" },
  CANCELED: { color: "#dc2626", bg: "#fee2e2" },
  FAILED: { color: "#dc2626", bg: "#fee2e2" },
};

const AdminOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newStatus, setNewStatus] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const [savingStatus, setSavingStatus] = useState(false);
  const [shipping, setShipping] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosClient.get(`/orders/${id}`);
      setOrder(res.data);
      setNewStatus(res.data.status);
      setCarrier(res.data.carrier || "");
      setTrackingNumber(res.data.tracking_number || "");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Failed to load order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const updateStatus = async () => {
    if (!newStatus || newStatus === order.status) return;

    try {
      setSavingStatus(true);

      const res = await axiosClient.patch(`/orders/${id}/status`, {
        status: newStatus,
      });

      setOrder(res.data);
      alert("Order status updated.");
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to update order status.");
    } finally {
      setSavingStatus(false);
    }
  };

  const shipOrder = async () => {
    if (!carrier.trim() || !trackingNumber.trim()) {
      alert("Please enter carrier and tracking number.");
      return;
    }

    try {
      setShipping(true);

      const res = await axiosClient.post(`/orders/${id}/ship`, {
        carrier: carrier.trim(),
        tracking_number: trackingNumber.trim(),
      });

      setOrder(res.data);
      setNewStatus(res.data.status);

      alert("Order marked as shipped.");
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to ship order.");
    } finally {
      setShipping(false);
    }
  };

  if (loading) {
    return (
      <p style={{ padding: "28px", color: "#8b8fa3" }}>Loading order...</p>
    );
  }

  if (error || !order) {
    return (
      <div style={{ padding: "28px 32px" }}>
        <Link
          to="/admin/orders"
          style={{
            color: "#4f46e5",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          ← Back to Orders
        </Link>

        <p style={{ color: "#dc2626", marginTop: "20px" }}>
          {error || "Order not found."}
        </p>
      </div>
    );
  }

  const meta = STATUS_META[order.status] || {
    color: "#8b8fa3",
    bg: "#f1f2f6",
  };

  const canShip = order.status === "PROCESSING";

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div>
          <Link
            to="/admin/orders"
            style={{
              color: "#4f46e5",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: "600",
            }}
          >
            ← Back to Orders
          </Link>

          <h1
            style={{
              margin: "10px 0 4px",
              fontSize: "1.5rem",
              fontWeight: "800",
              color: "#14162b",
            }}
          >
            Order #{order.id}
          </h1>

          <p
            style={{
              margin: 0,
              color: "#8b8fa3",
              fontSize: "0.85rem",
            }}
          >
            Created {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <span
          style={{
            padding: "7px 16px",
            borderRadius: "20px",
            backgroundColor: meta.bg,
            color: meta.color,
            fontSize: "0.8rem",
            fontWeight: "700",
          }}
        >
          {order.status}
        </span>
      </div>

      {/* Customer + Shipper */}

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "18px",
        }}
      >
        <InfoCard
          title="Customer"
          rows={[
            ["Name", order.customer_name || `User #${order.user_id}`],
            ["Email", order.customer_email || "—"],
            ["Phone", order.customer_phone || "—"],
          ]}
        />

        <InfoCard
          title="Shipper"
          rows={[
            ["Name", order.shipper_name || "Not assigned"],
            ["Email", order.shipper_email || "—"],
            ["Phone", order.shipper_phone || "—"],
          ]}
        />
      </div>

      {/* Shipping */}

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #eef0f5",
          padding: "22px",
          marginBottom: "18px",
        }}
      >
        <h3
          style={{
            margin: "0 0 16px",
            color: "#14162b",
            fontSize: "1rem",
          }}
        >
          Shipping Information
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          <InfoItem
            label="Provider"
            value={order.shipping_provider || "IN_HOUSE"}
          />

          <InfoItem label="Address" value={order.shipping_address || "—"} />

          <InfoItem label="Carrier" value={order.carrier || "—"} />

          <InfoItem
            label="Tracking Number"
            value={order.tracking_number || order.tracking_code || "—"}
          />
        </div>
      </div>

      {/* Products */}

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #eef0f5",
          overflow: "hidden",
          marginBottom: "18px",
        }}
      >
        <div style={{ padding: "20px" }}>
          <h3
            style={{
              margin: 0,
              color: "#14162b",
              fontSize: "1rem",
            }}
          >
            Order Items
          </h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#fafbfc" }}>
                {["Product", "Price", "Quantity", "Total"].map((title) => (
                  <th
                    key={title}
                    style={{
                      textAlign: "left",
                      padding: "12px 20px",
                      fontSize: "0.72rem",
                      color: "#a0a3b5",
                      textTransform: "uppercase",
                    }}
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {(order.items || []).map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderTop: "1px solid #f0f1f5",
                  }}
                >
                  <td
                    style={{
                      padding: "14px 20px",
                      fontWeight: "600",
                      color: "#14162b",
                    }}
                  >
                    {item.product_name}
                  </td>

                  <td
                    style={{
                      padding: "14px 20px",
                      color: "#5c5f78",
                    }}
                  >
                    {formatUSD(item.product_price)}
                  </td>

                  <td
                    style={{
                      padding: "14px 20px",
                      color: "#5c5f78",
                    }}
                  >
                    {item.quantity}
                  </td>

                  <td
                    style={{
                      padding: "14px 20px",
                      fontWeight: "700",
                      color: "#4f46e5",
                    }}
                  >
                    {formatUSD(item.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            borderTop: "1px solid #f0f1f5",
            padding: "18px 20px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ minWidth: "220px" }}>
            <SummaryRow
              label="Shipping fee"
              value={formatUSD(order.shipping_fee || 0)}
            />

            <SummaryRow
              label="Total"
              value={formatUSD(order.total_amount)}
              bold
            />
          </div>
        </div>
      </div>

      {/* Payment */}

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #eef0f5",
          padding: "22px",
          marginBottom: "18px",
        }}
      >
        <h3
          style={{
            margin: "0 0 16px",
            color: "#14162b",
            fontSize: "1rem",
          }}
        >
          Payment
        </h3>

        <div
          style={{
            display: "flex",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
          <InfoItem
            label="Payment Status"
            value={order.payment_status || "PENDING"}
          />

          <InfoItem
            label="Payment Provider"
            value={order.payment_provider || "—"}
          />
        </div>
      </div>

      {/* Admin Controls */}

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #eef0f5",
          padding: "22px",
        }}
      >
        <h3
          style={{
            margin: "0 0 18px",
            color: "#14162b",
            fontSize: "1rem",
          }}
        >
          Order Management
        </h3>

        {/* Status */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "22px",
          }}
        >
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            style={inputStyle}
          >
            <option value="PLACED">PLACED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELED">CANCELED</option>
            <option value="FAILED">FAILED</option>
          </select>

          <button
            onClick={updateStatus}
            disabled={savingStatus || newStatus === order.status}
            style={buttonStyle(
              "#14162b",
              savingStatus || newStatus === order.status,
            )}
          >
            {savingStatus ? "Saving..." : "Update Status"}
          </button>
        </div>

        {/* Ship */}

        {canShip && (
          <div
            style={{
              borderTop: "1px solid #f0f1f5",
              paddingTop: "20px",
            }}
          >
            <p
              style={{
                margin: "0 0 12px",
                color: "#5c5f78",
                fontSize: "0.85rem",
                fontWeight: "600",
              }}
            >
              Shipping Details
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <input
                placeholder="Carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                style={inputStyle}
              />

              <input
                placeholder="Tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                style={inputStyle}
              />

              <button
                onClick={shipOrder}
                disabled={shipping}
                style={buttonStyle("#4f46e5", shipping)}
              >
                {shipping ? "Shipping..." : "Mark as Shipped"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoCard = ({ title, rows }) => (
  <div
    style={{
      flex: "1 1 320px",
      background: "#fff",
      borderRadius: "16px",
      border: "1px solid #eef0f5",
      padding: "20px",
    }}
  >
    <h3
      style={{
        margin: "0 0 16px",
        fontSize: "1rem",
        color: "#14162b",
      }}
    >
      {title}
    </h3>

    {rows.map(([label, value]) => (
      <div
        key={label}
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "15px",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            color: "#a0a3b5",
            fontSize: "0.8rem",
          }}
        >
          {label}
        </span>

        <span
          style={{
            color: "#5c5f78",
            fontSize: "0.82rem",
            fontWeight: "600",
            textAlign: "right",
          }}
        >
          {value}
        </span>
      </div>
    ))}
  </div>
);

const InfoItem = ({ label, value }) => (
  <div>
    <p
      style={{
        margin: "0 0 4px",
        color: "#a0a3b5",
        fontSize: "0.72rem",
      }}
    >
      {label}
    </p>

    <p
      style={{
        margin: 0,
        color: "#5c5f78",
        fontSize: "0.85rem",
        fontWeight: "600",
      }}
    >
      {value}
    </p>
  </div>
);

const SummaryRow = ({ label, value, bold = false }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "6px 0",
      fontWeight: bold ? "800" : "500",
      color: bold ? "#14162b" : "#8b8fa3",
      fontSize: bold ? "1rem" : "0.82rem",
    }}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const inputStyle = {
  padding: "9px 12px",
  borderRadius: "9px",
  border: "1px solid #e4e6ee",
  fontSize: "0.82rem",
  outline: "none",
  minWidth: "180px",
};

const buttonStyle = (background, disabled = false) => ({
  padding: "9px 16px",
  borderRadius: "9px",
  border: "none",
  background,
  color: "#fff",
  fontSize: "0.82rem",
  fontWeight: "700",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.5 : 1,
});

export default AdminOrderDetailsPage;
