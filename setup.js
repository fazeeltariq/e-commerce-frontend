// setup.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up E-Commerce Frontend Structure...\n');

// ============================================
// 1. CREATE FOLDER STRUCTURE
// ============================================
const folders = [
  'src/api',
  'src/components/common/Layout',
  'src/components/common/UI',
  'src/components/common/Cards',
  'src/components/auth',
  'src/components/products/Admin',
  'src/components/cart',
  'src/components/wishlist',
  'src/components/orders/Admin',
  'src/context',
  'src/hooks',
  'src/pages/admin',
  'src/utils',
];

console.log('📁 Creating folders...');
folders.forEach(folder => {
  const fullPath = path.join(process.cwd(), folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`  ✅ Created: ${folder}`);
  }
});
console.log('');

// ============================================
// 2. CREATE API CONFIGURATION
// ============================================
console.log('📄 Creating files...');

// axiosConfig.js
const axiosConfig = `import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized! Please login again.');
    }
    return Promise.reject(error);
  }
);

export default api;
`;
fs.writeFileSync('src/api/axiosConfig.js', axiosConfig);
console.log('  ✅ Created: src/api/axiosConfig.js');

// ============================================
// 3. CREATE AUTH CONTEXT
// ============================================
const authContext = `import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/users/profile');
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      setUser(response.data.user);
      toast.success('Welcome back!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/users/register', { name, email, password });
      setUser(response.data.user);
      toast.success('Account created successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.put('/users/profile', data);
      setUser(response.data.user);
      toast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
      throw error;
    }
  };

  const changePassword = async (data) => {
    try {
      const response = await api.put('/users/change-password', data);
      toast.success('Password changed successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
`;
fs.writeFileSync('src/context/AuthContext.jsx', authContext);
console.log('  ✅ Created: src/context/AuthContext.jsx');

// ============================================
// 4. CREATE PROTECTED ROUTE
// ============================================
const protectedRoute = `import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
`;
fs.writeFileSync('src/components/common/ProtectedRoute.jsx', protectedRoute);
console.log('  ✅ Created: src/components/common/ProtectedRoute.jsx');

// ============================================
// 5. CREATE NAVBAR
// ============================================
const navbar = `import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ShoppingCart, Heart, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            Store
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
              Products
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                </Link>
                <Link to="/wishlist" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <Heart className="w-5 h-5" />
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Admin
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <User className="w-5 h-5" />
                    <span>{user?.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 invisible group-hover:visible transition-all">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50 transition-colors">
                      Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-50 transition-colors">
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors">
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  <UserPlus className="w-4 h-4 inline mr-1" />
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
            <Link to="/products" className="block py-2 text-gray-600 hover:text-gray-900 transition-colors">
              Products
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="block py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  Cart
                </Link>
                <Link to="/wishlist" className="block py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  Wishlist
                </Link>
                <Link to="/profile" className="block py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  Profile
                </Link>
                <Link to="/orders" className="block py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="block py-2 text-primary-600 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
`;
fs.writeFileSync('src/components/common/Layout/Navbar.jsx', navbar);
console.log('  ✅ Created: src/components/common/Layout/Navbar.jsx');

// ============================================
// 6. CREATE FOOTER
// ============================================
const footer = `const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Store</h3>
            <p className="text-gray-600">Your premium e-commerce destination.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="/products" className="hover:text-primary-600 transition-colors">Products</a></li>
              <li><a href="/about" className="hover:text-primary-600 transition-colors">About</a></li>
              <li><a href="/contact" className="hover:text-primary-600 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="/faq" className="hover:text-primary-600 transition-colors">FAQ</a></li>
              <li><a href="/returns" className="hover:text-primary-600 transition-colors">Returns</a></li>
              <li><a href="/shipping" className="hover:text-primary-600 transition-colors">Shipping</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-600">
              <li>Email: support@store.com</li>
              <li>Phone: +1 234 567 890</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
`;
fs.writeFileSync('src/components/common/Layout/Footer.jsx', footer);
console.log('  ✅ Created: src/components/common/Layout/Footer.jsx');

// ============================================
// 7. CREATE LAYOUT
// ============================================
const layout = `import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
`;
fs.writeFileSync('src/components/common/Layout/Layout.jsx', layout);
console.log('  ✅ Created: src/components/common/Layout/Layout.jsx');

