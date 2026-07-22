import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiTrash2, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import { wishlistApi } from '../../api';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';

const Wishlist = () => {
  const { token, isAuthenticated } = useUser();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchWishlist = async () => {
      try {
        const res = await wishlistApi.get();
        setItems(res.data || []);
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [token, navigate]);

  const handleRemove = async (productId) => {
    try {
      await wishlistApi.remove(productId);
      setItems(items.filter((item) => item.product._id !== productId));
      toast.success('Removed from wishlist.');
    } catch (err) {
      toast.error('Failed to remove item.');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <SEOHead title="My Wishlist" description="View products you saved for later." canonicalUrl="/wishlist" />
      <section className="pt-32 pb-8 bg-cream-50">
        <div className="container-custom">
          <Breadcrumbs items={[{ label: 'Wishlist' }]} />
          <h1 className="text-3xl font-poppins font-bold text-dark mt-4">My Wishlist</h1>
        </div>
      </section>

      <section className="py-8 bg-cream-50 min-h-[60vh]">
        <div className="container-custom">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 font-inter">Loading wishlist...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm max-w-lg mx-auto">
              <FiHeart className="w-16 h-16 text-gray-200 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-poppins font-bold text-dark mb-1">Your Wishlist is Empty</h3>
              <p className="text-gray-500 font-inter mb-6">Explore products and click the heart icon to save items.</p>
              <Link to="/products" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition text-sm font-poppins">
                <FiArrowLeft /> Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(({ product }) => {
                if (!product) return null;
                return (
                  <motion.div key={product._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col justify-between p-4 relative group">
                    <div>
                      <Link to={`/products/${product.slug}`} className="block aspect-[4/3] rounded-xl overflow-hidden bg-gray-50 mb-4">
                        <img src={product.thumbnail?.url || product.gallery?.[0]?.url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      </Link>
                      <Link to={`/products/${product.slug}`} className="font-poppins font-semibold text-dark hover:text-primary-500 transition-colors line-clamp-1 block text-base">{product.name}</Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base font-bold text-dark font-poppins">₹{product.sellingPrice}</span>
                        {product.mrp > product.sellingPrice && (
                          <span className="text-xs text-gray-400 line-through font-inter">₹{product.mrp}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                      <button onClick={() => handleAddToCart(product)} className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-semibold font-poppins transition shadow-md shadow-primary-500/10">
                        <FiShoppingBag /> Add to Cart
                      </button>
                      <button onClick={() => handleRemove(product._id)} className="p-2.5 border border-red-100 hover:bg-red-50 text-red-500 rounded-xl transition" title="Remove">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Wishlist;
