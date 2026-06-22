import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const ProductDetailPage = ({ addToCart = () => {} }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    setProduct(null);
    setAdded(false);

    fetch(`https://fakestoreapi.com/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Product not found.');
        return res.json();
      })
      .then((data) => setProduct(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
      <div style={{
        width: '36px', height: '36px', border: '4px solid #eee',
        borderTop: '4px solid #1976d2', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p>Loading product...</p>
    </div>
  );

  if (error) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>
      <Link to="/products" style={{ color: '#1976d2' }}>← Back to Products</Link>
    </div>
  );

  if (!product) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <p style={{ color: '#888' }}>Product not found.</p>
      <Link to="/products" style={{ color: '#1976d2' }}>← Back to Products</Link>
    </div>
  );

  // ✅ handleAddToCart is defined AFTER the null checks above
  // so product is guaranteed to exist here
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
  };

  return (
    <section style={{ padding: '24px 16px', maxWidth: '900px', margin: '0 auto' }}>
      <Link to="/products" style={{ color: '#1976d2', textDecoration: 'none', fontSize: '0.95rem' }}>
        ← Back to Products
      </Link>

      <div style={{ display: 'flex', gap: '40px', marginTop: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{
          width: '280px', height: '280px', borderRadius: '12px',
          backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0, padding: '16px', boxSizing: 'border-box',
        }}>
          <img
            src={product.image}
            alt={product.title}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <span style={{
            alignSelf: 'flex-start', backgroundColor: '#f0f0f0',
            padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', color: '#555',
          }}>
            {product.category}
          </span>

          <h2 style={{ margin: 0, color: '#111', lineHeight: '1.3' }}>{product.title}</h2>

          <p style={{ margin: 0, fontSize: '1.7rem', fontWeight: 'bold', color: '#1976d2' }}>
            ${product.price}
          </p>

          <p style={{ margin: 0, color: '#f59e0b', fontWeight: '600' }}>
            ⭐ {product.rating?.rate}{' '}
            <span style={{ color: '#999', fontWeight: 'normal', fontSize: '0.9rem' }}>
              ({product.rating?.count} reviews)
            </span>
          </p>

          <p style={{ margin: 0, color: '#555', lineHeight: '1.7', fontSize: '0.95rem' }}>
            {product.description}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
            <button
              onClick={handleAddToCart}
              style={{
                padding: '12px 28px',
                backgroundColor: added ? '#4caf50' : '#1976d2',
                color: '#fff', border: 'none', borderRadius: '6px',
                cursor: 'pointer', fontSize: '1rem', fontWeight: '500',
                transition: 'background-color 0.2s',
              }}
            >
              {added ? '✓ Added to Cart' : 'Add to Cart'}
            </button>

            {added && (
              <Link to="/cart" style={{
                padding: '12px 20px',
                border: '1px solid #1976d2',
                color: '#1976d2', borderRadius: '6px',
                textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500',
              }}>
                View Cart →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailPage;