const Header = ({ title }) => {
  const navItems = ['Home', 'Products', 'Cart', 'Login'];
 
  return (
    <header style={{ padding: '16px 24px', borderBottom: '1px solid #ddd' }}>
      <h1>{title}</h1>
      <nav>
        {navItems.map((item) => (
          <a key={item} href="#" style={{ marginRight: '8px' }}>
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
};

export default Header;
