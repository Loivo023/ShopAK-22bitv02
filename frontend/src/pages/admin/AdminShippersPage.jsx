import { useEffect, useState } from "react";
import { usersApi } from "../../api/usersApi";

const AdminShippersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      setUsers(await usersApi.getAll());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePromote = async (id) => {
    await usersApi.updateRole(id, "SHIPPER");
    fetchUsers();
  };
  const handleDemote = async (id) => {
    await usersApi.updateRole(id, "CUSTOMER");
    fetchUsers();
  };

  const shippers = users.filter((u) => u.role === "SHIPPER");
  const customers = users.filter((u) => u.role === "CUSTOMER");

  if (loading)
    return <p style={{ padding: "28px", color: "#8b8fa3" }}>Loading...</p>;

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
        Shippers
      </h1>

      <p style={{ fontWeight: "700", color: "#14162b", marginBottom: "10px" }}>
        Active Shippers ({shippers.length})
      </p>
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #eef0f5",
          overflow: "hidden",
          marginBottom: "28px",
        }}
      >
        {shippers.map((u, idx) => (
          <div
            key={u.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 18px",
              borderBottom:
                idx === shippers.length - 1 ? "none" : "1px solid #f0f1f5",
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: "600", color: "#14162b" }}>
                {u.full_name}
              </p>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#a0a3b5" }}>
                {u.email}
              </p>
            </div>
            <button
              onClick={() => handleDemote(u.id)}
              style={{
                padding: "7px 16px",
                borderRadius: "8px",
                border: "1px solid #e4e6ee",
                backgroundColor: "#fff",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              Remove Shipper Role
            </button>
          </div>
        ))}
      </div>

      <p style={{ fontWeight: "700", color: "#14162b", marginBottom: "10px" }}>
        Promote Customer to Shipper
      </p>
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #eef0f5",
          overflow: "hidden",
        }}
      >
        {customers.map((u, idx) => (
          <div
            key={u.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 18px",
              borderBottom:
                idx === customers.length - 1 ? "none" : "1px solid #f0f1f5",
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: "600", color: "#14162b" }}>
                {u.full_name}
              </p>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#a0a3b5" }}>
                {u.email}
              </p>
            </div>
            <button
              onClick={() => handlePromote(u.id)}
              style={{
                padding: "7px 16px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#34d399",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              Make Shipper
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminShippersPage;
