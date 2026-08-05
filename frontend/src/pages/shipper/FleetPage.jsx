import { useEffect, useState } from "react";
import { fleetApi } from "../../api/fleetApi";
import { useAuth } from "../../auth/useAuth";

const STATUS_COLOR = {
  AVAILABLE: "#16a34a",
  IN_USE: "#4f46e5",
  MAINTENANCE: "#dc2626",
};

const FleetPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    plate_number: "",
    vehicle_type: "Motorbike",
    capacity_kg: "",
  });
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      setVehicles(await fleetApi.getAll());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await fleetApi.create({
        ...form,
        capacity_kg: parseFloat(form.capacity_kg),
      });
      setForm({ plate_number: "", vehicle_type: "Motorbike", capacity_kg: "" });
      fetchVehicles();
    } catch (err) {
      alert("Failed to add vehicle.");
    }
  };

  const handleStatusChange = async (id, status) => {
    await fleetApi.update(id, { status });
    fetchVehicles();
  };

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
        Vehicle Management
      </h1>

      {isAdmin && (
        <form
          onSubmit={handleAdd}
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "24px",
            flexWrap: "wrap",
            background: "#fff",
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid #eef0f5",
          }}
        >
          <input
            placeholder="Plate number"
            value={form.plate_number}
            onChange={(e) => setForm({ ...form, plate_number: e.target.value })}
            required
            style={{
              padding: "9px 14px",
              borderRadius: "10px",
              border: "1px solid #e4e6ee",
              fontSize: "0.85rem",
            }}
          />
          <select
            value={form.vehicle_type}
            onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
            style={{
              padding: "9px 14px",
              borderRadius: "10px",
              border: "1px solid #e4e6ee",
              fontSize: "0.85rem",
            }}
          >
            <option>Motorbike</option>
            <option>Van</option>
            <option>Truck</option>
          </select>
          <input
            type="number"
            placeholder="Capacity (kg)"
            value={form.capacity_kg}
            onChange={(e) => setForm({ ...form, capacity_kg: e.target.value })}
            required
            style={{
              padding: "9px 14px",
              borderRadius: "10px",
              border: "1px solid #e4e6ee",
              fontSize: "0.85rem",
              width: "140px",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "9px 20px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#4f46e5",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            + Add Vehicle
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ color: "#8b8fa3" }}>Loading...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          {vehicles.map((v) => (
            <div
              key={v.id}
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
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <p style={{ margin: 0, fontWeight: "700", color: "#14162b" }}>
                  {v.plate_number}
                </p>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    color: "#fff",
                    padding: "2px 10px",
                    borderRadius: "20px",
                    backgroundColor: STATUS_COLOR[v.status] || "#8b8fa3",
                  }}
                >
                  {v.status}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#8b8fa3" }}>
                {v.vehicle_type} · {v.capacity_kg}kg capacity
              </p>
              {isAdmin && (
                <select
                  value={v.status}
                  onChange={(e) => handleStatusChange(v.id, e.target.value)}
                  style={{
                    marginTop: "12px",
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #e4e6ee",
                    fontSize: "0.8rem",
                  }}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="IN_USE">In Use</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FleetPage;
