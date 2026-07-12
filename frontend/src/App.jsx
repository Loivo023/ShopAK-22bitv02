import { Routes, Route } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductCreatePage from './pages/ProductCreatePage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFound from './pages/NotFound';
import AdminRoute from './routes/AdminRoute';

const App = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
      <Header title="ShopAK" />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"             element={<HomePage />} />
          <Route path="/products"     element={<ProductPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart"         element={<CartPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin/products/new" element={<ProductCreatePage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
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