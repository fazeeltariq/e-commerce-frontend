import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../../api';
import Footer from '../../components/common/Layout/Footer';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X,
  FolderOpen,
  Loader2,
  Check,
  AlertCircle,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryManagementPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch categories - FIXED: Handle non-array response
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await categoryApi.getCategories();
        // Ensure we return an array
        if (Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
      }
    },
  });

  // Ensure categories is always an array
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // Filter categories by search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: async (name) => {
      const response = await categoryApi.createCategory({ name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      closeModal();
    },
    onError: (error) => {
      console.error('Failed to create category:', error);
      setFormError(error.response?.data?.message || 'Failed to create category');
      setIsSubmitting(false);
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, name }) => {
      const response = await categoryApi.updateCategory(id, { name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      closeModal();
    },
    onError: (error) => {
      console.error('Failed to update category:', error);
      setFormError(error.response?.data?.message || 'Failed to update category');
      setIsSubmitting(false);
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await categoryApi.deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setDeleteConfirm(null);
    },
    onError: (error) => {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category. Please try again.');
    },
  });

  // Open modal for create/edit
  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName('');
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setCategoryName('');
    setFormError('');
    setIsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      setFormError('Category name is required');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory._id,
          name: categoryName.trim(),
        });
      } else {
        await createMutation.mutateAsync(categoryName.trim());
      }
    } catch (error) {
      // Error handled in mutation
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom pt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-black/40">Loading categories...</p>
            </div>
          </div>
        </div>
        <Footer />
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
              <h1 className="text-3xl font-bold text-black">Categories</h1>
              <p className="text-black/40 mt-1">Manage your product categories</p>
            </div>
            <button
              onClick={() => openModal()}
              className="mt-4 sm:mt-0 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Categories Grid */}
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                        <FolderOpen className="w-6 h-6 text-black/30" />
                      </div>
                      <h3 className="font-semibold text-black truncate">{category.name}</h3>
                      <p className="text-xs text-black/40 mt-1">
                        ID: {category._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openModal(category)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-black/40" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(category._id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600 transition-colors" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <FolderOpen className="w-16 h-16 text-black/20 mx-auto mb-4" />
              <p className="text-black/40">
                {searchQuery ? 'No categories match your search' : 'No categories found'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => openModal()}
                  className="mt-4 px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors"
                >
                  Add Your First Category
                </button>
              )}
            </div>
          )}

          {/* Category Count */}
          {filteredCategories.length > 0 && (
            <div className="mt-6 text-sm text-black/40">
              Showing {filteredCategories.length} of {categories.length} categories
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
              className="bg-white rounded-2xl max-w-md w-full"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-black/40 hover:text-black transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                    placeholder="Enter category name"
                    autoFocus
                  />
                  {formError && (
                    <p className="text-sm text-red-600 mt-1">{formError}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {editingCategory ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {editingCategory ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
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
                <h3 className="text-xl font-bold text-black">Delete Category</h3>
                <p className="text-black/60 mt-2">
                  Are you sure you want to delete this category? 
                  Products in this category will not be deleted.
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

      <Footer />
    </div>
  );
};

export default CategoryManagementPage;