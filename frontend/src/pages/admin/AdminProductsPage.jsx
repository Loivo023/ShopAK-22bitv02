import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "../../api/productsApi";

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await productsApi.getAll({ page: 1, size: 100 });
      setProducts(data);
    } catch (err) {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await productsApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <p style={{ padding: "24px", textAlign: "center", color: "#888" }}>
        Loading products...
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ color: "#14162b", margin: 0, fontSize: "1.4rem" }}>
            Products
          </h2>
          <p
            style={{ color: "#8b8fa3", margin: "4px 0 0", fontSize: "0.9rem" }}
          >
            Manage your product catalog.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          style={{
            padding: "10px 18px",
            backgroundColor: "#4f46e5",
            color: "#fff",
            borderRadius: "10px",
            textDecoration: "none",
            fontSize: "0.88rem",
            fontWeight: "600",
          }}
        >
          + New Product
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "9px 14px",
          borderRadius: "10px",
          border: "1px solid #e4e6ee",
          fontSize: "0.88rem",
          width: "100%",
          maxWidth: "320px",
          marginBottom: "18px",
          boxSizing: "border-box",
        }}
      />

      {filtered.length === 0 ? (
        <p style={{ color: "#a0a3b5", textAlign: "center", padding: "40px 0" }}>
          No products found.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          {filtered.map((p) => (
            <div
              key={p.id}
              style={{
                background: "#fff",
                borderRadius: "16px",
                border: "1px solid #eef0f5",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <img
                src={p.imageUrl}
                alt={p.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/300x180?text=No+Image";
                }}
                style={{ width: "100%", height: "140px", objectFit: "cover" }}
              />
              <div
                style={{
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  flex: 1,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    color: "#14162b",
                    fontSize: "0.92rem",
                  }}
                >
                  {p.name}
                </p>
                <p style={{ margin: 0, color: "#a0a3b5", fontSize: "0.78rem" }}>
                  {p.category}
                </p>
                <p
                  style={{
                    margin: "4px 0 10px",
                    fontWeight: "700",
                    color: "#4f46e5",
                  }}
                >
                  ${p.price}
                </p>

                <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                  <Link
                    to={`/admin/products/${p.id}/edit`}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "8px 0",
                      backgroundColor: "#f5f6fb",
                      color: "#14162b",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "0.82rem",
                      fontWeight: "600",
                    }}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      backgroundColor: "#fef2f2",
                      color: "#dc2626",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      fontWeight: "600",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
