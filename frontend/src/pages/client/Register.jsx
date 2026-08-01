import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';
import SEOHead from '../../components/seo/SEOHead';

const Register = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
    if (e.target.name === 'password' && errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Client-side validations
    const newErrors = {};
    if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password });
      toast.success('Registration successful! Verification code sent to your email.');
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      const errMsg = err.message || 'Registration failed.';
      const serverErrors = {};
      
      if (errMsg.toLowerCase().includes('email')) {
        serverErrors.email = errMsg;
      } else if (errMsg.toLowerCase().includes('password')) {
        serverErrors.password = errMsg;
      } else if (errMsg.toLowerCase().includes('phone')) {
        serverErrors.phone = errMsg;
      } else if (errMsg.toLowerCase().includes('first name') || errMsg.toLowerCase().includes('firstname')) {
        serverErrors.firstName = errMsg;
      } else if (errMsg.toLowerCase().includes('last name') || errMsg.toLowerCase().includes('lastname')) {
        serverErrors.lastName = errMsg;
      } else {
        serverErrors.general = errMsg;
      }
      
      setErrors(serverErrors);
      if (serverErrors.general) {
        toast.error(serverErrors.general);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Create Account" description="Create your PeelKraft account to shop organic products." canonicalUrl="/register" />
      <section className="min-h-screen flex items-center justify-center bg-cream-50 py-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-10">
            <div className="text-center mb-8">
              <Link to="/"><img src="/images/logo.png" alt="PeelKraft" className="h-12 mx-auto mb-4" /></Link>
              <h1 className="text-2xl font-poppins font-bold text-dark">Create Account</h1>
              <p className="text-gray-500 font-inter text-sm mt-1">Join PeelKraft for healthy organic products</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-inter">
                  {errors.general}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">First Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition font-inter text-sm ${
                        errors.firstName
                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                      }`}
                      placeholder="John"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1 font-inter">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">Last Name</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition font-inter text-sm ${
                      errors.lastName
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1 font-inter">{errors.lastName}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition font-inter text-sm ${
                      errors.email
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 font-inter">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition font-inter text-sm ${
                      errors.phone
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                    }`}
                    placeholder="+91 9876543210"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 font-inter">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border outline-none transition font-inter text-sm ${
                      errors.password
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 font-inter">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none transition font-inter text-sm ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                  }`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 font-inter">{errors.confirmPassword}</p>
                )}
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/20 font-poppins disabled:opacity-50 mt-2">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6 font-inter">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-600 font-semibold">Sign In</Link>
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Register;
