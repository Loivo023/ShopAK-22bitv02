import { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ id, name, price, category, imageUrl, description }) => {
  const [hovered, setHovered] = useState(false);

  const truncated = description?.length > 65
    ? description.slice(0, 65) + '...'
    : description;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '1px solid #eee',
        borderRadius: '10px',
        padding: '14px',
        width: '220px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
        backgroundColor: '#fff',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 8px 20px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {price > 100 && (
        <span style={{
          position: 'absolute', top: '10px', right: '10px',
          backgroundColor: '#f59e0b', color: '#fff',
          fontSize: '0.68rem', fontWeight: 'bold',
          padding: '2px 8px', borderRadius: '20px',
        }}>
          PREMIUM
        </span>
      )}

      <img
        src={imageUrl}
        alt={name}
        style={{
          width: '100%', height: '150px',
          objectFit: 'contain', borderRadius: '6px',
          backgroundColor: '#f9f9f9',
        }}
      />

      <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#111', lineHeight: '1.3' }}>{name}</h3>

      <span style={{
        alignSelf: 'flex-start', backgroundColor: '#f0f0f0',
        color: '#666', fontSize: '0.72rem',
        padding: '2px 10px', borderRadius: '20px',
      }}>
        {category}
      </span>

      <p style={{ margin: 0, fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>${price}</p>
      <p style={{ margin: 0, fontSize: '0.82rem', color: '#666', lineHeight: '1.4' }}>{truncated}</p>

      <Link
        to={`/products/${id}`}
        style={{
          marginTop: 'auto',
          padding: '8px 12px',
          backgroundColor: '#1976d2',
          color: '#fff',
          borderRadius: '6px',
          textAlign: 'center',
          textDecoration: 'none',
          fontSize: '0.88rem',
          fontWeight: '500',
        }}
      >
        View Details
      </Link>
    </div>
  );
};

export default ProductCard;