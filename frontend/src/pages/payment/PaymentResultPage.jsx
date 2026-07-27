import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { paymentsApi } from "../../api/paymentsApi";

const providerLabels = { stripe: "Stripe", paypal: "PayPal", vnpay: "VNPay" };

const PaymentResultPage = ({ provider, result }) => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(
    result === "success" ? "confirming" : "canceled",
  );
  const [error, setError] = useState("");

  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (result !== "success") return;

    if (provider === "vnpay") {
      const responseCode = searchParams.get("vnp_ResponseCode");
      if (responseCode !== "00") {
        setStatus("failed");
        return;
      }
    }

    const doConfirm = async () => {
      try {
        if (provider === "paypal") {
          const paypalOrderId = searchParams.get("token");
          await paymentsApi.capturePaypalOrder(paypalOrderId, Number(orderId));
        } else {
          await paymentsApi.confirm(Number(orderId), provider);
        }
        setStatus("success");
      } catch (err) {
        setError("Failed to confirm payment.");
        setStatus("failed");
      }
    };

    if (orderId) doConfirm();
    else setStatus("failed");
  }, [result, provider, orderId, searchParams]);

  const label = providerLabels[provider];

  return (
    <section style={{ padding: "60px 24px", textAlign: "center" }}>
      {status === "confirming" && (
        <>
          <h2 style={{ color: "#888" }}>Confirming payment...</h2>
        </>
      )}

      {status === "success" && (
        <>
          <h2 style={{ color: "#2e7d32", marginBottom: "8px" }}>
            ✓ {label} payment successful
          </h2>
          <p style={{ color: "#888", marginBottom: "20px" }}>
            Your order #{orderId} has been paid.
          </p>
        </>
      )}

      {status === "canceled" && (
        <>
          <h2 style={{ color: "#e53935", marginBottom: "8px" }}>
            {label} payment canceled
          </h2>
          <p style={{ color: "#888", marginBottom: "20px" }}>
            You canceled the payment process.
          </p>
        </>
      )}

      {status === "failed" && (
        <>
          <h2 style={{ color: "#e53935", marginBottom: "8px" }}>
            {label} payment failed
          </h2>
          <p style={{ color: "#888", marginBottom: "20px" }}>
            {error || "Something went wrong while processing your payment."}
          </p>
        </>
      )}

      <Link
        to={orderId ? `/orders/${orderId}` : "/orders"}
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
};

export default PaymentResultPage;
