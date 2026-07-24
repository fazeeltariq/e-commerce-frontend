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
  
  // Initialize state from URL parameters
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-createdAt');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const itemsPerPage = 9;

  // Fetch categories
  const { data: categories = [], error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await categoryApi.getCategories();
        console.log('📂 Categories raw response:', response);
        console.log('📂 Categories response.data:', response.data);
        
        if (Array.isArray(response.data)) {
          console.log('✅ Categories is an array:', response.data.length, 'items');
          return response.data;
        }
        
        if (response.data?.categories && Array.isArray(response.data.categories)) {
          return response.data.categories;
        }
        
        if (response.data?.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        
        console.warn('⚠️ Unexpected categories format:', response.data);
        return [];
      } catch (err) {
        console.error('❌ Failed to fetch categories:', err);
        console.error('Error details:', err.response?.status, err.response?.data);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });

  if (categoriesError) {
    console.error('❌ Categories query error:', categoriesError);
  }

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
      try {
        const response = await productApi.getProducts(params);
        return response.data;
      } catch (error) {
        console.error('❌ Failed to fetch products:', error);
        return { products: [], totalProducts: 0, totalPages: 1 };
      }
    },
  });

  const products = productsData?.products || [];
  const totalProducts = productsData?.totalProducts || 0;
  const totalPages = productsData?.totalPages || 1;

  // Sync state with URL changes (for Navbar navigation)
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || '-createdAt';
    const page = parseInt(searchParams.get('page')) || 1;

    // Update state if URL changed externally (e.g., from Navbar)
    if (search !== searchQuery) {
      setSearchQuery(search);
      setSearchInput(search);
    }
    if (category !== selectedCategory) {
      setSelectedCategory(category);
    }
    if (sort !== sortBy) {
      setSortBy(sort);
    }
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  }, [searchParams, searchQuery, selectedCategory, sortBy, currentPage]);

  // Update URL when state changes (for internal navigation)
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (sortBy !== '-createdAt') params.sort = sortBy;
    if (currentPage > 1) params.page = currentPage;
    
    // Only update if different from current URL
    const currentSearch = searchParams.get('search') || '';
    const currentCategory = searchParams.get('category') || '';
    const currentSort = searchParams.get('sort') || '-createdAt';
    const currentPageParam = parseInt(searchParams.get('page')) || 1;
    
    if (searchQuery !== currentSearch || 
        selectedCategory !== currentCategory || 
        sortBy !== currentSort || 
        currentPage !== currentPageParam) {
      setSearchParams(params);
    }
  }, [searchQuery, selectedCategory, sortBy, currentPage, setSearchParams, searchParams]);

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
    setIsFilterOpen(false);
  };

  const handleWishlistToggle = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      return;
    }
    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    }
  };

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      return;
    }
    try {
      await addToCart({ productId, quantity: 1 });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const getImageUrl = (product) => {
    if (!product?.images || product.images.length === 0) return null;
    return product.images[0]?.url || null;
  };

  const ProductCard = ({ product, index }) => {
    const imageUrl = getImageUrl(product);
    const isWishlisted = isInWishlist(product._id);
    
    return (
      <motion.div
        key={product._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="group"
      >
        <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
          <Link to={`/products/${product._id}`} className="block">
            <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
              {imageUrl ? (
                <img 
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/600x450/f0f0f0/999999?text=${encodeURIComponent(product.name.charAt(0))}`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-black/20 text-sm">
                  No Image
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-black rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Quick View
                </span>
              </div>
            </div>
          </Link>

          <button
            onClick={(e) => handleWishlistToggle(e, product._id)}
            className="absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm z-10"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart 
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                isAuthenticated && isWishlisted ? 'fill-black text-black' : 'text-black/40'
              }`}
            />
          </button>

          {product.stock < 5 && product.stock > 0 && (
            <span className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-yellow-500 text-white text-[10px] sm:text-xs font-medium rounded-full">
              Low Stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-red-500 text-white text-[10px] sm:text-xs font-medium rounded-full">
              Out of Stock
            </span>
          )}

          <div className="p-3 sm:p-5">
            <Link to={`/products/${product._id}`}>
              <h3 className="font-semibold text-black text-sm sm:text-base line-clamp-1 hover:text-black/70 transition-colors">
                {product.name}
              </h3>
            </Link>
            
            {product.brand && (
              <p className="text-[10px] sm:text-xs text-black/40 mt-0.5">{product.brand}</p>
            )}
            
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black text-black" />
                <span className="text-xs sm:text-sm font-medium text-black">{product.averageRating || 0}</span>
              </div>
              <span className="text-[10px] sm:text-xs text-black/40">({product.numReviews || 0} reviews)</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3">
              <span className="text-base sm:text-xl font-bold text-black">${product.price}</span>
              {product.oldPrice && (
                <span className="text-xs sm:text-sm text-black/40 line-through">${product.oldPrice}</span>
              )}
            </div>

            <button
              onClick={(e) => handleAddToCart(e, product._id)}
              disabled={product.stock === 0}
              className="w-full mt-3 sm:mt-4 py-2 sm:py-2.5 bg-black text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-black/80 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="pt-14 sm:pt-16 md:pt-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
                  <div className="h-4 sm:h-5 bg-gray-200 rounded mt-2 sm:mt-3 w-3/4" />
                  <div className="h-3 sm:h-4 bg-gray-200 rounded mt-1.5 sm:mt-2 w-1/4" />
                  <div className="h-5 sm:h-6 bg-gray-200 rounded mt-2 sm:mt-3 w-1/3" />
                  <div className="h-8 sm:h-10 bg-gray-200 rounded mt-3 sm:mt-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-14 sm:pt-16 md:pt-20">
        <div className="container-custom py-4 sm:py-8">
          <div className="mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-black">All Products</h1>
            <p className="text-black/40 mt-0.5 sm:mt-1 text-sm sm:text-base">
              {totalProducts} products available
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory && categories.find(c => c._id === selectedCategory) && 
                ` in ${categories.find(c => c._id === selectedCategory).name}`
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-8">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products..."
                  className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                  aria-label="Search products"
                />
              </div>
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors whitespace-nowrap"
              >
                Search
              </button>
            </form>

            <div className="flex gap-2">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors"
                aria-label="Open filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="sm:hidden">Filter</span>
                <span className="hidden sm:inline">Filters</span>
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none px-3 sm:px-4 py-2 sm:py-2.5 pr-7 sm:pr-10 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none focus:border-black"
                  aria-label="Sort products"
                >
                  <option value="-createdAt">Newest</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="-name">Name: Z to A</option>
                </select>
                <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-black/40 pointer-events-none" />
              </div>

              {(searchQuery || selectedCategory || sortBy !== '-createdAt') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-black/40 hover:text-black transition-colors"
                  aria-label="Clear all filters"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-8">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setCurrentPage(1);
                }}
                className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm transition-colors ${
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
                  className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm transition-colors ${
                    selectedCategory === category._id ? 'bg-black text-white' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {products.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-12">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-black text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && <span className="text-black/40 text-sm">...</span>}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 sm:py-20">
              <p className="text-black/40 text-sm sm:text-base">No products found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Sidebar */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={() => setIsFilterOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] sm:w-80 bg-white p-5 sm:p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Filters</h2>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  aria-label="Close filters"
                >
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
                        setIsFilterOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                        !selectedCategory ? 'bg-black text-white' : 'hover:bg-gray-50'
                      }`}
                    >
                      All
                    </button>
                    {Array.isArray(categories) && categories.map((category) => (
                      <button
                        key={category._id}
                        onClick={() => {
                          setSelectedCategory(selectedCategory === category._id ? '' : category._id);
                          setCurrentPage(1);
                          setIsFilterOpen(false);
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
                          setIsFilterOpen(false);
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