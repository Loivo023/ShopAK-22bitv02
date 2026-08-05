import { useEffect, useState } from "react";
import { shipperApi } from "../../api/shipperApi";
import { formatUSD } from "../../utils/currency";

const BillingPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    shipperApi.getMyDeliveries().then(setOrders);
  }, []);

  const completed = orders.filter((o) => o.status === "COMPLETED");
  const totalEarnings = completed.reduce(
    (sum, o) => sum + o.shipping_fee / 25400,
    0,
  );

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "800",
          color: "#14162b",
          marginBottom: "8px",
        }}
      >
        Billing & Payments
      </h1>
      <p style={{ color: "#8b8fa3", marginBottom: "20px" }}>
        Total earnings:{" "}
        <strong style={{ color: "#16a34a" }}>{formatUSD(totalEarnings)}</strong>
      </p>

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #eef0f5",
          overflow: "hidden",
        }}
      >
        {completed.map((o, idx) => (
          <div
            key={o.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom:
                idx === completed.length - 1 ? "none" : "1px solid #f0f1f5",
            }}
          >
            <p style={{ margin: 0, color: "#14162b" }}>Order #{o.id}</p>
            <p style={{ margin: 0, fontWeight: "700", color: "#16a34a" }}>
              {formatUSD(o.shipping_fee / 25400)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillingPage;
