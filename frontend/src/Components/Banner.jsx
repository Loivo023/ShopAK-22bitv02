import { Link } from 'react-router-dom';

const Banner = ({ subtitle, buttonText }) => {
  return (
    <div style={{
      backgroundColor: '#1976d2',
      color: '#fff',
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      <h2 style={{ margin: '0 0 12px', fontSize: '2rem', color: '#fff' }}>ShopAK</h2>
      <p style={{ margin: '0 0 24px', fontSize: '1.1rem', opacity: 0.9 }}>{subtitle}</p>
      <Link
        to="/products"
        style={{
          display: 'inline-block',
          padding: '12px 28px',
          backgroundColor: '#fff',
          color: '#1976d2',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '1rem',
          transition: 'opacity 0.2s',
        }}
      >
        {buttonText}
      </Link>
    </div>
  );
};

export default Banner;