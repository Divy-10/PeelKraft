import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCopy, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { usePopup } from '../../context/PopupContext';

const sizeClasses = {
  small: 'w-full max-w-[95%] lg:max-w-[900px]',
  medium: 'w-full max-w-[95%] lg:max-w-[920px]',
  large: 'w-full max-w-[95%] lg:max-w-[950px]',
  xl: 'w-full max-w-[95%] lg:max-w-[980px]',
};

const positionClasses = {
  center: 'fixed inset-0 flex items-center justify-center z-[9999] p-4 overflow-y-auto',
  top: 'fixed inset-x-0 top-0 flex items-start justify-center z-[9999] p-4 overflow-y-auto',
  bottom: 'fixed inset-x-0 bottom-0 flex items-end justify-center z-[9999] p-4 overflow-y-auto',
  left: 'fixed inset-y-0 left-0 flex items-center justify-start z-[9999] p-4 overflow-y-auto',
  right: 'fixed inset-y-0 right-0 flex items-center justify-end z-[9999] p-4 overflow-y-auto',
};

const animationConfigs = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  },
  slideDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },
  bounce: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: 'spring', stiffness: 300, damping: 22 },
    exit: { opacity: 0, scale: 0.9 },
  },
  rotate: {
    initial: { opacity: 0, rotate: -3, scale: 0.98 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 3, scale: 0.98 },
  },
};

