import { useEffect, useMemo, useState } from "react";

import { fleetApi } from "../../api/fleetApi";
import { shipperApi } from "../../api/shipperApi";
import { useAuth } from "../../auth/useAuth";

const DriversPage = () => {
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [fleet, deliveries] = await Promise.all([
        fleetApi.getAll(),
        shipperApi.getMyDeliveries(),
      ]);

      setVehicles(fleet || []);
      setOrders(deliveries || []);
    } catch (error) {
      console.error("Failed to load driver information:", error);
      setVehicles([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const myVehicle = useMemo(() => {
    if (!user?.id) return null;

    return (
      vehicles.find((vehicle) => vehicle.assigned_shipper_id === user.id) ||
      null
    );
  }, [vehicles, user]);

  const activeOrders = orders.filter(
    (order) => order.status === "PROCESSING" || order.status === "SHIPPED",
  );

  const completedOrders = orders.filter(
    (order) => order.status === "COMPLETED",
  );

  const failedOrders = orders.filter((order) => order.status === "FAILED");

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading driver information...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Driver</h1>
          <p style={styles.subtitle}>
            Your driver profile, assigned vehicle, and delivery performance.
          </p>
        </div>

        <button style={styles.refreshButton} onClick={fetchData}>
          ↻ Refresh
        </button>
      </div>

      {/* Driver Profile */}
      <div style={styles.profileCard}>
        <div style={styles.avatar}>
          {user?.full_name?.[0]?.toUpperCase() || "S"}
        </div>

        <div style={styles.profileInfo}>
          <h2 style={styles.profileName}>{user?.full_name || "Shipper"}</h2>

          <p style={styles.profileEmail}>
            {user?.email || "No email available"}
          </p>

          <div style={styles.statusRow}>
            <span style={styles.onlineDot}></span>
            <span style={styles.onlineText}>Active Driver</span>
          </div>
        </div>

        <div style={styles.roleBadge}>SHIPPER</div>
      </div>

      {/* Statistics */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📦</div>
          <div>
            <p style={styles.statLabel}>Total Deliveries</p>
            <h3 style={styles.statValue}>{orders.length}</h3>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>🚚</div>
          <div>
            <p style={styles.statLabel}>Active Deliveries</p>
            <h3 style={styles.statValue}>{activeOrders.length}</h3>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>✓</div>
          <div>
            <p style={styles.statLabel}>Completed</p>
            <h3 style={styles.statValue}>{completedOrders.length}</h3>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>!</div>
          <div>
            <p style={styles.statLabel}>Failed</p>
            <h3 style={styles.statValue}>{failedOrders.length}</h3>
          </div>
        </div>
      </div>

      {/* Vehicle */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Assigned Vehicle</h2>
            <p style={styles.sectionSubtitle}>
              Vehicle currently assigned to your account.
            </p>
          </div>

          <span
            style={{
              ...styles.vehicleStatus,
              ...(myVehicle?.status === "AVAILABLE"
                ? styles.available
                : styles.unavailable),
            }}
          >
            {myVehicle?.status || "NOT ASSIGNED"}
          </span>
        </div>

        {myVehicle ? (
          <div style={styles.vehicleCard}>
            <div style={styles.vehicleIcon}>🛵</div>

            <div style={styles.vehicleMain}>
              <h3 style={styles.vehicleTitle}>
                {myVehicle.vehicle_type || "Delivery Vehicle"}
              </h3>

              <p style={styles.plate}>
                {myVehicle.plate_number || "No plate number"}
              </p>
            </div>

            <div style={styles.vehicleDetails}>
              <div>
                <span style={styles.detailLabel}>Vehicle ID</span>
                <strong style={styles.detailValue}>#{myVehicle.id}</strong>
              </div>

              <div>
                <span style={styles.detailLabel}>Status</span>
                <strong style={styles.detailValue}>
                  {myVehicle.status || "Unknown"}
                </strong>
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.emptyVehicle}>
            <div style={styles.emptyIcon}>🚗</div>

            <h3 style={styles.emptyTitle}>No vehicle assigned</h3>

            <p style={styles.emptyText}>
              Please contact an administrator to have a delivery vehicle
              assigned to your account.
            </p>
          </div>
        )}
      </div>

      {/* Delivery Performance */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Delivery Performance</h2>

            <p style={styles.sectionSubtitle}>
              Summary of your assigned deliveries.
            </p>
          </div>
        </div>

        <div style={styles.performanceGrid}>
          <div style={styles.performanceItem}>
            <span style={styles.performanceIcon}>📋</span>

            <div>
              <p style={styles.performanceLabel}>Assigned</p>
              <strong style={styles.performanceValue}>{orders.length}</strong>
            </div>
          </div>

          <div style={styles.performanceItem}>
            <span style={styles.performanceIcon}>🚚</span>

            <div>
              <p style={styles.performanceLabel}>In Progress</p>
              <strong style={styles.performanceValue}>
                {activeOrders.length}
              </strong>
            </div>
          </div>

          <div style={styles.performanceItem}>
            <span style={styles.performanceIcon}>✓</span>

            <div>
              <p style={styles.performanceLabel}>Completed</p>
              <strong style={styles.performanceValue}>
                {completedOrders.length}
              </strong>
            </div>
          </div>

          <div style={styles.performanceItem}>
            <span style={styles.performanceIcon}>✕</span>

            <div>
              <p style={styles.performanceLabel}>Failed</p>
              <strong style={styles.performanceValue}>
                {failedOrders.length}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: "28px 32px 60px",
    minHeight: "100%",
    background: "#f8f9fc",
  },

  loading: {
    padding: "40px",
    textAlign: "center",
    color: "#8b8fa3",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#14162b",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#8b8fa3",
    fontSize: "0.88rem",
  },

  refreshButton: {
    border: "1px solid #e4e6ee",
    background: "#fff",
    color: "#14162b",
    borderRadius: "10px",
    padding: "9px 14px",
    cursor: "pointer",
    fontWeight: "600",
  },

  profileCard: {
    background: "#fff",
    border: "1px solid #eef0f5",
    borderRadius: "18px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },

  avatar: {
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #34d399, #059669)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.3rem",
    fontWeight: "800",
    flexShrink: 0,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    margin: 0,
    color: "#14162b",
    fontSize: "1.05rem",
    fontWeight: "800",
  },

  profileEmail: {
    margin: "4px 0 7px",
    color: "#8b8fa3",
    fontSize: "0.82rem",
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  onlineDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  onlineText: {
    color: "#16a34a",
    fontSize: "0.78rem",
    fontWeight: "700",
  },

  roleBadge: {
    background: "#ecfdf5",
    color: "#059669",
    borderRadius: "8px",
    padding: "7px 10px",
    fontSize: "0.72rem",
    fontWeight: "800",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
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
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
  },

  statLabel: {
    margin: 0,
    color: "#8b8fa3",
    fontSize: "0.75rem",
  },

  statValue: {
    margin: "3px 0 0",
    color: "#14162b",
    fontSize: "1.3rem",
    fontWeight: "800",
  },

  section: {
    background: "#fff",
    border: "1px solid #eef0f5",
    borderRadius: "18px",
    padding: "22px",
    marginBottom: "20px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    color: "#14162b",
    fontSize: "1rem",
    fontWeight: "800",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#8b8fa3",
    fontSize: "0.8rem",
  },

  vehicleStatus: {
    padding: "6px 9px",
    borderRadius: "8px",
    fontSize: "0.68rem",
    fontWeight: "800",
  },

  available: {
    background: "#ecfdf5",
    color: "#059669",
  },

  unavailable: {
    background: "#fff7ed",
    color: "#ea580c",
  },

  vehicleCard: {
    border: "1px solid #eef0f5",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  vehicleIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "13px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4rem",
  },

  vehicleMain: {
    flex: 1,
  },

  vehicleTitle: {
    margin: 0,
    color: "#14162b",
    fontSize: "0.95rem",
    fontWeight: "800",
  },

  plate: {
    margin: "5px 0 0",
    color: "#8b8fa3",
    fontSize: "0.8rem",
  },

  vehicleDetails: {
    display: "flex",
    gap: "30px",
  },

  detailLabel: {
    display: "block",
    color: "#a0a3b5",
    fontSize: "0.68rem",
    marginBottom: "4px",
  },

  detailValue: {
    color: "#14162b",
    fontSize: "0.8rem",
  },

  emptyVehicle: {
    textAlign: "center",
    border: "1px dashed #dfe2ea",
    borderRadius: "14px",
    padding: "35px 20px",
  },

  emptyIcon: {
    fontSize: "2rem",
    marginBottom: "8px",
  },

  emptyTitle: {
    margin: 0,
    color: "#14162b",
    fontSize: "0.95rem",
  },

  emptyText: {
    maxWidth: "430px",
    margin: "7px auto 0",
    color: "#8b8fa3",
    fontSize: "0.8rem",
    lineHeight: 1.5,
  },

  performanceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
  },

  performanceItem: {
    border: "1px solid #eef0f5",
    borderRadius: "13px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  performanceIcon: {
    fontSize: "1.05rem",
  },

  performanceLabel: {
    margin: 0,
    color: "#8b8fa3",
    fontSize: "0.72rem",
  },

  performanceValue: {
    display: "block",
    marginTop: "3px",
    color: "#14162b",
    fontSize: "1.05rem",
  },
};

export default DriversPage;
