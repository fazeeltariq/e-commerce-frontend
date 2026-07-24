import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../hooks/useCart';
import { useWishlist } from '../../../hooks/useWishlist';
import { useCategories } from '../../../hooks/useCategories';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu, 
  X, 
  Search,
  ChevronDown
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems: cartCount } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { categories } = useCategories();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-2xl border-b border-gray-100/20 shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0" onClick={() => setIsMenuOpen(false)}>
              <motion.div 
                whileHover={{ rotate: -10, scale: 1.05 }}
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-black rounded-xl flex items-center justify-center"
              >
                <span className="text-white font-bold text-sm sm:text-base md:text-lg">B</span>
              </motion.div>
              <span className="text-base sm:text-lg md:text-xl font-bold tracking-tight">
                <span className="text-black">Byte</span>
                <span className="text-black/50">Buy</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 lg:gap-8">
              {/* Categories Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-black/60 hover:text-black transition-colors">
                  Categories
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100/20 py-2 invisible group-hover:visible transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <Link 
                        key={category._id}
                        to={`/products?category=${category._id}`}
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))
                  ) : (
                    <span className="block px-4 py-2 text-sm text-black/40">
                      No categories
                    </span>
                  )}
                </div>
              </div>

              <Link 
                to="/products" 
                className="text-sm font-medium text-black/60 hover:text-black transition-colors relative group"
              >
                Products
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
              </Link>

              <button 
                onClick={() => setIsSearchOpen(true)}
                className="text-black/60 hover:text-black transition-colors p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg"
                aria-label="Search"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="flex items-center gap-0.5 sm:gap-1">
                <Link 
                  to="/wishlist" 
                  className="relative p-1.5 sm:p-2 text-black/60 hover:text-black transition-colors hover:bg-gray-50 rounded-lg"
                  aria-label="Wishlist"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-black text-white text-[8px] sm:text-[10px] rounded-full flex items-center justify-center font-medium">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link 
                  to="/cart" 
                  className="relative p-1.5 sm:p-2 text-black/60 hover:text-black transition-colors hover:bg-gray-50 rounded-lg"
                  aria-label="Cart"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-black text-white text-[8px] sm:text-[10px] rounded-full flex items-center justify-center font-medium">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {isAuthenticated ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-1.5 p-1.5 text-black/60 hover:text-black transition-colors hover:bg-gray-50 rounded-lg"
                      aria-label="Profile"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/5 flex items-center justify-center border border-black/10">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black/60" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium hidden lg:block">{user?.name?.split(' ')[0]}</span>
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 hidden lg:block" />
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-56 sm:w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100/20 py-2"
                        >
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="font-medium text-black text-sm">{user?.name}</p>
                            <p className="text-xs text-black/40">{user?.email}</p>
                            {user?.role === 'admin' && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-black/5 text-black/60 text-xs rounded-full">
                                Admin
                              </span>
                            )}
                          </div>
                          <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                          <Link to="/orders" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                            <ShoppingBag className="w-4 h-4" />
                            Orders
                          </Link>
                          {user?.role === 'admin' && (
                            <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                              <User className="w-4 h-4" />
                              Dashboard
                            </Link>
                          )}
                          <div className="border-t border-gray-100 my-1" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Link 
                      to="/login" 
                      className="text-xs sm:text-sm font-medium text-black/60 hover:text-black transition-colors px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-50 rounded-lg"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      className="bg-black text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-black/80 transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-1 md:hidden">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="text-black/60 hover:text-black transition-colors p-2 hover:bg-gray-50 rounded-lg"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <button
                className="text-black p-2 hover:bg-gray-50 rounded-lg relative z-50"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ✅ Mobile Menu Overlay - Full screen */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white md:hidden"
            style={{ top: '56px' }}
          >
            <div className="container-custom py-6 space-y-6 overflow-y-auto h-full pb-20">
              {/* Close button at top of menu */}
              <div className="flex justify-end">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-black" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-6">
                <Link 
                  to="/products" 
                  className="block text-lg font-medium hover:text-black transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                
                {/* Categories */}
                <div className="space-y-2">
                  <p className="text-sm text-black/40 font-medium">Categories</p>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <Link 
                        key={category._id}
                        to={`/products?category=${category._id}`}
                        className="block py-2 text-base hover:text-black transition-colors pl-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-black/40 pl-2">No categories</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <Link 
                      to="/profile" 
                      className="block text-base font-medium hover:text-black transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block text-base font-medium hover:text-black transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <div className="flex gap-6">
                      <Link 
                        to="/cart" 
                        className="text-base font-medium hover:text-black transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Cart ({cartCount})
                      </Link>
                      <Link 
                        to="/wishlist" 
                        className="text-base font-medium hover:text-black transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Wishlist ({wishlistCount})
                      </Link>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left text-base font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link 
                      to="/login" 
                      className="block text-base font-medium hover:text-black transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      className="block text-base font-medium text-black/60 hover:text-black transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-2xl flex items-start justify-center pt-16 sm:pt-24"
            onClick={() => setIsSearchOpen(false)}
          >
            <div className="w-full max-w-3xl px-4" onClick={(e) => e.stopPropagation()}>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleSearch} className="flex items-center gap-3 sm:gap-4 border-b-2 border-black pb-3 sm:pb-4">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-black/40" />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="flex-1 bg-transparent text-base sm:text-lg outline-none placeholder:text-black/40"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <button 
                    onClick={() => setIsSearchOpen(false)}
                    className="text-black/40 hover:text-black transition-colors p-2"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </form>
                <div className="mt-6">
                  <p className="text-sm text-black/40 mb-3">Popular searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {['MacBook Pro', 'Sony Headphones', 'iPhone 15', 'AirPods Max', 'Samsung Galaxy'].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          navigate(`/products?search=${encodeURIComponent(term)}`);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 rounded-full text-xs sm:text-sm hover:bg-gray-100 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;