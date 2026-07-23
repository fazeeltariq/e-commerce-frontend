import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Daniel R.',
    role: 'Verified Buyer',
    quote: 'The packaging alone felt like unboxing a piece of art. Everything about NovaCart is considered.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
  },
  {
    id: 2,
    name: 'Amara K.',
    role: 'Verified Buyer',
    quote: 'Delivery was faster than promised and support answered within minutes. This is how tech retail should feel.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
  },
  {
    id: 3,
    name: 'Priya S.',
    role: 'Verified Buyer',
    quote: "I've bought three devices now. Every single one arrived flawless. NovaCart earned my full trust.",
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-medium text-accent uppercase tracking-wider">Testimonials</span>
          <h2 className="section-title mt-2">Loved by Discerning Customers</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="bg-primary-50/30 rounded-2xl p-8"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-primary text-base leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-primary-100">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-primary text-sm">{testimonial.name}</p>
                  <p className="text-xs text-text-muted">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;