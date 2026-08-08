import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminStatsApi } from "../../api/adminStatsApi";
import axiosClient from "../../api/axiosClient";
import { formatUSD } from "../../utils/currency";

const Icon = ({ path, size = 20, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} />
  </svg>
);

const ICONS = {
  box: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",

  receipt: "M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2V2z M8 7h8 M8 11h8 M8 15h5",

  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",

  dollar: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",

  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",

  userPlus:
    "M15 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M19 8v6 M22 11h-6",

  arrow: "M5 12h14M12 5l7 7-7 7",
};

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

const StatCard = ({ label, value, iconPath, iconBg }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: "18px",
      padding: "20px 22px",
      border: "1px solid #eef0f5",
      flex: "1 1 200px",
      minWidth: "200px",
    }}
  >
    <div
      style={{
        width: "38px",
        height: "38px",
        borderRadius: "11px",
        background: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "14px",
      }}
    >
      <Icon path={iconPath} size={18} color="#fff" />
    </div>

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
        margin: "6px 0 0",
        fontSize: "1.5rem",
        fontWeight: "800",
        color: "#14162b",
      }}
    >
      {value}
    </p>
  </div>
);

const AdminDashboardPage = () => {
  const [overview, setOverview] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [overviewData, ordersRes] = await Promise.all([
          adminStatsApi.getOverview(),
          axiosClient.get("/orders/admin/all"),
        ]);

        setOverview(overviewData);
        setRecentOrders(ordersRes.data.slice(0, 6));
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "12px",
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
            Welcome back 👋
          </h1>

          <p
            style={{
              margin: "4px 0 0",
              color: "#8b8fa3",
              fontSize: "0.9rem",
            }}
          >
            Here's a quick summary of your store.
          </p>
        </div>

        <Link
          to="/admin/analytics"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 20px",
            borderRadius: "10px",
            backgroundColor: "#4f46e5",
            color: "#fff",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: "700",
          }}
        >
          View Full Analytics
          <Icon path={ICONS.arrow} size={14} />
        </Link>
      </div>

      {/* LOADING */}
      {loading && <p style={{ color: "#8b8fa3" }}>Loading dashboard...</p>}

      {/* ERROR */}
      {!loading && error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "20px",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* DASHBOARD */}
      {!loading && !error && overview && (
        <>
          {/* STAT CARDS */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "28px",
            }}
          >
            <StatCard
              label="Total Revenue"
              value={formatUSD(overview.total_revenue)}
              iconPath={ICONS.dollar}
              iconBg="linear-gradient(135deg,#34d399,#059669)"
            />

            <StatCard
              label="Total Orders"
              value={overview.total_orders}
              iconPath={ICONS.receipt}
              iconBg="linear-gradient(135deg,#c084fc,#9333ea)"
            />

            <StatCard
              label="Pending Orders"
              value={overview.pending_orders}
              iconPath={ICONS.clock}
              iconBg="linear-gradient(135deg,#fbbf24,#d97706)"
            />

            <StatCard
              label="Total Products"
              value={overview.total_products}
              iconPath={ICONS.box}
              iconBg="linear-gradient(135deg,#60a5fa,#2563eb)"
            />

            <StatCard
              label="Total Users"
              value={overview.total_users}
              iconPath={ICONS.users}
              iconBg="linear-gradient(135deg,#a78bfa,#7c3aed)"
            />

            <StatCard
              label="New Users · 30 Days"
              value={overview.new_users_30d}
              iconPath={ICONS.userPlus}
              iconBg="linear-gradient(135deg,#fb7185,#e11d48)"
            />
          </div>

          {/* RECENT ORDERS */}
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              border: "1px solid #eef0f5",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "#14162b",
                    fontSize: "1.02rem",
                    fontWeight: "700",
                  }}
                >
                  Recent Orders
                </h3>

                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#a0a3b5",
                    fontSize: "0.78rem",
                  }}
                >
                  Latest orders across your entire store
                </p>
              </div>

              <Link
                to="/admin/orders"
                style={{
                  fontSize: "0.82rem",
                  color: "#4f46e5",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                View All →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#a0a3b5",
                }}
              >
                No orders yet.
              </div>
            ) : (
              recentOrders.map((o, idx) => {
                const meta = STATUS_META[o.status] || {
                  color: "#8b8fa3",
                  bg: "#f1f2f6",
                };

                return (
                  <div
                    key={o.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "14px",
                      padding: "12px 0",
                      borderBottom:
                        idx === recentOrders.length - 1
                          ? "none"
                          : "1px solid #f0f1f5",
                      flexWrap: "wrap",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: "700",
                        color: "#14162b",
                        minWidth: "70px",
                      }}
                    >
                      #{o.id}
                    </p>

                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        padding: "3px 12px",
                        borderRadius: "20px",
                        backgroundColor: meta.bg,
                        color: meta.color,
                      }}
                    >
                      {o.status}
                    </span>

                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "#8b8fa3",
                      }}
                    >
                      {o.payment_status || "PENDING"}
                    </span>

                    <p
                      style={{
                        margin: 0,
                        fontWeight: "700",
                        color: "#4f46e5",
                      }}
                    >
                      {formatUSD(o.total_amount)}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.8rem",
                        color: "#a0a3b5",
                      }}
                    >
                      {new Date(o.created_at).toLocaleDateString()}
                    </p>

                    <Link
                      to={`/admin/orders/${o.id}`}
                      style={{
                        fontSize: "0.76rem",
                        fontWeight: "600",
                        color: "#4f46e5",
                        textDecoration: "none",
                      }}
                    >
                      Manage
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