const PopupModal = ({ isPreview = false, previewData = null }) => {
  const popupContext = usePopup();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // Determine if we're rendering active popup or a preview
  const data = isPreview ? previewData : popupContext?.activePopup;
  const isCurrentlyOpen = isPreview ? true : popupContext?.isOpen;
  const closePopup = isPreview ? () => {} : popupContext?.closePopup;
  const trackClick = isPreview ? () => {} : popupContext?.trackClick;
  const trackCopy = isPreview ? () => {} : popupContext?.trackCopy;

  // Lock body scroll when popup is open
  useEffect(() => {
    if (isCurrentlyOpen && data?.popupPosition === 'center') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCurrentlyOpen, data?.popupPosition]);

  // ESC key listener for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCurrentlyOpen) {
        closePopup();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCurrentlyOpen, closePopup]);

  // Countdown timer logic
  useEffect(() => {
    if (!data?.countdownEnabled || !data?.endDate) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(data.endDate) - new Date();
      if (difference <= 0) {
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (!updated) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.countdownEnabled, data?.endDate]);

  if (!data || !isCurrentlyOpen) return null;

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!data.couponCode) return;
    
    navigator.clipboard.writeText(data.couponCode);
    setCopied(true);
    trackCopy();
    toast.success(`Coupon code ${data.couponCode} copied to clipboard!`, {
      position: 'top-center',
      autoClose: 2000,
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const handleCtaClick = (e) => {
    trackClick();
    if (isPreview) return;

    const action = data.buttonAction;
    const url = data.buttonUrl;

    if (action === 'close_popup') {
      closePopup();
    } else if (action === 'copy_coupon') {
      handleCopy(e);
    } else if (url) {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        navigate(url);
        closePopup();
      }
    } else {
      closePopup();
    }
  };

  const currentSize = data.popupSize || 'medium';
  const currentPosition = data.popupPosition || 'center';
  const currentAnimation = data.animation || 'zoom';

  const modalAnimation = animationConfigs[currentAnimation] || animationConfigs.zoom;

  // Custom colors styling object
  const customStyles = {
    backgroundColor: data.backgroundColor || '#ffffff',
    color: data.textColor || '#1f2937',
  };

  // Helper to dynamically highlight 'Offer' or the last word in Peelkraft Orange
  const renderTitle = (titleText) => {
    if (!titleText) return '';
    const regex = /(Offer)/gi;
    if (regex.test(titleText)) {
      return titleText.replace(regex, '<span class="text-[#f97316]">$1</span>');
    }
    const words = titleText.split(' ');
    if (words.length > 1) {
      const lastWord = words.pop();
      return `${words.join(' ')} <span class="text-[#f97316]">${lastWord}</span>`;
    }
    return titleText;
  };

  return (
    <AnimatePresence>
      <div 
        className={positionClasses[currentPosition]} 
        style={{ pointerEvents: currentPosition === 'center' ? 'auto' : 'none' }}
      >
        {/* Backdrop for center position only */}
        {currentPosition === 'center' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
            style={{ pointerEvents: 'auto' }}
          />
        )}

        {/* Modal body */}
        <motion.div
          {...modalAnimation}
          role="dialog"
          aria-modal="true"
          aria-label="Promotional offer dialog"
          transition={{ duration: 0.3 }}
          className={`${sizeClasses[currentSize]} overflow-hidden rounded-[32px] shadow-2xl relative flex flex-col sm:flex-row border-0 border-none pointer-events-auto my-auto max-h-[90vh]`}
          style={{ ...customStyles }}
        >
          {/* Close button */}
          <button
            onClick={closePopup}
            aria-label="Close promotion dialog"
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 hover:rotate-90 hover:scale-105 active:scale-95 shadow-md border border-gray-100 transition-all duration-300"
          >
            <FiX className="w-5 h-5 text-gray-700" />
          </button>

          {/* Left panel: Image Banner (40% on tablet, 45% on desktop) */}
          <div className="w-full sm:w-[40%] lg:w-[45%] relative h-[250px] sm:h-auto min-h-[250px] sm:min-h-full bg-white flex items-stretch overflow-hidden border-0 border-none box-border">
            <picture className="w-full h-full flex items-stretch border-0 border-none box-border">
              {data.mobileImage && <source media="(max-width: 767px)" srcSet={data.mobileImage} />}
              <img
                src={data.desktopImage}
                alt={data.title}
                className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 hover:scale-105 border-0 border-none box-border"
                loading="lazy"
              />
            </picture>
          </div>

          {/* Right panel: Content (60% on tablet, 55% on desktop) */}
          <div className="w-full sm:w-[60%] lg:w-[55%] p-6 sm:p-10 flex flex-col justify-center items-stretch sm:items-start text-center sm:text-left gap-5 sm:gap-6 relative">
            {/* Offer Badge */}
            {data.offerType && (
              <span 
                className="inline-block self-center sm:self-start px-4 py-1.5 font-poppins font-bold text-[10px] sm:text-xs uppercase tracking-widest bg-[#FFF3E8] text-[#f97316] rounded-full border border-[#FFF3E8]/50"
              >
                {data.offerType}
              </span>
            )}

            {/* Title */}
            <h2 
              className="font-poppins font-black text-2xl sm:text-[34px] lg:text-[44px] leading-[1.1] text-dark text-center sm:text-left"
              dangerouslySetInnerHTML={{ __html: renderTitle(data.title) }}
            />

            {/* Description */}
            {data.shortDescription && (
              <p className="font-inter text-sm sm:text-base text-[#555] leading-[1.6] text-center sm:text-left">
                {data.shortDescription}
              </p>
            )}

            {/* Countdown timer */}
            {timeLeft && (
              <div className="p-6 rounded-[20px] bg-gray-50 border border-gray-100 w-full">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100/50 flex flex-col items-center justify-center transition-all hover:-translate-y-1 hover:shadow-md cursor-default">
                    <span className="font-poppins font-extrabold text-[28px] md:text-[34px] text-dark leading-none mb-1">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">Days</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100/50 flex flex-col items-center justify-center transition-all hover:-translate-y-1 hover:shadow-md cursor-default">
                    <span className="font-poppins font-extrabold text-[28px] md:text-[34px] text-dark leading-none mb-1">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">Hours</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100/50 flex flex-col items-center justify-center transition-all hover:-translate-y-1 hover:shadow-md cursor-default">
                    <span className="font-poppins font-extrabold text-[28px] md:text-[34px] text-dark leading-none mb-1">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">Minutes</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100/50 flex flex-col items-center justify-center transition-all hover:-translate-y-1 hover:shadow-md cursor-default">
                    <span className="font-poppins font-extrabold text-[28px] md:text-[34px] text-[#f97316] leading-none mb-1">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">Seconds</span>
                  </div>
                </div>
              </div>
            )}

            {/* Coupon Code copy section */}
            {data.couponCode && (
              <div 
                onClick={handleCopy}
                className="h-[70px] flex items-center justify-between border-2 border-dashed border-[#f97316]/30 hover:border-[#f97316]/60 px-5 rounded-2xl cursor-pointer bg-[#f97316]/5 hover:bg-[#f97316]/10 transition-all select-none w-full group"
              >
                <span className="font-poppins font-black text-xl md:text-2xl tracking-wider text-dark">
                  {data.couponCode}
                </span>
                <button className="flex items-center gap-1.5 text-xs font-bold text-[#f97316] transition-colors">
                  {copied ? (
                    <>
                      <FiCheck className="w-4 h-4 text-emerald-500 animate-bounce" />
                      <span className="text-emerald-500 font-poppins">✓ Copied!</span>
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-4 h-4 text-gray-500 group-hover:text-[#f97316]" />
                      <span className="text-gray-500 group-hover:text-[#f97316] font-poppins">Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={handleCtaClick}
              className="w-full h-[60px] flex items-center justify-center bg-[#f97316] hover:bg-[#ea580c] text-white font-poppins font-bold text-base md:text-lg rounded-2xl shadow-lg shadow-[#f97316]/20 hover:shadow-xl hover:shadow-[#f97316]/30 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              {data.buttonText || 'Shop Now'} &rarr;
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PopupModal;
