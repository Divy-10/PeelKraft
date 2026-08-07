import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';
import SEOHead from '../../components/seo/SEOHead';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const errMsg = err.message || 'Login failed.';
      const newErrors = {};
      
      if (errMsg.toLowerCase().includes('email or password')) {
        newErrors.email = 'Invalid email or password.';
        newErrors.password = 'Invalid email or password.';
      } else if (errMsg.toLowerCase().includes('email') || errMsg.toLowerCase().includes('account with this email')) {
        newErrors.email = errMsg;
      } else if (errMsg.toLowerCase().includes('password')) {
        newErrors.password = errMsg;
      } else {
        newErrors.general = errMsg;
      }
      
      setErrors(newErrors);
      if (newErrors.general) {
        toast.error(newErrors.general);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Login" description="Login to your PeelKraft account." canonicalUrl="/login" />
      <section className="min-h-screen flex items-center justify-center bg-cream-50 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-premium border border-cream-200/60 p-6 sm:p-8 md:p-10">
            <div className="text-center mb-8">
              <Link to="/">
                <img src="/images/logo.png" alt="PeelKraft" className="h-10 mx-auto mb-4" />
              </Link>
              <h1 className="text-2xl font-serif text-dark">Welcome Back</h1>
              <p className="text-gray-400 font-sans text-xs tracking-wide mt-1.5">Login to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-650 rounded-xl text-xs font-sans">
                  {errors.general}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 font-sans">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition font-sans text-xs ${
                      errors.email
                        ? 'border-red-550 focus:border-red-550'
                        : 'border-cream-200 focus:border-primary-500 bg-white'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-550 text-[10px] mt-1.5 font-sans">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 font-sans">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    required
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border outline-none transition font-sans text-xs ${
                      errors.password
                        ? 'border-red-550 focus:border-red-550'
                        : 'border-cream-200 focus:border-primary-500 bg-white'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-550 text-[10px] mt-1.5 font-sans">{errors.password}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-sans tracking-wide">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-cream-200 text-primary-500 focus:ring-primary-500 w-3.5 h-3.5" />
                  <span className="text-gray-500">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-primary-500 hover:text-dark font-semibold transition-colors">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-dark hover:bg-green-800 text-white font-semibold rounded-full font-sans text-xs tracking-widest uppercase transition-all duration-300 shadow-premium disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6 font-sans tracking-wide">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-500 hover:text-dark font-bold transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Login;
