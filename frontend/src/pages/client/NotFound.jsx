import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEOHead from '../../components/seo/SEOHead';

const NotFound = () => (
  <>
    <SEOHead title="404 — Page Not Found" noIndex />
    <section className="min-h-screen flex items-center justify-center gradient-hero">
      <div className="container-custom text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-[150px] md:text-[200px] font-poppins font-bold gradient-text leading-none mb-4"
          >
            404
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-dark mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
            The page you're looking for seems to have gone on a citrus adventure. Let's get you back on track!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/" className="btn-primary">
              Go Home
            </Link>
            <Link to="/products" className="btn-outline">
              Browse Products
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  </>
);

export default NotFound;
