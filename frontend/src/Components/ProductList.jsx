import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { productsApi } from "../api/productsApi";
import { useAuth } from "../auth/useAuth";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("");
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productsApi.getAll({ page: 1, size: 100 });
        setProducts(data);
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await productsApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete product. You may not have permission.");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSortOption("");
  };

  const pillStyle = (active) => ({
    padding: "8px 18px",
    borderRadius: "30px",
    fontSize: "0.82rem",
    fontWeight: "500",
    cursor: "pointer",
    whiteSpace: "nowrap",
    border: active ? "1px solid #2b2825" : "1px solid #ece6dc",
    backgroundColor: active ? "#2b2825" : "#fff",
    color: active ? "#faf7f2" : "#5c574d",
    transition: "all 0.2s ease",
  });

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px 24px",
          color: "#a39c8f",
          backgroundColor: "#faf7f2",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid #ece6dc",
            borderTop: "3px solid #c1662f",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontFamily: "Georgia, serif" }}>Loading collection...</p>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          padding: "80px 24px",
          textAlign: "center",
          color: "#c14f2f",
          backgroundColor: "#faf7f2",
        }}
      >
        {error}
      </div>
    );

  const categories = [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const filtered = products
    .filter((p) => {
      const matchCat =
        selectedCategory === "All" ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortOption === "low") return a.price - b.price;
      if (sortOption === "high") return b.price - a.price;
      return 0;
    });

  return (
    <div style={{ backgroundColor: "#faf7f2", minHeight: "100vh" }}>
      {/* ── Page header banner ── */}
      <div style={{ backgroundColor: "#f0e4d8", padding: "56px 32px 44px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p
            style={{
              fontSize: "0.78rem",
              color: "#8a8378",
              marginBottom: "10px",
            }}
          >
            <Link to="/" style={{ color: "#8a8378", textDecoration: "none" }}>
              Home
            </Link>
            {" / "}
            <span style={{ color: "#2b2825" }}>Shop</span>
          </p>
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "2.6rem",
              fontWeight: "400",
              color: "#2b2825",
              margin: "0 0 8px",
            }}
          >
            All Products
          </h1>
          <p style={{ color: "#8a8378", fontSize: "0.95rem", margin: 0 }}>
            {products.length} items across {categories.length - 1} categories
          </p>
        </div>
      </div>

      {/* ── Filters + Grid ── */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "36px 32px 90px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={pillStyle(selectedCategory === cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate("/admin/products/new")}
              style={{
                padding: "10px 22px",
                backgroundColor: "#2b2825",
                color: "#faf7f2",
                border: "none",
                borderRadius: "30px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "500",
              }}
            >
              + Add Product
            </button>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "32px",
            justifyContent: "space-between",
          }}
        >
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "11px 18px",
              borderRadius: "30px",
              border: "1px solid #ece6dc",
              fontSize: "0.85rem",
              flex: "1",
              minWidth: "220px",
              backgroundColor: "#fff",
              color: "#2b2825",
            }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                padding: "11px 16px",
                borderRadius: "30px",
                border: "1px solid #ece6dc",
                fontSize: "0.85rem",
                backgroundColor: "#fff",
                color: "#2b2825",
                cursor: "pointer",
              }}
            >
              <option value="">Sort: Featured</option>
              <option value="low">Price: Low → High</option>
              <option value="high">Price: High → Low</option>
            </select>
            {(search || selectedCategory !== "All" || sortOption) && (
              <button
                onClick={clearFilters}
                style={{
                  padding: "11px 20px",
                  borderRadius: "30px",
                  border: "1px solid #c1662f",
                  color: "#c1662f",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <p
          style={{
            color: "#a39c8f",
            fontSize: "0.82rem",
            marginBottom: "20px",
          }}
        >
          Showing {filtered.length} of {products.length} products
        </p>

        {filtered.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                category={p.category}
                imageUrl={p.imageUrl}
                description={p.description}
                isAdmin={isAdmin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <p
            style={{
              textAlign: "center",
              color: "#a39c8f",
              marginTop: "60px",
              fontFamily: "Georgia, serif",
            }}
          >
            No products match your search.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductList;
