import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productsApi } from "../api/productsApi";

const ProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    productsApi
      .getById(id)
      .then((p) =>
        setForm({
          name: p.name,
          price: p.price,
          category: p.category,
          description: p.description,
          imageUrl: p.imageUrl,
        }),
      )
      .catch(() => setError("Failed to load product."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await productsApi.update(id, { ...form, price: parseFloat(form.price) });
      navigate("/admin/products");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Failed to update product.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <p style={{ padding: "40px", textAlign: "center", color: "#8b8fa3" }}>
        Loading product...
      </p>
    );

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      <Link
        to="/admin/products"
        style={{
          color: "#8b8fa3",
          textDecoration: "none",
          fontSize: "0.85rem",
        }}
      >
        ← Back to Products
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
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
            Edit Product
          </h1>
          <p
            style={{ margin: "4px 0 0", color: "#8b8fa3", fontSize: "0.88rem" }}
          >
            Update product details and visibility.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/admin/products")}
            type="button"
            style={{
              padding: "11px 22px",
              borderRadius: "10px",
              border: "1px solid #e4e6ee",
              backgroundColor: "#fff",
              color: "#5c5f78",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: "11px 26px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#4f46e5",
              color: "#fff",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "0.85rem",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "18px",
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            borderRadius: "10px",
            color: "#dc2626",
            fontSize: "0.85rem",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
      >
        {/* Left — Image */}
        <div style={{ flex: "1 1 300px", minWidth: "280px" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              border: "1px solid #eef0f5",
              padding: "20px",
            }}
          >
            <p
              style={{
                margin: "0 0 14px",
                fontWeight: "700",
                color: "#14162b",
                fontSize: "0.92rem",
              }}
            >
              Product Image
            </p>
            <div
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: "14px",
                overflow: "hidden",
                backgroundColor: "#f5f6fb",
                marginBottom: "14px",
              }}
            >
              <img
                src={form.imageUrl}
                alt="Preview"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/400x400/f5f6fb/8b8fa3?text=No+Image";
                }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.78rem",
                color: "#8b8fa3",
                fontWeight: "600",
              }}
            >
              IMAGE URL
            </label>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #e4e6ee",
                fontSize: "0.85rem",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Right — Details */}
        <div
          style={{
            flex: "2 1 420px",
            minWidth: "320px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              border: "1px solid #eef0f5",
              padding: "22px",
            }}
          >
            <p
              style={{
                margin: "0 0 16px",
                fontWeight: "700",
                color: "#14162b",
                fontSize: "0.92rem",
              }}
            >
              General Information
            </p>

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.78rem",
                color: "#8b8fa3",
                fontWeight: "600",
              }}
            >
              PRODUCT NAME
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              minLength={3}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #e4e6ee",
                fontSize: "0.88rem",
                boxSizing: "border-box",
                marginBottom: "16px",
              }}
            />

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.78rem",
                color: "#8b8fa3",
                fontWeight: "600",
              }}
            >
              CATEGORY
            </label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              minLength={3}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #e4e6ee",
                fontSize: "0.88rem",
                boxSizing: "border-box",
                marginBottom: "16px",
              }}
            />

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.78rem",
                color: "#8b8fa3",
                fontWeight: "600",
              }}
            >
              DESCRIPTION
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              minLength={5}
              rows={4}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #e4e6ee",
                fontSize: "0.88rem",
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              border: "1px solid #eef0f5",
              padding: "22px",
            }}
          >
            <p
              style={{
                margin: "0 0 16px",
                fontWeight: "700",
                color: "#14162b",
                fontSize: "0.92rem",
              }}
            >
              Pricing
            </p>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.78rem",
                color: "#8b8fa3",
                fontWeight: "600",
              }}
            >
              PRICE (USD)
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#8b8fa3",
                  fontSize: "0.9rem",
                }}
              >
                $
              </span>
              <input
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
                min="0.01"
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 28px",
                  borderRadius: "10px",
                  border: "1px solid #e4e6ee",
                  fontSize: "0.88rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductEditPage;
