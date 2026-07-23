import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const products = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    brand: 'Apple',
    price: 2499,
    oldPrice: 2799,
    rating: 4.9,
    reviews: 342,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
    isNew: false,
    isBestSeller: true
  },
  {
    id: 2,
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    price: 399,
    oldPrice: null,
    rating: 4.8,
    reviews: 215,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80',
    isNew: true,
    isBestSeller: false
  },
  {
    id: 3,
    name: 'Dyson V15 Detect',
    brand: 'Dyson',
    price: 799,
    oldPrice: 899,
    rating: 4.7,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80',
    isNew: false,
    isBestSeller: true
  },
  {
    id: 4,
    name: 'Samsung Galaxy S24',
    brand: 'Samsung',
    price: 1199,
    oldPrice: null,
    rating: 4.6,
    reviews: 456,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80',
    isNew: true,
    isBestSeller: false
  }
];

const ProductsSection = () => {
  const [wishlist, setWishlist] = useState([]);

  return (
    <section className="py-20 bg-primary-50/30">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <span className="text-xs font-medium text-accent uppercase tracking-wider">Best Sellers</span>
            <h2 className="section-title mt-2">Most Loved Products</h2>
          </div>
          <Link to="/products" className="flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors group">
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <Link to={`/products/${product.id}`}>
                <div className="relative aspect-square overflow-hidden bg-primary-50">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isBestSeller && (
                      <span className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">Best Seller</span>
                    )}
                    {product.isNew && (
                      <span className="px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">New</span>
                    )}
                    {product.oldPrice && (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                        -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setWishlist(prev => 
                        prev.includes(product.id) ? prev.filter(i => i !== product.id) : [...prev, product.id]
                      );
                    }}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Heart className={`w-4 h-4 transition-colors ${
                      wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-primary'
                    }`} />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <button className="w-full py-3 bg-white rounded-xl text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors">
                      Quick View
                    </button>
                  </div>
                </div>
              </Link>

              <div className="p-5">
                <p className="text-xs text-text-muted">{product.brand}</p>
                <h3 className="font-semibold text-primary text-sm mt-1 line-clamp-1">
                  <Link to={`/products/${product.id}`} className="hover:text-accent transition-colors">
                    {product.name}
                  </Link>
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-sm font-medium ml-1">{product.rating}</span>
                  </div>
                  <span className="text-xs text-text-muted">({product.reviews})</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-lg font-bold text-primary">${product.price.toLocaleString()}</span>
                  {product.oldPrice && (
                    <span className="text-sm text-text-muted line-through">${product.oldPrice.toLocaleString()}</span>
                  )}
                </div>
                <button className="w-full mt-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-800 transition-colors flex items-center justify-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;