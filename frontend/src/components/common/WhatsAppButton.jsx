import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { FiX, FiMessageCircle } from 'react-icons/fi';
import { useSettings } from '../../context/SettingsContext';

const WhatsAppButton = () => {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const isDragging = useRef(false);

  // Format phone number for WhatsApp wa.me link
  const rawPhone = settings?.whatsapp || settings?.phone || '+918511533004';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello PeelKraft! I am interested in your organic orange peel products.')}`;

  const handlePointerDown = () => {
    isDragging.current = false;
  };

  const handleDrag = () => {
    isDragging.current = true;
  };

  const handleClick = (e) => {
    if (isDragging.current) {
      e.preventDefault();
      return;
    }
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      onPointerDown={handlePointerDown}
      onDrag={handleDrag}
      className="fixed bottom-24 right-6 z-50 cursor-grab active:cursor-grabbing touch-none select-none"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <div className="relative group flex items-center gap-3">
        {/* Drag Hint & Chat Tooltip */}
        <div className="hidden sm:flex flex-col bg-white text-[#2D3A1E] px-3.5 py-2 rounded-2xl shadow-xl border border-emerald-100 text-xs font-semibold pointer-events-none group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Chat with PeelKraft
          </div>
          <span className="text-[10px] text-gray-400 font-normal">Drag to move button</span>
        </div>

        {/* WhatsApp Circular Drag Button */}
        <button
          onClick={handleClick}
          className="relative w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl flex items-center justify-center hover:bg-[#20ba5a] hover:scale-110 active:scale-95 transition-all duration-300 group focus:outline-none"
          aria-label="Contact PeelKraft on WhatsApp"
          title="Drag anywhere • Click to chat on WhatsApp"
        >
          {/* Animated Ripple Pulse */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />

          {/* Icon */}
          <FaWhatsapp className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
        </button>
      </div>
    </motion.div>
  );
};

export default WhatsAppButton;
