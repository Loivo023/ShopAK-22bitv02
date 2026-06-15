import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { UserDetail } from './UserDetail';

export const UserList = () => {
  const { data: users, loading, error } = useFetch('https://fakestoreapi.com/users');
  const [selectedId, setSelectedId] = useState(null);

  if (loading) return (
    <p style={{ padding: '40px', textAlign: 'center', color: '#333' }}>
      Loading users...
    </p>
  );
  if (error) return (
    <p style={{ padding: '40px', color: 'red' }}>Error: {error}</p>
  );

  if (selectedId) {
    return <UserDetail userId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <section style={{ maxWidth: '800px', margin: '40px auto', padding: '0 16px', backgroundColor: '#fff' }}>
      <h2 style={{ color: '#111', marginBottom: '16px' }}>Users</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => setSelectedId(user.id)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px', border: '1px solid #ddd', borderRadius: '8px',
              cursor: 'pointer', backgroundColor: '#fff', transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#111' }}>
                {user.name.firstname} {user.name.lastname}
              </p>
              <p style={{ margin: 0, color: '#777', fontSize: '0.9rem' }}>@{user.username}</p>
              <p style={{ margin: 0, color: '#555', fontSize: '0.85rem' }}>{user.email}</p>
            </div>
            <span style={{ color: '#1976d2', fontSize: '0.85rem' }}>View →</span>
          </div>
        ))}
      </div>
    </section>
  );
};