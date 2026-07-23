import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Check, 
  Eye, 
  EyeOff,
  UserCircle,
  Sparkles,
  Package,
  Heart,
  ShoppingBag,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  
  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Load user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      // Silent error - no toast
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      setIsEditing(false);
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!currentPassword) errors.currentPassword = 'Current password is required';
    if (!newPassword) errors.newPassword = 'New password is required';
    if (newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    setPasswordErrors({});
    setPasswordLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
    } catch (error) {
      // Error handled in context
    } finally {
      setPasswordLoading(false);
    }
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

  const strength = getPasswordStrength(newPassword);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-24 pb-16">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black">My Profile</h1>
            <p className="text-black/40 mt-1">Manage your account settings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-black/5 mx-auto flex items-center justify-center border-2 border-black/10">
                    <UserCircle className="w-12 h-12 text-black/40" />
                  </div>
                  <h2 className="text-lg font-bold text-black mt-4">{user?.name || 'User'}</h2>
                  <p className="text-sm text-black/40">{user?.email}</p>
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      user?.role === 'admin' ? 'bg-black text-white' : 'bg-gray-100 text-black/60'
                    }`}>
                      {user?.role === 'admin' ? 'Administrator' : 'Customer'}
                    </span>
                  </div>
                </div>
                
                {/* Navigation Links */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                  <Link 
                    to="/orders" 
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm text-black/60 hover:text-black"
                  >
                    <Package className="w-4 h-4" />
                    My Orders
                  </Link>
                  <Link 
                    to="/wishlist" 
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm text-black/60 hover:text-black"
                  >
                    <Heart className="w-4 h-4" />
                    Wishlist
                  </Link>
                  <Link 
                    to="/cart" 
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm text-black/60 hover:text-black"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Cart
                  </Link>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content - Bytee as before */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-black">Profile Information</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setName(user?.name || '');
                        setEmail(user?.email || '');
                      }}
                      className="px-4 py-2 bg-gray-100 text-black rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 py-3 border-b border-gray-50">
                      <User className="w-5 h-5 text-black/30" />
                      <div>
                        <p className="text-xs text-black/40">Full Name</p>
                        <p className="font-medium text-black">{user?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 py-3">
                      <Mail className="w-5 h-5 text-black/30" />
                      <div>
                        <p className="text-xs text-black/40">Email Address</p>
                        <p className="font-medium text-black">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Save Changes
                        </span>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>

              {/* Change Password */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-black">Password</h3>
                  {!showChangePassword ? (
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors"
                    >
                      Change Password
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowChangePassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordErrors({});
                      }}
                      className="px-4 py-2 bg-gray-100 text-black rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {showChangePassword ? (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1.5">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={`w-full px-4 pr-12 py-3 bg-gray-50 border ${
                            passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-200'
                          } rounded-xl focus:outline-none focus:border-black transition-colors`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-red-600 mt-1">{passwordErrors.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`w-full px-4 pr-12 py-3 bg-gray-50 border ${
                            passwordErrors.newPassword ? 'border-red-500' : 'border-gray-200'
                          } rounded-xl focus:outline-none focus:border-black transition-colors`}
                          placeholder="Min 8 characters"
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-red-600 mt-1">{passwordErrors.newPassword}</p>
                      )}
                      
                      {newPassword && (
                        <div className="mt-3 space-y-2">
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map((index) => (
                              <div
                                key={index}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                  index < strength ? strengthColors[strength - 1] : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-black/40">
                              Strength: <span className="font-medium">{strengthLabels[strength - 1] || 'None'}</span>
                            </span>
                            <div className="flex items-center gap-3 text-black/30">
                              <span className={`flex items-center gap-1 ${newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                                {newPassword.length >= 8 ? <Check className="w-3 h-3" /> : <Check className="w-3 h-3 opacity-30" />}
                                Min 8 chars
                              </span>
                              <span className={`flex items-center gap-1 ${newPassword.match(/[A-Z]/) && newPassword.match(/[a-z]/) ? 'text-green-600' : ''}`}>
                                {newPassword.match(/[A-Z]/) && newPassword.match(/[a-z]/) ? <Check className="w-3 h-3" /> : <Check className="w-3 h-3 opacity-30" />}
                                Mixed case
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full px-4 pr-12 py-3 bg-gray-50 border ${
                            passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                          } rounded-xl focus:outline-none focus:border-black transition-colors`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-red-600 mt-1">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {passwordLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Updating...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Update Password
                        </span>
                      )}
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-black/40">
                    Change your password to keep your account secure.
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

     
    </div>
  );
};

export default ProfilePage;