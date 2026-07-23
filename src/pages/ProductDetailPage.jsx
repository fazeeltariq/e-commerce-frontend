import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';

import { 
  ShoppingBag, 
  Heart, 
  Star, 
  Minus, 
  Plus, 
  ArrowLeft,
  Truck,
  Shield,
  Clock,
  User,
  MessageSquare,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productApi.getProduct(id);
      return response.data;
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async ({ productId, rating, comment }) => {
      const response = await productApi.addReview(productId, { rating, comment });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['product', id]);
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
      toast.success('Review added successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add review');
    },
  });

  const handleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart({ productId: id, quantity });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    setSubmittingReview(true);
    try {
      await submitReviewMutation.mutateAsync({
        productId: id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
    } catch (error) {
      // Error handled in mutation
    } finally {
      setSubmittingReview(false);
    }
  };

  const getImageUrl = () => {
    if (!product?.images || product.images.length === 0) return null;
    return product.images[0]?.url || null;
  };

  // Rating stars component
  // Rating stars component - YELLOW STARS
const RatingStars = ({ rating, onRatingChange, hoverRating, onHoverChange, size = 'large' }) => {
  const starSize = size === 'large' ? 'w-8 h-8' : 'w-5 h-5';
  const gap = size === 'large' ? 'gap-2' : 'gap-1';
  
  return (
    <div className={`flex ${gap}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => onHoverChange(star)}
          onMouseLeave={() => onHoverChange(0)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star 
            className={`${starSize} ${
              star <= (hoverRating || rating) 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } transition-colors duration-200`}
          />
        </button>
      ))}
    </div>
  );
};
  // Review card component
 // Review card component - YELLOW STARS
const ReviewCard = ({ review }) => {
  const getInitials = (name) => {
    return name?.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <div className="border-b border-gray-100 last:border-0 py-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center shrink-0">
          <span className="text-sm font-medium text-black/60">
            {getInitials(review.username)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-medium text-black text-sm">{review.username}</span>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3.5 h-3.5 ${
                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                  }`} 
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-black/60 mt-1.5">{review.comment}</p>
          <p className="text-xs text-black/30 mt-1.5">
            {new Date(review.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded w-1/3 animate-pulse" />
            </div>
          </div>
        </div>
     
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-black">Product Not Found</h2>
            <p className="text-black/40 mt-2">The product you're looking for doesn't exist.</p>
            <Link to="/products" className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors">
              Back to Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const imageUrl = getImageUrl();
  const hasReviewed = product.reviews?.some(r => r.user === user?._id);

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-24 pb-16">
        <div className="container-custom">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-black/40 hover:text-black transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="rounded-2xl overflow-hidden bg-gray-50">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover aspect-square"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center text-black/20">
                  No Image Available
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              {product.brand && (
                <p className="text-sm text-black/40 mb-2">{product.brand}</p>
              )}

              <h1 className="text-3xl font-bold text-black">{product.name}</h1>

              {/* Rating Summary */}
              {product.averageRating > 0 && (
  <div className="flex items-center gap-2 mt-1">
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-4 h-4 ${
            i < Math.round(product.averageRating) 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-200'
          }`} 
        />
      ))}
    </div>
    <span className="text-sm text-black/60">
      {product.averageRating} out of 5
    </span>
  </div>
)}
              {/* Price */}
              <div className="mt-4">
                <span className="text-3xl font-bold text-black">${product.price}</span>
                {product.oldPrice && (
                  <span className="ml-3 text-lg text-black/40 line-through">${product.oldPrice}</span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mt-2">
                {product.stock > 0 ? (
                  <span className="text-sm text-green-600">In Stock ({product.stock} available)</span>
                ) : (
                  <span className="text-sm text-red-600">Out of Stock</span>
                )}
              </div>

              {/* Description */}
              <p className="mt-4 text-black/60 leading-relaxed">{product.description}</p>

              {/* Quantity Selector */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-black mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock > 0 && quantity >= product.stock}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || addingToCart}
                  className="flex-1 py-3.5 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addingToCart ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleWishlist}
                  className={`px-6 py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border ${
                    isInWishlist(id)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(id) ? 'fill-white' : ''}`} />
                  {isInWishlist(id) ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
              </div>

              {/* Features / Trust Badges */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Truck className="w-5 h-5 text-black/40 mx-auto" />
                    <p className="text-xs text-black/40 mt-1">Free Delivery</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-5 h-5 text-black/40 mx-auto" />
                    <p className="text-xs text-black/40 mt-1">Secure Checkout</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-5 h-5 text-black/40 mx-auto" />
                    <p className="text-xs text-black/40 mt-1">2-Year Warranty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================
              REVIEWS SECTION
              ============================================ */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-black">
                  Reviews
                  {product.numReviews > 0 && (
                    <span className="text-lg font-normal text-black/40 ml-2">
                      ({product.numReviews})
                    </span>
                  )}
                </h2>
                {product.averageRating > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < Math.round(product.averageRating) 
                              ? 'fill-black text-black' 
                              : 'text-gray-200'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-black/60">
                      {product.averageRating} out of 5
                    </span>
                  </div>
                )}
              </div>

              {isAuthenticated && !hasReviewed && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Write a Review
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-2xl p-6 mb-8"
              >
                <h3 className="text-lg font-bold text-black mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Rating
                    </label>
                    <RatingStars 
                      rating={reviewRating}
                      hoverRating={hoverRating}
                      onRatingChange={setReviewRating}
                      onHoverChange={setHoverRating}
                      size="large"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Comment
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
                      placeholder="Share your experience with this product..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {submittingReview ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Review
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Already Reviewed Message */}
            {isAuthenticated && hasReviewed && (
              <div className="bg-gray-50 rounded-2xl p-4 text-center mb-8">
                <p className="text-sm text-black/60">You have already reviewed this product.</p>
              </div>
            )}

            {/* Reviews List */}
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-1">
                {product.reviews.map((review, index) => (
                  <ReviewCard key={index} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-black/40">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>

   
    </div>
  );
};

export default ProductDetailPage;