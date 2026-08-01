import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { userAuthApi } from '../../api';
import SEOHead from '../../components/seo/SEOHead';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await userAuthApi.forgotPassword({ email });
      setSent(true);
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Forgot Password" description="Request a password reset link for your account." canonicalUrl="/forgot-password" />
      <section className="min-h-screen flex items-center justify-center bg-cream-50 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
            <div className="text-center mb-8">
              <Link to="/">
                <img src="/images/logo.png" alt="PeelKraft" className="h-12 mx-auto mb-4" />
              </Link>
              <h1 className="text-2xl font-poppins font-bold text-dark">Forgot Password</h1>
              <p className="text-gray-500 font-inter text-sm mt-1">
                Enter your email address to receive a password reset link.
              </p>
            </div>

            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 font-inter">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      required
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none transition font-inter text-sm ${
                        error
                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {error && (
                    <p className="text-red-500 text-xs mt-1.5 font-inter">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/20 font-poppins disabled:opacity-50"
                >
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4 font-inter text-sm text-gray-600">
                <p>We've sent a password reset link to <strong>{email}</strong> if it is registered with us.</p>
                <p>Please check your inbox (and spam folder) for instructions.</p>
              </div>
            )}

            <div className="text-center mt-6">
              <Link to="/login" className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold font-inter text-sm transition">
                <FiArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default ForgotPassword;
