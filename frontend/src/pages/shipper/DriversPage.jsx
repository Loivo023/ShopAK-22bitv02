import { useEffect, useState } from "react";
import { usersApi } from "../../api/usersApi";
import { fleetApi } from "../../api/fleetApi";
import { useAuth } from "../../auth/useAuth";

const DriversPage = () => {
  const [shippers, setShippers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [users, fleet] = await Promise.all([
        usersApi.getAll(),
        fleetApi.getAll(),
      ]);
      setShippers(users.filter((u) => u.role === "SHIPPER"));
      setVehicles(fleet);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAssign = async (vehicleId, shipperId) => {
    await fleetApi.update(vehicleId, {
      assigned_shipper_id: shipperId || null,
    });
    fetchAll();
  };

  if (loading)
    return <p style={{ padding: "28px", color: "#8b8fa3" }}>Loading...</p>;

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
        Drivers
      </h1>
      <p
        style={{ color: "#8b8fa3", marginBottom: "24px", fontSize: "0.88rem" }}
      >
        {shippers.length} active drivers
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {shippers.map((s) => {
          const assignedVehicle = vehicles.find(
            (v) => v.assigned_shipper_id === s.id,
          );
          return (
            <div
              key={s.id}
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "18px",
                border: "1px solid #eef0f5",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #34d399, #059669)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: "700",
                  }}
                >
                  {s.full_name?.[0]?.toUpperCase() || "S"}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: "700", color: "#14162b" }}>
                    {s.full_name}
                  </p>
                  <p
                    style={{ margin: 0, fontSize: "0.78rem", color: "#a0a3b5" }}
                  >
                    {s.email}
                  </p>
                </div>
              </div>

              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "0.78rem",
                  color: "#a0a3b5",
                }}
              >
                Assigned Vehicle
              </p>
              {isAdmin ? (
                <select
                  value={assignedVehicle?.id || ""}
                  onChange={(e) => handleAssign(Number(e.target.value), s.id)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #e4e6ee",
                    fontSize: "0.82rem",
                  }}
                >
                  <option value="">— Unassigned —</option>
                  {vehicles
                    .filter(
                      (v) =>
                        !v.assigned_shipper_id ||
                        v.assigned_shipper_id === s.id,
                    )
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plate_number} ({v.vehicle_type})
                      </option>
                    ))}
                </select>
              ) : (
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "#14162b",
                    fontWeight: "500",
                  }}
                >
                  {assignedVehicle
                    ? `${assignedVehicle.plate_number} (${assignedVehicle.vehicle_type})`
                    : "No vehicle assigned"}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DriversPage;
