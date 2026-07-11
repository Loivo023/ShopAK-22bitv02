import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../api/productsApi';

const ProductCreatePage = () => {
  const [form, setForm] = useState({
    name: '', price: '', category: '', description: '', imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await productsApi.create({
        name: form.name,
        price: parseFloat(form.price),
        category: form.category,
        description: form.description,
        imageUrl: form.imageUrl,
      });
      navigate('/products');
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError('You do not have permission to create products.');
      } else {
        setError(err.response?.data?.detail || 'Failed to create product.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '40px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <h2 style={{ color: '#111', marginBottom: '20px' }}>Create Product</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <input
          name="name" placeholder="Product name" value={form.name}
          onChange={handleChange} required minLength={3}
          style={inputStyle}
        />
        <input
          name="price" type="number" step="0.01" placeholder="Price" value={form.price}
          onChange={handleChange} required min="0.01"
          style={inputStyle}
        />
        <input
          name="category" placeholder="Category" value={form.category}
          onChange={handleChange} required minLength={3}
          style={inputStyle}
        />
        <textarea
          name="description" placeholder="Description" value={form.description}
          onChange={handleChange} required minLength={5} rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
        <input
          name="imageUrl" placeholder="Image URL" value={form.imageUrl}
          onChange={handleChange} required
          style={inputStyle}
        />

        <button
          type="submit" disabled={loading}
          style={{
            padding: '12px', backgroundColor: '#1976d2', color: '#fff',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
            fontSize: '1rem', fontWeight: '500', opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>

      {error && <p style={{ color: '#c0392b', marginTop: '16px' }}>{error}</p>}
    </section>
  );
};

const inputStyle = {
  padding: '10px 12px', borderRadius: '6px',
  border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box',
};

export default ProductCreatePage;