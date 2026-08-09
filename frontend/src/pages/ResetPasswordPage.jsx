import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid password reset link.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.resetPassword(token, password);

      setSuccess(
        result.message || "Your password has been reset successfully.",
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      const detail = err?.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to reset your password. The link may have expired.",
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
          Reset Password
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
          Create a new password for your account.
        </p>

        {!token ? (
          <div
            style={{
              padding: "16px 18px",
              backgroundColor: "#fdf0eb",
              borderRadius: "14px",
              color: "#c14f2f",
              fontSize: "0.85rem",
              textAlign: "center",
            }}
          >
            Invalid or missing password reset token.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
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
                marginTop: "6px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

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

        {success && (
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
            {success}
            <br />
            Redirecting to login...
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

export default ResetPasswordPage;
