import { useFetch } from '../hooks/useFetch';

export const ProductDetail = ({ productId, onBack }) => {
  const { data: product, loading, error } = useFetch(
    `https://fakestoreapi.com/products/${productId}`
  );

  if (loading) return (
    <p style={{ padding: '40px', textAlign: 'center', color: '#333' }}>
      Loading product...
    </p>
  );
  if (error) return (
    <p style={{ padding: '40px', color: 'red' }}>Error: {error}</p>
  );

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 16px' }}>
      <button
        onClick={onBack}
        style={{
          marginBottom: '20px', padding: '8px 16px',
          backgroundColor: '#f0f0f0', border: 'none',
          borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', color: '#333',
        }}
      >
        ← Back to Products
      </button>

      <div style={{
        display: 'flex', gap: '32px', flexWrap: 'wrap',
        border: '1px solid #ddd', borderRadius: '12px',
        padding: '24px', backgroundColor: '#fff',
      }}>
        <img
          src={product.image}
          alt={product.title}
          style={{ width: '200px', height: '200px', objectFit: 'contain', backgroundColor: '#f9f9f9', borderRadius: '8px' }}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
          <span style={{
            alignSelf: 'flex-start', backgroundColor: '#f0f0f0',
            padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', color: '#555',
          }}>
            {product.category}
          </span>
          <h2 style={{ margin: 0, color: '#111' }}>{product.title}</h2>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2', margin: 0 }}>
            ${product.price}
          </p>
          <p style={{ color: '#555', lineHeight: '1.6', margin: 0 }}>{product.description}</p>
          <p style={{ color: '#f59e0b', fontWeight: 'bold', margin: 0 }}>
            ⭐ {product.rating?.rate} ({product.rating?.count} reviews)
          </p>
          <button style={{
            padding: '10px 20px', backgroundColor: '#1976d2',
            color: '#fff', border: 'none', borderRadius: '6px',
            cursor: 'pointer', fontSize: '1rem', alignSelf: 'flex-start',
          }}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};