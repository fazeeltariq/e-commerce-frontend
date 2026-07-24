import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";

const CategoriesSection = () => {
  const { categories = [] } = useCategories();

  return (
    <section className="py-20 bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <span className="text-xs font-medium text-accent uppercase tracking-wider">
              Categories
            </span>

            <h2 className="section-title mt-2">
              Shop by Category
            </h2>
          </div>

          {/* Changed from /categories to /products */}
          <Link
            to="/products"
            className="flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
                className="group relative overflow-hidden rounded-2xl bg-gray-100 h-64"
              >
                {/* Placeholder Image */}
                <img
                  src={`https://placehold.co/600x400?text=${encodeURIComponent(
                    category.name
                  )}`}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-white text-xl font-bold">
                    {category.name}
                  </h3>
                </div>

                {/* Navigate to Products Page with Category Filter */}
                <Link
                  to={`/products?category=${category._id}`}
                  className="absolute inset-0"
                />
              </motion.div>
            ))
          ) : (
            <p className="text-center col-span-4 text-gray-500">
              No categories available.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;