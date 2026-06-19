import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { ProductCard } from './ProductCard';
import { ProductDetail } from './ProductDetail';

export const ProductList = () => {
  const { data: products, loading, error } = useFetch('https://fakestoreapi.com/products');
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (loading) return <LoadingSpinner message="Loading products..." />;
  if (error)   return <ErrorMessage message={error} />;

  if (selectedId) {
    return (
      <ProductDetail
        productId={selectedId}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  const categories = ['All', ...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <section style={{
      padding: '24px 16px',
      boxSizing: 'border-box',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
      backgroundColor: '#fff',
    }}>
      <h2 style={{ color: '#111', marginBottom: '8px' }}>Product Catalog</h2>
      <p style={{ color: '#777', marginBottom: '16px' }}>{products.length} products available</p>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: '6px',
            border: '1px solid #ddd', fontSize: '0.95rem',
            flex: '1', minWidth: '180px', color: '#333',
          }}
        />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 14px', borderRadius: '20px',
              border: '1px solid #1976d2', cursor: 'pointer',
              fontSize: '0.85rem',
              backgroundColor: selectedCategory === cat ? '#1976d2' : '#fff',
              color: selectedCategory === cat ? '#fff' : '#1976d2',
              transition: 'all 0.2s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '12px' }}>
        Showing {filtered.length} of {products.length} products
      </p>

      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'flex-start' }}>
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              name={product.title}
              price={product.price}
              category={product.category}
              imageUrl={product.image}
              description={product.description}
              onViewDetails={() => setSelectedId(product.id)}
            />
          ))}
        </div>
      ) : (
        <p style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>
          No products found. Try a different search or category.
        </p>
      )}
    </section>
  );
};

const LoadingSpinner = ({ message }) => (
  <div style={{ textAlign: 'center', padding: '60px', color: '#777' }}>
    <div style={{
      width: '36px', height: '36px', border: '4px solid #ddd',
      borderTop: '4px solid #1976d2', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <p>{message}</p>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div style={{
    margin: '40px auto', maxWidth: '400px', padding: '20px',
    backgroundColor: '#fff3f3', border: '1px solid #f5c2c2',
    borderRadius: '8px', textAlign: 'center', color: '#c0392b',
  }}>
    <p style={{ fontSize: '1.5rem', margin: 0 }}>⚠️</p>
    <p style={{ fontWeight: 'bold' }}>Something went wrong</p>
    <p style={{ fontSize: '0.9rem' }}>{message}</p>
  </div>
);