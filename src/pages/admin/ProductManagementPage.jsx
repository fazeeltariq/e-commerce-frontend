import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, categoryApi } from '../../api';
import { Link } from 'react-router-dom';

import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X,
  Image as ImageIcon,
  Package,
  Loader2,
  Check,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductManagementPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    brand: '',
    category: '',
    images: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products', searchQuery],
    queryFn: async () => {
      const params = { limit: 50, sort: '-createdAt' };
      if (searchQuery) params.search = searchQuery;
      const response = await productApi.getProducts(params);
      return response.data;
    },
  });

  // ✅ FETCH CATEGORIES - FIXED
  const { 
    data: categories = [], 
    isLoading: categoriesLoading, 
    error: categoriesError, 
    refetch: refetchCategories 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        console.log('🔄 Fetching categories...');
        const response = await categoryApi.getCategories();
        console.log('📂 Categories API Response:', response);
        console.log('📂 Categories Data:', response.data);
        
        // Backend returns array directly
        if (Array.isArray(response.data)) {
          console.log('✅ Categories loaded:', response.data.length);
          return response.data;
        }
        
        // Handle wrapped responses
        if (response.data?.categories && Array.isArray(response.data.categories)) {
          return response.data.categories;
        }
        
        if (response.data?.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        
        console.warn('⚠️ Unexpected categories format:', response.data);
        return [];
      } catch (error) {
        console.error('❌ Failed to fetch categories:', error);
        console.error('Error details:', error.response?.status, error.response?.data);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  // Debug logging
  useEffect(() => {
    console.log('📂 Categories state:', categories);
    console.log('📂 Categories is array:', Array.isArray(categories));
    console.log('📂 Categories length:', categories?.length);
  }, [categories]);

  if (categoriesError) {
    console.error('❌ Categories query error:', categoriesError);
  }

  // ❌ REMOVED: const categories = Array.isArray(categoriesData) ? categoriesData : [];
  // ✅ categories is already defined from useQuery above

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (productId) => {
      await productApi.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      setDeleteConfirm(null);
    },
    onError: (error) => {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    },
  });

  // Create/Update product mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price);
      formData.append('stock', data.stock);
      formData.append('brand', data.brand);
      formData.append('category', data.category);
      
      data.images.forEach((file) => {
        formData.append('images', file);
      });

      if (editingProduct) {
        const response = await productApi.updateProduct(editingProduct._id, formData);
        return response.data;
      } else {
        const response = await productApi.createProduct(formData);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      closeModal();
    },
    onError: (error) => {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please check your inputs and try again.');
      setIsSubmitting(false);
    },
  });

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        brand: product.brand || '',
        category: product.category?._id || product.category || '',
        images: [],
      });
      setImagePreviews(product.images?.map(img => img.url) || []);
      setImageFiles([]);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        brand: '',
        category: '',
        images: [],
      });
      setImagePreviews([]);
      setImageFiles([]);
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      brand: '',
      category: '',
      images: [],
    });
    setImageFiles([]);
    setImagePreviews([]);
    setFormErrors({});
    setIsSubmitting(false);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalImages = imageFiles.length + files.length;
    if (totalImages > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setImageFiles([...imageFiles, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.price || formData.price <= 0) errors.price = 'Price must be greater than 0';
    if (!formData.stock || formData.stock < 0) errors.stock = 'Stock cannot be negative';
    if (!formData.brand.trim()) errors.brand = 'Brand is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!editingProduct && imageFiles.length === 0) errors.images = 'At least one image is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      await saveMutation.mutateAsync({
        ...formData,
        images: imageFiles,
      });
    } catch (error) {
      // Error handled in mutation
    }
  };

  const products = productsData?.products || [];

  // Product card component
  const ProductCard = ({ product }) => {
    const imageUrl = product.images?.[0]?.url || null;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
        <div className="aspect-square bg-gray-50 relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/300x300/f0f0f0/999999?text=${product.name.charAt(0)}`;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-black/20">
              <Package className="w-12 h-12" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-black text-sm line-clamp-1">{product.name}</h3>
          <p className="text-sm text-black/60 mt-0.5">${product.price}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              product.stock > 10 ? 'bg-green-50 text-green-600' :
              product.stock > 0 ? 'bg-yellow-50 text-yellow-600' :
              'bg-red-50 text-red-600'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => openModal(product)}
              className="flex-1 px-3 py-1.5 bg-black text-white rounded-lg text-xs font-medium hover:bg-black/80 transition-colors flex items-center justify-center gap-1"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => setDeleteConfirm(product._id)}
              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom pt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-black/40">Loading products...</p>
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
              <h1 className="text-3xl font-bold text-black">Products</h1>
              <p className="text-black/40 mt-1">Manage your product catalog</p>
            </div>
            <button
              onClick={() => openModal()}
              className="mt-4 sm:mt-0 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-black/20 mx-auto mb-4" />
              <p className="text-black/40">No products found</p>
              <button
                onClick={() => openModal()}
                className="mt-4 px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors"
              >
                Add Your First Product
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-black/40 hover:text-black transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${
                      formErrors.name ? 'border-red-500' : 'border-gray-200'
                    } rounded-xl focus:outline-none focus:border-black transition-colors`}
                    placeholder="Enter product name"
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1.5">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${
                      formErrors.description ? 'border-red-500' : 'border-gray-200'
                    } rounded-xl focus:outline-none focus:border-black transition-colors resize-none`}
                    placeholder="Enter product description"
                  />
                  {formErrors.description && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>
                  )}
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1.5">
                      Price * ($)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      min="0.01"
                      step="0.01"
                      className={`w-full px-4 py-2.5 bg-gray-50 border ${
                        formErrors.price ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl focus:outline-none focus:border-black transition-colors`}
                      placeholder="0.00"
                    />
                    {formErrors.price && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.price}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1.5">
                      Stock *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      min="0"
                      step="1"
                      className={`w-full px-4 py-2.5 bg-gray-50 border ${
                        formErrors.stock ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl focus:outline-none focus:border-black transition-colors`}
                      placeholder="0"
                    />
                    {formErrors.stock && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.stock}</p>
                    )}
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1.5">
                    Brand *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${
                      formErrors.brand ? 'border-red-500' : 'border-gray-200'
                    } rounded-xl focus:outline-none focus:border-black transition-colors`}
                    placeholder="Enter brand name"
                  />
                  {formErrors.brand && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.brand}</p>
                  )}
                </div>

                {/* Category - FIXED */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-black">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => refetchCategories()}
                      className="text-xs text-black/40 hover:text-black transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Refresh
                    </button>
                  </div>
                  
                  {categoriesLoading ? (
                    <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-black/40 text-sm">
                      Loading categories...
                    </div>
                  ) : categories.length > 0 ? (
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-gray-50 border ${
                        formErrors.category ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl focus:outline-none focus:border-black transition-colors`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-black/40 text-sm">
                        No categories available
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          No categories found.
                        </p>
                        <Link 
                          to="/admin/categories" 
                          className="text-sm text-black underline hover:text-black/70 transition-colors"
                        >
                          Create one here
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {formErrors.category && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.category}</p>
                  )}
                  
                  {/* Debug info */}
                  <div className="mt-2 p-2 bg-gray-100 rounded-lg text-xs text-black/40">
                    Debug: {categories.length} categories loaded
                    {categories.length > 0 && ` (${categories.map(c => c.name).join(', ')})`}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1.5">
                    Images {!editingProduct && '*'}
                  </label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {imagePreviews.length < 5 && (
                      <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-black transition-colors">
                        <ImageIcon className="w-6 h-6 text-black/30" />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-black/40">Max 5 images. Upload product images.</p>
                  {formErrors.images && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.images}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingProduct ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-black">Delete Product</h3>
                <p className="text-black/60 mt-2">
                  Are you sure you want to delete this product? This action cannot be undone.
                </p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(deleteConfirm)}
                    disabled={deleteMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductManagementPage;