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
    { label: "Shop", to: "/products" },
    { label: "Bag", to: "/cart" },
    ...(isAuthenticated ? [{ label: "Wishlist", to: "/wishlist" }] : []),
    ...(isAuthenticated
      ? [
          {
            label: "Orders",
            to: role === "ADMIN" ? "/admin/orders" : "/orders",
          },
        ]
      : [{ label: "Sign In", to: "/login" }]),
  ];

  const handleLogout = () => {
    clearToken();
    clearCart();
    navigate("/login");
  };

  return (
    <header
      style={{
        padding: "20px 32px",
        borderBottom: "1px solid #ece6dc",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#faf7f2",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "1.5rem",
          color: "#2b2825",
          fontFamily: "Georgia, serif",
          fontWeight: "400",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </h1>

      <nav style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            style={({ isActive }) => ({
              padding: "8px 18px",
              borderRadius: "30px",
              textDecoration: "none",
              fontSize: "0.86rem",
              fontWeight: isActive ? "600" : "400",
              color: isActive ? "#faf7f2" : "#5c574d",
              backgroundColor: isActive ? "#2b2825" : "transparent",
              transition: "all 0.2s ease",
              position: "relative",
              letterSpacing: "0.2px",
            })}
          >
            {item.label}
            {item.label === "Bag" && totalQuantity > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "2px",
                  backgroundColor: "#c1662f",
                  color: "#fff",
                  fontSize: "0.62rem",
                  fontWeight: "bold",
                  padding: "1px 5px",
                  borderRadius: "20px",
                  minWidth: "15px",
                  textAlign: "center",
                }}
              >
                {totalQuantity}
              </span>
            )}
          </NavLink>
        ))}

        {role === "ADMIN" && (
          <>
            <NavLink
              to="/admin/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 16px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #6d5ef6, #4f46e5)",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: "600",
                marginLeft: "4px",
              }}
            >
              ⚙ Admin Panel
            </NavLink>
            <NavLink
              to="/shipper"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 16px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #34d399, #059669)",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: "600",
                marginLeft: "4px",
              }}
            >
              🚚 Ship Panel
            </NavLink>
          </>
        )}

        {role === "SHIPPER" && (
          <NavLink
            to="/shipper"
            style={{
              padding: "8px 18px",
              borderRadius: "30px",
              backgroundColor: "#34d399",
              color: "#fff",
              textDecoration: "none",
              fontSize: "0.86rem",
              fontWeight: "500",
              marginLeft: "4px",
            }}
          >
            Deliveries
          </NavLink>
        )}
        {isAuthenticated && (
          <>
            <Link
              to="/profile"
              style={{
                fontSize: "0.85rem",
                color: "#888",
                marginLeft: "4px",
                paddingLeft: "12px",
                borderLeft: "1px solid #eee",
                textDecoration: "none",
              }}
            >
              {user?.full_name?.split(" ")[0] || user?.email}
            </Link>
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
