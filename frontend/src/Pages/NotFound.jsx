import { Link } from 'react-router-dom';

const NotFound = () => (
  <section style={{ padding: '80px 24px', textAlign: 'center' }}>
    <h1 style={{ fontSize: '5rem', color: '#eee', margin: 0 }}>404</h1>
    <h2 style={{ color: '#333', marginTop: '8px' }}>Page Not Found</h2>
    <p style={{ color: '#888', margin: '12px 0 28px' }}>
      The page you are looking for doesn't exist or has been moved.
    </p>
    <Link to="/" style={{
      padding: '10px 28px', backgroundColor: '#1976d2',
      color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: '600',
    }}>
      Go Home
    </Link>
  </section>
);

export default NotFound;