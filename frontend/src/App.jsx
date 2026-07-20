import { Routes, Route } from "react-router-dom";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductCreatePage from "./pages/ProductCreatePage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import OrderPaymentPage from "./pages/OrderPaymentPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import StripeSuccess from "./pages/payment/StripeSuccess";
import StripeCancel from "./pages/payment/StripeCancel";
import PaypalSuccess from "./pages/payment/PaypalSuccess";
import PaypalCancel from "./pages/payment/PaypalCancel";
import VnpaySuccess from "./pages/payment/VnpaySuccess";
import VnpayCancel from "./pages/payment/VnpayCancel";
import NotFound from "./pages/NotFound";
import AdminRoute from "./routes/AdminRoute";
import PrivateRoute from "./routes/PrivateRoute";

const App = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
      }}
    >
      <Header title="ShopAK" />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Payment result pages — công khai vì cổng thanh toán redirect vào đây */}
          <Route path="/payment/stripe/success" element={<StripeSuccess />} />
          <Route path="/payment/stripe/cancel" element={<StripeCancel />} />
          <Route path="/payment/paypal/success" element={<PaypalSuccess />} />
          <Route path="/payment/paypal/cancel" element={<PaypalCancel />} />
          <Route path="/payment/vnpay/success" element={<VnpaySuccess />} />
          <Route path="/payment/vnpay/cancel" element={<VnpayCancel />} />

          {/* Cần đăng nhập */}
          <Route element={<PrivateRoute />}>
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/orders/:id/payment" element={<OrderPaymentPage />} />
          </Route>

          {/* Chỉ ADMIN */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/products/new" element={<ProductCreatePage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
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
