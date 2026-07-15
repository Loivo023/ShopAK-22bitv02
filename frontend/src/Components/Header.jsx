import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../auth/useAuth";
import { clearToken } from "../auth/token";

const Header = ({ title }) => {
  const { totalQuantity, clearCart } = useCart();
  const { isAuthenticated, role, user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Products", to: "/products" },
    { label: "Cart", to: "/cart" },
    ...(isAuthenticated
      ? [
          {
            label: "Orders",
            to: role === "ADMIN" ? "/admin/orders" : "/orders",
          },
        ]
      : [{ label: "Login", to: "/login" }]),
  ];

  const handleLogout = () => {
    clearToken();
    clearCart();
    navigate("/login");
  };

  return (
    <header
      style={{
        padding: "16px 24px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "1.4rem", color: "#1976d2" }}>
        {title}
      </h1>
      <nav style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            style={({ isActive }) => ({
              padding: "6px 16px",
              borderRadius: "20px",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: isActive ? "600" : "400",
              color: isActive ? "#fff" : "#555",
              backgroundColor: isActive ? "#1976d2" : "transparent",
              transition: "all 0.2s ease",
              position: "relative",
            })}
          >
            {item.label}
            {item.label === "Cart" && totalQuantity > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-4px",
                  backgroundColor: "#e53935",
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                  padding: "1px 5px",
                  borderRadius: "20px",
                  minWidth: "16px",
                  textAlign: "center",
                }}
              >
                {totalQuantity}
              </span>
            )}
          </NavLink>
        ))}

        {isAuthenticated && (
          <>
            <span
              style={{
                fontSize: "0.85rem",
                color: "#888",
                marginLeft: "4px",
                paddingLeft: "12px",
                borderLeft: "1px solid #eee",
              }}
            >
              {user?.full_name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                border: "1px solid #e53935",
                backgroundColor: "#fff",
                color: "#e53935",
                fontSize: "0.9rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
