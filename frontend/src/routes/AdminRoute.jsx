import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const AdminRoute = () => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role !== 'ADMIN') {
    return (
      <section style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ color: '#c0392b', marginBottom: '8px' }}>Access Denied</h2>
        <p style={{ color: '#888' }}>You do not have permission to view this page.</p>
      </section>
    );
  }

  return <Outlet />;
};

export default AdminRoute;