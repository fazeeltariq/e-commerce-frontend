import { motion } from 'framer-motion';

const SectionHeader = ({ title, subtitle, align = 'center' }) => {
  const alignClasses = {
    center: 'text-center items-center',
    left: 'text-left items-start',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`flex flex-col ${alignClasses[align]} mb-12`}
    >
      <h2 className="section-title text-primary">{title}</h2>
      {subtitle && (
        <p className="section-subtitle mt-4">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default SectionHeader;