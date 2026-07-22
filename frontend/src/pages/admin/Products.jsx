import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiExternalLink, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { productApi } from '../../api';
import { getImageUrl } from '../../utils';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getAll({
        page,
        limit: 10,
        search,
      });
      setProducts(res.data || []);
      setPagination(res.pagination || null);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.delete(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-card">
        <div className="relative flex-1 max-w-md w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none transition-all font-inter text-sm"
          />
        </div>
        <Link
          to="/admin/products/new"
          className="btn-primary py-2.5 px-6 rounded-xl flex items-center gap-2 text-sm text-white"
        >
          <FiPlus className="w-5 h-5" /> Add Product
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 font-inter">No products found. Start by creating one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase font-poppins">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Featured</th>
                  <th className="px-6 py-4 text-center">Views</th>
                  <th className="px-6 py-4 text-center">Amazon Clicks</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-inter text-sm text-gray-600">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/55 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(product.thumbnail)}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                        />
                        <div>
                          <span className="font-semibold text-dark block line-clamp-1">{product.name}</span>
                          <span className="text-xs text-gray-400 block font-mono">{product.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{product.category?.name || 'Uncategorized'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        product.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        product.featured ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'
                      }`}>
                        {product.featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-dark">{product.views}</td>
                    <td className="px-6 py-4 text-center font-semibold text-primary-500">{product.amazonClicks}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`/products/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-dark transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                        </a>
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary-500 transition-colors"
                        >
                          <FiEdit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Showing page {page} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-50 text-xs font-semibold"
              >
                Previous
              </button>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-50 text-xs font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
