import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { formatUSD } from "../../utils/currency";

const ReportsPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axiosClient
      .get("/shipper/reports/overview")
      .then((res) => setStats(res.data))
      .catch(console.error);
  }, []);

  if (!stats)
    return <p style={{ padding: "28px", color: "#8b8fa3" }}>Loading...</p>;

  const cards = [
    { label: "Delivered", value: stats.total_delivered, color: "#16a34a" },
    { label: "Failed", value: stats.total_failed, color: "#dc2626" },
    { label: "In Progress", value: stats.total_in_progress, color: "#7c3aed" },
    {
      label: "Total Earnings",
      value: formatUSD(stats.total_earnings / 25400),
      color: "#4f46e5",
    },
  ];

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "800",
          color: "#14162b",
          marginBottom: "20px",
        }}
      >
        Reports & Analytics
      </h1>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              flex: "1 1 200px",
              background: "#fff",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid #eef0f5",
            }}
          >
            <p style={{ margin: 0, color: "#8b8fa3", fontSize: "0.8rem" }}>
              {c.label}
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "1.6rem",
                fontWeight: "800",
                color: c.color,
              }}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
