import { useState } from 'react';

export const ProductCard = ({ name, price, category, imageUrl, description, onViewDetails }) => {
  const [hovered, setHovered] = useState(false);

  const truncated = description?.length > 70
    ? description.slice(0, 70) + '...'
    : description;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '12px',
        width: '220px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        cursor: 'pointer',
        position: 'relative',
        backgroundColor: '#fff',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      {price > 100 && (
        <span style={{
          position: 'absolute', top: '10px', right: '10px',
          backgroundColor: '#f59e0b', color: '#fff',
          fontSize: '0.7rem', fontWeight: 'bold',
          padding: '2px 8px', borderRadius: '20px',
        }}>
          PREMIUM
        </span>
      )}

      <img
        src={imageUrl}
        alt={name}
        style={{ width: '100%', height: '140px', objectFit: 'contain', borderRadius: '4px', backgroundColor: '#f9f9f9' }}
      />

      <h3 style={{ margin: '4px 0', fontSize: '0.95rem', color: '#111' }}>{name}</h3>

      <span style={{
        display: 'inline-block', backgroundColor: '#f0f0f0',
        color: '#555', fontSize: '0.75rem',
        padding: '2px 10px', borderRadius: '20px', alignSelf: 'flex-start',
      }}>
        {category}
      </span>

      <p style={{ margin: '4px 0', fontWeight: 'bold', color: '#1976d2' }}>${price}</p>
      <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#555' }}>{truncated}</p>

      <button
        onClick={onViewDetails}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1565c0')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1976d2')}
        style={{
          marginTop: 'auto', padding: '8px 12px',
          backgroundColor: '#1976d2', color: '#fff',
          border: 'none', borderRadius: '4px',
          cursor: 'pointer', transition: 'background-color 0.2s',
        }}
      >
        View Details
      </button>
    </div>
  );
};