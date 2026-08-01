import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { popupApi } from '../api';
import { useUser } from './UserContext';

const PopupContext = createContext(null);

export const usePopup = () => {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error('usePopup must be used within PopupProvider');
  return ctx;
};

export const PopupProvider = ({ children }) => {
  const [activePopup, setActivePopup] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useUser();

  // Function to get current device type
  const getDeviceType = () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width >= 768 && width < 1024) return 'tablet';
    return 'desktop';
  };

  // Helper to check frequency rule
  const checkFrequency = (popup) => {
    const popupId = popup._id;
    const frequency = popup.displayFrequency;
    const now = Date.now();

    const seenId = localStorage.getItem('pk_popup_id');
    const lastSeen = localStorage.getItem('pk_popup_last_seen');
    const seenCount = parseInt(localStorage.getItem('pk_popup_seen_count') || '0', 10);

    // If it's a completely new/different popup, reset local storage stats for popup display
    if (seenId !== popupId) {
      return true;
    }

    if (!lastSeen) return true;

    const lastSeenTime = parseInt(lastSeen, 10);
    const diffTime = now - lastSeenTime;
    const oneDay = 24 * 60 * 60 * 1000;

    switch (frequency) {
      case 'once':
        return false; // Already seen once
      case 'daily':
        return diffTime >= oneDay;
      case 'three-days':
        return diffTime >= 3 * oneDay;
      case 'weekly':
        return diffTime >= 7 * oneDay;
      case 'custom':
        const days = popup.customFrequencyDays || 1;
        return diffTime >= days * oneDay;
      case 'every-visit':
      default:
        // Every visit displays popup on page reload/refresh
        return true;
    }
  };

  // Helper to check audience rule
  const checkAudience = (popup) => {
    const audience = popup.targetAudience;
    const isLogged = !!user;

    const isFirstTime = !localStorage.getItem('pk_returning_visitor');
    if (!localStorage.getItem('pk_returning_visitor')) {
      localStorage.setItem('pk_returning_visitor', 'true');
    }

    if (audience === 'everyone') return true;
    if (audience === 'guests' && !isLogged) return true;
    if (audience === 'users' && isLogged) return true;
    if (audience === 'first-time' && isFirstTime) return true;
    if (audience === 'returning' && !isFirstTime) return true;

    return false;
  };

  // Helper to check device rule
  const checkDevice = (popup) => {
    const target = popup.deviceTarget;
    const currentDevice = getDeviceType();

    if (target === 'all') return true;
    return target === currentDevice;
  };

  // Helper to check page target rule
  const checkPage = (popup) => {
    const target = popup.pageTarget;
    const path = location.pathname;

    if (target === 'all') return true;
    if (target === 'home' && (path === '/' || path === '/home')) return true;
    if (target === 'category' && path.startsWith('/category')) return true;
    if (target === 'product' && path.startsWith('/product')) return true;
    if (target === 'cart' && path === '/cart') return true;
    if (target === 'checkout' && path === '/checkout') return true;
    if (target === 'custom') {
      const urls = popup.customPages || [];
      return urls.some((url) => {
        const regex = new RegExp(`^${url.replace(/\*/g, '.*')}$`, 'i');
        return regex.test(path);
      });
    }

    return false;
  };

  useEffect(() => {
    // We only trigger popups on non-admin routes
    if (location.pathname.startsWith('/admin')) {
      setIsOpen(false);
      return;
    }

    const evaluatePopup = async () => {
      try {
        const res = await popupApi.getActive();
        const popup = res.data;

        if (!popup) {
          setActivePopup(null);
          setIsOpen(false);
          return;
        }

        // Evaluate Display Logic Rules
        const frequencyPass = checkFrequency(popup);
        const audiencePass = checkAudience(popup);
        const devicePass = checkDevice(popup);
        const pagePass = checkPage(popup);

        if (frequencyPass && audiencePass && devicePass && pagePass) {
          setActivePopup(popup);

          // Apply configured display delay
          const delayMs = (popup.showAfter || 0) * 1000;
          const timer = setTimeout(() => {
            setIsOpen(true);
            // Increment views in database
            popupApi.incrementView(popup._id).catch(console.error);
          }, delayMs);

          return () => clearTimeout(timer);
        } else {
          setIsOpen(false);
        }
      } catch (err) {
        console.error('Failed to fetch active promotional popup:', err);
      }
    };

    evaluatePopup();
  }, [location.pathname, user]);

  const handleClose = async () => {
    if (!activePopup) return;
    try {
      setIsOpen(false);
      // Increment close count in database
      await popupApi.incrementClose(activePopup._id);
      
      // Save frequency metadata to local storage
      const count = parseInt(localStorage.getItem('pk_popup_seen_count') || '0', 10);
      localStorage.setItem('pk_popup_id', activePopup._id);
      localStorage.setItem('pk_popup_last_seen', Date.now().toString());
      localStorage.setItem('pk_popup_seen_count', (count + 1).toString());
      sessionStorage.setItem(`pk_popup_session_${activePopup._id}`, 'true');
    } catch (err) {
      console.error(err);
    }
  };

  const handleClick = async () => {
    if (!activePopup) return;
    try {
      await popupApi.incrementClick(activePopup._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = async () => {
    if (!activePopup) return;
    try {
      await popupApi.incrementCopy(activePopup._id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PopupContext.Provider
      value={{
        activePopup,
        isOpen,
        closePopup: handleClose,
        trackClick: handleClick,
        trackCopy: handleCopy,
        setIsOpen,
        setActivePopup,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};
