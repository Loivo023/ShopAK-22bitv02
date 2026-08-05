import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const ShipperRoute = () => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />;
  if (role !== "SHIPPER" && role !== "ADMIN") {
    return (
      <section style={{ padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ color: "#c14f2f" }}>Access Denied</h2>
        <p style={{ color: "#8a8378" }}>
          You do not have permission to view this page.
        </p>
      </section>
    );
  }
  return <Outlet />;
};

export default ShipperRoute;
