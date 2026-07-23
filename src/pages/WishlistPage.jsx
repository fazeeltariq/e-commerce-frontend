import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  Trash2,
  ArrowRight,
  HeartOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WishlistPage = () => {
  const { isAuthenticated } = useAuth();
  const { wishlist, isLoading, removeFromWishlist, totalItems } = useWishlist();
  const { addToCart } = useCart();

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-black/40">Loading your wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-black/20" />
            </div>
            <h2 className="text-2xl font-bold text-black">Login to View Wishlist</h2>
            <p className="text-black/40 mt-2">Please login to see your saved items.</p>
            <Link 
              to="/login" 
              className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors"
            >
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty wishlist
  if (!wishlist?.products || wishlist.products.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <HeartOff className="w-12 h-12 text-black/20" />
            </div>
            <h2 className="text-2xl font-bold text-black">Your wishlist is empty</h2>
            <p className="text-black/40 mt-2">Start adding products you love.</p>
            <Link 
              to="/products" 
              className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const products = wishlist.products;

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-24 pb-16">
        <div className="container-custom">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">My Wishlist</h1>
              <p className="text-black/40 mt-1">{totalItems} items saved</p>
            </div>
            <Link 
              to="/products" 
              className="text-sm text-black/40 hover:text-black transition-colors flex items-center gap-1"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Wishlist Grid - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {products.map((product, index) => {
                const imageUrl = getImageUrl(product);
                
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="group"
                  >
                    <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                      {/* Image */}
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
                        </div>
                      </Link>

                      {/* Remove from Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveFromWishlist(product._id);
                        }}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm z-10 group/remove"
                      >
                        <Trash2 className="w-4 h-4 text-black/40 group-hover/remove:text-red-500 transition-colors" />
                      </button>

                      {/* Stock Badge */}
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

                        {/* Add to Cart Button */}
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
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;