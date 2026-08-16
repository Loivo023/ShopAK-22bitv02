import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { clearToken } from "../auth/token";
import ShipperChatWidget from "../Components/ShipperChatWidget";

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
  truck:
    "M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  receipt: "M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2V2z M8 7h8 M8 11h8 M8 15h5",
  fleet: "M3 3h18v18H3zM3 9h18M9 21V9",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  box: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
  chart: "M18 20V10M12 20V4M6 20v-6",
  dollar: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  store: "M3 9l1-6h16l1 6M4 9v11h16V9M4 9h16M9 21v-6h6v6",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  menu: "M3 12h18M3 6h18M3 18h18",
  close: "M18 6 6 18M6 6l12 12",
};

const NAV_ITEMS = [
  { label: "Dashboard", to: "/shipper", icon: ICONS.grid },
  { label: "Shipments", to: "/shipper/shipments", icon: ICONS.truck },
  { label: "Orders", to: "/shipper/orders", icon: ICONS.receipt },
  { label: "Fleet", to: "/shipper/fleet", icon: ICONS.fleet },
  { label: "Drivers", to: "/shipper/drivers", icon: ICONS.users },
  { label: "Reports", to: "/shipper/reports", icon: ICONS.chart },
  { label: "Billing", to: "/shipper/billing", icon: ICONS.dollar },
];

const ShipperLayout = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  const initials = (user?.full_name || user?.email || "S")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6fb" }}>
      <style>{`
        @media (max-width: 860px) {
          .shipper-sidebar { position: fixed !important; transform: translateX(-100%); transition: transform 0.25s ease; z-index: 200; }
          .shipper-sidebar.open { transform: translateX(0); }
          .shipper-content { margin-left: 0 !important; }
          .shipper-mobile-toggle { display: flex !important; }
        }
      `}</style>

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

      <aside
        className={`shipper-sidebar${mobileOpen ? " open" : ""}`}
        style={{
          width: "252px",
          flexShrink: 0,
          background: "linear-gradient(180deg, #14162b 0%, #0e0f1f 100%)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          padding: "22px 16px",
          position: "sticky",
          top: 0,
          height: "100vh",
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
                background: "linear-gradient(135deg, #34d399, #059669)",
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
            <span style={{ fontWeight: "700", fontSize: "1.05rem" }}>
              ShopAK <span style={{ color: "#34d399" }}>Shipments</span>
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "#9295b0",
              cursor: "pointer",
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
            overflowY: "auto",
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
              end={item.to === "/shipper"}
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
                  ? "linear-gradient(135deg, rgba(52,211,153,0.25), rgba(5,150,105,0.25))"
                  : "transparent",
                boxShadow: isActive
                  ? "inset 0 0 0 1px rgba(52,211,153,0.35)"
                  : "none",
              })}
            >
              <Icon path={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}

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
          {role === "ADMIN" && (
            <NavLink
              to="/shipper/admin"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 14px",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "#fbbf24",
              }}
            >
              <Icon path={ICONS.grid} size={18} />
              Admin View
            </NavLink>
          )}
        </nav>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.04)",
            marginTop: "12px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #34d399, #059669)",
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
              {user?.full_name || "Shipper"}
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
            style={{
              background: "none",
              border: "none",
              color: "#9295b0",
              cursor: "pointer",
              padding: "6px",
            }}
          >
            <Icon path={ICONS.logout} size={17} />
          </button>
        </div>
      </aside>

      <div className="shipper-content" style={{ flex: 1, minWidth: 0 }}>
        <div
          className="shipper-mobile-toggle"
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
            ShopAK Ship
          </span>
        </div>

        <Outlet />

        <ShipperChatWidget />
      </div>
    </div>
  );
};

export default ShipperLayout;
