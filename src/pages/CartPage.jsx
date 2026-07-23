import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  X,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { cart, isLoading, updateQuantity, removeFromCart, clearCart } = useCart();
  
  const [updating, setUpdating] = useState({});
  const [removing, setRemoving] = useState(null);

  // Handle quantity update
  const handleQuantityUpdate = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      await updateQuantity({ productId, quantity: newQuantity });
    } catch (error) {
      // Error handled in hook
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Handle remove item
  const handleRemoveItem = async (productId) => {
    setRemoving(productId);
    try {
      await removeFromCart(productId);
    } catch (error) {
      // Error handled in hook
    } finally {
      setRemoving(null);
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  // Calculate totals
  const cartItems = cart?.products || [];
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  // Check if all items have valid product data
  const hasInvalidItems = cartItems.some(item => !item.product);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-black/40">Loading your cart...</p>
            </div>
          </div>
        </div>
       
      </div>
    );
  }

  // Empty cart
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-black/20" />
            </div>
            <h2 className="text-2xl font-bold text-black">Your cart is empty</h2>
            <p className="text-black/40 mt-2">Start shopping to add items to your cart.</p>
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

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-24 pb-16">
        <div className="container-custom">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">Shopping Cart</h1>
              <p className="text-black/40 mt-1">{totalItems} items in your cart</p>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>

          {hasInvalidItems && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-700">
                Some items in your cart are no longer available. Please remove them.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item, index) => {
                  const product = item.product;
                  const isUpdating = updating[item.product?._id];
                  const isRemoving = removing === item.product?._id;

                  // Skip invalid items
                  if (!product) {
                    return (
                      <div key={index} className="bg-red-50 rounded-2xl p-4 border border-red-100">
                        <p className="text-sm text-red-600">Product unavailable</p>
                      </div>
                    );
                  }

                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                      className={`bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all ${
                        isRemoving ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <Link to={`/products/${product._id}`} className="shrink-0">
                          <div className="w-24 h-24 rounded-xl bg-gray-50 overflow-hidden">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = `https://via.placeholder.com/100x100/f0f0f0/999999?text=${product.name.charAt(0)}`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-black/20 text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <Link to={`/products/${product._id}`}>
                            <h3 className="font-medium text-black hover:text-black/70 transition-colors line-clamp-1">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-black/40">${product.price}</p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 mt-3">
                            <button
                              onClick={() => handleQuantityUpdate(product._id, item.quantity - 1)}
                              disabled={isUpdating || item.quantity <= 1}
                              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {isUpdating ? '...' : item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityUpdate(product._id, item.quantity + 1)}
                              disabled={isUpdating}
                              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Price & Remove */}
                        <div className="text-right shrink-0">
                          <p className="font-bold text-black">
                            ${(product.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(product._id)}
                            disabled={isRemoving}
                            className="mt-2 text-black/30 hover:text-red-600 transition-colors"
                          >
                            {isRemoving ? (
                              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
                <h3 className="text-lg font-bold text-black mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Subtotal ({totalItems} items)</span>
                    <span className="font-medium text-black">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Shipping</span>
                    <span className="font-medium text-black">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-black">Total</span>
                      <span className="font-bold text-black">${totalPrice.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-black/30 mt-1">Taxes included</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please login to checkout');
                      navigate('/login');
                      return;
                    }
                    navigate('/checkout');
                  }}
                  className="w-full mt-6 py-3.5 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  to="/products"
                  className="block text-center mt-4 text-sm text-black/40 hover:text-black transition-colors"
                >
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-4 text-xs text-black/30">
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3 h-3" />
                      Secure
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3 h-3" />
                      Fast Delivery
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3 h-3" />
                      Easy Returns
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

   
    </div>
  );
};

export default CartPage;