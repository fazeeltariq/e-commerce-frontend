import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api';
import { 
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Calendar,
  CreditCard
} from 'lucide-react';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await orderApi.getOrder(id);
      return response.data;
    },
  });

  // Status badge
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Pending': { icon: Clock, color: 'bg-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-50' },
      'Confirmed': { icon: CheckCircle, color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
      'Shipped': { icon: Truck, color: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50' },
      'Delivered': { icon: CheckCircle, color: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50' },
      'Cancelled': { icon: XCircle, color: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' },
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-black/40">Loading order details...</p>
            </div>
          </div>
        </div>
      
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-black">Order Not Found</h2>
            <p className="text-black/40 mt-2">The order you're looking for doesn't exist.</p>
            <Link 
              to="/orders" 
              className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors"
            >
              Back to Orders
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
          {/* Back Button */}
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-black/40 hover:text-black transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>

          {/* Order Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-black">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge status={order.status} />
                <span className="text-sm text-black/40">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-black/40">Total Amount</p>
              <p className="text-2xl font-bold text-black">${order.totalPrice?.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-bold text-black mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.orderItems?.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-xl bg-white overflow-hidden shrink-0">
                      {item.product?.images?.[0]?.url ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/64x64/f0f0f0/999999?text=${item.product?.name?.charAt(0) || 'P'}`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black/20 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.product?._id}`}>
                        <h4 className="font-medium text-black hover:text-black/70 transition-colors">
                          {item.product?.name || 'Product'}
                        </h4>
                      </Link>
                      <p className="text-sm text-black/40">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-black mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-black/40">Price</p>
                      <p className="text-sm font-medium text-black">${item.price?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
                <h3 className="text-lg font-bold text-black mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Subtotal</span>
                    <span className="font-medium text-black">${order.totalPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Shipping</span>
                    <span className="font-medium text-black">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-black">Total</span>
                      <span className="font-bold text-black">${order.totalPrice?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-black/40">
                    <CreditCard className="w-4 h-4" />
                    <span>Payment: Cash on Delivery</span>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-black mb-3">Order Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                      <div>
                        <p className="text-sm font-medium text-black">Order Placed</p>
                        <p className="text-xs text-black/40">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {order.status === 'Confirmed' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                        <div>
                          <p className="text-sm font-medium text-black">Order Confirmed</p>
                          <p className="text-xs text-black/40">Processing your order</p>
                        </div>
                      </div>
                    )}
                    {order.status === 'Shipped' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                        <div>
                          <p className="text-sm font-medium text-black">Shipped</p>
                          <p className="text-xs text-black/40">On its way to you</p>
                        </div>
                      </div>
                    )}
                    {order.status === 'Delivered' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                        <div>
                          <p className="text-sm font-medium text-black">Delivered</p>
                          <p className="text-xs text-black/40">Successfully delivered</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                {order.user && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-black mb-2">Customer</h4>
                    <p className="text-sm text-black">{order.user.name || 'Customer'}</p>
                    <p className="text-sm text-black/40">{order.user.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default OrderDetailPage;