import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { formatUSD } from "../../utils/currency";

const STATUS_META = {
  PLACED: {
    color: "#8b8fa3",
    bg: "#f1f2f6",
  },
  PROCESSING: {
    color: "#d97706",
    bg: "#fef3c7",
  },
  SHIPPED: {
    color: "#7c3aed",
    bg: "#ede9fe",
  },
  COMPLETED: {
    color: "#16a34a",
    bg: "#dcfce7",
  },
  CANCELED: {
    color: "#dc2626",
    bg: "#fee2e2",
  },
  FAILED: {
    color: "#dc2626",
    bg: "#fee2e2",
  },
};

const ShipperAdminViewPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axiosClient.get("/shipper/my-deliveries");

      const data = Array.isArray(response.data) ? response.data : [];

      setOrders(data);
    } catch (err) {
      console.error("Failed to load shipper admin view:", err);

      setError(
        err?.response?.data?.detail || "Failed to load shipment information.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const total = orders.length;

  const pending = orders.filter(
    (o) => o.status === "PLACED" || o.status === "PROCESSING",
  ).length;

  const shipped = orders.filter((o) => o.status === "SHIPPED").length;

  const completed = orders.filter((o) => o.status === "COMPLETED").length;

  const failed = orders.filter(
    (o) => o.status === "FAILED" || o.status === "CANCELED",
  ).length;

  const totalValue = orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0,
  );

  return (
    <div
      style={{
        padding: "28px 32px 60px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "26px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: "800",
              color: "#14162b",
            }}
          >
            Admin View
          </h1>

          <p
            style={{
              margin: "5px 0 0",
              color: "#8b8fa3",
              fontSize: "0.9rem",
            }}
          >
            Overview of your shipping operations and delivery performance.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          style={{
            border: "1px solid #e4e6ee",
            background: "#fff",
            borderRadius: "10px",
            padding: "9px 16px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "700",
            color: "#4f46e5",
            opacity: loading ? 0.6 : 1,
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Statistics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <StatCard label="Total Deliveries" value={total} icon="📦" />

        <StatCard label="Pending" value={pending} icon="⏳" />

        <StatCard label="Shipped" value={shipped} icon="🚚" />

        <StatCard label="Completed" value={completed} icon="✓" />

        <StatCard label="Failed / Canceled" value={failed} icon="!" />

        <StatCard
          label="Delivery Value"
          value={formatUSD(totalValue)}
          icon="$"
        />
      </div>

      {/* Main shipment overview */}
      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          border: "1px solid #eef0f5",
          overflow: "hidden",
        }}
      >
        {/* Section header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #eef0f5",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#14162b",
              fontSize: "1.05rem",
              fontWeight: "800",
            }}
          >
            Shipment Overview
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#a0a3b5",
              fontSize: "0.8rem",
            }}
          >
            Orders currently assigned to your shipping account.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#8b8fa3",
            }}
          >
            Loading shipments...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0 0 14px",
                color: "#dc2626",
                fontWeight: "600",
              }}
            >
              {error}
            </p>

            <button
              onClick={fetchOrders}
              style={{
                border: "none",
                background: "#4f46e5",
                color: "#fff",
                borderRadius: "8px",
                padding: "9px 16px",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "2rem",
                marginBottom: "10px",
              }}
            >
              📦
            </div>

            <h3
              style={{
                margin: "0 0 6px",
                color: "#14162b",
              }}
            >
              No deliveries yet
            </h3>

            <p
              style={{
                margin: 0,
                color: "#a0a3b5",
                fontSize: "0.85rem",
              }}
            >
              Orders assigned to you will appear here.
            </p>
          </div>
        )}

        {/* Orders */}
        {!loading && !error && orders.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "850px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#fafbfc",
                    borderBottom: "1px solid #eef0f5",
                  }}
                >
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Status</Th>
                  <Th>Amount</Th>
                  <Th>Shipping</Th>
                  <Th>Created</Th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const meta = STATUS_META[order.status] || {
                    color: "#8b8fa3",
                    bg: "#f1f2f6",
                  };

                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: "1px solid #f0f1f5",
                      }}
                    >
                      {/* Order */}
                      <td style={tdStyle}>
                        <strong
                          style={{
                            color: "#14162b",
                          }}
                        >
                          #{order.id}
                        </strong>
                      </td>

                      {/* Customer */}
                      <td style={tdStyle}>
                        <div>
                          <div
                            style={{
                              fontWeight: "700",
                              color: "#14162b",
                            }}
                          >
                            {order.customer_name || `User #${order.user_id}`}
                          </div>

                          {order.customer_email && (
                            <div
                              style={{
                                marginTop: "3px",
                                fontSize: "0.74rem",
                                color: "#a0a3b5",
                              }}
                            >
                              {order.customer_email}
                            </div>
                          )}

                          {order.customer_phone && (
                            <div
                              style={{
                                marginTop: "2px",
                                fontSize: "0.74rem",
                                color: "#a0a3b5",
                              }}
                            >
                              {order.customer_phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "5px 11px",
                            borderRadius: "20px",
                            backgroundColor: meta.bg,
                            color: meta.color,
                            fontSize: "0.72rem",
                            fontWeight: "700",
                          }}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Amount */}
                      <td style={tdStyle}>
                        <strong
                          style={{
                            color: "#4f46e5",
                          }}
                        >
                          {formatUSD(order.total_amount || 0)}
                        </strong>
                      </td>

                      {/* Shipping */}
                      <td style={tdStyle}>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#475569",
                            fontWeight: "600",
                          }}
                        >
                          {order.shipping_provider || "IN_HOUSE"}
                        </div>

                        {order.tracking_number && (
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "#a0a3b5",
                              marginTop: "3px",
                            }}
                          >
                            {order.tracking_number}
                          </div>
                        )}

                        {order.carrier && (
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "#a0a3b5",
                              marginTop: "2px",
                            }}
                          >
                            {order.carrier}
                          </div>
                        )}
                      </td>

                      {/* Created */}
                      <td style={tdStyle}>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            color: "#8b8fa3",
                          }}
                        >
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString()
                            : "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Information card */}
      <div
        style={{
          marginTop: "20px",
          background: "linear-gradient(135deg, #eef2ff, #f5f3ff)",
          borderRadius: "16px",
          border: "1px solid #e0e7ff",
          padding: "18px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "#4f46e5",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontWeight: "800",
            }}
          >
            i
          </div>

          <div>
            <h3
              style={{
                margin: "0 0 4px",
                color: "#312e81",
                fontSize: "0.9rem",
              }}
            >
              Shipper information
            </h3>

            <p
              style={{
                margin: 0,
                color: "#6366a0",
                fontSize: "0.8rem",
                lineHeight: 1.5,
              }}
            >
              This page provides an overview of deliveries assigned to your
              account. Customer and shipment information shown here is limited
              to what is required for delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================
   STAT CARD
========================= */

const StatCard = ({ label, value, icon }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: "16px",
      border: "1px solid #eef0f5",
      padding: "18px",
      minHeight: "90px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "11px",
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1rem",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <p
          style={{
            margin: 0,
            color: "#8b8fa3",
            fontSize: "0.75rem",
            fontWeight: "600",
          }}
        >
          {label}
        </p>

        <p
          style={{
            margin: "5px 0 0",
            color: "#14162b",
            fontSize: "1.25rem",
            fontWeight: "800",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  </div>
);

/* =========================
   TABLE HEADER
========================= */

const Th = ({ children }) => (
  <th
    style={{
      padding: "12px 18px",
      textAlign: "left",
      color: "#8b8fa3",
      fontSize: "0.72rem",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.4px",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </th>
);

const tdStyle = {
  padding: "14px 18px",
  color: "#475569",
  fontSize: "0.84rem",
  verticalAlign: "middle",
};

export default ShipperAdminViewPage;
