import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiClock, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';
import { userAuthApi } from '../../api';
import SEOHead from '../../components/seo/SEOHead';

const VerifyEmail = () => {
  const { verifyEmail } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract email from query parameter
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errors, setErrors] = useState({});

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (otp.length !== 6 || isNaN(otp)) {
      setErrors({ otp: 'Please enter a valid 6-digit verification code.' });
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(email, otp);
      toast.success('Account verified successfully! Welcome to PeelKraft.');
      navigate('/', { replace: true });
    } catch (err) {
      const errMsg = err.message || 'Verification failed.';
      setErrors({ general: errMsg });
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setResendLoading(true);
    try {
      const res = await userAuthApi.resendEmail({ email });
      toast.success(res.message || 'A new verification OTP has been sent to your email.');
      setCooldown(60); // 60 seconds cooldown
    } catch (err) {
      toast.error(err.message || 'Failed to resend verification code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Verify Email" description="Verify your email address to activate your account." canonicalUrl="/verify-email" />
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
              <h1 className="text-2xl font-poppins font-bold text-dark">Verify Your Email</h1>
              <p className="text-gray-500 font-inter text-sm mt-2">
                We sent a 6-digit verification code to <span className="font-semibold text-dark">{email}</span>.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-inter">
                  {errors.general}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter text-center">
                  Enter 6-Digit Code
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ''));
                      if (errors.otp) setErrors({});
                    }}
                    required
                    className={`w-full pl-11 pr-4 py-3.5 tracking-[0.25em] text-center text-lg font-bold rounded-xl border outline-none transition font-inter ${
                      errors.otp
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                    }`}
                    placeholder="000000"
                  />
                </div>
                {errors.otp && (
                  <p className="text-red-500 text-xs mt-1.5 font-inter text-center">{errors.otp}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary-500 text-white font-poppins font-bold text-sm tracking-wide rounded-xl shadow-lg hover:shadow-xl hover:bg-primary-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : 'Verify & Log In'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resendLoading}
                  className="inline-flex items-center gap-2 text-xs font-semibold font-inter text-primary-600 hover:text-primary-700 transition disabled:opacity-50"
                >
                  {resendLoading ? (
                    <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : cooldown > 0 ? (
                    <>
                      <FiClock className="w-3.5 h-3.5" />
                      Resend code in {cooldown}s
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="w-3.5 h-3.5" />
                      Resend Verification Code
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default VerifyEmail;
