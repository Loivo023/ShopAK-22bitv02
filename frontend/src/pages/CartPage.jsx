import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ordersApi } from "../api/ordersApi";
import { formatUSD, formatVND } from "../utils/currency";
import { shippingApi } from "../api/shippingApi";

const CartPage = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalQuantity,
    totalPrice,
    clearCart,
  } = useCart();
  const [shippingAddress, setShippingAddress] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // Thêm state mới ở đầu component
  const [shippingProvider, setShippingProvider] = useState("IN_HOUSE");
  const [toDistrictId, setToDistrictId] = useState("");
  const [toWardCode, setToWardCode] = useState("");
  const [shippingFee, setShippingFee] = useState(15000);
  const [calculatingFee, setCalculatingFee] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  const ghnInputStyle = {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #ece6dc",
    fontSize: "0.85rem",
    boxSizing: "border-box",
  };

  // Thêm hàm tính phí GHN
  const handleCalculateGhnFee = async () => {
    if (!toDistrictId || !toWardCode) {
      setError("Please enter district ID and ward code for GHN.");
      return;
    }
    setCalculatingFee(true);
    setError("");
    try {
      const { fee } = await shippingApi.calculateFee({
        shippingProvider: "GHN",
        toDistrictId: Number(toDistrictId),
        toWardCode,
      });
      setShippingFee(fee);
    } catch (err) {
      setError("Failed to calculate GHN fee. Check district/ward code.");
    } finally {
      setCalculatingFee(false);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!shippingAddress.trim()) {
      setError("Please enter a shipping address.");
      return;
    }

    setPlacingOrder(true);
    setError("");
    try {
      const order = await ordersApi.checkout(items, {
        shippingAddress: shippingAddress.trim(),
        shippingProvider,
        shippingFee: shippingProvider === "IN_HOUSE" ? 15000 : shippingFee,
        toName: shippingProvider === "GHN" ? recipientName : undefined,
        toPhone: shippingProvider === "GHN" ? recipientPhone : undefined,
        toDistrictId:
          shippingProvider === "GHN" ? Number(toDistrictId) : undefined,
        toWardCode: shippingProvider === "GHN" ? toWardCode : undefined,
      });
      clearCart();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <section
        style={{
          padding: "100px 24px",
          textAlign: "center",
          backgroundColor: "#faf7f2",
          minHeight: "60vh",
        }}
      >
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "1.8rem",
            color: "#2b2825",
            fontWeight: "400",
            marginBottom: "10px",
          }}
        >
          Your Bag is Empty
        </h2>
        <p style={{ color: "#a39c8f", marginBottom: "28px" }}>
          Start adding some products you love.
        </p>
        <Link
          to="/products"
          style={{
            display: "inline-block",
            padding: "14px 32px",
            backgroundColor: "#2b2825",
            color: "#faf7f2",
            borderRadius: "30px",
            textDecoration: "none",
            fontWeight: "500",
            fontSize: "0.88rem",
          }}
        >
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section
      style={{
        padding: "48px 32px 80px",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#faf7f2",
      }}
    >
      <h2
        style={{
          fontFamily: "Georgia, serif",
          fontSize: "2rem",
          fontWeight: "400",
          color: "#2b2825",
          marginBottom: "4px",
        }}
      >
        Your Bag
      </h2>
      <p
        style={{ color: "#a39c8f", marginBottom: "32px", fontSize: "0.88rem" }}
      >
        {totalQuantity} item{totalQuantity !== 1 ? "s" : ""}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "16px",
              border: "1px solid #ece6dc",
            }}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              referrerPolicy="no-referrer"
              style={{
                width: "76px",
                height: "76px",
                objectFit: "cover",
                borderRadius: "12px",
              }}
            />

            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: "500", color: "#2b2825" }}>
                {item.name}
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  color: "#c1662f",
                  fontWeight: "600",
                  fontSize: "0.92rem",
                }}
              >
                {formatUSD(item.price)}
              </p>
              <p
                style={{
                  margin: "1px 0 0",
                  color: "#a39c8f",
                  fontSize: "0.74rem",
                }}
              >
                {formatVND(item.price)}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                style={{
                  width: "30px",
                  height: "30px",
                  border: "1px solid #ece6dc",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  color: "#2b2825",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                −
              </button>
              <span
                style={{
                  minWidth: "16px",
                  textAlign: "center",
                  color: "#2b2825",
                }}
              >
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                style={{
                  width: "30px",
                  height: "30px",
                  border: "1px solid #ece6dc",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  color: "#2b2825",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                +
              </button>
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
              style={{
                padding: "8px 14px",
                backgroundColor: "transparent",
                color: "#c14f2f",
                border: "1px solid #f0d4cb",
                borderRadius: "30px",
                cursor: "pointer",
                fontSize: "0.78rem",
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "24px", marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "10px",
            fontSize: "0.85rem",
            color: "#2b2825",
            fontWeight: "500",
          }}
        >
          Delivery Method
        </label>
        <div style={{ display: "flex", gap: "10px" }}>
          <label
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              borderRadius: "14px",
              cursor: "pointer",
              border:
                shippingProvider === "IN_HOUSE"
                  ? "2px solid #2b2825"
                  : "1px solid #ece6dc",
            }}
          >
            <input
              type="radio"
              checked={shippingProvider === "IN_HOUSE"}
              onChange={() => setShippingProvider("IN_HOUSE")}
            />
            <span style={{ fontSize: "0.85rem" }}>
              In-house Delivery (15,000₫)
            </span>
          </label>
          <label
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              borderRadius: "14px",
              cursor: "pointer",
              border:
                shippingProvider === "GHN"
                  ? "2px solid #2b2825"
                  : "1px solid #ece6dc",
            }}
          >
            <input
              type="radio"
              checked={shippingProvider === "GHN"}
              onChange={() => setShippingProvider("GHN")}
            />
            <span style={{ fontSize: "0.85rem" }}>Fast delievery (GHN)</span>
          </label>
        </div>

        {shippingProvider === "GHN" && (
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <input
              placeholder="Recipient name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              style={ghnInputStyle}
            />
            <input
              placeholder="Recipient phone"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              style={ghnInputStyle}
            />
            <input
              placeholder="District ID (from GHN)"
              value={toDistrictId}
              onChange={(e) => setToDistrictId(e.target.value)}
              style={ghnInputStyle}
            />
            <input
              placeholder="Ward code (from GHN)"
              value={toWardCode}
              onChange={(e) => setToWardCode(e.target.value)}
              style={ghnInputStyle}
            />
            <button
              onClick={handleCalculateGhnFee}
              disabled={calculatingFee}
              style={{
                padding: "10px",
                borderRadius: "12px",
                border: "1px solid #2b2825",
                backgroundColor: "#fff",
                color: "#2b2825",
                cursor: "pointer",
                fontSize: "0.82rem",
              }}
            >
              {calculatingFee
                ? "Calculating..."
                : `Calculate Fee${shippingFee ? ` — ${shippingFee.toLocaleString()}₫` : ""}`}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: "28px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "0.85rem",
            color: "#2b2825",
            fontWeight: "500",
          }}
        >
          Shipping Address
        </label>
        <textarea
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          placeholder="Street, city, district, country..."
          rows={2}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "14px",
            border: "1px solid #ece6dc",
            fontSize: "0.88rem",
            boxSizing: "border-box",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      </div>

      {error && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            backgroundColor: "#fdf0eb",
            borderRadius: "12px",
            color: "#c14f2f",
            fontSize: "0.86rem",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          marginTop: "28px",
          padding: "20px 24px",
          backgroundColor: "#fff",
          borderRadius: "16px",
          border: "1px solid #ece6dc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ margin: 0, color: "#a39c8f", fontSize: "0.8rem" }}>
            Total
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "1.4rem",
              fontWeight: "600",
              color: "#2b2825",
            }}
          >
            {formatUSD(totalPrice)}
          </p>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "#a39c8f" }}>
            {formatVND(totalPrice)}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={clearCart}
            style={{
              padding: "12px 20px",
              backgroundColor: "transparent",
              color: "#8a8378",
              border: "1px solid #ece6dc",
              borderRadius: "30px",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Clear
          </button>
          <button
            onClick={handleCheckout}
            disabled={placingOrder}
            style={{
              padding: "12px 28px",
              backgroundColor: "#2b2825",
              color: "#faf7f2",
              border: "none",
              borderRadius: "30px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "500",
              opacity: placingOrder ? 0.7 : 1,
            }}
          >
            {placingOrder ? "Placing..." : "Checkout"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
