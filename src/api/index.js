import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized! Please login again.');
    }
    return Promise.reject(error);
  }
);

// API Functions
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  login: (email, password) => api.post('/users/login', { email, password }),
  register: (name, email, password) => api.post('/users/register', { name, email, password }),
  logout: () => api.post('/users/logout'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
};



export const categoryApi = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};


export const cartApi = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  updateQuantity: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete('/cart'),
};

export const wishlistApi = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) => api.post('/wishlist', { productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
};

export const orderApi = {
  createOrder: () => api.post('/orders'),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  getAllOrders: () => api.get('/orders'), // Admin only
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Add this to your existing exports
export const adminApi = {
  getStats: () => api.get('/admin/dashboard/stats'),
};


export const productApi = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProduct: (id, data) => api.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

export default api;