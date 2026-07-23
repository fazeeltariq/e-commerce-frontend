import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi, categoryApi } from '../api';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Eye
} from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProductsPage = () => {
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-createdAt');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const itemsPerPage = 9; // 3 rows of 3

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await categoryApi.getCategories();
        return response.data || [];
      } catch (err) {
        console.error('❌ Failed to fetch categories:', err);
        return [];
      }
    },
  });

  // Fetch products with filters
  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ['products', searchQuery, selectedCategory, sortBy, currentPage],
    queryFn: async () => {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { category: selectedCategory }),
      };
      const response = await productApi.getProducts(params);
      return response.data;
    },
  });

  const products = productsData?.products || [];
  const totalProducts = productsData?.totalProducts || 0;
  const totalPages = productsData?.totalPages || 1;

  // Update URL when filters change
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (sortBy !== '-createdAt') params.sort = sortBy;
    if (currentPage > 1) params.page = currentPage;
    setSearchParams(params);
  }, [searchQuery, selectedCategory, sortBy, currentPage, setSearchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('-createdAt');
    setCurrentPage(1);
  };

  const handleWishlistToggle = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const handleAddToCart = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    addToCart({ productId, quantity: 1 });
  };

  const getImageUrl = (product) => {
    if (!product?.images || product.images.length === 0) return null;
    return product.images[0]?.url || null;
  };

  // Product Card Component - Bigger size
  const ProductCard = ({ product, index }) => {
    const imageUrl = getImageUrl(product);
    const isWishlisted = isInWishlist(product._id);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="group"
      >
        <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
          {/* Image - Link to product detail */}
          <Link to={`/products/${product._id}`} className="block">
            <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
              {imageUrl ? (
                <img 
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/600x450/f0f0f0/999999?text=${product.name.charAt(0)}`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-black/20 text-sm">
                  No Image
                </div>
              )}
              
              {/* Quick View Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="px-4 py-2 bg-white text-black rounded-xl text-sm font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Quick View
                </span>
              </div>
            </div>
          </Link>

          {/* Wishlist Button */}
          <button
            onClick={(e) => handleWishlistToggle(e, product._id)}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm z-10"
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${
                isAuthenticated && isWishlisted ? 'fill-black text-black' : 'text-black/40'
              }`}
            />
          </button>

          {/* Stock Badge */}
          {product.stock < 5 && product.stock > 0 && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
              Low Stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
              Out of Stock
            </span>
          )}

          {/* Content */}
          <div className="p-5">
            <Link to={`/products/${product._id}`}>
              <h3 className="font-semibold text-black text-base line-clamp-1 hover:text-black/70 transition-colors">
                {product.name}
              </h3>
            </Link>
            
            {/* Brand */}
            {product.brand && (
              <p className="text-xs text-black/40 mt-0.5">{product.brand}</p>
            )}
            
            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                <span className="text-sm font-medium text-black">{product.averageRating || 0}</span>
              </div>
              <span className="text-xs text-black/40">({product.numReviews || 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xl font-bold text-black">${product.price}</span>
              {product.oldPrice && (
                <span className="text-sm text-black/40 line-through">${product.oldPrice}</span>
              )}
            </div>

            {/* Add to Cart Button - Only on Product Card */}
            <button
              onClick={(e) => handleAddToCart(e, product._id)}
              disabled={product.stock === 0}
              className="w-full mt-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Loading skeleton - NO FOOTER HERE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
                <div className="h-5 bg-gray-200 rounded mt-3 w-3/4" />
                <div className="h-4 bg-gray-200 rounded mt-2 w-1/4" />
                <div className="h-6 bg-gray-200 rounded mt-3 w-1/3" />
                <div className="h-10 bg-gray-200 rounded mt-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-20">
        <div className="container-custom py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black">All Products</h1>
            <p className="text-black/40 mt-1">{totalProducts} products available</p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products..."
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors whitespace-nowrap"
              >
                Search
              </button>
            </form>

            <div className="flex gap-2">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors sm:hidden"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none focus:border-black"
                >
                  <option value="-createdAt">Newest</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="-name">Name: Z to A</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 pointer-events-none" />
              </div>

              {(searchQuery || selectedCategory || sortBy !== '-createdAt') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2.5 text-sm text-black/40 hover:text-black transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  !selectedCategory ? 'bg-black text-white' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === category._id ? '' : category._id);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                    selectedCategory === category._id ? 'bg-black text-white' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Products Grid - 3 columns */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-50 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-black text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && <span className="text-black/40">...</span>}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-50 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-black/40">No products found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsFilterOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute left-0 top-0 bottom-0 w-80 bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setCurrentPage(1);
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                        !selectedCategory ? 'bg-black text-white' : 'hover:bg-gray-50'
                      }`}
                    >
                      All
                    </button>
                    {categories?.map((category) => (
                      <button
                        key={category._id}
                        onClick={() => {
                          setSelectedCategory(selectedCategory === category._id ? '' : category._id);
                          setCurrentPage(1);
                        }}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                          selectedCategory === category._id ? 'bg-black text-white' : 'hover:bg-gray-50'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <div className="space-y-2">
                    {[
                      { value: '-createdAt', label: 'Newest' },
                      { value: 'price', label: 'Price: Low to High' },
                      { value: '-price', label: 'Price: High to Low' },
                      { value: 'name', label: 'Name: A to Z' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setCurrentPage(1);
                        }}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                          sortBy === option.value ? 'bg-black text-white' : 'hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={clearFilters}
                  className="w-full py-3 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsPage;