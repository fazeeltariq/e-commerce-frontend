import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    else if (name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    else if (name.trim().length > 50) newErrors.name = 'Name must be less than 50 characters';
    
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email address';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (password.length > 100) newErrors.password = 'Password must be less than 100 characters';
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    
    try {
      await register(name.trim(), email.trim(), password);
      setSuccessMessage('Account created successfully!');
      
      // ✅ Wait a moment before redirecting to ensure cookie is set
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 800);
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || 'Something went wrong. Please try again.';
      
      if (status === 400) {
        if (message.toLowerCase().includes('email')) {
          setErrors({ email: 'This email is already registered. Please login instead.' });
        } else {
          setServerError(message);
        }
      } else if (status === 409) {
        setErrors({ email: 'This email is already registered. Please login instead.' });
      } else {
        setServerError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const validationErrors = validate();
    setErrors(validationErrors);
  };

  // Password strength
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) score++;
    if (pass.match(/[0-9]/)) score++;
    if (pass.match(/[^a-zA-Z0-9]/)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /[0-9]/.test(password) },
    { label: 'Contains uppercase & lowercase', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'Contains a special character', met: /[^a-zA-Z0-9]/.test(password) },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center pt-20 pb-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-black">Create account</h1>
            <p className="text-black/40 text-sm mt-1">Join ByteBuy today</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5">
            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2.5"
                >
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-600">{successMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Server Error Alert */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600">{serverError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: '' });
                      if (serverError) setServerError('');
                    }}
                    onBlur={() => handleBlur('name')}
                    className={`w-full pl-12 pr-4 py-3 bg-[#F5F5F5] border ${
                      errors.name && touched.name ? 'border-red-500' : 'border-transparent'
                    } rounded-xl focus:outline-none focus:border-black transition-all duration-200 text-sm`}
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>
                {errors.name && touched.name && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </motion.p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                      if (serverError) setServerError('');
                    }}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-12 pr-4 py-3 bg-[#F5F5F5] border ${
                      errors.email && touched.email ? 'border-red-500' : 'border-transparent'
                    } rounded-xl focus:outline-none focus:border-black transition-all duration-200 text-sm`}
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
                {errors.email && touched.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                      if (serverError) setServerError('');
                    }}
                    onBlur={() => handleBlur('password')}
                    className={`w-full pl-12 pr-12 py-3 bg-[#F5F5F5] border ${
                      errors.password && touched.password ? 'border-red-500' : 'border-transparent'
                    } rounded-xl focus:outline-none focus:border-black transition-all duration-200 text-sm`}
                    placeholder="Min 8 characters"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/25 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </motion.p>
                )}

                {/* Password Strength */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            index < strength ? strengthColors[strength - 1] : 'bg-black/10'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-black/40">
                        Strength: <span className="font-medium">{strengthLabels[strength - 1] || 'None'}</span>
                      </span>
                      <span className="text-black/30">{password.length}/100</span>
                    </div>
                    
                    {/* Password Requirements */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-1.5 text-[11px]">
                          {req.met ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-red-400" />
                          )}
                          <span className={req.met ? 'text-green-600' : 'text-black/40'}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-black text-white rounded-xl font-medium hover:bg-black/85 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-black/30 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-black font-medium hover:text-black/70 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;