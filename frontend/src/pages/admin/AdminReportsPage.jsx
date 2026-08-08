import { useEffect, useState } from "react";
import { adminStatsApi } from "../../api/adminStatsApi";
import { formatUSD } from "../../utils/currency";

const AdminReportsPage = () => {
  const [overview, setOverview] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewData, productsData] = await Promise.all([
          adminStatsApi.getOverview(),
          adminStatsApi.getTopProducts(10),
        ]);

        setOverview(overviewData);
        setTopProducts(productsData.products || []);
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
      <p style={{ padding: "28px", color: "#8b8fa3" }}>Loading reports...</p>
    );
  }

  if (!overview) {
    return (
      <p style={{ padding: "28px", color: "#dc2626" }}>
        Failed to load report data.
      </p>
    );
  }

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
        Reports
      </h1>

      <p
        style={{
          margin: "0 0 24px",
          color: "#8b8fa3",
          fontSize: "0.9rem",
        }}
      >
        Overview of store performance and order activity.
      </p>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "22px",
        }}
      >
        <ReportCard
          label="Revenue"
          value={formatUSD(overview.total_revenue)}
          valueColor="#16a34a"
        />

        <ReportCard
          label="Orders"
          value={overview.total_orders}
          valueColor="#4f46e5"
        />

        <ReportCard
          label="Pending Orders"
          value={overview.pending_orders}
          valueColor="#d97706"
        />

        <ReportCard
          label="Products"
          value={overview.total_products}
          valueColor="#7c3aed"
        />

        <ReportCard
          label="Users"
          value={overview.total_users}
          valueColor="#0891b2"
        />
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
          }}
        >
          Top Products
        </h3>

        {topProducts.length === 0 ? (
          <p style={{ color: "#a0a3b5" }}>No product sales data yet.</p>
        ) : (
          topProducts.map((product, index) => (
            <div
              key={product.product_id || index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                padding: "13px 0",
                borderBottom:
                  index === topProducts.length - 1
                    ? "none"
                    : "1px solid #f0f1f5",
              }}
            >
              <div>
                <strong style={{ color: "#14162b" }}>
                  {index + 1}. {product.product_name}
                </strong>

                <p
                  style={{
                    margin: "3px 0 0",
                    color: "#a0a3b5",
                    fontSize: "0.78rem",
                  }}
                >
                  {product.total_quantity || 0} sold
                </p>
              </div>

              <strong style={{ color: "#4f46e5" }}>
                {formatUSD(product.total_revenue || 0)}
              </strong>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ReportCard = ({ label, value, valueColor }) => (
  <div
    style={{
      flex: "1 1 180px",
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
        color: valueColor,
        fontSize: "1.5rem",
        fontWeight: "800",
      }}
    >
      {value}
    </p>
  </div>
);

export default AdminReportsPage;
