import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import NotFound from './pages/NotFound';

const App = () => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
      <Header title="ShopAK" cartCount={totalCount} />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"             element={<HomePage />} />
          <Route path="/products"     element={<ProductPage />} />
          <Route path="/products/:id" element={<ProductDetailPage addToCart={addToCart} />} />  {/* ✅ this was missing */}
          <Route path="/cart"         element={<CartPage cartItems={cartItems} updateQty={updateQty} removeItem={removeItem} />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="*"             element={<NotFound />} />
        </Routes>
      </main>
      <Footer
        studentName="Võ Thành Lợi & Lê Nguyễn Hoàng Long"
        courseName="Full-Stack Web Development"
      />
    </div>
  );
};

export default App;