import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi, categoryApi } from '../api';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  ArrowRight, 
  Package,
  Shield,
  Truck,
  Headphones,
  RefreshCw,
  Award,
  Clock
} from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';

const BANNER_IMAGE = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1920&q=80';

const features = [
  { icon: Shield, title: 'Authenticity Guaranteed', description: 'Every product is verified and sourced directly from authorized partners.' },
  { icon: Truck, title: 'Free Next-Day Delivery', description: 'Complimentary express shipping on all orders, no minimum purchase.' },
  { icon: Clock, title: '2-Year Warranty', description: 'Every device comes with a comprehensive 2-year warranty for peace of mind.' },
  { icon: Headphones, title: '24/7 Expert Support', description: 'Our team of specialists is available around the clock to assist you.' },
  { icon: RefreshCw, title: '30-Day Returns', description: 'Not satisfied? Return within 30 days for a full refund, no questions asked.' },
  { icon: Award, title: 'Curated Selection', description: 'We hand-pick every product to ensure it meets our premium standards.' },
];

const testimonials = [
  {
    id: 1,
    name: 'Daniel R.',
    role: 'Verified Buyer',
    quote: 'The packaging alone felt like unboxing a piece of art. Everything about ByteBuy is considered.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    rating: 5,
  },
  {
    id: 2,
    name: 'Amara K.',
    role: 'Verified Buyer',
    quote: 'Delivery was faster than promised and support answered within minutes. This is how tech retail should feel.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    rating: 5,
  },
  {
    id: 3,
    name: 'Priya S.',
    role: 'Verified Buyer',
    quote: "I've bought three devices now. Every single one arrived flawless. ByteBuy earned my full trust.",
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    rating: 5,
  },
];

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Fetch products - limit to 9 for 3 rows of 3
  const { data: products, isLoading } = useQuery({
    queryKey: ['home-products'],
    queryFn: async () => {
      try {
        const response = await productApi.getProducts({ limit: 9, sort: '-createdAt' });
        return response.data?.products || [];
      } catch (err) {
        console.error('❌ Failed to fetch products:', err);
        return [];
      }
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['home-categories'],
    queryFn: async () => {
      try {
        const response = await categoryApi.getCategories();
        return response.data || [];
      } catch (err) {
        return [];
      }
    },
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });

  const handleWishlist = (productId) => {
    if (!isAuthenticated) return;
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const getImageUrl = (product) => {
    if (!product?.images || product.images.length === 0) return null;
    const image = product.images[0];
    if (image?.url && image.url.trim() !== '') return image.url;
    return null;
  };

  // Product Card Component - NO Add to Cart Button
  const ProductCard = ({ product, index }) => {
    const imageUrl = getImageUrl(product);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="group"
      >
        <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          {/* Image - Link to product detail */}
          <Link to={`/products/${product._id}`}>
            <div className="aspect-square bg-gray-50 overflow-hidden">
              {imageUrl ? (
                <img 
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x400/f0f0f0/999999?text=${product.name.charAt(0)}`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-black/20 text-sm">
                  No Image
                </div>
              )}
            </div>
          </Link>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlist(product._id);
            }}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm z-10"
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${
                isAuthenticated && isInWishlist(product._id) ? 'fill-black text-black' : 'text-black/40'
              }`}
            />
          </button>

          {/* Content - NO Add to Cart button */}
          <div className="p-4">
            <Link to={`/products/${product._id}`}>
              <h3 className="font-medium text-black text-sm line-clamp-1 hover:text-black/70 transition-colors">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-center justify-between mt-2">
              <span className="font-bold text-black">${product.price}</span>
              {product.averageRating > 0 && (
                <span className="text-xs text-black/40 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-black/40 text-black/40" />
                  {product.averageRating}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom pt-32">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-2xl" />
                <div className="h-4 bg-gray-200 rounded mt-3 w-3/4" />
                <div className="h-4 bg-gray-200 rounded mt-2 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <section className="relative w-full overflow-hidden pt-16">
        <div className="relative w-full h-[200px] sm:h-[280px] md:h-[320px] lg:h-[400px]">
          <img 
            src={BANNER_IMAGE}
            alt="ByteBuy Premium Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Premium Tech & Lifestyle
              </h2>
              <p className="mt-2 text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto">
                Discover curated electronics designed for the modern individual
              </p>
              <Link 
                to="/products" 
                className="inline-block mt-4 px-6 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Shop Now
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-4 border-b border-gray-100 bg-white">
          <div className="container-custom">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/categories/${category._id}`}
                  className="px-4 py-1.5 bg-gray-50 rounded-full text-xs sm:text-sm text-black/60 hover:bg-black hover:text-white transition-all duration-300"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products - 3 per row */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-medium text-black/40 uppercase tracking-wider">New Arrivals</span>
              <h2 className="text-2xl md:text-3xl font-bold text-black mt-1">Fresh Products</h2>
            </div>
            <Link to="/products" className="text-sm text-black/40 hover:text-black transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products?.slice(0, 9).map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50/50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-medium text-black/40 uppercase tracking-wider">Why ByteBuy</span>
            <h2 className="text-2xl md:text-3xl font-bold text-black mt-2">Designed for Discerning Customers</h2>
            <p className="text-black/40 mt-3 max-w-xl mx-auto">
              We believe in quality over quantity. Every product is curated, every experience is crafted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-black/60" />
                  </div>
                  <h3 className="font-semibold text-black text-base">{feature.title}</h3>
                  <p className="text-sm text-black/40 mt-2 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16 bg-black text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Limited Time Offer</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">Upgrade Your Tech</h2>
              <p className="text-white/60 mt-3 max-w-md">
                Get premium devices at exclusive prices. Limited stock available.
              </p>
              <Link 
                to="/products" 
                className="inline-block mt-6 px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors"
              >
                Shop Now
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
                <p className="text-6xl font-bold text-white/20">SALE</p>
                <p className="text-white/40 mt-2">Up to 40% off</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50/50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-medium text-black/40 uppercase tracking-wider">Testimonials</span>
            <h2 className="text-2xl md:text-3xl font-bold text-black mt-2">Loved by Discerning Customers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-black text-black" />
                  ))}
                </div>
                <p className="text-black text-base leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-black text-sm">{testimonial.name}</p>
                    <p className="text-xs text-black/40">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;