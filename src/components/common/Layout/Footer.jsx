import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white/60">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <span className="text-lg font-bold text-white">ByteBuy</span>
            <p className="text-sm mt-2">Premium tech shopping, redefined.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Categories</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-medium mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>fazeeeltaariq@gmail.com</li>
              <li>03121836544</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ByteBuy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;