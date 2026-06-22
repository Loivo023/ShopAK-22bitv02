import { NavLink } from 'react-router-dom';

const Header = ({ title, cartCount }) => {
  const navItems = [
    { label: 'Home',     to: '/' },
    { label: 'Products', to: '/products' },
    { label: 'Cart',     to: '/cart' },
    { label: 'Login',    to: '/login' },
  ];

  return (
    <header style={{
      padding: '16px 24px',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#1976d2' }}>{title}</h1>
      <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              padding: '6px 16px',
              borderRadius: '20px',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: isActive ? '600' : '400',
              color: isActive ? '#fff' : '#555',
              backgroundColor: isActive ? '#1976d2' : 'transparent',
              transition: 'all 0.2s ease',
              position: 'relative',
            })}
          >
            {item.label}
            {/* Badge on Cart */}
            {item.label === 'Cart' && cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-4px',
                backgroundColor: '#e53935',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                padding: '1px 5px',
                borderRadius: '20px',
                minWidth: '16px',
                textAlign: 'center',
              }}>
                {cartCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Header;