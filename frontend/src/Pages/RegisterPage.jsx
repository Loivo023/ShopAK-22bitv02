import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

const RegisterPage = () => {
  const [form, setForm] = useState({ email: '', fullName: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await authApi.register({
        email: form.email,
        full_name: form.fullName,
        password: form.password,
      });
      setSuccessMessage('Registration successful! Redirecting to login...');
      setForm({ email: '', fullName: '', password: '' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please check your input.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '40px 16px', maxWidth: '420px', margin: '0 auto' }}>
      <h2 style={{ color: '#111', marginBottom: '4px' }}>Create Account</h2>
      <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '24px' }}>
        Join ShopAK to start shopping.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#333' }}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '6px',
              border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#333' }}>
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '6px',
              border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#333' }}>
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '6px',
              border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px', backgroundColor: '#1976d2', color: '#fff',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
            fontSize: '1rem', fontWeight: '500', marginTop: '8px',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {error && (
        <p style={{ color: '#c0392b', marginTop: '16px', fontSize: '0.9rem' }}>{error}</p>
      )}
      {successMessage && (
        <p style={{ color: '#2e7d32', marginTop: '16px', fontSize: '0.9rem' }}>{successMessage}</p>
      )}

      <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#555', textAlign: 'center' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
          Log in
        </Link>
      </p>
    </section>
  );
};

export default RegisterPage;