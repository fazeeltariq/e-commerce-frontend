import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../api';
import { 
  Search, 
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package,
  ArrowRight,
  ChevronDown,
  Eye,
  Loader2,
  Calendar,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const OrderManagementPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch all orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', searchQuery, statusFilter],
    queryFn: async () => {
      const response = await orderApi.getAllOrders();
      let data = response.data || [];
      
      if (statusFilter !== 'all') {
        data = data.filter(order => order.status === statusFilter);
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        data = data.filter(order => 
          order._id.toLowerCase().includes(query) ||
          order.user?.name?.toLowerCase().includes(query) ||
          order.user?.email?.toLowerCase().includes(query)
        );
      }
      
      return data;
    },
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const response = await orderApi.updateOrderStatus(orderId, status);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
    },
    onError: (error) => {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    },
  });

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Pending': { icon: Clock, color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-200' },
      'Confirmed': { icon: CheckCircle, color: 'bg-blue-50 text-blue-600', border: 'border-blue-200' },
      'Shipped': { icon: Truck, color: 'bg-purple-50 text-purple-600', border: 'border-purple-200' },
      'Delivered': { icon: CheckCircle, color: 'bg-green-50 text-green-600', border: 'border-green-200' },
      'Cancelled': { icon: XCircle, color: 'bg-red-50 text-red-600', border: 'border-red-200' },
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg} border ${config.border}`}>
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  // Status options
  const statusOptions = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  // Handle status update
  const handleStatusUpdate = (orderId, newStatus) => {
    if (window.confirm(`Change order status to "${newStatus}"?`)) {
      updateStatusMutation.mutate({ orderId, status: newStatus });
    }
  };

  // Open order detail - FIXED
  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  // Close order detail
  const closeOrderDetail = () => {
    setIsDetailOpen(false);
    setSelectedOrder(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom pt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-black/40">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-16">
        <div className="container-custom">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">Orders</h1>
              <p className="text-black/40 mt-1">Manage all customer orders</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-black/40 mt-4 sm:mt-0">
              <Package className="w-4 h-4" />
              <span>{orders?.length || 0} orders total</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID or customer..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Orders Table */}
          {orders && orders.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-black/40 uppercase tracking-wider">Order ID</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-black/40 uppercase tracking-wider">Customer</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-black/40 uppercase tracking-wider">Date</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-black/40 uppercase tracking-wider">Items</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-black/40 uppercase tracking-wider">Total</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-black/40 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-black/40 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order, index) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-black">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-black">{order.user?.name || 'Customer'}</p>
                            <p className="text-xs text-black/40">{order.user?.email || ''}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-black/60">
                            <Calendar className="w-3.5 h-3.5 text-black/30" />
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-black/60">
                            {order.orderItems?.length || 0} items
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-black">
                            ${order.totalPrice?.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleStatusUpdate(order._id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="appearance-none px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none focus:border-black pr-7"
                              >
                                <option value="">Update Status</option>
                                {statusOptions
                                  .filter(s => s !== order.status)
                                  .map(status => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/30 pointer-events-none" />
                            </div>
                            
                            <button
                              onClick={() => openOrderDetail(order)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-black/40" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Package className="w-16 h-16 text-black/20 mx-auto mb-4" />
              <p className="text-black/40">No orders found</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal - FIXED */}
      <AnimatePresence>
        {isDetailOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-black">
                    Order #{selectedOrder._id.slice(-8).toUpperCase()}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedOrder.status} />
                    <span className="text-xs text-black/40">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeOrderDetail}
                  className="text-black/40 hover:text-black transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-black mb-2">Customer Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-black/40">Name</p>
                      <p className="text-sm text-black">{selectedOrder.user?.name || 'Customer'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-black/40">Email</p>
                      <p className="text-sm text-black">{selectedOrder.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-sm font-medium text-black mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.orderItems?.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0">
                          {item.product?.images?.[0]?.url ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = `https://via.placeholder.com/48x48/f0f0f0/999999?text=${item.product?.name?.charAt(0) || 'P'}`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-black/20 text-xs">
                              No Img
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-black">{item.product?.name || 'Product'}</p>
                          <p className="text-xs text-black/40">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-black">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between">
                    <span className="text-black/60">Subtotal</span>
                    <span className="font-medium text-black">${selectedOrder.totalPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-black/60">Shipping</span>
                    <span className="font-medium text-black">Free</span>
                  </div>
                  <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                    <span className="font-bold text-black">Total</span>
                    <span className="font-bold text-black">${selectedOrder.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Status Update */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-black mb-2">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          if (status !== selectedOrder.status) {
                            handleStatusUpdate(selectedOrder._id, status);
                            closeOrderDetail();
                          }
                        }}
                        disabled={status === selectedOrder.status || updateStatusMutation.isPending}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          status === selectedOrder.status
                            ? 'bg-gray-100 text-black/40 cursor-not-allowed'
                            : 'bg-black text-white hover:bg-black/80'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManagementPage;