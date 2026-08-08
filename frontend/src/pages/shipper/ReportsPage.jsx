import { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";

const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get("/shipper/reports/overview")
      .then((res) => setStats(res.data))
      .catch((error) => {
        console.error("Failed to load reports:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const completionRate = useMemo(() => {
    if (!stats) return 0;

    const delivered = Number(stats.total_delivered || 0);
    const failed = Number(stats.total_failed || 0);
    const inProgress = Number(stats.total_in_progress || 0);

    const total = delivered + failed + inProgress;

    if (total === 0) return 0;

    return ((delivered / total) * 100).toFixed(1);
  }, [stats]);

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.loading}>Loading reports...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={styles.page}>
        <div style={styles.error}>Unable to load reports.</div>
      </div>
    );
  }

  const delivered = Number(stats.total_delivered || 0);

  const failed = Number(stats.total_failed || 0);

  const inProgress = Number(stats.total_in_progress || 0);

  const total = delivered + failed + inProgress;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Reports & Analytics</h1>

          <p style={styles.subtitle}>
            Your delivery performance and operational statistics.
          </p>
        </div>
      </div>

      {/* Main statistics */}
      <div style={styles.grid}>
        <StatCard
          icon="✓"
          label="Delivered"
          value={delivered}
          description="Successfully completed"
          type="success"
        />

        <StatCard
          icon="✕"
          label="Failed"
          value={failed}
          description="Unsuccessful deliveries"
          type="danger"
        />

        <StatCard
          icon="🚚"
          label="In Progress"
          value={inProgress}
          description="Currently being delivered"
          type="purple"
        />

        <StatCard
          icon="📦"
          label="Total Deliveries"
          value={total}
          description="All assigned deliveries"
          type="blue"
        />
      </div>

      {/* Performance */}
      <div style={styles.contentGrid}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Delivery Performance</h2>

          <p style={styles.sectionSubtitle}>
            Overall completion rate for your deliveries.
          </p>

          <div style={styles.rateContainer}>
            <div style={styles.rateCircle}>
              <span style={styles.rateValue}>{completionRate}%</span>

              <span style={styles.rateLabel}>completed</span>
            </div>

            <div style={styles.rateDetails}>
              <div style={styles.rateRow}>
                <span>
                  <span
                    style={{
                      ...styles.dot,
                      background: "#16a34a",
                    }}
                  />
                  Delivered
                </span>

                <strong>{delivered}</strong>
              </div>

              <div style={styles.rateRow}>
                <span>
                  <span
                    style={{
                      ...styles.dot,
                      background: "#7c3aed",
                    }}
                  />
                  In Progress
                </span>

                <strong>{inProgress}</strong>
              </div>

              <div style={styles.rateRow}>
                <span>
                  <span
                    style={{
                      ...styles.dot,
                      background: "#dc2626",
                    }}
                  />
                  Failed
                </span>

                <strong>{failed}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Performance summary */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Performance Summary</h2>

          <p style={styles.sectionSubtitle}>
            Quick overview of your current workload.
          </p>

          <div style={styles.summaryList}>
            <SummaryRow label="Total assigned" value={total} />

            <SummaryRow label="Successfully delivered" value={delivered} />

            <SummaryRow label="Currently delivering" value={inProgress} />

            <SummaryRow label="Failed deliveries" value={failed} />

            <SummaryRow
              label="Completion rate"
              value={`${completionRate}%`}
              highlight
            />
          </div>
        </div>
      </div>

      {/* Earnings */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Delivery Earnings</h2>

        <p style={styles.sectionSubtitle}>
          Delivery-related financial information reported by your backend.
        </p>

        <div style={styles.earningsCard}>
          <div>
            <span style={styles.earningsLabel}>Total delivery earnings</span>

            <h2 style={styles.earningsValue}>
              {formatBackendAmount(stats.total_earnings)}
            </h2>
          </div>

          <div style={styles.earningsIcon}>💰</div>
        </div>

        <div style={styles.warning}>
          <strong>Note:</strong> This figure represents the value returned by
          your shipper reporting API. It should not be interpreted as company
          profit.
        </div>
      </div>
    </div>
  );
};

const formatBackendAmount = (amount) => {
  const value = Number(amount || 0);

  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value);
};

const StatCard = ({ icon, label, value, description, type }) => {
  const colors = {
    success: {
      bg: "#ecfdf5",
      text: "#16a34a",
    },
    danger: {
      bg: "#fef2f2",
      text: "#dc2626",
    },
    purple: {
      bg: "#f5f3ff",
      text: "#7c3aed",
    },
    blue: {
      bg: "#eff6ff",
      text: "#2563eb",
    },
  };

  const color = colors[type];

  return (
    <div style={styles.statCard}>
      <div
        style={{
          ...styles.statIcon,
          background: color.bg,
          color: color.text,
        }}
      >
        {icon}
      </div>

      <div>
        <p style={styles.statLabel}>{label}</p>

        <h2 style={styles.statValue}>{value}</h2>

        <p style={styles.statDescription}>{description}</p>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value, highlight = false }) => (
  <div style={styles.summaryRow}>
    <span style={styles.summaryLabel}>{label}</span>

    <strong
      style={{
        ...styles.summaryValue,
        ...(highlight ? styles.summaryHighlight : {}),
      }}
    >
      {value}
    </strong>
  </div>
);

const styles = {
  page: {
    padding: "28px 32px 60px",
    minHeight: "100%",
    background: "#f8f9fc",
  },

  loading: {
    color: "#8b8fa3",
  },

  error: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "16px",
    borderRadius: "12px",
  },

  header: {
    marginBottom: "22px",
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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },

  statCard: {
    background: "#fff",
    border: "1px solid #eef0f5",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  statIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    flexShrink: 0,
  },

  statLabel: {
    margin: 0,
    color: "#8b8fa3",
    fontSize: "0.75rem",
  },

  statValue: {
    margin: "4px 0 2px",
    color: "#14162b",
    fontSize: "1.35rem",
    fontWeight: "800",
  },

  statDescription: {
    margin: 0,
    color: "#a0a3b5",
    fontSize: "0.68rem",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },

  section: {
    background: "#fff",
    border: "1px solid #eef0f5",
    borderRadius: "16px",
    padding: "22px",
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: 0,
    color: "#14162b",
    fontSize: "1rem",
    fontWeight: "800",
  },

  sectionSubtitle: {
    margin: "5px 0 20px",
    color: "#8b8fa3",
    fontSize: "0.76rem",
  },

  rateContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "45px",
    padding: "10px 0",
  },

  rateCircle: {
    width: "145px",
    height: "145px",
    borderRadius: "50%",
    border: "12px solid #dcfce7",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  rateValue: {
    color: "#16a34a",
    fontSize: "1.8rem",
    fontWeight: "800",
  },

  rateLabel: {
    color: "#8b8fa3",
    fontSize: "0.7rem",
  },

  rateDetails: {
    minWidth: "150px",
  },

  rateRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "30px",
    padding: "9px 0",
    borderBottom: "1px solid #f0f1f5",
    color: "#45485c",
    fontSize: "0.78rem",
  },

  dot: {
    display: "inline-block",
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    marginRight: "7px",
  },

  summaryList: {
    marginTop: "10px",
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #f0f1f5",
  },

  summaryLabel: {
    color: "#8b8fa3",
    fontSize: "0.78rem",
  },

  summaryValue: {
    color: "#14162b",
    fontSize: "0.8rem",
  },

  summaryHighlight: {
    color: "#16a34a",
  },

  earningsCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#f8fafc",
    border: "1px solid #eef0f5",
    borderRadius: "14px",
    padding: "20px",
  },

  earningsLabel: {
    color: "#8b8fa3",
    fontSize: "0.75rem",
  },

  earningsValue: {
    margin: "6px 0 0",
    color: "#14162b",
    fontSize: "1.5rem",
  },

  earningsIcon: {
    fontSize: "2rem",
  },

  warning: {
    marginTop: "12px",
    padding: "12px 14px",
    borderRadius: "10px",
    background: "#fffbeb",
    color: "#92400e",
    fontSize: "0.72rem",
  },
};

export default ReportsPage;
