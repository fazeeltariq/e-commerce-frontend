import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  href,
  onClick,
  ...props 
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    gold: 'btn-accent',
  };

  const buttonClass = `${variants[variant]} ${className}`;

  const content = (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={buttonClass}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );

  if (href) {
    return <a href={href} className={buttonClass}>{children}</a>;
  }

  return content;
};

export default Button;