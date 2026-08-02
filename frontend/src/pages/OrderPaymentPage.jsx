import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ordersApi } from "../api/ordersApi";
import { paymentsApi } from "../api/paymentsApi";
import { formatUSD, formatVND } from "../utils/currency";

const OrderPaymentPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("stripe");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await ordersApi.getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError("Failed to load order.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handlePayNow = async () => {
    setProcessing(true);
    setError("");
    try {
      if (method === "stripe") {
        const { url } = await paymentsApi.createStripeSession(order.id);
        window.location.href = url;
      } else if (method === "paypal") {
        const { approve_url } = await paymentsApi.createPaypalOrder(order.id);
        window.location.href = approve_url;
      } else if (method === "vnpay") {
        const { url } = await paymentsApi.createVnpayUrl(order.id);
        window.location.href = url;
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Failed to start payment.",
      );
      setProcessing(false);
    }
  };

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
        <p style={{ fontFamily: "Georgia, serif" }}>Loading order...</p>
      </div>
    );

  if (error && !order)
    return (
      <p
        style={{
          padding: "80px 24px",
          textAlign: "center",
          color: "#c14f2f",
          backgroundColor: "#faf7f2",
        }}
      >
        {error}
      </p>
    );
  if (!order) return null;

  if (order.status === "PAID") {
    return (
      <div
        style={{
          backgroundColor: "#faf7f2",
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 24px",
        }}
      >
        <p style={{ fontSize: "2.5rem", marginBottom: "8px" }}>✓</p>
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "1.7rem",
            fontWeight: "400",
            color: "#2b2825",
            marginBottom: "10px",
          }}
        >
          Order Already Paid
        </h2>
        <p style={{ color: "#a39c8f", marginBottom: "28px" }}>
          Order #{order.id} has already been paid.
        </p>
        <Link
          to={`/orders/${order.id}`}
          style={{
            padding: "13px 30px",
            backgroundColor: "#2b2825",
            color: "#faf7f2",
            borderRadius: "30px",
            textDecoration: "none",
            fontWeight: "500",
            fontSize: "0.88rem",
          }}
        >
          View Order
        </Link>
      </div>
    );
  }

  const methods = [
    { value: "stripe", label: "Credit Card (Stripe)", icon: "💳" },
    { value: "paypal", label: "PayPal", icon: "🅿️" },
    { value: "vnpay", label: "VNPay", icon: "🏦" },
  ];

  return (
    <div style={{ backgroundColor: "#faf7f2", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "460px",
          margin: "0 auto",
          padding: "48px 24px 90px",
        }}
      >
        <Link
          to={`/orders/${order.id}`}
          style={{
            color: "#8a8378",
            textDecoration: "none",
            fontSize: "0.85rem",
          }}
        >
          ← Back to Order
        </Link>

        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "1.9rem",
            fontWeight: "400",
            color: "#2b2825",
            margin: "20px 0 4px",
          }}
        >
          Complete Payment
        </h1>
        <p
          style={{ color: "#a39c8f", fontSize: "0.86rem", marginBottom: "8px" }}
        >
          Order #{order.id}
        </p>

        <div style={{ marginBottom: "28px" }}>
          <p
            style={{
              margin: 0,
              fontSize: "1.7rem",
              fontWeight: "600",
              color: "#c1662f",
            }}
          >
            {formatUSD(order.total_amount)}
          </p>
          <p
            style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#a39c8f" }}
          >
            {formatVND(order.total_amount)}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "28px",
          }}
        >
          {methods.map((m) => (
            <label
              key={m.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 18px",
                borderRadius: "16px",
                border:
                  method === m.value
                    ? "2px solid #2b2825"
                    : "1px solid #ece6dc",
                backgroundColor: "#fff",
                cursor: "pointer",
                transition: "border-color 0.2s ease",
              }}
            >
              <input
                type="radio"
                name="method"
                value={m.value}
                checked={method === m.value}
                onChange={(e) => setMethod(e.target.value)}
              />
              <span style={{ fontSize: "1.1rem" }}>{m.icon}</span>
              <span style={{ color: "#2b2825", fontSize: "0.9rem" }}>
                {m.label}
              </span>
            </label>
          ))}
        </div>

        {error && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 16px",
              backgroundColor: "#fdf0eb",
              borderRadius: "14px",
              color: "#c14f2f",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handlePayNow}
          disabled={processing}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: "#2b2825",
            color: "#faf7f2",
            border: "none",
            borderRadius: "30px",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "500",
            opacity: processing ? 0.7 : 1,
          }}
        >
          {processing ? "Redirecting..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default OrderPaymentPage;
