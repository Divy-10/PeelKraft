import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { blogApi } from '../../api';
import { getImageUrl, formatDateShort } from '../../utils';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await blogApi.getAll({
        page,
        limit: 10,
        search,
      });
      setBlogs(res.data || []);
      setPagination(res.pagination || null);
    } catch (err) {
      toast.error('Failed to load blog articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await blogApi.delete(id);
      toast.success('Article deleted successfully');
      fetchBlogs();
    } catch (err) {
      toast.error(err.message || 'Failed to delete article');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-card">
        <div className="relative flex-1 max-w-md w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search articles..."
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none transition-all font-inter text-sm"
          />
        </div>
        <Link
          to="/admin/blogs/new"
          className="btn-primary py-2.5 px-6 rounded-xl flex items-center gap-2 text-sm text-white"
        >
          <FiPlus className="w-5 h-5" /> Add Article
        </Link>
      </div>

      {/* Grid of articles */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-inter">
            No articles found. Add some new content to start!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase font-poppins">
                  <th className="px-6 py-4">Article</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Views</th>
                  <th className="px-6 py-4">Publish Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-inter text-sm text-gray-600">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50/55 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(blog.featuredImage)}
                          alt={blog.title}
                          className="w-14 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                        />
                        <div>
                          <span className="font-semibold text-dark block line-clamp-1">{blog.title}</span>
                          <span className="text-xs text-gray-400 block font-mono">{blog.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        blog.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-dark">{blog.views || 0}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDateShort(blog.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`/blogs/${blog.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-dark transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                        </a>
                        <Link
                          to={`/admin/blogs/edit/${blog._id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary-500 transition-colors"
                        >
                          <FiEdit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(blog._id)}
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

export default Blogs;