// ============================================
// 8. CREATE PAGES
// ============================================
const pages = {
  'HomePage': `const HomePage = () => {
  return (
    <div className="container-custom py-20">
      <div className="text-center animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
          Welcome to <span className="text-primary-600">Store</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
          Your premium destination for quality products.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/products" className="btn-primary">Browse Products</a>
          <a href="/register" className="btn-secondary">Get Started</a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;`,

  'LoginPage': `import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {}
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-20 max-w-md">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 text-center">Welcome Back</h1>
        <p className="mt-2 text-gray-600 text-center">Sign in to your account</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                className="input-primary pl-10" placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
                className="input-primary pl-10" placeholder="••••••••" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Don't have an account? <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;`,

  'RegisterPage': `import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (error) {}
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-20 max-w-md">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 text-center">Create Account</h1>
        <p className="mt-2 text-gray-600 text-center">Join our community</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} 
                className="input-primary pl-10" placeholder="John Doe" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                className="input-primary pl-10" placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
                className="input-primary pl-10" placeholder="Min 8 characters" required minLength={8} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? 'Creating account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;`,

  'ProductsPage': `const ProductsPage = () => {
  return (
    <div className="container-custom py-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="mt-4 text-gray-600">This page is under construction.</p>
      </div>
    </div>
  );
};

export default ProductsPage;`,

  'ProductDetailPage': `const ProductDetailPage = () => {
  return (
    <div className="container-custom py-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Product Detail</h1>
        <p className="mt-4 text-gray-600">This page is under construction.</p>
      </div>
    </div>
  );
};

export default ProductDetailPage;`,

  'CartPage': `const CartPage = () => {
  return (
    <div className="container-custom py-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="mt-4 text-gray-600">This page is under construction.</p>
      </div>
    </div>
  );
};

export default CartPage;`,

  'WishlistPage': `const WishlistPage = () => {
  return (
    <div className="container-custom py-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Wishlist</h1>
        <p className="mt-4 text-gray-600">This page is under construction.</p>
      </div>
    </div>
  );
};

export default WishlistPage;`,

  'ProfilePage': `const ProfilePage = () => {
  return (
    <div className="container-custom py-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-4 text-gray-600">This page is under construction.</p>
      </div>
    </div>
  );
};

export default ProfilePage;`,

  'OrdersPage': `const OrdersPage = () => {
  return (
    <div className="container-custom py-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-4 text-gray-600">This page is under construction.</p>
      </div>
    </div>
  );
};

export default OrdersPage;`,

  'OrderDetailPage': `const OrderDetailPage = () => {
  return (
    <div className="container-custom py-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Order Detail</h1>
        <p className="mt-4 text-gray-600">This page is under construction.</p>
      </div>
    </div>
  );
};

export default OrderDetailPage;`,

  'CheckoutPage': `const CheckoutPage = () => {
  return (
    <div className="container-custom py-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="mt-4 text-gray-600">This page is under construction.</p>
      </div>
    </div>
  );
};

export default CheckoutPage;`,
};

Object.entries(pages).forEach(([name, content]) => {
  fs.writeFileSync(`src/pages/${name}.jsx`, content);
  console.log(`  ✅ Created: src/pages/${name}.jsx`);
});

// ============================================
// 9. CREATE ADMIN PAGES
// ============================================
const adminPages = {
  'DashboardPage': `const DashboardPage = () => {
  return (
    <div className="container-custom py-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-4 text-gray-600">Admin panel is under construction.</p>
      </div>
    </div>
  );
};

export default DashboardPage;`,

  'ProductManagementPage': `const ProductManagementPage = () => {
  return (
    <div className="container-custom py-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Product Management</h1>
        <p className="mt-4 text-gray-600">Admin panel is under construction.</p>
      </div>
    </div>
  );
};

export default ProductManagementPage;`,

  'CategoryManagementPage': `const CategoryManagementPage = () => {
  return (
    <div className="container-custom py-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Category Management</h1>
        <p className="mt-4 text-gray-600">Admin panel is under construction.</p>
      </div>
    </div>
  );
};

export default CategoryManagementPage;`,

  'OrderManagementPage': `const OrderManagementPage = () => {
  return (
    <div className="container-custom py-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Order Management</h1>
        <p className="mt-4 text-gray-600">Admin panel is under construction.</p>
      </div>
    </div>
  );
};

export default OrderManagementPage;`,
};

Object.entries(adminPages).forEach(([name, content]) => {
  fs.writeFileSync(`src/pages/admin/${name}.jsx`, content);
  console.log(`  ✅ Created: src/pages/admin/${name}.jsx`);
});

// ============================================
// 10. CREATE ROUTER
// ============================================
const router = `import { createBrowserRouter } from 'react-router-dom';
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
`;
fs.writeFileSync('src/Router.jsx', router);
console.log('  ✅ Created: src/Router.jsx');

