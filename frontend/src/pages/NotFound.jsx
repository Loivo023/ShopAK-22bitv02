import { Link } from "react-router-dom";

const NotFound = () => (
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
    <p
      style={{
        fontFamily: "Georgia, serif",
        fontSize: "5rem",
        color: "#f0e4d8",
        margin: 0,
        fontWeight: "700",
      }}
    >
      404
    </p>
    <h2
      style={{
        fontFamily: "Georgia, serif",
        fontSize: "1.6rem",
        fontWeight: "400",
        color: "#2b2825",
        margin: "8px 0",
      }}
    >
      Page Not Found
    </h2>
    <p style={{ color: "#a39c8f", marginBottom: "28px" }}>
      The page you are looking for doesn't exist or has been moved.
    </p>
    <Link
      to="/"
      style={{
        padding: "13px 30px",
        backgroundColor: "#2b2825",
        color: "#faf7f2",
        borderRadius: "30px",
        textDecoration: "none",
        fontSize: "0.88rem",
        fontWeight: "500",
      }}
    >
      Go Home
    </Link>
  </div>
);

export default NotFound;
