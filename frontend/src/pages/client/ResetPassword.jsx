import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { userAuthApi } from '../../api';
import SEOHead from '../../components/seo/SEOHead';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract reset token from query parameter
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!token) {
      toast.error('Invalid or missing password reset token.');
      return;
    }

    if (password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters.' });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      const res = await userAuthApi.resetPassword({ token, password });
      toast.success(res.message || 'Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      const errMsg = err.message || 'Failed to reset password.';
      setErrors({ general: errMsg });
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Reset Password" description="Create a new password for your PeelKraft account." canonicalUrl="/reset-password" />
      <section className="min-h-screen flex items-center justify-center bg-cream-50 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-10">
            <div className="text-center mb-8">
              <Link to="/">
                <img src="/images/logo.png" alt="PeelKraft" className="h-12 mx-auto mb-4" />
              </Link>
              <h1 className="text-2xl font-poppins font-bold text-dark">Reset Password</h1>
              <p className="text-gray-500 font-inter text-sm mt-1">Enter your new secure password below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-inter">
                  {errors.general}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 font-inter">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    required
                    className={`w-full pl-11 pr-11 py-3 rounded-xl border outline-none transition font-inter text-sm ${
                      errors.password
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5 font-inter">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 font-inter">Confirm New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                    }}
                    required
                    className={`w-full pl-11 pr-11 py-3 rounded-xl border outline-none transition font-inter text-sm ${
                      errors.confirmPassword
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1.5 font-inter">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary-500 text-white font-poppins font-bold text-sm tracking-wide rounded-xl shadow-lg hover:shadow-xl hover:bg-primary-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Resetting password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default ResetPassword;