// ============================================
// 11. CREATE UTILITIES
// ============================================
const utils = `export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};
`;
fs.writeFileSync('src/utils/index.js', utils);
console.log('  ✅ Created: src/utils/index.js');

// ============================================
// 12. CREATE .env FILE
// ============================================
const envContent = `VITE_API_URL=http://localhost:4000/api
VITE_NODE_ENV=development
`;
fs.writeFileSync('.env', envContent);
console.log('  ✅ Created: .env');

// ============================================
// 13. UPDATE App.jsx
// ============================================
const appContent = `import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import router from './Router';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#22c55e',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
`;
fs.writeFileSync('src/App.jsx', appContent);
console.log('  ✅ Updated: src/App.jsx');

// ============================================
// 14. UPDATE index.css (Tailwind CSS v4)
// ============================================
const cssContent = `@import "tailwindcss";

@theme {
  --font-sans: 'Inter', system-ui, sans-serif;
  
  --color-primary-50: #ecfdf5;
  --color-primary-100: #d1fae5;
  --color-primary-200: #a7f3d0;
  --color-primary-300: #6ee7b7;
  --color-primary-400: #34d399;
  --color-primary-500: #10b981;
  --color-primary-600: #059669;
  --color-primary-700: #047857;
  --color-primary-800: #065f46;
  --color-primary-900: #064e3b;
  --color-primary-950: #022c22;
}

@layer base {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background-color: var(--color-white);
    color: var(--color-gray-900);
    -webkit-font-smoothing: antialiased;
    font-family: var(--font-sans);
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background-color: var(--color-gray-100);
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--color-gray-300);
    border-radius: 9999px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-gray-400);
  }
}

@layer components {
  .container-custom {
    max-width: 80rem;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  @media (min-width: 640px) {
    .container-custom {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
  }

  @media (min-width: 1024px) {
    .container-custom {
      padding-left: 2rem;
      padding-right: 2rem;
    }
  }

  .btn-primary {
    background-color: var(--color-primary-600);
    color: var(--color-white);
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition-property: all;
    transition-duration: 200ms;
  }

  .btn-primary:hover {
    background-color: var(--color-primary-700);
  }

  .btn-primary:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
    --ring-color: var(--color-primary-500);
    --ring-offset-width: 2px;
    box-shadow: 0 0 0 var(--ring-offset-width) var(--color-white), 0 0 0 calc(2px + var(--ring-offset-width)) var(--ring-color);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background-color: var(--color-gray-100);
    color: var(--color-gray-900);
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition-property: all;
    transition-duration: 200ms;
  }

  .btn-secondary:hover {
    background-color: var(--color-gray-200);
  }

  .input-primary {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-gray-300);
    border-radius: 0.5rem;
    transition-property: all;
    transition-duration: 200ms;
  }

  .input-primary:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
    --ring-color: var(--color-primary-500);
    --ring-offset-width: 2px;
    box-shadow: 0 0 0 var(--ring-offset-width) var(--color-white), 0 0 0 calc(2px + var(--ring-offset-width)) var(--ring-color);
    border-color: transparent;
  }

  .card-hover {
    transition-property: all;
    transition-duration: 300ms;
  }

  .card-hover:hover {
    --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    box-shadow: var(--tw-shadow);
    transform: translateY(-4px);
  }
}

@layer utilities {
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }

  .animate-slide-up {
    animation: slideUp 0.5s ease-out;
  }

  .animate-scale-in {
    animation: scaleIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
}
`;
fs.writeFileSync('src/index.css', cssContent);
console.log('  ✅ Updated: src/index.css');

// ============================================
// 15. DELETE tailwind.config.js (v4 doesn't need it)
// ============================================
const configPath = path.join(process.cwd(), 'tailwind.config.js');
if (fs.existsSync(configPath)) {
  fs.unlinkSync(configPath);
  console.log('  ✅ Removed: tailwind.config.js (not needed in v4)');
}

// ============================================
// 16. COMPLETE
// ============================================
console.log('');
console.log('='.repeat(60));
console.log('✅ SETUP COMPLETE!');
console.log('='.repeat(60));
console.log('');
console.log('📦 Now install these dependencies:');
console.log('   npm install react-router-dom axios react-hot-toast lucide-react');
console.log('');
console.log('🚀 Then start the dev server:');
console.log('   npm run dev');
console.log('');
console.log('📝 Note: Using Tailwind CSS v4 - no config file needed!');
console.log('='.repeat(60));