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
    console.log('🍪 Cookie Manager: Initializing Analytics Scripts');
    
    // Create Tag Manager / GA script tags dynamically
    const script = document.createElement('script');
    script.id = 'google-analytics-script';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-MOCKID1234';
    
    const inlineScript = document.createElement('script');
    inlineScript.id = 'google-analytics-inline-script';
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-MOCKID1234');
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
    console.log('🍪 Cookie Manager: Initializing Marketing/Meta Pixel Scripts');

    const inlineScript = document.createElement('script');
    inlineScript.id = 'meta-pixel-script';
    inlineScript.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '123456789012345');
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
