import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit, FiPercent, FiTag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { couponApi } from '../../api';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percentage', discountValue: '',
    minPurchase: '', maxDiscount: '', usageLimit: '', expiryDate: '', isActive: true
  });

  const fetchCoupons = async () => {
    try {
      const res = await couponApi.getAll();
      setCoupons(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase || '',
      maxDiscount: coupon.maxDiscount || '',
      usageLimit: coupon.usageLimit || '',
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '',
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this coupon?')) {
      try {
        await couponApi.delete(id);
        toast.success('Coupon deleted.');
        fetchCoupons();
      } catch (err) {
        toast.error('Failed to delete coupon.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        discountValue: Number(form.discountValue),
        minPurchase: form.minPurchase ? Number(form.minPurchase) : 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : 0,
      };

      if (editingId) {
        await couponApi.update(editingId, data);
        toast.success('Coupon updated.');
      } else {
        await couponApi.create(data);
        toast.success('Coupon created successfully!');
      }

      setShowForm(false);
      setEditingId(null);
      setForm({
        code: '', description: '', discountType: 'percentage', discountValue: '',
        minPurchase: '', maxDiscount: '', usageLimit: '', expiryDate: '', isActive: true
      });
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon.');
    }
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-inter outline-none focus:border-primary-500';

  return (
    <div className="space-y-6 font-inter">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-poppins font-bold text-dark">Coupon Management</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md shadow-primary-500/10 transition font-poppins text-xs"
          >
            <FiPlus /> Create Coupon
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm max-w-2xl">
          <h2 className="text-lg font-poppins font-bold text-dark mb-4">
            {editingId ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Coupon Code *</label>
                <input name="code" value={form.code} onChange={handleChange} required className={inputCls} placeholder="e.g. SAVE20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Discount Type *</label>
                <select name="discountType" value={form.discountType} onChange={handleChange} className={inputCls}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Discount Value *</label>
                <input name="discountValue" type="number" value={form.discountValue} onChange={handleChange} required className={inputCls} placeholder="e.g. 10" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Min Purchase (₹)</label>
                <input name="minPurchase" type="number" value={form.minPurchase} onChange={handleChange} className={inputCls} placeholder="e.g. 499" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Max Discount Cap (₹)</label>
                <input name="maxDiscount" type="number" value={form.maxDiscount} onChange={handleChange} className={inputCls} placeholder="e.g. 200 (0 for no cap)" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Expiry Date *</label>
                <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Usage Limit (Total)</label>
                <input name="usageLimit" type="number" value={form.usageLimit} onChange={handleChange} className={inputCls} placeholder="e.g. 100 (0 for unlimited)" />
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="rounded border-gray-300 text-primary-500" />
                  <span className="text-sm font-semibold text-gray-500">Is Coupon Active</span>
                </label>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                <input name="description" value={form.description} onChange={handleChange} className={inputCls} placeholder="Brief description of the offer" />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg text-xs">Save</button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-5 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupon List Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No coupons created.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Min Purchase</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-semibold text-dark font-poppins">
                      <FiTag className="text-primary-500" /> {coupon.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {coupon.discountType === 'percentage' ? (
                      <span className="flex items-center gap-0.5"><FiPercent className="w-3.5 h-3.5 text-gray-400" />{coupon.discountValue}%</span>
                    ) : (
                      <span>₹{coupon.discountValue}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">₹{coupon.minPurchase || 0}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      coupon.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button onClick={() => handleEdit(coupon)} className="p-1 text-primary-500 hover:bg-primary-50 rounded" title="Edit"><FiEdit /></button>
                    <button onClick={() => handleDelete(coupon._id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Delete"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Coupons;
