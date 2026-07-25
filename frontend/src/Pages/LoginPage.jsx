import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { setToken, setUser } from "../auth/token";

// Hàm helper: luôn trả về string, không bao giờ trả về object
const extractErrorMessage = (err, fallback) => {
  const detail = err.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d) => d.msg).join(", ");
  }
  if (err.response?.status === 401) {
    return "Incorrect email or password.";
  }
  if (!err.response) {
    return "Cannot connect to server. Please try again.";
  }
  return fallback;
};

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
    <section
      style={{ padding: "40px 16px", maxWidth: "420px", margin: "0 auto" }}
    >
      <h2 style={{ color: "#111", marginBottom: "4px" }}>Welcome Back</h2>
      <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "24px" }}>
        Log in to your ShopAK account.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "0.9rem",
              color: "#333",
            }}
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              fontSize: "0.95rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "0.9rem",
              color: "#333",
            }}
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              fontSize: "0.95rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "500",
            marginTop: "8px",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: "16px",
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

      <p
        style={{
          marginTop: "20px",
          fontSize: "0.9rem",
          color: "#555",
          textAlign: "center",
        }}
      >
        Don't have an account?{" "}
        <Link
          to="/register"
          style={{ color: "#1976d2", textDecoration: "none" }}
        >
          Register
        </Link>
      </p>
    </section>
  );
};

export default LoginPage;
