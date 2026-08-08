import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatUSD, formatVND } from "../utils/currency";
import { wishlistApi } from "../api/extrasApi";
import { useAuth } from "../auth/useAuth";

const ProductCard = ({
  id,
  name,
  price,
  category,
  imageUrl,
  description,
  isAdmin,
  onDelete,
}) => {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({ id, name, price, imageUrl }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const { isAuthenticated } = useAuth();
  const [wished, setWished] = useState(false);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    try {
      if (wished) {
        await wishlistApi.remove(id);
        setWished(false);
      } else {
        await wishlistApi.add(id);
        setWished(true);
      }
    } catch (err) {
      /* silent */
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "#fff",
        borderRadius: "20px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        border: "1px solid #ece6dc",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        transform: hovered ? "translateY(-6px)" : "none",
        boxShadow: hovered
          ? "0 16px 32px rgba(43,40,37,0.08)"
          : "0 2px 8px rgba(43,40,37,0.04)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "220px",
          backgroundColor: "#f0e4d8",
          overflow: "hidden",
        }}
      >
        <img
          src={imageUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/400x400/f0e4d8/8a8378?text=No+Image";
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}
        />
        {price > 150 && (
          <span
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              backgroundColor: "#2b2825",
              color: "#faf7f2",
              fontSize: "0.65rem",
              fontWeight: "600",
              letterSpacing: "0.5px",
              padding: "4px 10px",
              borderRadius: "20px",
              textTransform: "uppercase",
            }}
          >
            {isAuthenticated && (
              <button
                onClick={handleToggleWishlist}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                }}
              >
                {wished ? "❤️" : "🤍"}
              </button>
            )}
            Premium
          </span>
        )}
      </div>

      <div
        style={{
          padding: "18px 20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flex: 1,
        }}
      >
        <span
          style={{
            fontSize: "0.7rem",
            color: "#8a8378",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
          }}
        >
          {category}
        </span>

        <h3
          style={{
            margin: 0,
            fontSize: "1.02rem",
            color: "#2b2825",
            fontWeight: "500",
            lineHeight: "1.35",
          }}
        >
          {name}
        </h3>

        <p
          style={{
            margin: "2px 0 6px",
            fontSize: "0.82rem",
            color: "#a39c8f",
            lineHeight: "1.5",
            minHeight: "38px",
          }}
        >
          {description?.length > 60
            ? description.slice(0, 60) + "…"
            : description}
        </p>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{ fontSize: "1.15rem", fontWeight: "600", color: "#c1662f" }}
          >
            {formatUSD(price)}
          </span>
          <span style={{ fontSize: "0.74rem", color: "#a39c8f" }}>
            {formatVND(price)}
          </span>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Link
            to={`/products/${id}`}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px 0",
              border: "1px solid #2b2825",
              borderRadius: "30px",
              color: "#2b2825",
              textDecoration: "none",
              fontSize: "0.8rem",
              fontWeight: "500",
              letterSpacing: "0.3px",
              transition: "all 0.2s ease",
            }}
          >
            View
          </Link>
          <button
            onClick={handleAddToCart}
            style={{
              flex: 1,
              padding: "10px 0",
              border: "none",
              borderRadius: "30px",
              backgroundColor: added ? "#5a7d5a" : "#2b2825",
              color: "#faf7f2",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "500",
              letterSpacing: "0.3px",
              transition: "background-color 0.2s ease",
            }}
          >
            {added ? "Added ✓" : "Add to Bag"}
          </button>
        </div>

        {isAdmin && (
          <button
            onClick={() => onDelete(id)}
            style={{
              marginTop: "6px",
              padding: "8px 0",
              backgroundColor: "transparent",
              color: "#c14f2f",
              border: "1px solid #f0d4cb",
              borderRadius: "30px",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: "500",
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
