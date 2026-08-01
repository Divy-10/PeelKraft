import { useState, useEffect } from 'react';
import { useCookies } from '../../context/CookieContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const CookieSettingsModal = () => {
  const { showSettings, setShowSettings, consent, saveCustomSettings } = useCookies();
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    if (consent) {
      setPreferences({
        essential: true,
        analytics: !!consent.analytics,
        marketing: !!consent.marketing,
        preferences: !!consent.preferences
      });
    }
  }, [consent, showSettings]);

  if (!showSettings) return null;

  const handleToggle = (key) => {
    if (key === 'essential') return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    saveCustomSettings(preferences);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-dark/50 backdrop-blur-sm font-inter">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
            <h2 id="cookie-modal-title" className="text-xl font-poppins font-bold text-dark">
              Cookie Preferences
            </h2>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-dark hover:bg-gray-50 transition-colors"
              aria-label="Close settings modal"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body List */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <p className="text-gray-500 text-sm leading-relaxed">
              We use cookies to enhance your experience. Manage your preferences below. Necessary cookies are vital for basic site mechanics.
            </p>

            <div className="space-y-4">
              {/* Essential */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                <div className="flex-1">
                  <h3 className="font-poppins font-bold text-dark text-sm">Essential Cookies</h3>
                  <p className="text-gray-400 text-xs mt-1">Required for basic site mechanics, login authentication, shopping cart persistence, and security features.</p>
                </div>
                <div className="flex items-center shrink-0">
                  <span className="text-xs text-gray-400 font-semibold uppercase mr-3">Always Active</span>
                  <input type="checkbox" disabled checked className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500 cursor-not-allowed" />
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex-1">
                  <h3 className="font-poppins font-bold text-dark text-sm">Analytics Cookies</h3>
                  <p className="text-gray-400 text-xs mt-1">Allows us to monitor total visitors, check loading performance, analyze page usage patterns, and optimize user experience metrics.</p>
                </div>
                <div className="flex items-center shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handleToggle('analytics')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex-1">
                  <h3 className="font-poppins font-bold text-dark text-sm">Marketing Cookies</h3>
                  <p className="text-gray-400 text-xs mt-1">Used to personalize ad campaigns, coordinate social sharing integrations, and monitor overall campaign performance.</p>
                </div>
                <div className="flex items-center shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => handleToggle('marketing')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>

              {/* Preferences */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex-1">
                  <h3 className="font-poppins font-bold text-dark text-sm">Preference Cookies</h3>
                  <p className="text-gray-400 text-xs mt-1">Enable us to remember site customizations (such as selected language, visual layout states, or region details).</p>
                </div>
                <div className="flex items-center shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={() => handleToggle('preferences')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={() => setShowSettings(false)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-dark text-sm font-semibold font-poppins transition-all bg-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold font-poppins transition-all shadow-md shadow-primary-500/10"
            >
              Save Selections
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CookieSettingsModal;
