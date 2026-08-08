import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { wishlistApi } from "../api/extrasApi";
import { formatUSD, formatVND } from "../utils/currency";

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      setItems(await wishlistApi.getAll());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    await wishlistApi.remove(productId);
    setItems((prev) => prev.filter((p) => p.product_id !== productId));
  };

  if (loading)
    return (
      <p
        style={{
          padding: "100px 24px",
          textAlign: "center",
          color: "#a39c8f",
          backgroundColor: "#faf7f2",
        }}
      >
        Loading...
      </p>
    );

  return (
    <div style={{ backgroundColor: "#faf7f2", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "48px 32px 90px",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#c1662f",
            fontWeight: "600",
            margin: "0 0 8px",
          }}
        >
          Saved For Later
        </p>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "2.1rem",
            fontWeight: "400",
            color: "#2b2825",
            margin: "0 0 32px",
          }}
        >
          Your Wishlist
        </h1>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#a39c8f", marginBottom: "24px" }}>
              Your wishlist is empty.
            </p>
            <Link
              to="/products"
              style={{
                padding: "13px 30px",
                backgroundColor: "#2b2825",
                color: "#faf7f2",
                borderRadius: "30px",
                textDecoration: "none",
                fontSize: "0.88rem",
                fontWeight: "500",
              }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            {items.map((p) => (
              <div
                key={p.product_id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "18px",
                  overflow: "hidden",
                  border: "1px solid #ece6dc",
                }}
              >
                <Link
                  to={`/products/${p.product_id}`}
                  style={{ display: "block" }}
                >
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                    }}
                  />
                </Link>
                <div style={{ padding: "14px 16px" }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: "500",
                      color: "#2b2825",
                      fontSize: "0.9rem",
                    }}
                  >
                    {p.name}
                  </p>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontWeight: "600",
                      color: "#c1662f",
                    }}
                  >
                    {formatUSD(p.price)}
                  </p>
                  <p
                    style={{ margin: 0, fontSize: "0.72rem", color: "#a39c8f" }}
                  >
                    {formatVND(p.price)}
                  </p>
                  <button
                    onClick={() => handleRemove(p.product_id)}
                    style={{
                      marginTop: "10px",
                      width: "100%",
                      padding: "9px 0",
                      borderRadius: "30px",
                      border: "1px solid #f0d4cb",
                      backgroundColor: "transparent",
                      color: "#c14f2f",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
