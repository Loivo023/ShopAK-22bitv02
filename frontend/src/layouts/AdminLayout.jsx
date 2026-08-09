import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { clearToken } from "../auth/token";

const Icon = ({ path, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} />
  </svg>
);

const ICONS = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  box: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
  receipt: "M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2V2z M8 7h8 M8 11h8 M8 15h5",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  chat: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5a8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  store: "M3 9l1-6h16l1 6M4 9v11h16V9M4 9h16M9 21v-6h6v6",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  menu: "M3 12h18M3 6h18M3 18h18",
  close: "M18 6 6 18M6 6l12 12",
  truck:
    "M3 6h11v10H3zM14 9h4l3 3v4h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  chart: "M4 19V5M4 19h16M8 16v-4M12 16V8M16 16V4M20 16V9",
};

const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin/dashboard", icon: ICONS.grid },
  { label: "Products", to: "/admin/products", icon: ICONS.box },
  { label: "Orders", to: "/admin/orders", icon: ICONS.receipt },
  { label: "Users", to: "/admin/users", icon: ICONS.users },
  { label: "Customer Chat", to: "/admin/support", icon: ICONS.chat },
  { label: "Shipper Chat", to: "/admin/shipper-chat", icon: ICONS.chat },
  { label: "Drivers & Fleet", to: "/admin/fleet", icon: ICONS.truck },
  { label: "Reports", to: "/admin/reports", icon: ICONS.chart },
  { label: "Billing", to: "/admin/billing", icon: ICONS.receipt },
  { label: "Analytics", to: "/admin/analytics", icon: ICONS.chart },
];

const AdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  const initials = (user?.full_name || user?.email || "A")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6fb" }}>
      <style>{`
        @media (max-width: 860px) {
          .admin-sidebar {
            position: fixed !important;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            z-index: 200;
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-content {
            margin-left: 0 !important;
          }
          .admin-mobile-toggle {
            display: flex !important;
          }
          .admin-sidebar-close {
            display: block !important;
          }
        }
      `}</style>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,17,26,0.4)",
            zIndex: 150,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar${mobileOpen ? " open" : ""}`}
        style={{
          width: "252px",
          boxSizing: "border-box",
          flexShrink: 0,
          background: "linear-gradient(180deg, #14162b 0%, #0e0f1f 100%)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          padding: "22px 16px",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "36px",
            padding: "0 8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #7c6cff, #4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "0.95rem",
                color: "#fff",
              }}
            >
              S
            </div>
            <span
              style={{
                fontWeight: "700",
                fontSize: "1.05rem",
                letterSpacing: "0.2px",
              }}
            >
              ShopAK <span style={{ color: "#7c6cff" }}>Admin</span>
            </span>
          </div>
          <button
            className="admin-sidebar-close"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "#9295b0",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <Icon path={ICONS.close} />
          </button>
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: "2px",
          }}
        >
          <p
            style={{
              color: "#5c5f78",
              fontSize: "0.7rem",
              fontWeight: "700",
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "0 12px",
              marginBottom: "6px",
            }}
          >
            Menu
          </p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 14px",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: isActive ? "600" : "500",
                color: isActive ? "#fff" : "#9295b0",
                background: isActive
                  ? "linear-gradient(135deg, rgba(124,108,255,0.25), rgba(79,70,229,0.25))"
                  : "transparent",
                boxShadow: isActive
                  ? "inset 0 0 0 1px rgba(124,108,255,0.35)"
                  : "none",
                transition: "all 0.15s ease",
              })}
            >
              <Icon path={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}

          <NavLink
            to="/shipper"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "11px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "500",
              color: "#34d399",
            }}
          >
            <Icon
              path={ICONS.truck || "M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"}
              size={18}
            />
            Shipper Dashboard
          </NavLink>

          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.08)",
              margin: "14px 4px",
            }}
          />

          <NavLink
            to="/products"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "11px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "500",
              color: "#9295b0",
            }}
          >
            <Icon path={ICONS.store} size={18} />
            View Store
          </NavLink>
        </nav>

        {/* User footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.04)",
            marginTop: "12px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c6cff, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
              fontSize: "0.8rem",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                fontWeight: "600",
                color: "#fff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.full_name || "Admin"}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "0.72rem",
                color: "#6d7086",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              background: "none",
              border: "none",
              color: "#9295b0",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
            }}
          >
            <Icon path={ICONS.logout} size={17} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-content" style={{ flex: 1, minWidth: 0 }}>
        {/* Mobile top bar */}
        <div
          className="admin-mobile-toggle"
          style={{
            display: "none",
            alignItems: "center",
            gap: "10px",
            padding: "14px 20px",
            background: "#fff",
            borderBottom: "1px solid #eef0f3",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#101828",
            }}
          >
            <Icon path={ICONS.menu} />
          </button>
          <span style={{ fontWeight: "700", color: "#101828" }}>
            ShopAK Admin
          </span>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
