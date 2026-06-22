import { useState } from 'react';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = () => {
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) return (
    <section style={{ padding: '60px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: '3rem' }}>✅</p>
      <h2 style={{ color: '#111' }}>Welcome back!</h2>
      <p style={{ color: '#777' }}>You are now logged in as <strong>{form.email}</strong></p>
    </section>
  );

  return (
    <section style={{ padding: '40px 16px', maxWidth: '420px', margin: '0 auto' }}>
      <h2 style={{ color: '#111', marginBottom: '8px' }}>Login</h2>
      <p style={{ color: '#888', marginBottom: '28px', fontSize: '0.9rem' }}>
        Sign in to your ShopAK account.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
            Email / Username
          </label>
          <input
            type="text"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '6px',
              border: '1px solid #ddd', fontSize: '0.95rem',
              color: '#333', boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '6px',
              border: '1px solid #ddd', fontSize: '0.95rem',
              color: '#333', boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <p style={{ color: '#e53935', fontSize: '0.88rem', margin: 0 }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          style={{
            padding: '12px', backgroundColor: '#1976d2',
            color: '#fff', border: 'none', borderRadius: '6px',
            cursor: 'pointer', fontSize: '1rem', fontWeight: '600',
          }}
        >
          Login
        </button>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.88rem', margin: 0 }}>
          Don't have an account?{' '}
          <span style={{ color: '#1976d2', cursor: 'pointer' }}>Register</span>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;