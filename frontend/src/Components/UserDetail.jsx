import { useFetch } from '../hooks/useFetch';

export const UserDetail = ({ userId, onBack }) => {
  const { data: user, loading, error } = useFetch(
    `https://fakestoreapi.com/users/${userId}`
  );

  if (loading) return (
    <p style={{ padding: '40px', textAlign: 'center', color: '#333' }}>
      Loading user...
    </p>
  );
  if (error) return (
    <p style={{ padding: '40px', color: 'red' }}>Error: {error}</p>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '0 16px' }}>
      <button
        onClick={onBack}
        style={{
          marginBottom: '20px', padding: '8px 16px',
          backgroundColor: '#f0f0f0', border: 'none',
          borderRadius: '6px', cursor: 'pointer', color: '#333',
        }}
      >
        ← Back to Users
      </button>

      <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '24px', backgroundColor: '#fff' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          backgroundColor: '#1976d2', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px',
        }}>
          {user.name.firstname[0].toUpperCase()}
        </div>

        <h2 style={{ margin: '0 0 4px', color: '#111' }}>
          {user.name.firstname} {user.name.lastname}
        </h2>
        <p style={{ color: '#777', margin: '0 0 16px' }}>@{user.username}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ margin: 0, color: '#555' }}>📧 {user.email}</p>
          <p style={{ margin: 0, color: '#555' }}>📞 {user.phone}</p>
          <p style={{ margin: 0, color: '#555' }}>
            📍 {user.address.street}, {user.address.city} {user.address.zipcode}
          </p>
        </div>
      </div>
    </div>
  );
};