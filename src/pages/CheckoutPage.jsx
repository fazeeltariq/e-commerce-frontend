import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api';
import { 
  ArrowLeft,
  ShoppingBag,
  Check,
  Loader2,
  Truck,
  Shield,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { cart, isLoading, clearCart } = useCart();
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Get cart items
  const cartItems = cart?.products || [];
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;

  // Handle place order with confirmation
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  // Confirm and place order
  const confirmOrder = async () => {
    setShowConfirmDialog(false);
    setIsPlacingOrder(true);
    setError(null);

    try {
      const response = await orderApi.createOrder();
      setOrderId(response.data.order._id);
      setOrderPlaced(true);
      await clearCart();
    } catch (err) {
      console.error('Order failed:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

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
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-black/20" />
            </div>
            <h2 className="text-2xl font-bold text-black">Your cart is empty</h2>
            <p className="text-black/40 mt-2">Add some products before checking out.</p>
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

  // Order placed successfully
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-black">Order Placed!</h2>
            <p className="text-black/40 mt-2">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
            {orderId && (
              <p className="text-sm text-black/30 mt-2">
                Order ID: #{orderId.slice(-8).toUpperCase()}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link 
                to={`/orders/${orderId}`} 
                className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors"
              >
                View Order
              </Link>
              <Link 
                to="/products" 
                className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-24 pb-16">
        <div className="container-custom">
          {/* Back Button */}
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-black/40 hover:text-black transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Items */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-black mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const product = item.product;
                  if (!product) return null;
                  
                  return (
                    <div key={product._id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-20 h-20 rounded-xl bg-white overflow-hidden shrink-0">
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/80x80/f0f0f0/999999?text=${product.name.charAt(0)}`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-black/20 text-xs">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${product._id}`}>
                          <h4 className="font-medium text-black hover:text-black/70 transition-colors line-clamp-1">
                            {product.name}
                          </h4>
                        </Link>
                        <p className="text-sm text-black/40">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-black mt-1">
                          ${(product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
                <h3 className="text-lg font-bold text-black mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Subtotal ({totalItems} items)</span>
                    <span className="font-medium text-black">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Shipping</span>
                    <span className="font-medium text-black">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-black">Total</span>
                      <span className="font-bold text-black">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || cartItems.length === 0}
                  className="w-full mt-6 py-3.5 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Place Order
                    </>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <Truck className="w-4 h-4 text-black/30 mx-auto" />
                      <p className="text-[10px] text-black/30 mt-1">Free Delivery</p>
                    </div>
                    <div>
                      <Shield className="w-4 h-4 text-black/30 mx-auto" />
                      <p className="text-[10px] text-black/30 mt-1">Secure</p>
                    </div>
                    <div>
                      <Clock className="w-4 h-4 text-black/30 mx-auto" />
                      <p className="text-[10px] text-black/30 mt-1">2-Year Warranty</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-black">Confirm Order</h3>
              <p className="text-black/60 mt-2">
                Are you sure you want to place this order for <strong>${total.toFixed(2)}</strong>?
              </p>
              <p className="text-sm text-black/40 mt-1">
                You'll receive a confirmation email once the order is placed.
              </p>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmOrder}
                  className="flex-1 px-4 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors"
                >
                  Confirm Order
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

     
    
    </div>
  );
};

export default CheckoutPage;