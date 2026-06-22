import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((res) => { if (!res.ok) throw new Error('Failed to fetch'); return res.json(); })
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSortOption('');
  };

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorBox message={error} />;

  const categories = ['All', ...new Set(products.map((p) => p.category))];

  const filtered = products
    .filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortOption === 'low')  return a.price - b.price;
      if (sortOption === 'high') return b.price - a.price;
      return 0;
    });

  return (
    <section style={{ padding: '24px 16px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ color: '#111', marginBottom: '4px' }}>Product Catalog</h2>
      <p style={{ color: '#888', marginBottom: '20px', fontSize: '0.9rem' }}>{products.length} products available</p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd',
            fontSize: '0.9rem', flex: '1', minWidth: '160px', color: '#333',
          }}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd',
            fontSize: '0.9rem', color: '#333', backgroundColor: '#fff', cursor: 'pointer',
          }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd',
            fontSize: '0.9rem', color: '#333', backgroundColor: '#fff', cursor: 'pointer',
          }}
        >
          <option value="">Sort: Default</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
        </select>

        <button
          onClick={clearFilters}
          style={{
            padding: '8px 16px', borderRadius: '6px',
            border: '1px solid #e53935', backgroundColor: '#fff',
            color: '#e53935', cursor: 'pointer', fontSize: '0.88rem',
          }}
        >
          Clear Filters
        </button>
      </div>

      <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: '16px' }}>
        Showing {filtered.length} of {products.length} products
      </p>

      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.title}
              price={p.price}
              category={p.category}
              imageUrl={p.image}
              description={p.description}
            />
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#aaa', marginTop: '40px' }}>
          No products match your filters.
        </p>
      )}
    </section>
  );
};

const LoadingSpinner = () => (
  <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
    <div style={{
      width: '36px', height: '36px', border: '4px solid #eee',
      borderTop: '4px solid #1976d2', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <p>Loading products...</p>
  </div>
);

const ErrorBox = ({ message }) => (
  <div style={{
    margin: '40px auto', maxWidth: '400px', padding: '20px',
    backgroundColor: '#fff3f3', border: '1px solid #f5c2c2',
    borderRadius: '8px', textAlign: 'center', color: '#c0392b',
  }}>
    <p style={{ fontSize: '1.4rem' }}>⚠️</p>
    <p style={{ fontWeight: 'bold' }}>Something went wrong</p>
    <p style={{ fontSize: '0.9rem' }}>{message}</p>
  </div>
);

export default ProductList;