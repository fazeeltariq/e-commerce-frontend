import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems: cartCount = 0 } = useCart() || {}; // Add fallback
  const { totalItems: wishlistCount = 0 } = useWishlist() || {}; // Add fallback
  const { categories, isLoading: categoriesLoading } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const profileRef = useRef(null);
  const categoriesRef = useRef(null);
  const searchInputRef = useRef(null);

  // Handle scroll with cleanup
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close categories dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow || 'auto';
    }
    return () => {
      document.body.style.overflow = originalOverflow || 'auto';
    };
  }, [isMenuOpen]);

  // Auto-focus search input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMenuOpen(false);
        setIsProfileOpen(false);
        setIsCategoriesOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsProfileOpen(false);
      setIsMenuOpen(false);
    }
  }, [logout, navigate]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/products?search=${encodeURIComponent(trimmedQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  const handleSearchClick = useCallback((term) => {
    setSearchQuery(term);
    // Create a synthetic event for the search
    const syntheticEvent = { preventDefault: () => {} };
    // Use setTimeout to ensure state is updated
    setTimeout(() => {
      handleSearch(syntheticEvent);
    }, 0);
  }, [handleSearch]);

  // Remove debug logging in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Navbar: categories state:', categories);
      console.log('🔍 Navbar: categories is array?', Array.isArray(categories));
      console.log('🔍 Navbar: categories length:', categories?.length);
    }
  }, [categories]);

  // Memoize category items to prevent unnecessary re-renders
  const renderCategoryItems = useCallback(() => {
    if (categoriesLoading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-black/40" />
        </div>
      );
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return (
        <span className="block px-4 py-2 text-sm text-black/40 text-center">
          No categories found
        </span>
      );
    }

    return categories.map((category) => (
      <Link 
        key={category._id || category.id} // Fallback for id
        to={`/products?category=${category._id || category.id}`}
        onClick={() => setIsCategoriesOpen(false)}
        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
      >
        {category.name}
      </Link>
    ));
  }, [categories, categoriesLoading]);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-2xl border-b border-gray-100/20 shadow-sm' 
            : 'bg-transparent'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-1.5 sm:gap-2 group shrink-0" 
              onClick={() => setIsMenuOpen(false)}
              aria-label="ByteBuy Home"
            >
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
              <div className="relative" ref={categoriesRef}>
                <button 
                  onClick={() => setIsCategoriesOpen(prev => !prev)}
                  className="flex items-center gap-1 text-sm font-medium text-black/60 hover:text-black transition-colors"
                  aria-expanded={isCategoriesOpen}
                  aria-haspopup="true"
                >
                  Categories
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isCategoriesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100/20 py-2 z-[9999]"
                      role="menu"
                    >
                      {renderCategoryItems()}
                    </motion.div>
                  )}
                </AnimatePresence>
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
                aria-label="Search products"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="flex items-center gap-0.5 sm:gap-1">
                <Link 
                  to="/wishlist" 
                  className="relative p-1.5 sm:p-2 text-black/60 hover:text-black transition-colors hover:bg-gray-50 rounded-lg"
                  aria-label={`Wishlist${wishlistCount > 0 ? ` (${wishlistCount} items)` : ''}`}
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-black text-white text-[8px] sm:text-[10px] rounded-full flex items-center justify-center font-medium">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>

                <Link 
                  to="/cart" 
                  className="relative p-1.5 sm:p-2 text-black/60 hover:text-black transition-colors hover:bg-gray-50 rounded-lg"
                  aria-label={`Cart${cartCount > 0 ? ` (${cartCount} items)` : ''}`}
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-black text-white text-[8px] sm:text-[10px] rounded-full flex items-center justify-center font-medium">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>

                {isAuthenticated ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(prev => !prev)}
                      className="flex items-center gap-1.5 p-1.5 text-black/60 hover:text-black transition-colors hover:bg-gray-50 rounded-lg"
                      aria-label="Profile menu"
                      aria-expanded={isProfileOpen}
                      aria-haspopup="true"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/5 flex items-center justify-center border border-black/10">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black/60" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium hidden lg:block">
                        {user?.name?.split(' ')[0] || 'User'}
                      </span>
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
                          role="menu"
                        >
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="font-medium text-black text-sm">{user?.name || 'User'}</p>
                            <p className="text-xs text-black/40">{user?.email || ''}</p>
                            {user?.role === 'admin' && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-black/5 text-black/60 text-xs rounded-full">
                                Admin
                              </span>
                            )}
                          </div>
                          <Link 
                            to="/profile" 
                            className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                            role="menuitem"
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                          <Link 
                            to="/orders" 
                            className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                            role="menuitem"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Orders
                          </Link>
                          {user?.role === 'admin' && (
                            <Link 
                              to="/admin/dashboard" 
                              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                              role="menuitem"
                            >
                              <User className="w-4 h-4" />
                              Dashboard
                            </Link>
                          )}
                          <div className="border-t border-gray-100 my-1" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                            role="menuitem"
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
                aria-label="Search products"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <button
                className="text-black p-2 hover:bg-gray-50 rounded-lg relative z-50"
                onClick={() => setIsMenuOpen(prev => !prev)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white md:hidden"
            style={{ top: '56px' }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="container-custom py-6 space-y-6 overflow-y-auto h-full pb-20">
              <div className="space-y-6">
                <Link 
                  to="/products" 
                  className="block text-lg font-medium hover:text-black transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                
                <div className="space-y-2">
                  <p className="text-sm text-black/40 font-medium">Categories</p>
                  {categoriesLoading ? (
                    <div className="flex items-center gap-2 py-2 pl-2">
                      <Loader2 className="w-4 h-4 animate-spin text-black/40" />
                      <span className="text-sm text-black/40">Loading categories...</span>
                    </div>
                  ) : categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <Link 
                        key={category._id || category.id}
                        to={`/products?category=${category._id || category.id}`}
                        className="block py-2 text-base hover:text-black transition-colors pl-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-black/40 pl-2">No categories found</p>
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
            className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-2xl flex items-start justify-center pt-16 sm:pt-24"
            onClick={() => setIsSearchOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Search dialog"
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
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for products..."
                    className="flex-1 bg-transparent text-base sm:text-lg outline-none placeholder:text-black/40"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    aria-label="Search input"
                  />
                  <button 
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="text-black/40 hover:text-black transition-colors p-2"
                    aria-label="Close search"
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
                        onClick={() => handleSearchClick(term)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 rounded-full text-xs sm:text-sm hover:bg-gray-100 transition-colors"
                        type="button"
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