import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ordersApi } from "../api/ordersApi";
import { shippingApi } from "../api/shippingApi";
import { ghnApi } from "../api/ghnApi";
import { formatUSD, formatVND } from "../utils/currency";
import { voucherApi } from "../api/extrasApi";

const inputStyle = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #ece6dc",
  fontSize: "0.85rem",
  boxSizing: "border-box",
  backgroundColor: "#fff",
  color: "#2b2825",
};

const CartPage = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalQuantity,
    totalPrice,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingProvider, setShippingProvider] = useState("IN_HOUSE");
  const [error, setError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherResult, setVoucherResult] = useState(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  // GHN specifics
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [calculatingFee, setCalculatingFee] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  useEffect(() => {
    if (shippingProvider !== "GHN" || provinces.length > 0) return;
    setLoadingProvinces(true);
    ghnApi
      .getProvinces()
      .then(setProvinces)
      .catch(() =>
        setError("Failed to load GHN provinces. Check API configuration."),
      )
      .finally(() => setLoadingProvinces(false));
  }, [shippingProvider]);

  useEffect(() => {
    if (!provinceId) {
      setDistricts([]);
      setDistrictId("");
      return;
    }
    ghnApi
      .getDistricts(Number(provinceId))
      .then(setDistricts)
      .catch(() => setDistricts([]));
    setDistrictId("");
    setWardCode("");
    setWards([]);
  }, [provinceId]);

  useEffect(() => {
    if (!districtId) {
      setWards([]);
      setWardCode("");
      return;
    }
    ghnApi
      .getWards(Number(districtId))
      .then(setWards)
      .catch(() => setWards([]));
    setWardCode("");
  }, [districtId]);

  const effectiveFee = shippingProvider === "IN_HOUSE" ? 15000 : shippingFee;

  const handleCalculateFee = async () => {
    if (!districtId || !wardCode) {
      setError("Please select district and ward.");
      return;
    }
    setCalculatingFee(true);
    setError("");
    try {
      const { fee } = await shippingApi.calculateFee({
        shippingProvider: "GHN",
        toDistrictId: Number(districtId),
        toWardCode: wardCode,
      });
      setShippingFee(fee);
    } catch (err) {
      setError("Failed to calculate GHN fee.");
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
    if (shippingProvider === "GHN") {
      if (!recipientName || !recipientPhone || !districtId || !wardCode) {
        setError(
          "Please complete all GHN delivery fields and calculate the fee.",
        );
        return;
      }
      const discount = voucherResult?.valid ? voucherResult.discount_amount : 0;
      const finalFee =
        voucherResult?.valid && voucherResult.free_shipping ? 0 : effectiveFee;
      if (shippingFee === 0) {
        setError("Please calculate the shipping fee first.");
        return;
      }
    }

    const handleApplyVoucher = async () => {
      if (!voucherCode.trim()) return;
      setCheckingVoucher(true);
      try {
        const result = await voucherApi.apply(
          voucherCode.trim().toUpperCase(),
          totalPrice,
        );
        setVoucherResult(result);
      } catch (err) {
        setVoucherResult({ valid: false, message: "Failed to apply voucher." });
      } finally {
        setCheckingVoucher(false);
      }
    };

    setPlacingOrder(true);
    setError("");
    try {
      const order = await ordersApi.checkout(items, {
        shippingAddress: shippingAddress.trim(),
        shippingProvider,
        shippingFee: effectiveFee,
        toName: shippingProvider === "GHN" ? recipientName : undefined,
        toPhone: shippingProvider === "GHN" ? recipientPhone : undefined,
        toDistrictId:
          shippingProvider === "GHN" ? Number(districtId) : undefined,
        toWardCode: shippingProvider === "GHN" ? wardCode : undefined,
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

      {/* ── Delivery method ── */}
      <div style={{ marginTop: "28px" }}>
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
            <span style={{ fontSize: "0.84rem" }}>
              In-house — {(15000).toLocaleString()}₫
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
            <span style={{ fontSize: "0.84rem" }}>Giao Hàng Nhanh</span>
          </label>
        </div>

        {shippingProvider === "GHN" && (
          <div
            style={{
              marginTop: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "16px",
              backgroundColor: "#fff",
              borderRadius: "16px",
              border: "1px solid #ece6dc",
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                placeholder="Recipient name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                placeholder="Phone number"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>

            <select
              value={provinceId}
              onChange={(e) => setProvinceId(e.target.value)}
              style={inputStyle}
              disabled={loadingProvinces}
            >
              <option value="">
                {loadingProvinces
                  ? "Loading provinces..."
                  : "Select Province/City"}
              </option>
              {provinces.map((p) => (
                <option key={p.ProvinceID} value={p.ProvinceID}>
                  {p.ProvinceName}
                </option>
              ))}
            </select>

            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              style={inputStyle}
              disabled={!provinceId}
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.DistrictID} value={d.DistrictID}>
                  {d.DistrictName}
                </option>
              ))}
            </select>

            <select
              value={wardCode}
              onChange={(e) => setWardCode(e.target.value)}
              style={inputStyle}
              disabled={!districtId}
            >
              <option value="">Select Ward</option>
              {wards.map((w) => (
                <option key={w.WardCode} value={w.WardCode}>
                  {w.WardName}
                </option>
              ))}
            </select>

            <button
              onClick={handleCalculateFee}
              disabled={calculatingFee || !wardCode}
              style={{
                padding: "11px",
                borderRadius: "14px",
                border: "1px solid #2b2825",
                backgroundColor: "#fff",
                color: "#2b2825",
                cursor: "pointer",
                fontSize: "0.84rem",
                fontWeight: "500",
              }}
            >
              {calculatingFee
                ? "Calculating..."
                : shippingFee > 0
                  ? `Fee: ${shippingFee.toLocaleString()}₫ — Recalculate`
                  : "Calculate Shipping Fee"}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "0.85rem",
            color: "#2b2825",
            fontWeight: "500",
          }}
        >
          Voucher Code
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            placeholder="Enter code (e.g. WELCOME10)"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={handleApplyVoucher}
            disabled={checkingVoucher}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              border: "1px solid #2b2825",
              backgroundColor: "#fff",
              color: "#2b2825",
              cursor: "pointer",
              fontSize: "0.84rem",
            }}
          >
            {checkingVoucher ? "..." : "Apply"}
          </button>
        </div>
        {voucherResult?.valid && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.85rem",
              color: "#5a7d5a",
              marginBottom: "6px",
            }}
          >
            <span>Discount ({voucherCode})</span>
            <span>-{formatUSD(discount)}</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
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
            ...inputStyle,
            width: "100%",
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
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem",
            color: "#5c574d",
            marginBottom: "6px",
          }}
        >
          <span>Subtotal</span>
          <span>{formatUSD(totalPrice)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem",
            color: "#5c574d",
            marginBottom: "12px",
          }}
        >
          <span>Shipping</span>
          <span>{formatVND(effectiveFee / 25400)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "12px",
            borderTop: "1px solid #ece6dc",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "1.4rem",
                fontWeight: "600",
                color: "#2b2825",
              }}
            >
              {formatUSD(totalPrice + effectiveFee / 25400)}
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
      </div>
    </section>
  );
};

export default CartPage;
