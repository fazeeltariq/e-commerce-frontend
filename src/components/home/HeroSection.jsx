import { motion } from 'framer-motion';
import { 
  Search, 
  ArrowRight, 
  Star, 
  Shield, 
  Truck,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../api';

const quickCategories = [
  { name: 'Phones', icon: Smartphone, slug: 'phones' },
  { name: 'Laptops', icon: Laptop, slug: 'laptops' },
  { name: 'Audio', icon: Headphones, slug: 'audio' },
  { name: 'Watches', icon: Watch, slug: 'watches' },
];

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: productsData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productApi.getProducts({ limit: 4, sort: '-createdAt' }),
    select: (data) => data.data.products || [],
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${searchQuery}`;
    }
  };

  const trending = ['MacBook Pro', 'Sony Headphones', 'Dyson V15'];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-4rem)]">
          
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 text-black/60 text-sm font-medium w-fit mb-6"
            >
              <Sparkles className="w-4 h-4" />
              The 2025 Flagship Collection
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-[1.05] tracking-tight"
            >
              Technology
              <br />
              <span className="text-black/60">Refined to its Essence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-4 text-base sm:text-lg text-black/50 max-w-lg leading-relaxed"
            >
              Curated electronics, accessories, and gadgets — 
              designed for those who appreciate quality.
            </motion.p>

            {/* Search */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              onSubmit={handleSearch}
              className="mt-8"
            >
              <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl focus-within:border-black transition-all duration-300 shadow-sm hover:shadow-md">
                <Search className="absolute left-4 w-5 h-5 text-black/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for premium products..."
                  className="flex-1 px-12 py-4 bg-transparent outline-none text-black placeholder:text-black/30"
                />
                <button
                  type="submit"
                  className="mr-2 px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors flex items-center gap-2"
                >
                  Search
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>

            {/* Trending Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-4 flex flex-wrap items-center gap-2 text-sm"
            >
              <span className="text-black/40">⚡ Trending:</span>
              {trending.map((tag) => (
                <Link
                  key={tag}
                  to={`/products?search=${tag}`}
                  className="px-3 py-1 bg-black/5 rounded-full text-black/60 hover:bg-black/10 hover:text-black transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </motion.div>

            {/* Quick Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-6 flex flex-wrap gap-3"
            >
              {quickCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Link
                    key={category.name}
                    to={`/categories/${category.slug}`}
                    className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-xl hover:bg-black/10 transition-colors group"
                  >
                    <Icon className="w-4 h-4 text-black/40 group-hover:text-black transition-colors" />
                    <span className="text-sm font-medium text-black/60 group-hover:text-black transition-colors">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-8 flex flex-wrap gap-6 text-sm text-black/40"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secure Checkout
              </span>
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Free Delivery
              </span>
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                240k+ Trusted
              </span>
            </motion.div>
          </motion.div>

          {/* Right Side - Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-square w-full max-w-lg mx-auto">
              {/* Main Image */}
              <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80"
                  alt="Premium Tech Collection"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
              </div>

              {/* Floating Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 min-w-[160px]"
              >
                <p className="text-xs text-black/40 uppercase tracking-wider">Featured</p>
                <p className="font-bold text-black text-sm mt-1">MacBook Pro M4</p>
                <p className="text-black/60 text-sm">From $1,999</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-black/10" />
                    ))}
                  </div>
                  <span className="text-xs text-black/40">+12 bought today</span>
                </div>
              </motion.div>

              {/* Floating Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center">
                    <Star className="w-6 h-6 text-black/40" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">4.9</p>
                    <p className="text-xs text-black/40">Average Rating</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Featured Products - Below Hero */}
        {productsData && productsData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="py-8 border-t border-gray-100 mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-black uppercase tracking-wider">
                ⭐ Best Sellers
              </h3>
              <Link to="/products" className="text-sm text-black/40 hover:text-black transition-colors flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {productsData.slice(0, 4).map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center mb-3 overflow-hidden">
                    {product.images?.[0]?.url ? (
                      <img 
                        src={product.images[0].url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50" />
                    )}
                  </div>
                  <h4 className="font-medium text-black text-sm line-clamp-1">{product.name}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-black">${product.price}</span>
                    {product.averageRating > 0 && (
                      <span className="text-xs text-black/40">★ {product.averageRating}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;