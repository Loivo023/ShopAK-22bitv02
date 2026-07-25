import { useEffect, useState } from "react";
import { usersApi } from "../api/usersApi";
import { useAuth } from "../auth/useAuth";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (u) => {
    const newRole = u.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
    setUpdatingId(u.id);
    try {
      const updated = await usersApi.updateRole(u.id, newRole);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch (err) {
      alert("Failed to update role.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading)
    return (
      <p style={{ padding: "24px", textAlign: "center", color: "#888" }}>
        Loading users...
      </p>
    );
  if (error)
    return (
      <p style={{ padding: "24px", textAlign: "center", color: "red" }}>
        {error}
      </p>
    );

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      <h2 style={{ color: "#14162b", marginBottom: "4px", fontSize: "1.4rem" }}>
        Users
      </h2>
      <p style={{ color: "#8b8fa3", marginBottom: "20px", fontSize: "0.9rem" }}>
        Manage user accounts and permissions.
      </p>

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #eef0f5",
          overflow: "hidden",
        }}
      >
        {users.map((u, idx) => (
          <div
            key={u.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom:
                idx === users.length - 1 ? "none" : "1px solid #f0f1f5",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c6cff, #4f46e5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "0.8rem",
                  flexShrink: 0,
                }}
              >
                {(u.full_name || u.email)[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    color: "#14162b",
                    fontSize: "0.9rem",
                  }}
                >
                  {u.full_name}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "#a0a3b5",
                    fontSize: "0.8rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {u.email}
                </p>
              </div>
            </div>

            <span
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.76rem",
                fontWeight: "700",
                color: u.role === "ADMIN" ? "#7c3aed" : "#475569",
                backgroundColor: u.role === "ADMIN" ? "#f3e8ff" : "#f1f5f9",
                marginRight: "16px",
              }}
            >
              {u.role}
            </span>

            <button
              onClick={() => handleToggleRole(u)}
              disabled={u.id === currentUser?.id || updatingId === u.id}
              title={
                u.id === currentUser?.id ? "You can't change your own role" : ""
              }
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: "600",
                border:
                  "1px solid " + (u.role === "ADMIN" ? "#e4e6ee" : "#4f46e5"),
                backgroundColor: u.role === "ADMIN" ? "#fff" : "#4f46e5",
                color: u.role === "ADMIN" ? "#666" : "#fff",
                cursor:
                  u.id === currentUser?.id || updatingId === u.id
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  u.id === currentUser?.id || updatingId === u.id ? 0.5 : 1,
              }}
            >
              {updatingId === u.id
                ? "..."
                : u.role === "ADMIN"
                  ? "Demote to Customer"
                  : "Promote to Admin"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsersPage;
