import { motion } from 'framer-motion';
import { Shield, Truck, Clock, Award, Headphones, RefreshCw } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Authenticity Guaranteed', description: 'Every product is verified and sourced directly from authorized partners.' },
  { icon: Truck, title: 'Free Next-Day Delivery', description: 'Complimentary express shipping on all orders, no minimum purchase.' },
  { icon: Clock, title: '2-Year Warranty', description: 'Every device comes with a comprehensive 2-year warranty for peace of mind.' },
  { icon: Headphones, title: '24/7 Expert Support', description: 'Our team of specialists is available around the clock to assist you.' },
  { icon: RefreshCw, title: '30-Day Returns', description: 'Not satisfied? Return within 30 days for a full refund, no questions asked.' },
  { icon: Award, title: 'Curated Selection', description: 'We hand-pick every product to ensure it meets our premium standards.' }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-primary-50/10">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-xs font-medium text-accent uppercase tracking-wider">Why NovaCart</span>
          <h2 className="section-title mt-2">Designed for Discerning Customers</h2>
        </motion.div>

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
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-primary text-base">{feature.title}</h3>
                <p className="text-sm text-text-secondary mt-2">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;