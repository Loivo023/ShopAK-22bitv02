import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ordersApi } from "../api/ordersApi";
import { paymentsApi } from "../api/paymentsApi";

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
      <p style={{ padding: "24px", textAlign: "center", color: "#888" }}>
        Loading order...
      </p>
    );
  if (error && !order)
    return (
      <p style={{ padding: "24px", textAlign: "center", color: "red" }}>
        {error}
      </p>
    );
  if (!order) return null;

  if (order.status === "PAID") {
    return (
      <section style={{ padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ color: "#2e7d32", marginBottom: "8px" }}>
          ✓ Order Already Paid
        </h2>
        <p style={{ color: "#888", marginBottom: "20px" }}>
          Order #{order.id} has already been paid.
        </p>
        <Link
          to={`/orders/${order.id}`}
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
          View Order
        </Link>
      </section>
    );
  }

  const methods = [
    { value: "stripe", label: "Stripe (Credit Card)" },
    { value: "paypal", label: "PayPal" },
    { value: "vnpay", label: "VNPay" },
  ];

  return (
    <section
      style={{ padding: "24px 16px", maxWidth: "480px", margin: "0 auto" }}
    >
      <Link
        to={`/orders/${order.id}`}
        style={{
          color: "#1976d2",
          textDecoration: "none",
          fontSize: "0.95rem",
        }}
      >
        ← Back to Order
      </Link>

      <h2 style={{ color: "#111", marginTop: "16px", marginBottom: "4px" }}>
        Pay for Order #{order.id}
      </h2>
      <p
        style={{
          color: "#1976d2",
          fontWeight: "bold",
          fontSize: "1.4rem",
          marginBottom: "24px",
        }}
      >
        ${order.total_amount.toFixed(2)}
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        {methods.map((m) => (
          <label
            key={m.value}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              borderRadius: "8px",
              border:
                method === m.value ? "2px solid #1976d2" : "1px solid #ddd",
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
          >
            <input
              type="radio"
              name="method"
              value={m.value}
              checked={method === m.value}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span style={{ color: "#111", fontSize: "0.95rem" }}>
              {m.label}
            </span>
          </label>
        ))}
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
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

      <button
        onClick={handlePayNow}
        disabled={processing}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: "500",
          opacity: processing ? 0.7 : 1,
        }}
      >
        {processing ? "Redirecting..." : "Pay Now"}
      </button>
    </section>
  );
};

export default OrderPaymentPage;
