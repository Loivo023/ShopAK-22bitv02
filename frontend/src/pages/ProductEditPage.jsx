import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsApi } from "../api/productsApi";

const inputStyle = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #e4e6ee",
  fontSize: "0.92rem",
  boxSizing: "border-box",
};

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
    const fetchProduct = async () => {
      try {
        const p = await productsApi.getById(id);
        setForm({
          name: p.name,
          price: p.price,
          category: p.category,
          description: p.description,
          imageUrl: p.imageUrl,
        });
      } catch (err) {
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await productsApi.update(id, {
        name: form.name,
        price: parseFloat(form.price),
        category: form.category,
        description: form.description,
        imageUrl: form.imageUrl,
      });
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
      <p style={{ padding: "28px", textAlign: "center", color: "#888" }}>
        Loading product...
      </p>
    );

  return (
    <div style={{ padding: "28px 32px 60px", maxWidth: "520px" }}>
      <h2
        style={{ color: "#14162b", marginBottom: "20px", fontSize: "1.3rem" }}
      >
        Edit Product
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
      >
        <input
          name="name"
          placeholder="Product name"
          value={form.name}
          onChange={handleChange}
          required
          minLength={3}
          style={inputStyle}
        />
        <input
          name="price"
          type="number"
          step="0.01"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
          min="0.01"
          style={inputStyle}
        />
        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
          minLength={3}
          style={inputStyle}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          minLength={5}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        <input
          name="imageUrl"
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              padding: "11px",
              backgroundColor: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.92rem",
              fontWeight: "600",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            style={{
              padding: "11px 20px",
              backgroundColor: "#f5f6fb",
              color: "#14162b",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.92rem",
              fontWeight: "600",
            }}
          >
            Cancel
          </button>
        </div>
      </form>

      {error && (
        <div
          style={{
            marginTop: "16px",
            padding: "10px 14px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#dc2626",
            fontSize: "0.88rem",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default ProductEditPage;
