import { useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from '../common/WhatsAppButton';
import PopupModal from '../common/PopupModal';
import useScrollTop from '../../hooks/useScrollTop';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

const FrozenRoute = ({ children }) => {
  const context = useRef(children);
  return context.current;
};

const ClientLayout = () => {
  const location = useLocation();
  const element = useOutlet();
  useScrollTop();

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {element && (
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <FrozenRoute key={location.pathname}>
                {element}
              </FrozenRoute>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
      <WhatsAppButton />
      <PopupModal />
    </div>
  );
};

export default ClientLayout;
