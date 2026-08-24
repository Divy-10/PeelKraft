import { createContext, useContext, useState, useEffect } from 'react';

const CookieContext = createContext(null);

export const useCookies = () => {
  const context = useContext(CookieContext);
  if (!context) {
    throw new Error('useCookies must be used within a CookieProvider');
  }
  return context;
};

const CONSENT_KEY = 'pk_cookie_consent';

export const CookieProvider = ({ children }) => {
  const [consent, setConsent] = useState(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [showSettings, setShowSettings] = useState(false);

  // Trigger scripts based on consent selection
  useEffect(() => {
    if (!consent) return;

    // Analytics Cookies
    if (consent.analytics) {
      loadAnalyticsScripts();
    } else {
      removeAnalyticsScripts();
    }

    // Marketing Cookies
    if (consent.marketing) {
      loadMarketingScripts();
    } else {
      removeMarketingScripts();
    }
  }, [consent]);

  const acceptAll = () => {
    const preferences = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
    setConsent(preferences);
  };

  const rejectNonEssential = () => {
    const preferences = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
    setConsent(preferences);
  };

  const saveCustomSettings = (customPrefs) => {
    const preferences = {
      essential: true,
      analytics: !!customPrefs.analytics,
      marketing: !!customPrefs.marketing,
      preferences: !!customPrefs.preferences,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
    setConsent(preferences);
    setShowSettings(false);
  };

  // Google Analytics loader implementation
  const loadAnalyticsScripts = () => {
    if (document.getElementById('google-analytics-script')) return;
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;

    // Provide fallback dummy gtag function
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
    }

    if (!gaId || gaId === 'G-MOCKID1234') {
      console.log('🍪 Cookie Manager: Analytics initialized (Mock mode)');
      return;
    }

    console.log('🍪 Cookie Manager: Initializing Analytics Scripts');
    const script = document.createElement('script');
    script.id = 'google-analytics-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.onerror = (err) => console.warn('Google Analytics script failed to load:', err);

    const inlineScript = document.createElement('script');
    inlineScript.id = 'google-analytics-inline-script';
    inlineScript.innerHTML = `
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;

    document.head.appendChild(script);
    document.head.appendChild(inlineScript);
  };

  const removeAnalyticsScripts = () => {
    const script = document.getElementById('google-analytics-script');
    const inlineScript = document.getElementById('google-analytics-inline-script');
    if (script) script.remove();
    if (inlineScript) inlineScript.remove();
  };

  // Meta Pixel / Marketing script loader
  const loadMarketingScripts = () => {
    if (document.getElementById('meta-pixel-script')) return;
    const pixelId = import.meta.env.VITE_META_PIXEL_ID;

    // Provide fallback dummy fbq function
    if (!window.fbq) {
      window.fbq = function () {
        if (window.fbq.callMethod) {
          window.fbq.callMethod.apply(window.fbq, arguments);
        } else {
          window.fbq.queue.push(arguments);
        }
      };
      window.fbq.queue = [];
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
    }

    if (!pixelId || pixelId === '123456789012345') {
      console.log('🍪 Cookie Manager: Marketing scripts initialized (Mock mode)');
      return;
    }

    console.log('🍪 Cookie Manager: Initializing Marketing/Meta Pixel Scripts');
    const inlineScript = document.createElement('script');
    inlineScript.id = 'meta-pixel-script';
    inlineScript.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;
      t.onerror=function(){ console.warn('Meta Pixel script failed to load:', v); };
      s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;

    document.head.appendChild(inlineScript);
  };

  const removeMarketingScripts = () => {
    const script = document.getElementById('meta-pixel-script');
    if (script) script.remove();
  };

  return (
    <CookieContext.Provider
      value={{
        consent,
        showSettings,
        setShowSettings,
        acceptAll,
        rejectNonEssential,
        saveCustomSettings
      }}
    >
      {children}
    </CookieContext.Provider>
  );
};
