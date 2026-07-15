import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ordersApi } from "../api/ordersApi";

const CartPage = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalQuantity,
    totalPrice,
    clearCart,
  } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setPlacingOrder(true);
    setError("");

    try {
      const order = await ordersApi.checkout(items);
      clearCart();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Failed to place order. Please try again.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <section style={{ padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ color: "#111", marginBottom: "8px" }}>Your Cart</h2>
        <p style={{ color: "#888", marginBottom: "20px" }}>
          Your cart is empty. Start adding some products!
        </p>
        <Link
          to="/products"
          style={{
            display: "inline-block",
            padding: "10px 24px",
            backgroundColor: "#1976d2",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section
      style={{ padding: "24px 16px", maxWidth: "900px", margin: "0 auto" }}
    >
      <h2 style={{ color: "#111", marginBottom: "4px" }}>Your Cart</h2>
      <p style={{ color: "#888", marginBottom: "20px", fontSize: "0.95rem" }}>
        Total items: <strong>{totalQuantity}</strong> | Total price:{" "}
        <strong style={{ color: "#1976d2" }}>${totalPrice.toFixed(2)}</strong>
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              referrerPolicy="no-referrer"
              style={{
                width: "70px",
                height: "70px",
                objectFit: "cover",
                borderRadius: "6px",
              }}
            />

            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: "500", color: "#111" }}>
                {item.name}
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  color: "#1976d2",
                  fontWeight: "bold",
                }}
              >
                ${item.price.toFixed(2)}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                style={{
                  width: "28px",
                  height: "28px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                  color: "#000",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                -
              </button>
              <span
                style={{ minWidth: "20px", textAlign: "center", color: "#111" }}
              >
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                style={{
                  width: "28px",
                  height: "28px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                  color: "#000",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                +
              </button>
            </div>

            <p
              style={{
                minWidth: "70px",
                textAlign: "right",
                fontWeight: "bold",
                color: "#111",
              }}
            >
              ${(item.price * item.quantity).toFixed(2)}
            </p>

            <button
              onClick={() => removeFromCart(item.id)}
              style={{
                padding: "6px 12px",
                backgroundColor: "#e53935",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.82rem",
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div
          style={{
            marginTop: "16px",
            padding: "10px 14px",
            backgroundColor: "#fff3f3",
            border: "1px solid #f5c2c2",
            borderRadius: "6px",
            color: "#c0392b",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button
          onClick={clearCart}
          style={{
            padding: "10px 20px",
            backgroundColor: "#757575",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Clear Cart
        </button>
        <button
          onClick={handleCheckout}
          disabled={placingOrder}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            opacity: placingOrder ? 0.7 : 1,
          }}
        >
          {placingOrder ? "Placing Order..." : "Checkout"}
        </button>
      </div>
    </section>
  );
};

export default CartPage;
