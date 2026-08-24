import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiHome, FiMail } from 'react-icons/fi';
import { newsletterApi } from '../../api';
import SEOHead from '../../components/seo/SEOHead';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  const [inputEmail, setInputEmail] = useState(emailParam);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const handleUnsubscribe = async (targetEmail, targetToken) => {
    const emailToUse = (targetEmail || inputEmail).trim();
    if (!emailToUse) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const res = await newsletterApi.unsubscribe({
        email: emailToUse,
        token: targetToken || tokenParam,
      });
      setStatus('success');
      setMessage(res.message || 'You have been successfully unsubscribed from PeelKraft marketing emails.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Failed to unsubscribe. Please try again.');
    }
  };

  useEffect(() => {
    if (emailParam) {
      handleUnsubscribe(emailParam, tokenParam);
    }
  }, [emailParam, tokenParam]);

  return (
    <>
      <SEOHead title="Unsubscribe — PeelKraft" description="Unsubscribe from PeelKraft newsletter and marketing emails." />

      <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 bg-cream-50/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 md:p-10 shadow-card border border-cream-200/50 text-center"
        >
          {status === 'loading' ? (
            <div className="py-8">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-serif font-bold text-dark">Processing Unsubscribe Request...</h2>
              <p className="text-sm text-gray-500 font-sans mt-2">Please wait while we update your email preferences.</p>
            </div>
          ) : status === 'success' ? (
            <div className="py-4">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-dark mb-3">Successfully Unsubscribed</h1>
              <p className="text-sm text-gray-600 font-sans leading-relaxed mb-8">{message}</p>
              <p className="text-xs text-gray-400 font-sans mb-8">
                You will no longer receive newsletter updates or promotional emails from PeelKraft. If this was a mistake, you can re-subscribe anytime from our homepage.
              </p>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-dark text-white rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-primary-600 transition-colors w-full"
              >
                <FiHome className="w-4 h-4" /> Return to Homepage
              </Link>
            </div>
          ) : (
            <div className="py-4">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiMail className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-dark mb-3">Unsubscribe from Newsletter</h1>
              <p className="text-sm text-gray-500 font-sans mb-6">
                {message || 'Enter your email address below to unsubscribe from PeelKraft marketing emails.'}
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUnsubscribe(inputEmail, tokenParam);
                }}
                className="space-y-4 text-left"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 font-sans">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full px-5 py-3 rounded-xl border border-cream-200 focus:outline-none focus:border-primary-500 text-xs font-sans bg-white transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-dark text-white rounded-full text-xs font-semibold font-sans tracking-widest uppercase hover:bg-primary-600 transition-colors"
                >
                  Unsubscribe Me
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-cream-100">
                <Link to="/" className="text-xs font-semibold text-gray-400 hover:text-dark transition-colors font-sans">
                  Cancel and return to home
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default Unsubscribe;
