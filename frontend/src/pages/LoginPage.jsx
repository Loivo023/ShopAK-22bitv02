import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { setToken, setUser } from "../auth/token";

const extractErrorMessage = (err, fallback) => {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0)
    return detail.map((d) => d.msg).join(", ");
  if (!err.response) return "Cannot connect to server. Please try again.";
  return fallback;
};

const inputStyle = {
  width: "100%",
  padding: "13px 18px",
  borderRadius: "30px",
  border: "1px solid #ece6dc",
  fontSize: "0.9rem",
  boxSizing: "border-box",
  backgroundColor: "#fff",
  color: "#2b2825",
};

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await authApi.login({
        email: form.email,
        password: form.password,
      });
      setToken(result.access_token);
      setUser(result.user);
      navigate("/products");
    } catch (err) {
      setError(
        extractErrorMessage(
          err,
          "Login failed. Please check your credentials.",
        ),
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
          Welcome Back
        </p>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "2rem",
            fontWeight: "400",
            color: "#2b2825",
            textAlign: "center",
            margin: "0 0 8px",
          }}
        >
          Sign In
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#a39c8f",
            fontSize: "0.88rem",
            marginBottom: "36px",
          }}
        >
          Log in to continue shopping.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={inputStyle}
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
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
              marginTop: "8px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
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

        <p
          style={{
            marginTop: "28px",
            fontSize: "0.86rem",
            color: "#8a8378",
            textAlign: "center",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#c1662f",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
