import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { adminStatsApi } from "../../api/adminStatsApi";
import { formatUSD } from "../../utils/currency";

const AdminBillingPage = () => {
  const [overview, setOverview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewData, ordersRes] = await Promise.all([
          adminStatsApi.getOverview(),
          axiosClient.get("/orders/admin/all"),
        ]);

        setOverview(overviewData);
        setOrders(ordersRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <p style={{ padding: "28px", color: "#8b8fa3" }}>Loading billing...</p>
    );
  }

  const completedOrders = orders.filter((o) => o.status === "COMPLETED");

  const completedRevenue = completedOrders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0,
  );

  const pendingRevenue = orders
    .filter((o) => o.status !== "CANCELED" && o.status !== "FAILED")
    .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      <h1
        style={{
          margin: "0 0 4px",
          fontSize: "1.5rem",
          fontWeight: "800",
          color: "#14162b",
        }}
      >
        Billing & Payments
      </h1>

      <p
        style={{
          margin: "0 0 24px",
          color: "#8b8fa3",
          fontSize: "0.9rem",
        }}
      >
        Store-wide revenue and completed order payments.
      </p>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "22px",
        }}
      >
        <BillingCard
          label="Total Revenue"
          value={formatUSD(overview?.total_revenue || 0)}
          color="#4f46e5"
        />

        <BillingCard
          label="Completed Revenue"
          value={formatUSD(completedRevenue)}
          color="#16a34a"
        />

        <BillingCard
          label="Active Order Value"
          value={formatUSD(pendingRevenue)}
          color="#d97706"
        />

        <BillingCard
          label="Completed Orders"
          value={completedOrders.length}
          color="#7c3aed"
        />
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          border: "1px solid #eef0f5",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "20px" }}>
          <h3
            style={{
              margin: 0,
              color: "#14162b",
              fontSize: "1.02rem",
            }}
          >
            Recent Payments
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
                {["Order", "Status", "Payment", "Amount", "Date"].map(
                  (heading) => (
                    <th key={heading} style={thStyle}>
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {orders.slice(0, 15).map((order) => (
                <tr
                  key={order.id}
                  style={{
                    borderTop: "1px solid #f0f1f5",
                  }}
                >
                  <td style={tdStyle}>
                    <strong>#{order.id}</strong>
                  </td>

                  <td style={tdStyle}>
                    <Status status={order.status} />
                  </td>

                  <td style={tdStyle}>{order.payment_status || "PENDING"}</td>

                  <td
                    style={{
                      ...tdStyle,
                      fontWeight: "700",
                      color: "#4f46e5",
                    }}
                  >
                    {formatUSD(order.total_amount || 0)}
                  </td>

                  <td style={tdStyle}>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#a0a3b5",
                    }}
                  >
                    No payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const BillingCard = ({ label, value, color }) => (
  <div
    style={{
      flex: "1 1 200px",
      background: "#fff",
      borderRadius: "16px",
      border: "1px solid #eef0f5",
      padding: "20px",
    }}
  >
    <p
      style={{
        margin: 0,
        color: "#8b8fa3",
        fontSize: "0.78rem",
        fontWeight: "600",
      }}
    >
      {label}
    </p>

    <p
      style={{
        margin: "7px 0 0",
        color,
        fontSize: "1.45rem",
        fontWeight: "800",
      }}
    >
      {value}
    </p>
  </div>
);

const Status = ({ status }) => {
  const meta = {
    COMPLETED: ["#16a34a", "#dcfce7"],
    CANCELED: ["#dc2626", "#fee2e2"],
    FAILED: ["#dc2626", "#fee2e2"],
    PROCESSING: ["#d97706", "#fef3c7"],
    SHIPPED: ["#7c3aed", "#ede9fe"],
    PLACED: ["#8b8fa3", "#f1f2f6"],
  }[status] || ["#8b8fa3", "#f1f2f6"];

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "0.7rem",
        fontWeight: "700",
        color: meta[0],
        background: meta[1],
      }}
    >
      {status}
    </span>
  );
};

const thStyle = {
  textAlign: "left",
  padding: "12px 20px",
  fontSize: "0.72rem",
  fontWeight: "700",
  color: "#a0a3b5",
  textTransform: "uppercase",
};

const tdStyle = {
  padding: "14px 20px",
  fontSize: "0.82rem",
  color: "#5c5f78",
};

export default AdminBillingPage;
