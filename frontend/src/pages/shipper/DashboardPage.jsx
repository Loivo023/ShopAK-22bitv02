import { useEffect, useMemo, useState } from "react";
import { shipperApi } from "../../api/shipperApi";

const STATUS = {
  PROCESSING: {
    label: "Ready for pickup",
    color: "#f59e0b",
    background: "#fff7ed",
  },
  SHIPPED: {
    label: "Out for delivery",
    color: "#2563eb",
    background: "#eff6ff",
  },
  COMPLETED: {
    label: "Delivered",
    color: "#16a34a",
    background: "#f0fdf4",
  },
  FAILED: {
    label: "Failed",
    color: "#dc2626",
    background: "#fef2f2",
  },
};

const formatMoney = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const DashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await shipperApi.getMyDeliveries();

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load shipper dashboard:", err);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const statistics = useMemo(() => {
    const processing = orders.filter(
      (order) => order.status === "PROCESSING",
    ).length;

    const shipped = orders.filter((order) => order.status === "SHIPPED").length;

    const completed = orders.filter(
      (order) => order.status === "COMPLETED",
    ).length;

    const failed = orders.filter((order) => order.status === "FAILED").length;

    const totalCod = orders
      .filter((order) => order.status === "COMPLETED")
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

    return {
      processing,
      shipped,
      completed,
      failed,
      totalCod,
    };
  }, [orders]);

  const activeOrders = useMemo(() => {
    return orders
      .filter(
        (order) => order.status === "PROCESSING" || order.status === "SHIPPED",
      )
      .slice(0, 5);
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      })
      .slice(0, 5);
  }, [orders]);

  const totalOrders = orders.length;

  const deliveryRate =
    totalOrders > 0
      ? Math.round((statistics.completed / totalOrders) * 100)
      : 0;

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorBox}>
          <strong>Something went wrong</strong>
          <p>{error}</p>

          <button onClick={fetchDashboard} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Shipper Dashboard</h1>

          <p style={styles.subtitle}>
            Manage your deliveries and track today's performance.
          </p>
        </div>

        <button onClick={fetchDashboard} style={styles.refreshButton}>
          ↻ Refresh
        </button>
      </div>

      {/* STATISTICS */}
      <div style={styles.statsGrid}>
        <StatCard
          icon="📦"
          title="Ready for Pickup"
          value={statistics.processing}
          description="Orders waiting for pickup"
          iconBackground="#fff7ed"
          iconColor="#f59e0b"
        />

        <StatCard
          icon="🚚"
          title="Out for Delivery"
          value={statistics.shipped}
          description="Currently delivering"
          iconBackground="#eff6ff"
          iconColor="#2563eb"
        />

        <StatCard
          icon="✅"
          title="Delivered"
          value={statistics.completed}
          description="Successfully completed"
          iconBackground="#f0fdf4"
          iconColor="#16a34a"
        />

        <StatCard
          icon="❌"
          title="Failed"
          value={statistics.failed}
          description="Delivery problems"
          iconBackground="#fef2f2"
          iconColor="#dc2626"
        />
      </div>

      {/* MAIN GRID */}
      <div style={styles.mainGrid}>
        {/* ACTIVE DELIVERIES */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Active Deliveries</h2>

              <p style={styles.cardSubtitle}>
                Orders that require your attention
              </p>
            </div>

            <span style={styles.countBadge}>{activeOrders.length}</span>
          </div>

          {activeOrders.length === 0 ? (
            <EmptyState
              icon="🎉"
              title="No active deliveries"
              description="You are all caught up!"
            />
          ) : (
            <div style={styles.orderList}>
              {activeOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Quick Actions</h2>

              <p style={styles.cardSubtitle}>Common shipper tasks</p>
            </div>
          </div>

          <div style={styles.quickActions}>
            <QuickAction
              icon="📦"
              title="My Shipments"
              description="View assigned orders"
              href="/shipper/shipments"
            />

            <QuickAction
              icon="🗺️"
              title="Delivery Map"
              description="View delivery locations"
              href="/shipper/map"
            />

            <QuickAction
              icon="📊"
              title="Performance"
              description="View your statistics"
              href="/shipper/reports"
            />

            <QuickAction
              icon="🚚"
              title="Fleet"
              description="Manage your vehicle"
              href="/shipper/fleet"
            />
          </div>
        </div>
      </div>

      {/* PERFORMANCE */}
      <div style={styles.bottomGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Delivery Performance</h2>

              <p style={styles.cardSubtitle}>
                Your current delivery success rate
              </p>
            </div>

            <strong style={styles.performanceValue}>{deliveryRate}%</strong>
          </div>

          <div style={styles.progressContainer}>
            <div
              style={{
                ...styles.progressBar,
                width: `${deliveryRate}%`,
              }}
            />
          </div>

          <div style={styles.progressLabels}>
            <span>{statistics.completed} completed</span>

            <span>{totalOrders} total orders</span>
          </div>
        </div>

        {/* COD */}
        <div style={styles.card}>
          <div style={styles.codHeader}>
            <div style={styles.codIcon}>💰</div>

            <div>
              <p style={styles.codLabel}>Completed Order Value</p>

              <h2 style={styles.codValue}>
                {formatMoney(statistics.totalCod)}
              </h2>
            </div>
          </div>

          <p style={styles.codDescription}>
            Total value of successfully delivered orders.
          </p>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Recent Shipments</h2>

            <p style={styles.cardSubtitle}>Your latest delivery activity</p>
          </div>
        </div>

        {recentOrders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No shipments yet"
            description="Your assigned shipments will appear here."
          />
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order</th>
                  <th style={styles.th}>Address</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={styles.td}>
                      <strong>#{order.id}</strong>
                    </td>

                    <td style={styles.td}>
                      {order.shipping_address || "No address"}
                    </td>

                    <td style={styles.td}>{formatMoney(order.total_amount)}</td>

                    <td style={styles.td}>
                      <StatusBadge status={order.status} />
                    </td>

                    <td style={styles.td}>
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================
   COMPONENTS
========================= */

const StatCard = ({
  icon,
  title,
  value,
  description,
  iconBackground,
  iconColor,
}) => {
  return (
    <div style={styles.statCard}>
      <div
        style={{
          ...styles.statIcon,
          background: iconBackground,
          color: iconColor,
        }}
      >
        {icon}
      </div>

      <div style={styles.statContent}>
        <p style={styles.statTitle}>{title}</p>

        <h2 style={styles.statValue}>{value}</h2>

        <p style={styles.statDescription}>{description}</p>
      </div>
    </div>
  );
};

const OrderRow = ({ order }) => {
  return (
    <div style={styles.orderRow}>
      <div style={styles.orderIcon}>📦</div>

      <div style={styles.orderInfo}>
        <div style={styles.orderTop}>
          <strong>Order #{order.id}</strong>

          <StatusBadge status={order.status} />
        </div>

        <p style={styles.orderAddress}>
          📍 {order.shipping_address || "No address provided"}
        </p>

        <div style={styles.orderBottom}>
          <span>{formatMoney(order.total_amount)}</span>

          <span>{order.items?.length || 0} item(s)</span>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = STATUS[status] || {
    label: status || "Unknown",
    color: "#6b7280",
    background: "#f3f4f6",
  };

  return (
    <span
      style={{
        ...styles.statusBadge,
        color: config.color,
        background: config.background,
      }}
    >
      {config.label}
    </span>
  );
};

const QuickAction = ({ icon, title, description, href }) => {
  return (
    <a href={href} style={styles.quickAction}>
      <div style={styles.quickIcon}>{icon}</div>

      <div>
        <strong style={styles.quickTitle}>{title}</strong>

        <p style={styles.quickDescription}>{description}</p>
      </div>

      <span style={styles.arrow}>→</span>
    </a>
  );
};

const EmptyState = ({ icon, title, description }) => {
  return (
    <div style={styles.empty}>
      <div style={styles.emptyIcon}>{icon}</div>

      <strong>{title}</strong>

      <p>{description}</p>
    </div>
  );
};

/* =========================
   STYLES
========================= */

const styles = {
  page: {
    padding: "28px 32px 60px",
    background: "#f7f8fc",
    minHeight: "100%",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 800,
    color: "#14162b",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#7c8195",
    fontSize: "14px",
  },

  refreshButton: {
    border: "1px solid #e2e5ec",
    background: "#ffffff",
    color: "#4f46e5",
    borderRadius: "10px",
    padding: "10px 16px",
    fontWeight: 700,
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e8eaf0",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 4px 16px rgba(20, 22, 43, 0.04)",
  },

  statIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
  },

  statContent: {
    minWidth: 0,
  },

  statTitle: {
    margin: 0,
    color: "#7c8195",
    fontSize: "13px",
    fontWeight: 600,
  },

  statValue: {
    margin: "3px 0",
    color: "#14162b",
    fontSize: "26px",
    fontWeight: 800,
  },

  statDescription: {
    margin: 0,
    color: "#a0a4b3",
    fontSize: "11px",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.6fr) minmax(300px, 0.8fr)",
    gap: "20px",
    marginBottom: "20px",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.5fr) minmax(300px, 1fr)",
    gap: "20px",
    marginBottom: "20px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e8eaf0",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 4px 16px rgba(20, 22, 43, 0.04)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    color: "#14162b",
    fontSize: "17px",
    fontWeight: 800,
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#8b8fa3",
    fontSize: "12px",
  },

  countBadge: {
    minWidth: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 800,
  },

  orderList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  orderRow: {
    display: "flex",
    gap: "13px",
    padding: "14px",
    border: "1px solid #edf0f5",
    borderRadius: "12px",
  },

  orderIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#f3f4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  orderInfo: {
    flex: 1,
    minWidth: 0,
  },

  orderTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  orderAddress: {
    margin: "7px 0",
    color: "#6b7280",
    fontSize: "12px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  orderBottom: {
    display: "flex",
    justifyContent: "space-between",
    color: "#8b8fa3",
    fontSize: "11px",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 9px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  quickActions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  quickAction: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    border: "1px solid #edf0f5",
    borderRadius: "12px",
    textDecoration: "none",
    color: "#14162b",
    transition: "0.2s",
  },

  quickIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#f5f3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  quickTitle: {
    fontSize: "13px",
  },

  quickDescription: {
    margin: "3px 0 0",
    color: "#8b8fa3",
    fontSize: "11px",
  },

  arrow: {
    marginLeft: "auto",
    color: "#9ca3af",
    fontSize: "18px",
  },

  performanceValue: {
    color: "#16a34a",
    fontSize: "24px",
  },

  progressContainer: {
    height: "12px",
    borderRadius: "999px",
    background: "#eef0f4",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #4f46e5, #6366f1)",
    transition: "width 0.4s ease",
  },

  progressLabels: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "9px",
    color: "#8b8fa3",
    fontSize: "11px",
  },

  codHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  codIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "#ecfdf5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  codLabel: {
    margin: 0,
    color: "#8b8fa3",
    fontSize: "12px",
  },

  codValue: {
    margin: "4px 0 0",
    color: "#14162b",
    fontSize: "22px",
  },

  codDescription: {
    margin: "16px 0 0",
    color: "#8b8fa3",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
  },

  th: {
    textAlign: "left",
    padding: "11px 10px",
    borderBottom: "1px solid #e8eaf0",
    color: "#8b8fa3",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  td: {
    padding: "14px 10px",
    borderBottom: "1px solid #f0f1f5",
    color: "#4b5563",
    verticalAlign: "middle",
  },

  empty: {
    padding: "35px 20px",
    textAlign: "center",
    color: "#6b7280",
  },

  emptyIcon: {
    fontSize: "34px",
    marginBottom: "10px",
  },

  errorBox: {
    maxWidth: "500px",
    margin: "80px auto",
    padding: "25px",
    background: "#ffffff",
    border: "1px solid #fecaca",
    borderRadius: "14px",
    textAlign: "center",
    color: "#991b1b",
  },

  retryButton: {
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },

  loading: {
    minHeight: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#8b8fa3",
  },

  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #4f46e5",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "12px",
  },
};

export default DashboardPage;
