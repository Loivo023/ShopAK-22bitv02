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
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import OrderPaymentPage from "./pages/OrderPaymentPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import ProductEditPage from "./pages/ProductEditPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import StripeSuccess from "./pages/payment/StripeSuccess";
import StripeCancel from "./pages/payment/StripeCancel";
import PaypalSuccess from "./pages/payment/PaypalSuccess";
import PaypalCancel from "./pages/payment/PaypalCancel";
import VnpaySuccess from "./pages/payment/VnpaySuccess";
import VnpayCancel from "./pages/payment/VnpayCancel";
import NotFound from "./pages/NotFound";
import AdminRoute from "./routes/AdminRoute";
import PrivateRoute from "./routes/PrivateRoute";
import AdminLayout from "./layouts/AdminLayout";
import ShipperLayout from "./layouts/ShipperLayout";
import DashboardPage from "./pages/shipper/DashboardPage";
import ShipmentsPage from "./pages/shipper/ShipmentsPage";
import ShipmentDetailPage from "./pages/shipper/ShipmentDetailPage";
import FleetPage from "./pages/shipper/FleetPage";
import InventoryPage from "./pages/shipper/InventoryPage";
import ReportsPage from "./pages/shipper/ReportsPage";
import BillingPage from "./pages/shipper/BillingPage";
import AdminShippersPage from "./pages/admin/AdminShippersPage";
import ShipperRoute from "./routes/ShipperRoute";
import OrdersPageShipper from "./pages/shipper/OrdersPage";
import DriversPage from "./pages/shipper/DriversPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import ChatWidget from "./Components/ChatWidget";
import AdminSupportChatPage from "./pages/admin/AdminSupportChatPage";
import AdminOrderDetailsPage from "./pages/admin/AdminOrderDetailsPage";
import AdminFleetPage from "./pages/admin/AdminFleetPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminBillingPage from "./pages/admin/AdminBillingPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import ShipperAdminViewPage from "./pages/shipper/ShipperAdminViewPage";
import WishlistPage from "./pages/WishlistPage";
import ProfilePage from "./pages/ProfilePage";

const StoreLayout = ({ children }) => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#fff",
    }}
  >
    <Header title="ShopAK" />
    <main style={{ flex: 1 }}>{children}</main>
    <Footer
      studentName="Võ Thành Lợi & Lê Nguyễn Hoàng Long"
      courseName="Full-Stack Web Development"
    />
    <ChatWidget />
  </div>
);

const App = () => {
  return (
    <Routes>
      {/* ── Admin section — sidebar riêng, chỉ ADMIN vào được ── */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/products/new" element={<ProductCreatePage />} />
          <Route
            path="/admin/products/:id/edit"
            element={<ProductEditPage />}
          />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetailsPage />} />
          <Route path="/admin/fleet" element={<FleetPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/shippers" element={<AdminShippersPage />} />
          <Route path="/admin/shipments" element={<ShipmentsPage />} />
          <Route path="/admin/fleet" element={<AdminFleetPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/billing" element={<AdminBillingPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route
            path="/admin/support"
            element={<AdminSupportChatPage listType="support" />}
          />
          <Route
            path="/admin/shipper-chat"
            element={<AdminSupportChatPage listType="shipper" />}
          />
        </Route>
      </Route>

      <Route element={<ShipperRoute />}>
        <Route element={<ShipperLayout />}>
          <Route path="/shipper" element={<DashboardPage />} />
          <Route path="/shipper/dashboard" element={<DashboardPage />} />
          <Route path="/shipper/shipments" element={<ShipmentsPage />} />
          <Route
            path="/shipper/shipments/:orderId"
            element={<ShipmentDetailPage />}
          />
          <Route
            path="/shipper/orders/:orderId"
            element={<ShipmentDetailPage />}
          />
          <Route path="/shipper/orders" element={<OrdersPageShipper />} />
          <Route path="/shipper/fleet" element={<FleetPage />} />
          <Route path="/shipper/drivers" element={<DriversPage />} />
          <Route path="/shipper/inventory" element={<InventoryPage />} />
          <Route path="/shipper/reports" element={<ReportsPage />} />
          <Route path="/shipper/billing" element={<BillingPage />} />
          <Route path="/shipper/admin" element={<ShipperAdminViewPage />} />
        </Route>
      </Route>

      {/* ── Store section ── */}
      <Route
        path="/"
        element={
          <StoreLayout>
            <HomePage />
          </StoreLayout>
        }
      />
      <Route
        path="/products"
        element={
          <StoreLayout>
            <ProductPage />
          </StoreLayout>
        }
      />
      <Route
        path="/products/:id"
        element={
          <StoreLayout>
            <ProductDetailPage />
          </StoreLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <StoreLayout>
            <CartPage />
          </StoreLayout>
        }
      />
      <Route
        path="/login"
        element={
          <StoreLayout>
            <LoginPage />
          </StoreLayout>
        }
      />
      <Route
        path="/register"
        element={
          <StoreLayout>
            <RegisterPage />
          </StoreLayout>
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/payment/stripe/success"
        element={
          <StoreLayout>
            <StripeSuccess />
          </StoreLayout>
        }
      />
      <Route
        path="/payment/stripe/cancel"
        element={
          <StoreLayout>
            <StripeCancel />
          </StoreLayout>
        }
      />
      <Route
        path="/payment/paypal/success"
        element={
          <StoreLayout>
            <PaypalSuccess />
          </StoreLayout>
        }
      />
      <Route
        path="/payment/paypal/cancel"
        element={
          <StoreLayout>
            <PaypalCancel />
          </StoreLayout>
        }
      />
      <Route
        path="/payment/vnpay/success"
        element={
          <StoreLayout>
            <VnpaySuccess />
          </StoreLayout>
        }
      />
      <Route
        path="/payment/vnpay/cancel"
        element={
          <StoreLayout>
            <VnpayCancel />
          </StoreLayout>
        }
      />

      <Route element={<PrivateRoute />}>
        <Route
          path="/orders"
          element={
            <StoreLayout>
              <OrderHistoryPage />
            </StoreLayout>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <StoreLayout>
              <OrderDetailPage />
            </StoreLayout>
          }
        />
        <Route
          path="/orders/:id/payment"
          element={
            <StoreLayout>
              <OrderPaymentPage />
            </StoreLayout>
          }
        />
      </Route>
      <Route
        path="/wishlist"
        element={
          <StoreLayout>
            <WishlistPage />
          </StoreLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <StoreLayout>
            <ProfilePage />
          </StoreLayout>
        }
      />

      <Route
        path="*"
        element={
          <StoreLayout>
            <NotFound />
          </StoreLayout>
        }
      />
    </Routes>
  );
};

export default App;
