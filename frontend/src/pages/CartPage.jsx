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

  // =========================
  // BASIC CHECKOUT STATE
  // =========================

  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingProvider, setShippingProvider] = useState("IN_HOUSE");
  const [error, setError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  // =========================
  // VOUCHER STATE
  // =========================

  const [voucherCode, setVoucherCode] = useState("");
  const [voucherResult, setVoucherResult] = useState(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  // =========================
  // GHN STATE
  // =========================

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

  // =========================
  // GHN: LOAD PROVINCES
  // =========================

  useEffect(() => {
    if (shippingProvider !== "GHN" || provinces.length > 0) {
      return;
    }

    setLoadingProvinces(true);

    ghnApi
      .getProvinces()
      .then(setProvinces)
      .catch(() => {
        setError("Failed to load GHN provinces. Check API configuration.");
      })
      .finally(() => {
        setLoadingProvinces(false);
      });
  }, [shippingProvider, provinces.length]);

  // =========================
  // GHN: LOAD DISTRICTS
  // =========================

  useEffect(() => {
    if (!provinceId) {
      setDistricts([]);
      setDistrictId("");
      setWards([]);
      setWardCode("");
      return;
    }

    ghnApi
      .getDistricts(Number(provinceId))
      .then(setDistricts)
      .catch(() => {
        setDistricts([]);
      });

    setDistrictId("");
    setWardCode("");
    setWards([]);
  }, [provinceId]);

  // =========================
  // GHN: LOAD WARDS
  // =========================

  useEffect(() => {
    if (!districtId) {
      setWards([]);
      setWardCode("");
      return;
    }

    ghnApi
      .getWards(Number(districtId))
      .then(setWards)
      .catch(() => {
        setWards([]);
      });

    setWardCode("");
  }, [districtId]);

  // =========================
  // SHIPPING CALCULATION
  // =========================

  const baseShippingFee = shippingProvider === "IN_HOUSE" ? 15000 : shippingFee;

  // Voucher discount
  const discount =
    voucherResult?.valid && voucherResult?.discount_amount
      ? Number(voucherResult.discount_amount)
      : 0;

  // Free shipping voucher
  const finalShippingFee =
    voucherResult?.valid && voucherResult?.free_shipping ? 0 : baseShippingFee;

  // Final total
  const finalTotal =
    Math.max(0, totalPrice - discount) + finalShippingFee / 25400;

  // =========================
  // CALCULATE GHN FEE
  // =========================

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
      console.error("GHN fee calculation error:", err);
      setError("Failed to calculate GHN fee.");
    } finally {
      setCalculatingFee(false);
    }
  };

  // =========================
  // APPLY VOUCHER
  // =========================

  const handleApplyVoucher = async () => {
    const code = voucherCode.trim().toUpperCase();

    if (!code) {
      setVoucherResult(null);
      return;
    }

    setCheckingVoucher(true);
    setError("");

    try {
      const result = await voucherApi.apply(code, totalPrice);

      setVoucherResult(result);
    } catch (err) {
      console.error("Voucher error:", err);

      setVoucherResult({
        valid: false,
        message: "Failed to apply voucher.",
      });
    } finally {
      setCheckingVoucher(false);
    }
  };

  // =========================
  // CHECKOUT
  // =========================

  const handleCheckout = async () => {
    if (items.length === 0) {
      return;
    }

    // Shipping address required
    if (!shippingAddress.trim()) {
      setError("Please enter a shipping address.");
      return;
    }

    // GHN validation
    if (shippingProvider === "GHN") {
      if (
        !recipientName.trim() ||
        !recipientPhone.trim() ||
        !districtId ||
        !wardCode
      ) {
        setError(
          "Please complete all GHN delivery fields and calculate the fee.",
        );
        return;
      }

      if (shippingFee === 0) {
        setError("Please calculate the shipping fee first.");
        return;
      }
    }

    setPlacingOrder(true);
    setError("");

    try {
      const order = await ordersApi.checkout(items, {
        shippingAddress: shippingAddress.trim(),

        shippingProvider,

        // Apply free-shipping voucher to checkout shipping fee
        shippingFee: finalShippingFee,

        toName: shippingProvider === "GHN" ? recipientName.trim() : undefined,

        toPhone: shippingProvider === "GHN" ? recipientPhone.trim() : undefined,

        toDistrictId:
          shippingProvider === "GHN" ? Number(districtId) : undefined,

        toWardCode: shippingProvider === "GHN" ? wardCode : undefined,
      });

      clearCart();

      navigate(`/orders/${order.id}`);
    } catch (err) {
      console.error("Checkout error:", err);

      const detail = err.response?.data?.detail;

      setError(typeof detail === "string" ? detail : "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // =========================
  // EMPTY CART
  // =========================

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

        <p
          style={{
            color: "#a39c8f",
            marginBottom: "28px",
          }}
        >
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

  // =========================
  // MAIN PAGE
  // =========================

  return (
    <section
      style={{
        padding: "48px 32px 80px",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#faf7f2",
      }}
    >
      {/* =========================
          TITLE
      ========================= */}

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
        style={{
          color: "#a39c8f",
          marginBottom: "32px",
          fontSize: "0.88rem",
        }}
      >
        {totalQuantity} item
        {totalQuantity !== 1 ? "s" : ""}
      </p>

      {/* =========================
          CART ITEMS
      ========================= */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
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
              <p
                style={{
                  margin: 0,
                  fontWeight: "500",
                  color: "#2b2825",
                }}
              >
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

            {/* Quantity */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
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

            {/* Remove */}
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

      {/* =========================
          DELIVERY METHOD
      ========================= */}

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

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          {/* In-house */}
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
              onChange={() => {
                setShippingProvider("IN_HOUSE");
                setShippingFee(0);
                setError("");
              }}
            />

            <span style={{ fontSize: "0.84rem" }}>In-house — 15,000₫</span>
          </label>

          {/* GHN */}
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
              onChange={() => {
                setShippingProvider("GHN");
                setShippingFee(0);
                setError("");
              }}
            />

            <span
              style={{
                fontSize: "0.84rem",
              }}
            >
              Giao Hàng Nhanh
            </span>
          </label>
        </div>

        {/* =========================
            GHN FORM
        ========================= */}

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
            {/* Name + Phone */}
            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <input
                placeholder="Recipient name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                style={{
                  ...inputStyle,
                  flex: 1,
                }}
              />

              <input
                placeholder="Phone number"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                style={{
                  ...inputStyle,
                  flex: 1,
                }}
              />
            </div>

            {/* Province */}
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

            {/* District */}
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

            {/* Ward */}
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

            {/* Calculate Fee */}
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

      {/* =========================
          VOUCHER
      ========================= */}

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

        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            value={voucherCode}
            onChange={(e) => {
              setVoucherCode(e.target.value);

              // Remove old voucher result when
              // user changes the code
              if (voucherResult) {
                setVoucherResult(null);
              }
            }}
            placeholder="Enter code (e.g. WELCOME10)"
            style={{
              ...inputStyle,
              flex: 1,
            }}
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
              cursor: checkingVoucher ? "not-allowed" : "pointer",
              fontSize: "0.84rem",
              opacity: checkingVoucher ? 0.7 : 1,
            }}
          >
            {checkingVoucher ? "..." : "Apply"}
          </button>
        </div>

        {/* Voucher result */}
        {voucherResult && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px 14px",
              borderRadius: "10px",
              backgroundColor: voucherResult.valid ? "#eef8ef" : "#fdf0eb",
              color: voucherResult.valid ? "#4d7c4d" : "#c14f2f",
              fontSize: "0.82rem",
            }}
          >
            {voucherResult.valid
              ? voucherResult.message || "Voucher applied successfully."
              : voucherResult.message || "Invalid voucher."}
          </div>
        )}

        {/* Discount */}
        {voucherResult?.valid && discount > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.85rem",
              color: "#5a7d5a",
              marginTop: "8px",
            }}
          >
            <span>Discount ({voucherCode.toUpperCase()})</span>

            <span>-{formatUSD(discount)}</span>
          </div>
        )}

        {/* Free shipping message */}
        {voucherResult?.valid && voucherResult.free_shipping && (
          <div
            style={{
              marginTop: "6px",
              fontSize: "0.82rem",
              color: "#5a7d5a",
            }}
          >
            ✓ Free shipping applied
          </div>
        )}
      </div>

      {/* =========================
          SHIPPING ADDRESS
      ========================= */}

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

      {/* =========================
          ERROR
      ========================= */}

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

      {/* =========================
          ORDER SUMMARY
      ========================= */}

      <div
        style={{
          marginTop: "28px",
          padding: "20px 24px",
          backgroundColor: "#fff",
          borderRadius: "16px",
          border: "1px solid #ece6dc",
        }}
      >
        {/* Subtotal */}
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

        {/* Discount */}
        {voucherResult?.valid && discount > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.85rem",
              color: "#5a7d5a",
              marginBottom: "6px",
            }}
          >
            <span>Discount</span>

            <span>-{formatUSD(discount)}</span>
          </div>
        )}

        {/* Shipping */}
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

          <span>
            {finalShippingFee === 0
              ? "FREE"
              : formatVND(finalShippingFee / 25400)}
          </span>
        </div>

        {/* Total */}
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
                fontSize: "0.75rem",
                color: "#8a8378",
                marginBottom: "4px",
              }}
            >
              Total
            </p>

            <p
              style={{
                margin: 0,
                fontSize: "1.4rem",
                fontWeight: "600",
                color: "#2b2825",
              }}
            >
              {formatUSD(finalTotal)}
            </p>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
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
                cursor: placingOrder ? "not-allowed" : "pointer",
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
