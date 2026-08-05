const STAGES = [
  { key: "PROCESSING", label: "Order Prepared", icon: "📦" },
  { key: "SHIPPED", label: "Out for Delivery", icon: "🚚" },
  { key: "COMPLETED", label: "Delivered", icon: "✓" },
];

const RouteProgress = ({ status }) => {
  const currentIndex = STAGES.findIndex((s) => s.key === status);
  const activeIndex =
    status === "FAILED" ? -1 : currentIndex === -1 ? 0 : currentIndex;

  return (
    <div
      style={{ display: "flex", alignItems: "flex-start", padding: "20px 8px" }}
    >
      {STAGES.map((stage, idx) => (
        <div
          key={stage.key}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          {idx > 0 && (
            <div
              style={{
                position: "absolute",
                top: "18px",
                right: "50%",
                width: "100%",
                height: "2px",
                backgroundColor: idx <= activeIndex ? "#4f46e5" : "#e4e6ee",
                zIndex: 0,
              }}
            />
          )}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: idx <= activeIndex ? "#4f46e5" : "#eceef4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              zIndex: 1,
              position: "relative",
            }}
          >
            {idx <= activeIndex ? stage.icon : idx + 1}
          </div>
          <p
            style={{
              marginTop: "8px",
              fontSize: "0.78rem",
              fontWeight: idx <= activeIndex ? "600" : "400",
              color: idx <= activeIndex ? "#14162b" : "#a0a3b5",
              textAlign: "center",
            }}
          >
            {stage.label}
          </p>
        </div>
      ))}
      {status === "FAILED" && (
        <div
          style={{
            position: "absolute",
            right: "24px",
            padding: "6px 14px",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: "700",
          }}
        >
          Delivery Failed
        </div>
      )}
    </div>
  );
};

export default RouteProgress;
