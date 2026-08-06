import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../api/ordersApi";
import { formatUSD } from "../utils/currency";

const STATUS_META = {
  PLACED: { color: "#8b8fa3", bg: "#f1f2f6" },
  PROCESSING: { color: "#d97706", bg: "#fef3c7" },
  SHIPPED: { color: "#7c3aed", bg: "#ede9fe" },
  COMPLETED: { color: "#16a34a", bg: "#dcfce7" },
  CANCELED: { color: "#dc2626", bg: "#fee2e2" },
  FAILED: { color: "#dc2626", bg: "#fee2e2" },
};

const FILTERS = [
  "All",
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELED",
  "FAILED",
];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    ordersApi
      .getAllForAdmin()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders
    .filter((o) => filter === "All" || o.status === filter)
    .filter(
      (o) => search.trim() === "" || String(o.id).includes(search.trim()),
    );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading)
    return (
      <p style={{ padding: "28px", color: "#8b8fa3" }}>Loading orders...</p>
    );

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      <h1
        style={{
          margin: "0 0 4px",
          fontSize: "1.5rem",
          fontWeight: "800",
          color: "#14162b",
        }}
      >
        Orders
      </h1>
      <p style={{ margin: "0 0 22px", color: "#8b8fa3", fontSize: "0.9rem" }}>
        Manage and track all customer orders.
      </p>

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          border: "1px solid #eef0f5",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid #f0f1f5",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setPage(1);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: "20px",
                  border: "none",
                  fontSize: "0.78rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  backgroundColor: filter === f ? "#14162b" : "#f5f6fb",
                  color: filter === f ? "#fff" : "#8b8fa3",
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            placeholder="Search order #..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "9px 14px",
              borderRadius: "10px",
              border: "1px solid #e4e6ee",
              fontSize: "0.84rem",
              minWidth: "180px",
            }}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#fafbfc" }}>
                {[
                  "Order",
                  "Customer",
                  "Status",
                  "Provider",
                  "Date",
                  "Total",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 20px",
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      color: "#a0a3b5",
                      textTransform: "uppercase",
                      letterSpacing: "0.4px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((o) => {
                const meta = STATUS_META[o.status] || {
                  color: "#8b8fa3",
                  bg: "#f1f2f6",
                };
                return (
                  <tr key={o.id} style={{ borderTop: "1px solid #f0f1f5" }}>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontWeight: "700",
                        color: "#14162b",
                        fontSize: "0.85rem",
                      }}
                    >
                      #{o.id}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg,#7c6cff,#4f46e5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                          }}
                        >
                          U{o.id}
                        </div>
                        <span style={{ fontSize: "0.82rem", color: "#5c5f78" }}>
                          User #{o.id}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          padding: "3px 12px",
                          borderRadius: "20px",
                          backgroundColor: meta.bg,
                          color: meta.color,
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontSize: "0.82rem",
                        color: "#8b8fa3",
                      }}
                    >
                      {o.shipping_provider || "IN_HOUSE"}
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontSize: "0.82rem",
                        color: "#8b8fa3",
                      }}
                    >
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontWeight: "700",
                        color: "#4f46e5",
                        fontSize: "0.85rem",
                      }}
                    >
                      {formatUSD(o.total_amount)}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <Link
                        to={`/admin/orders/${o.id}`}
                        style={{
                          padding: "6px 16px",
                          backgroundColor: "#14162b",
                          color: "#fff",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontSize: "0.78rem",
                          fontWeight: "600",
                        }}
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 20px",
            borderTop: "1px solid #f0f1f5",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#a0a3b5" }}>
            Showing {paginated.length ? (page - 1) * perPage + 1 : 0}–
            {Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #e4e6ee",
                backgroundColor: "#fff",
                cursor: page === 1 ? "not-allowed" : "pointer",
                fontSize: "0.8rem",
                opacity: page === 1 ? 0.5 : 1,
              }}
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #e4e6ee",
                backgroundColor: "#fff",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                fontSize: "0.8rem",
                opacity: page === totalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
