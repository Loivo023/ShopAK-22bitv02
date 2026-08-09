import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/authApi";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await authApi.forgotPassword(email);

      setMessage(result.message || "Password reset request submitted.");
    } catch (err) {
      const detail = err?.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to process your request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#faf7f2",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <p
          style={{
            fontSize: "0.75rem",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#c1662f",
            fontWeight: "600",
            marginBottom: "10px",
            textAlign: "center",
          }}
        >
          Account Recovery
        </p>

        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "2rem",
            fontWeight: "400",
            color: "#2b2825",
            textAlign: "center",
            margin: "0 0 10px",
          }}
        >
          Forgot Password
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#a39c8f",
            fontSize: "0.88rem",
            lineHeight: "1.6",
            marginBottom: "30px",
          }}
        >
          Enter your email address and we'll help you reset your password.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "13px 18px",
              borderRadius: "30px",
              border: "1px solid #ece6dc",
              fontSize: "0.9rem",
              boxSizing: "border-box",
              backgroundColor: "#fff",
              color: "#2b2825",
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "15px",
              backgroundColor: "#2b2825",
              color: "#faf7f2",
              border: "none",
              borderRadius: "30px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Processing..." : "Reset Password"}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: "18px",
              padding: "12px 18px",
              backgroundColor: "#fdf0eb",
              borderRadius: "14px",
              color: "#c14f2f",
              fontSize: "0.85rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            style={{
              marginTop: "18px",
              padding: "14px 18px",
              backgroundColor: "#eef7ee",
              borderRadius: "14px",
              color: "#4f754f",
              fontSize: "0.85rem",
              textAlign: "center",
              lineHeight: "1.5",
            }}
          >
            {message}
          </div>
        )}

        <p
          style={{
            marginTop: "28px",
            fontSize: "0.86rem",
            color: "#8a8378",
            textAlign: "center",
          }}
        >
          Remember your password?{" "}
          <Link
            to="/login"
            style={{
              color: "#c1662f",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
