import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gold/10 to-transparent" />
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">Join the NovaCart Circle</h2>
          <p className="mt-4 text-white/60 text-lg">
            Be the first to know about exclusive drops, early access, and premium releases.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-6 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-accent transition-colors"
              required
            />
            <button type="submit" className="btn-accent py-3.5 px-8 whitespace-nowrap">
              Subscribe <ArrowRight className="w-4 h-4 inline" />
            </button>
          </form>
          <p className="mt-4 text-white/30 text-sm">No spam. Unsubscribe anytime.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;