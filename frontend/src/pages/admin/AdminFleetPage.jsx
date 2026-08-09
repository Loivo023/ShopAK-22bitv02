import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { usersApi } from "../../api/usersApi";

const STATUS_META = {
  AVAILABLE: {
    color: "#16a34a",
    bg: "#dcfce7",
  },
  ACTIVE: {
    color: "#4f46e5",
    bg: "#e0e7ff",
  },
  IN_USE: {
    color: "#7c3aed",
    bg: "#ede9fe",
  },
  MAINTENANCE: {
    color: "#d97706",
    bg: "#fef3c7",
  },
  INACTIVE: {
    color: "#dc2626",
    bg: "#fee2e2",
  },
};

const AdminFleetPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shippers, setShippers] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    plate_number: "",
    vehicle_type: "Motorbike",
    capacity_kg: "",
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosClient.get("/fleet");
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load fleet.");
    } finally {
      setLoading(false);
    }
  };

  const fetchShippers = async () => {
    try {
      const data = await usersApi.getAll();

      const shipperUsers = data.filter((user) => user.role === "SHIPPER");

      setShippers(shipperUsers);
    } catch (err) {
      console.error("Failed to load shippers:", err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchShippers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!form.plate_number || !form.vehicle_type || !form.capacity_kg) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);

      const res = await axiosClient.post("/fleet", {
        plate_number: form.plate_number,
        vehicle_type: form.vehicle_type,
        capacity_kg: Number(form.capacity_kg),
      });

      setVehicles((prev) => [...prev, res.data]);

      setForm({
        plate_number: "",
        vehicle_type: "Motorbike",
        capacity_kg: "",
      });

      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to create vehicle.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (vehicle, status) => {
    try {
      const res = await axiosClient.patch(`/fleet/${vehicle.id}`, {
        status,
      });

      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicle.id ? res.data : v)),
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to update vehicle.");
    }
  };

  const handleAssignShipper = async (vehicle, shipperId) => {
    try {
      const res = await axiosClient.patch(`/fleet/${vehicle.id}`, {
        assigned_shipper_id: shipperId ? Number(shipperId) : null,
      });

      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicle.id ? res.data : v)),
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to assign shipper.");
    }
  };

  const handleDelete = async (vehicle) => {
    const confirmed = window.confirm(`Delete vehicle ${vehicle.plate_number}?`);

    if (!confirmed) return;

    try {
      await axiosClient.delete(`/fleet/${vehicle.id}`);

      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to delete vehicle.");
    }
  };

  const available = vehicles.filter((v) => v.status === "AVAILABLE").length;

  const assigned = vehicles.filter((v) => v.assigned_shipper_id != null).length;

  const maintenance = vehicles.filter((v) => v.status === "MAINTENANCE").length;

  if (loading) {
    return (
      <p style={{ padding: "28px", color: "#8b8fa3" }}>Loading fleet...</p>
    );
  }

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
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
            Drivers & Fleet
          </h1>

          <p
            style={{
              margin: "5px 0 0",
              color: "#8b8fa3",
              fontSize: "0.9rem",
            }}
          >
            Manage delivery vehicles and shipper assignments.
          </p>
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            border: "none",
            borderRadius: "10px",
            padding: "10px 18px",
            background: "#4f46e5",
            color: "#fff",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancel" : "+ Add Vehicle"}
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#dc2626",
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "18px",
          }}
        >
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            background: "#fff",
            border: "1px solid #eef0f5",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px",
              color: "#14162b",
            }}
          >
            Add Vehicle
          </h3>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <input
              placeholder="Plate number"
              value={form.plate_number}
              onChange={(e) =>
                setForm({
                  ...form,
                  plate_number: e.target.value,
                })
              }
              style={inputStyle}
            />

            <select
              value={form.vehicle_type}
              onChange={(e) =>
                setForm({
                  ...form,
                  vehicle_type: e.target.value,
                })
              }
              style={inputStyle}
            >
              <option>Motorbike</option>
              <option>Car</option>
              <option>Van</option>
              <option>Truck</option>
            </select>

            <input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Capacity (kg)"
              value={form.capacity_kg}
              onChange={(e) =>
                setForm({
                  ...form,
                  capacity_kg: e.target.value,
                })
              }
              style={inputStyle}
            />

            <button
              type="submit"
              disabled={saving}
              style={{
                border: "none",
                borderRadius: "10px",
                padding: "10px 18px",
                background: "#16a34a",
                color: "#fff",
                fontWeight: "700",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Create Vehicle"}
            </button>
          </div>
        </form>
      )}

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <StatCard label="Total Vehicles" value={vehicles.length} />
        <StatCard label="Available" value={available} />
        <StatCard label="Assigned" value={assigned} />
        <StatCard label="Maintenance" value={maintenance} />
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          border: "1px solid #eef0f5",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#fafbfc" }}>
                {[
                  "Vehicle",
                  "Type",
                  "Capacity",
                  "Status",
                  "Shipper",
                  "Actions",
                ].map((h) => (
                  <th key={h} style={thStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#a0a3b5",
                    }}
                  >
                    No vehicles yet.
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => {
                  const meta = STATUS_META[vehicle.status] || {
                    color: "#8b8fa3",
                    bg: "#f1f2f6",
                  };

                  return (
                    <tr
                      key={vehicle.id}
                      style={{
                        borderTop: "1px solid #f0f1f5",
                      }}
                    >
                      <td style={tdStyle}>
                        <strong>{vehicle.plate_number}</strong>
                      </td>

                      <td style={tdStyle}>{vehicle.vehicle_type}</td>

                      <td style={tdStyle}>{vehicle.capacity_kg} kg</td>

                      <td style={tdStyle}>
                        <select
                          value={vehicle.status}
                          onChange={(e) =>
                            handleStatusChange(vehicle, e.target.value)
                          }
                          style={{
                            border: "none",
                            borderRadius: "20px",
                            padding: "5px 10px",
                            background: meta.bg,
                            color: meta.color,
                            fontWeight: "700",
                            fontSize: "0.75rem",
                          }}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="IN_USE">IN_USE</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </td>

                      <td style={tdStyle}>
                        <select
                          value={vehicle.assigned_shipper_id || ""}
                          onChange={(e) =>
                            handleAssignShipper(vehicle, e.target.value)
                          }
                          style={{
                            padding: "7px 10px",
                            borderRadius: "8px",
                            border: "1px solid #e4e6ee",
                            background: "#fff",
                            color: "#14162b",
                            minWidth: "180px",
                            fontSize: "0.82rem",
                          }}
                        >
                          <option value="">Unassigned</option>

                          {shippers.map((shipper) => (
                            <option key={shipper.id} value={shipper.id}>
                              {shipper.full_name || shipper.email}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td style={tdStyle}>
                        <button
                          onClick={() => handleDelete(vehicle)}
                          style={{
                            border: "none",
                            borderRadius: "8px",
                            padding: "7px 12px",
                            background: "#fee2e2",
                            color: "#dc2626",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div
    style={{
      flex: "1 1 180px",
      background: "#fff",
      border: "1px solid #eef0f5",
      borderRadius: "16px",
      padding: "18px 20px",
    }}
  >
    <p
      style={{
        margin: 0,
        color: "#8b8fa3",
        fontSize: "0.78rem",
      }}
    >
      {label}
    </p>

    <p
      style={{
        margin: "5px 0 0",
        color: "#14162b",
        fontSize: "1.5rem",
        fontWeight: "800",
      }}
    >
      {value}
    </p>
  </div>
);

const inputStyle = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #e4e6ee",
  fontSize: "0.85rem",
  minWidth: "170px",
};

const thStyle = {
  textAlign: "left",
  padding: "12px 20px",
  fontSize: "0.72rem",
  fontWeight: "700",
  color: "#a0a3b5",
  textTransform: "uppercase",
};

const tdStyle = {
  padding: "14px 20px",
  fontSize: "0.84rem",
  color: "#5c5f78",
};

export default AdminFleetPage;
