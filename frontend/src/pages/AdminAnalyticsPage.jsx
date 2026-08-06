import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { adminStatsApi } from "../api/adminStatsApi";
import { formatUSD } from "../utils/currency";

const RANGE_OPTIONS = [
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "12M", months: 12 },
];

const AdminAnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState({ months: [], revenues: [] });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rangeMonths, setRangeMonths] = useState(12);

  const fetchAll = async (months) => {
    setLoading(true);
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - months);
    const [ov, mr, tp] = await Promise.all([
      adminStatsApi.getOverview(),
      adminStatsApi.getMonthlyRevenue(
        from.toISOString().slice(0, 10),
        to.toISOString().slice(0, 10),
      ),
      adminStatsApi.getTopProducts(5),
    ]);
    setOverview(ov);
    setMonthly(mr);
    setTopProducts(tp.products);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll(rangeMonths);
  }, [rangeMonths]);

  const chartData = monthly.months.map((m, i) => ({
    month: m,
    revenue: monthly.revenues[i],
  }));
  const avgOrderValue =
    overview && overview.total_orders > 0
      ? overview.total_revenue / overview.total_orders
      : 0;

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
        Revenue Analytics
      </h1>
      <p style={{ margin: "0 0 26px", color: "#8b8fa3", fontSize: "0.9rem" }}>
        Deep dive into your store's financial performance.
      </p>

      {loading || !overview ? (
        <p style={{ color: "#8b8fa3" }}>Loading...</p>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            {[
              {
                label: "Total Revenue",
                value: formatUSD(overview.total_revenue),
              },
              { label: "Avg. Order Value", value: formatUSD(avgOrderValue) },
              { label: "Total Orders", value: overview.total_orders },
              { label: "Pending Orders", value: overview.pending_orders },
            ].map((c) => (
              <div
                key={c.label}
                style={{
                  flex: "1 1 200px",
                  background: "#fff",
                  borderRadius: "16px",
                  padding: "18px 20px",
                  border: "1px solid #eef0f5",
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
                  {c.label}
                </p>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "1.4rem",
                    fontWeight: "800",
                    color: "#14162b",
                  }}
                >
                  {c.value}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              border: "1px solid #eef0f5",
              padding: "24px",
              marginBottom: "20px",
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
              <h3
                style={{
                  margin: 0,
                  color: "#14162b",
                  fontSize: "1.02rem",
                  fontWeight: "700",
                }}
              >
                Revenue Over Time
              </h3>
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
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {chartData.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "#c3c6d4",
                  padding: "60px 0",
                }}
              >
                No revenue data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 8, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
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
                    formatter={(v) => [`$${v.toFixed(2)}`, "Revenue"]}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #eef0f5",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fill="url(#revFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              border: "1px solid #eef0f5",
              padding: "24px",
            }}
          >
            <h3
              style={{
                margin: "0 0 18px",
                color: "#14162b",
                fontSize: "1.02rem",
                fontWeight: "700",
              }}
            >
              Top Products by Revenue
            </h3>
            {topProducts.length === 0 ? (
              <p style={{ color: "#a0a3b5" }}>No sales data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={topProducts.map((p) => ({
                    name: p.product_name.slice(0, 14),
                    revenue: p.total_revenue,
                  }))}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f1f5"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#a0a3b5" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#14162b" }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
