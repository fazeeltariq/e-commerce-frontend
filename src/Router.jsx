import { createBrowserRouter } from 'react-router-dom';
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
]);

export default router;
