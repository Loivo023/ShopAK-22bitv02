import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { adminStatsApi } from "../api/adminStatsApi";

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
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
  spark:
    "M12 3v3m0 12v3m9-9h-3M6 12H3m14.14-6.14-2.12 2.12M8.98 15.02l-2.12 2.12m10.28 0-2.12-2.12M8.98 8.98 6.86 6.86",
  trendUp: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  dollar: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
};

const RANGE_OPTIONS = [
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "12M", months: 12 },
];

const shimmer = {
  background: "linear-gradient(90deg, #eef0f5 25%, #e4e6ee 37%, #eef0f5 63%)",
  backgroundSize: "400% 100%",
  animation: "shimmer 1.4s ease infinite",
};

const StatCard = ({ label, value, iconPath, iconBg, trend }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: "18px",
      padding: "20px 22px",
      border: "1px solid #eef0f5",
      boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
      flex: "1 1 180px",
      minWidth: "180px",
      transition: "transform 0.18s ease, box-shadow 0.18s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = "0 10px 24px rgba(16,24,40,0.07)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 1px 2px rgba(16,24,40,0.03)";
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
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "8px",
        marginTop: "6px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "1.55rem",
          fontWeight: "800",
          color: "#14162b",
        }}
      >
        {value}
      </p>
      {trend && (
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: "700",
            color: "#16a34a",
            display: "flex",
            alignItems: "center",
            gap: "2px",
          }}
        >
          <Icon path={ICONS.trendUp} size={12} color="#16a34a" /> {trend}
        </span>
      )}
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState({ months: [], revenues: [] });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rangeMonths, setRangeMonths] = useState(12);

  const fetchAll = async (months) => {
    setLoading(true);
    setError("");
    try {
      const to = new Date();
      const from = new Date();
      from.setMonth(from.getMonth() - months);

      const [overviewData, monthlyData, topProductsData] = await Promise.all([
        adminStatsApi.getOverview(),
        adminStatsApi.getMonthlyRevenue(
          from.toISOString().slice(0, 10),
          to.toISOString().slice(0, 10),
        ),
        adminStatsApi.getTopProducts(5),
      ]);

      setOverview(overviewData);
      setMonthly(monthlyData);
      setTopProducts(topProductsData.products);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(rangeMonths);
  }, [rangeMonths]);

  const chartData = monthly.months.map((m, i) => ({
    month: m,
    revenue: monthly.revenues[i],
  }));

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>

      {/* Header */}
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
            style={{ margin: "4px 0 0", color: "#8b8fa3", fontSize: "0.9rem" }}
          >
            Here's what's happening with your store today.
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fff1f0",
            border: "1px solid #ffd4d0",
            borderRadius: "10px",
            color: "#c0392b",
            fontSize: "0.88rem",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* Hero Revenue Card + KPI grid */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        {/* Hero card */}
        <div
          style={{
            flex: "2 1 320px",
            minWidth: "300px",
            borderRadius: "20px",
            padding: "26px",
            background: "linear-gradient(135deg, #6d5ef6 0%, #4f46e5 100%)",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 12px 28px rgba(79,70,229,0.25)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-40px",
              right: "-40px",
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <Icon
                path={ICONS.dollar}
                size={16}
                color="rgba(255,255,255,0.75)"
              />
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.75)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Total Revenue
              </span>
            </div>
            {loading || !overview ? (
              <div
                style={{
                  width: "160px",
                  height: "38px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.15)",
                  ...shimmer,
                }}
              />
            ) : (
              <p
                style={{
                  margin: 0,
                  fontSize: "2.3rem",
                  fontWeight: "800",
                  letterSpacing: "-0.5px",
                }}
              >
                $
                {overview.total_revenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            )}
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              From all paid orders
            </p>
          </div>
        </div>

        {/* Small stat cards */}
        {loading || !overview ? (
          <>
            <div
              style={{
                flex: "1 1 180px",
                minWidth: "180px",
                borderRadius: "18px",
                height: "132px",
                ...shimmer,
              }}
            />
            <div
              style={{
                flex: "1 1 180px",
                minWidth: "180px",
                borderRadius: "18px",
                height: "132px",
                ...shimmer,
              }}
            />
          </>
        ) : (
          <>
            <StatCard
              label="Total Products"
              value={overview.total_products}
              iconPath={ICONS.box}
              iconBg="linear-gradient(135deg,#60a5fa,#2563eb)"
            />
            <StatCard
              label="Total Orders"
              value={overview.total_orders}
              iconPath={ICONS.receipt}
              iconBg="linear-gradient(135deg,#c084fc,#9333ea)"
            />
          </>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "28px",
        }}
      >
        {loading || !overview ? (
          <>
            <div
              style={{
                flex: "1 1 180px",
                minWidth: "180px",
                borderRadius: "18px",
                height: "104px",
                ...shimmer,
              }}
            />
            <div
              style={{
                flex: "1 1 180px",
                minWidth: "180px",
                borderRadius: "18px",
                height: "104px",
                ...shimmer,
              }}
            />
            <div
              style={{
                flex: "1 1 180px",
                minWidth: "180px",
                borderRadius: "18px",
                height: "104px",
                ...shimmer,
              }}
            />
          </>
        ) : (
          <>
            <StatCard
              label="Total Users"
              value={overview.total_users}
              iconPath={ICONS.users}
              iconBg="linear-gradient(135deg,#fbbf24,#d97706)"
            />
            <StatCard
              label="Pending Orders"
              value={overview.pending_orders}
              iconPath={ICONS.clock}
              iconBg="linear-gradient(135deg,#f87171,#dc2626)"
            />
            <StatCard
              label="New Users (30d)"
              value={overview.new_users_30d}
              iconPath={ICONS.spark}
              iconBg="linear-gradient(135deg,#34d399,#059669)"
            />
          </>
        )}
      </div>

      {/* Chart + Top products side by side */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* Revenue chart */}
        <div
          style={{
            flex: "2 1 480px",
            minWidth: "320px",
            background: "#fff",
            borderRadius: "20px",
            padding: "24px",
            border: "1px solid #eef0f5",
            boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "18px",
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
                Revenue Trend
              </h3>
              <p
                style={{
                  margin: "2px 0 0",
                  color: "#a0a3b5",
                  fontSize: "0.8rem",
                }}
              >
                Paid orders over time
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: "4px",
                background: "#f5f6fb",
                padding: "4px",
                borderRadius: "10px",
              }}
            >
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.months}
                  onClick={() => setRangeMonths(opt.months)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    backgroundColor:
                      rangeMonths === opt.months ? "#14162b" : "transparent",
                    color: rangeMonths === opt.months ? "#fff" : "#8b8fa3",
                    transition: "all 0.15s ease",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div
              style={{ height: "280px", borderRadius: "12px", ...shimmer }}
            />
          ) : chartData.length === 0 ? (
            <div
              style={{
                height: "280px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                color: "#c3c6d4",
              }}
            >
              <Icon path={ICONS.dollar} size={28} color="#d0d3e0" />
              <p style={{ margin: 0, fontSize: "0.88rem" }}>
                No revenue data yet
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={chartData}
                margin={{ top: 4, right: 8, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6d5ef6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6d5ef6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f1f5"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#a0a3b5" }}
                  axisLine={{ stroke: "#eef0f5" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#a0a3b5" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #eef0f5",
                    boxShadow: "0 8px 20px rgba(16,24,40,0.1)",
                    fontSize: "0.85rem",
                  }}
                  formatter={(value) => [`$${value.toFixed(2)}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fill="url(#revFill)"
                  dot={{ r: 3, fill: "#4f46e5", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products */}
        <div
          style={{
            flex: "1 1 300px",
            minWidth: "280px",
            background: "#fff",
            borderRadius: "20px",
            padding: "24px",
            border: "1px solid #eef0f5",
            boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
          }}
        >
          <h3
            style={{
              margin: "0 0 2px",
              color: "#14162b",
              fontSize: "1.02rem",
              fontWeight: "700",
            }}
          >
            Top Products
          </h3>
          <p
            style={{ margin: "0 0 18px", color: "#a0a3b5", fontSize: "0.8rem" }}
          >
            Best sellers by revenue
          </p>

          {loading ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{ height: "44px", borderRadius: "10px", ...shimmer }}
                />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <p
              style={{
                color: "#a0a3b5",
                textAlign: "center",
                padding: "30px 0",
                fontSize: "0.86rem",
              }}
            >
              No sales data yet.
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {topProducts.map((p, idx) => {
                const maxRevenue = Math.max(
                  ...topProducts.map((x) => x.total_revenue),
                );
                const pct = (p.total_revenue / maxRevenue) * 100;
                return (
                  <div
                    key={p.product_id}
                    style={{
                      padding: "10px 6px",
                      borderRadius: "10px",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8f8fc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          color: "#14162b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "150px",
                        }}
                      >
                        {idx === 0 && "🏆 "}
                        {p.product_name}
                      </span>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "700",
                          color: "#4f46e5",
                        }}
                      >
                        ${p.total_revenue.toFixed(0)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: "5px",
                        borderRadius: "3px",
                        background: "#f0f1f5",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          borderRadius: "3px",
                          background: "linear-gradient(90deg,#7c6cff,#4f46e5)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
