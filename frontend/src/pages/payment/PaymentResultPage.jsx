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
    <div
      style={{
        backgroundColor: "#faf7f2",
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      {status === "confirming" && (
        <>
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid #ece6dc",
              borderTop: "3px solid #c1662f",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              marginBottom: "20px",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#a39c8f", fontFamily: "Georgia, serif" }}>
            Confirming payment...
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>✓</p>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.7rem",
              fontWeight: "400",
              color: "#2b2825",
              marginBottom: "10px",
            }}
          >
            {label} Payment Successful
          </h2>
          <p style={{ color: "#a39c8f", marginBottom: "28px" }}>
            Your order #{orderId} has been paid.
          </p>
        </>
      )}

      {status === "canceled" && (
        <>
          <p style={{ fontSize: "3rem", margin: "0 0 12px", color: "#c14f2f" }}>
            ✕
          </p>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.7rem",
              fontWeight: "400",
              color: "#2b2825",
              marginBottom: "10px",
            }}
          >
            {label} Payment Canceled
          </h2>
          <p style={{ color: "#a39c8f", marginBottom: "28px" }}>
            You canceled the payment process.
          </p>
        </>
      )}

      {status === "failed" && (
        <>
          <p style={{ fontSize: "3rem", margin: "0 0 12px", color: "#c14f2f" }}>
            ✕
          </p>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.7rem",
              fontWeight: "400",
              color: "#2b2825",
              marginBottom: "10px",
            }}
          >
            {label} Payment Failed
          </h2>
          <p style={{ color: "#a39c8f", marginBottom: "28px" }}>
            {error || "Something went wrong while processing your payment."}
          </p>
        </>
      )}

      {status !== "confirming" && (
        <Link
          to={orderId ? `/orders/${orderId}` : "/orders"}
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
      )}
    </div>
  );
};

export default PaymentResultPage;
