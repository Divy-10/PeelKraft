import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronRight, FiHome } from 'react-icons/fi';

const Breadcrumbs = ({ items }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: item.path ? `${import.meta.env.VITE_SITE_URL || ''}${item.path}` : undefined,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm font-inter text-gray-500 mb-6 flex-wrap"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="flex items-center gap-1 hover:text-primary-500 transition-colors">
          <FiHome className="w-4 h-4" />
          <span>Home</span>
        </Link>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            <FiChevronRight className="w-4 h-4 text-gray-300" />
            {item.path && i < items.length - 1 ? (
              <Link to={item.path} className="hover:text-primary-500 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-primary-500 font-medium">{item.label}</span>
            )}
          </span>
        ))}
      </motion.nav>
    </>
  );
};

export default Breadcrumbs;
