// src/components/Header.jsx
import { useState } from "react";

const Header = ({ title }) => {
  const navItems = ["Home", "Products", "Cart", "Login"];
  const [activeItem, setActiveItem] = useState("Home");

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
      }}
    >
      <h1 style={{ margin: 0, fontSize: "1.4rem", color: "#1976d2" }}>
        {title}
      </h1>
      {navItems.map((item) => {
        const isActive = item === activeItem;
        return (
          <button
            key={item}
            onClick={() => setActiveItem(item)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: isActive ? "600" : "400",
              color: isActive ? "#fff" : "#555",
              backgroundColor: isActive ? "#1976d2" : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            {item}
          </button>
        );
      })}
    </header>
  );
};

export default Header;
