import { createBrowserRouter, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductManagementPage from './pages/admin/ProductManagementPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';
import OrderManagementPage from './pages/admin/OrderManagementPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout/Layout';

// Minimal fallback for unmatched routes (e.g. /categories, /forgot-password
// links that don't have a page yet). Without this, React Router renders its
// raw unstyled error screen instead of something consistent with the app.
const NotFoundPage = () => (
  <div className="min-h-screen bg-white">
    <div className="container-custom pt-32">
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-black">Page Not Found</h2>
        <p className="text-black/40 mt-2">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  </div>
);

const router = createBrowserRouter([
  { path: '/', element: <Layout><HomePage /></Layout> },
  { path: '/login', element: <Layout><LoginPage /></Layout> },
  { path: '/register', element: <Layout><RegisterPage /></Layout> },
  { path: '/products', element: <Layout><ProductsPage /></Layout> },
  { path: '/products/:id', element: <Layout><ProductDetailPage /></Layout> },
  { path: '/cart', element: <Layout><CartPage /></Layout> },
  { path: '/wishlist', element: <Layout><WishlistPage /></Layout> },
  { path: '/profile', element: <Layout><ProtectedRoute><ProfilePage /></ProtectedRoute></Layout> },
  { path: '/orders', element: <Layout><ProtectedRoute><OrdersPage /></ProtectedRoute></Layout> },
  { path: '/orders/:id', element: <Layout><ProtectedRoute><OrderDetailPage /></ProtectedRoute></Layout> },
  { path: '/checkout', element: <Layout><ProtectedRoute><CheckoutPage /></ProtectedRoute></Layout> },
  { path: '/admin/dashboard', element: <Layout><ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute></Layout> },
  { path: '/admin/products', element: <Layout><ProtectedRoute adminOnly><ProductManagementPage /></ProtectedRoute></Layout> },
  { path: '/admin/categories', element: <Layout><ProtectedRoute adminOnly><CategoryManagementPage /></ProtectedRoute></Layout> },
  { path: '/admin/orders', element: <Layout><ProtectedRoute adminOnly><OrderManagementPage /></ProtectedRoute></Layout> },
  { path: '*', element: <Layout><NotFoundPage /></Layout> },
]);

export default router;
