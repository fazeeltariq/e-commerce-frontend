import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api';
import { 
  Package, 
  ArrowRight, 
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  Calendar,
  ShoppingBag,
  CreditCard,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

const OrdersPage = () => {
  const [filter, setFilter] = useState('all');

  // Fetch orders
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response = await orderApi.getMyOrders();
      return response.data || [];
    },
  });

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Pending': { icon: Clock, color: 'bg-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
      'Confirmed': { icon: CheckCircle, color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50', label: 'Confirmed' },
      'Shipped': { icon: Truck, color: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50', label: 'Shipped' },
      'Delivered': { icon: CheckCircle, color: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50', label: 'Delivered' },
      'Cancelled': { icon: XCircle, color: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  // Filter orders
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders?.filter(order => order.status === filter);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-black/40">Loading your orders...</p>
            </div>
          </div>
        </div>
     
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-black">Something went wrong</h2>
            <p className="text-black/40 mt-2">Failed to load your orders.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Empty orders
  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-black/20" />
            </div>
            <h2 className="text-2xl font-bold text-black">No orders yet</h2>
            <p className="text-black/40 mt-2">Start shopping to place your first order.</p>
            <Link 
              to="/products" 
              className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-24 pb-16">
        <div className="container-custom">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">My Orders</h1>
              <p className="text-black/40 mt-1">{orders.length} orders placed</p>
            </div>
            <Link 
              to="/products" 
              className="mt-4 sm:mt-0 text-sm text-black/40 hover:text-black transition-colors flex items-center gap-1"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['all', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  filter === status 
                    ? 'bg-black text-white' 
                    : 'bg-gray-50 text-black/60 hover:bg-gray-100'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {filteredOrders?.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all"
              >
                {/* Order Header */}
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm font-medium text-black">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <StatusBadge status={order.status} />
                    <span className="text-xs text-black/40 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-black">
                      Total: ${order.totalPrice?.toFixed(2)}
                    </span>
                    <Link
                      to={`/orders/${order._id}`}
                      className="px-4 py-1.5 bg-black text-white rounded-lg text-xs font-medium hover:bg-black/80 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-black/40 mb-3">
                    <ShoppingBag className="w-4 h-4" />
                    <span>{order.orderItems?.length || 0} items</span>
                  </div>
                  
                  <div className="space-y-3">
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                        {/* Product Image */}
                        <div className="w-14 h-14 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                          {item.product?.images?.[0]?.url ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = `https://via.placeholder.com/56x56/f0f0f0/999999?text=${item.product?.name?.charAt(0) || 'P'}`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-black/20 text-xs">
                              No Img
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link to={`/products/${item.product?._id}`} className="font-medium text-black hover:text-black/70 transition-colors text-sm">
                            {item.product?.name || 'Product'}
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-black/40">
                            <span>Qty: {item.quantity}</span>
                            <span>${item.price?.toFixed(2)} each</span>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-sm font-medium text-black">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary at bottom of card */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-4 text-xs text-black/40">
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5" />
                        Cash on Delivery
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        {order.orderItems?.length || 0} items
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-black/60">Order Total:</span>
                      <span className="text-base font-bold text-black">${order.totalPrice?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* No filtered results */}
          {filteredOrders?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-black/40">No {filter} orders found.</p>
            </div>
          )}
        </div>
      </div>

    
    </div>
  );
};

export default OrdersPage;