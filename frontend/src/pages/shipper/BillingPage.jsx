import { useEffect, useMemo, useState } from "react";
import { shipperApi } from "../../api/shipperApi";

const USD_TO_VND = 25400;

const formatMoney = (amount, currency = "VND") => {
  const value = Number(amount || 0);

  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const getOrderCurrency = (order) => {
  // If your backend later adds `currency`, this will automatically use it.
  if (order?.currency) {
    return order.currency.toUpperCase();
  }

  if (order?.payment_currency) {
    return order.payment_currency.toUpperCase();
  }

  // Your current project appears to use USD for the
  // regular order amount and VND for VNPay/COD-related values.
  return "USD";
};

const BillingPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBilling = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await shipperApi.getMyDeliveries();
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to load billing:", err);
      setError("Unable to load billing information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
  }, []);

  const completed = useMemo(
    () => orders.filter((o) => o.status === "COMPLETED"),
    [orders],
  );

  const pending = useMemo(
    () =>
      orders.filter((o) => o.status === "PROCESSING" || o.status === "SHIPPED"),
    [orders],
  );

  const failed = useMemo(
    () => orders.filter((o) => o.status === "FAILED"),
    [orders],
  );

  /*
   * Delivery fees from completed deliveries.
   *
   * IMPORTANT:
   * This is DELIVERY FEE handled through your orders,
   * not company profit.
   */
  const completedShippingFee = completed.reduce(
    (sum, order) => sum + Number(order.shipping_fee || 0),
    0,
  );

  const pendingShippingFee = pending.reduce(
    (sum, order) => sum + Number(order.shipping_fee || 0),
    0,
  );

  const failedShippingFee = failed.reduce(
    (sum, order) => sum + Number(order.shipping_fee || 0),
    0,
  );

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.loading}>Loading billing information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorBox}>
          {error}
          <button onClick={loadBilling} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Billing & Payments</h1>

          <p style={styles.subtitle}>
            Overview of delivery fees and payment activity for your assigned
            orders.
          </p>
        </div>

        <button onClick={loadBilling} style={styles.refreshButton}>
          ↻ Refresh
        </button>
      </div>

      {/* Important note */}
      <div style={styles.infoBox}>
        <span style={styles.infoIcon}>ℹ</span>

        <div>
          <strong style={styles.infoTitle}>Shipper financial summary</strong>

          <p style={styles.infoText}>
            These amounts represent delivery/payment activity associated with
            your deliveries. They are not company profit.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div style={styles.summaryGrid}>
        <div style={styles.card}>
          <div style={styles.cardIcon}>✓</div>

          <div>
            <p style={styles.cardLabel}>Completed Deliveries</p>

            <h2 style={styles.cardValue}>{completed.length}</h2>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>💰</div>

          <div>
            <p style={styles.cardLabel}>Completed Delivery Fees</p>

            <h2 style={styles.moneyValue}>
              {formatMoney(completedShippingFee)}
            </h2>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>⏳</div>

          <div>
            <p style={styles.cardLabel}>Pending Deliveries</p>

            <h2 style={styles.cardValue}>{pending.length}</h2>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>✕</div>

          <div>
            <p style={styles.cardLabel}>Failed Deliveries</p>

            <h2 style={styles.cardValue}>{failed.length}</h2>
          </div>
        </div>
      </div>

      {/* Currency note */}
      <div style={styles.currencyBox}>
        <strong>Currency:</strong> Order amounts can be displayed in their
        original currency. Do not use a fixed USD conversion for customer-facing
        totals.
      </div>

      {/* Transactions */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Delivery Transactions</h2>

            <p style={styles.sectionSubtitle}>
              Completed and pending delivery-related payments.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>💳</div>

            <h3>No billing records</h3>

            <p>
              Billing information will appear when you receive delivery
              assignments.
            </p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Shipping Fee</th>
                  <th style={styles.th}>Payment</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const currency = getOrderCurrency(order);

                  return (
                    <tr key={order.id}>
                      <td style={styles.td}>
                        <strong>#{order.id}</strong>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.status,
                            ...getStatusStyle(order.status),
                          }}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <strong>
                          {formatMoney(order.shipping_fee, currency)}
                        </strong>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.paymentStatus,
                            ...(order.payment_status === "PAID"
                              ? styles.paid
                              : styles.unpaid),
                          }}
                        >
                          {order.payment_status || "PENDING"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusStyle = (status) => {
  switch (status) {
    case "COMPLETED":
      return {
        background: "#ecfdf5",
        color: "#059669",
      };

    case "SHIPPED":
      return {
        background: "#eff6ff",
        color: "#2563eb",
      };

    case "PROCESSING":
      return {
        background: "#f5f3ff",
        color: "#7c3aed",
      };

    case "FAILED":
      return {
        background: "#fef2f2",
        color: "#dc2626",
      };

    default:
      return {
        background: "#f3f4f6",
        color: "#6b7280",
      };
  }
};

const styles = {
  page: {
    padding: "28px 32px 60px",
    minHeight: "100%",
    background: "#f8f9fc",
  },

  loading: {
    color: "#8b8fa3",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
    color: "#14162b",
    fontSize: "1.5rem",
    fontWeight: "800",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#8b8fa3",
    fontSize: "0.85rem",
  },

  refreshButton: {
    border: "1px solid #e4e6ee",
    background: "#fff",
    borderRadius: "10px",
    padding: "9px 14px",
    cursor: "pointer",
    fontWeight: "600",
  },

  infoBox: {
    display: "flex",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    marginBottom: "20px",
  },

  infoIcon: {
    fontWeight: "800",
    color: "#2563eb",
  },

  infoTitle: {
    color: "#1e40af",
    fontSize: "0.82rem",
  },

  infoText: {
    margin: "3px 0 0",
    color: "#64748b",
    fontSize: "0.76rem",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "14px",
    marginBottom: "16px",
  },

  card: {
    background: "#fff",
    border: "1px solid #eef0f5",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    gap: "13px",
    alignItems: "center",
  },

  cardIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  cardLabel: {
    margin: 0,
    color: "#8b8fa3",
    fontSize: "0.74rem",
  },

  cardValue: {
    margin: "4px 0 0",
    color: "#14162b",
    fontSize: "1.25rem",
  },

  moneyValue: {
    margin: "4px 0 0",
    color: "#059669",
    fontSize: "1.1rem",
  },

  currencyBox: {
    background: "#fff",
    border: "1px solid #eef0f5",
    borderRadius: "12px",
    padding: "12px 15px",
    color: "#64748b",
    fontSize: "0.76rem",
    marginBottom: "20px",
  },

  section: {
    background: "#fff",
    border: "1px solid #eef0f5",
    borderRadius: "16px",
    overflow: "hidden",
  },

  sectionHeader: {
    padding: "20px",
    borderBottom: "1px solid #eef0f5",
  },

  sectionTitle: {
    margin: 0,
    color: "#14162b",
    fontSize: "1rem",
    fontWeight: "800",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#8b8fa3",
    fontSize: "0.78rem",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px",
  },

  th: {
    textAlign: "left",
    padding: "12px 18px",
    color: "#8b8fa3",
    fontSize: "0.72rem",
    fontWeight: "700",
    background: "#fafbfc",
  },

  td: {
    padding: "14px 18px",
    borderTop: "1px solid #f0f1f5",
    color: "#45485c",
    fontSize: "0.78rem",
  },

  status: {
    display: "inline-block",
    padding: "5px 8px",
    borderRadius: "7px",
    fontSize: "0.65rem",
    fontWeight: "800",
  },

  paymentStatus: {
    display: "inline-block",
    padding: "5px 8px",
    borderRadius: "7px",
    fontSize: "0.65rem",
    fontWeight: "800",
  },

  paid: {
    background: "#ecfdf5",
    color: "#059669",
  },

  unpaid: {
    background: "#fff7ed",
    color: "#ea580c",
  },

  empty: {
    padding: "45px 20px",
    textAlign: "center",
    color: "#8b8fa3",
  },

  emptyIcon: {
    fontSize: "2rem",
    marginBottom: "8px",
  },

  errorBox: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "16px",
    borderRadius: "12px",
  },

  retryButton: {
    marginLeft: "10px",
    padding: "7px 12px",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
  },
};

export default BillingPage;
