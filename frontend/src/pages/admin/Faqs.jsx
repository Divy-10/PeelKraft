import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { faqApi } from '../../api';

const Faqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      question: '',
      answer: '',
      category: 'General',
      order: 0,
      status: 'active'
    }
  });

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await faqApi.getAll();
      setFaqs(res.data || []);
    } catch (err) {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleEditClick = (faq) => {
    setEditingId(faq._id);
    reset(faq);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset({
      question: '',
      answer: '',
      category: 'General',
      order: 0,
      status: 'active'
    });
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await faqApi.update(editingId, data);
        toast.success('FAQ updated successfully');
      } else {
        await faqApi.create(data);
        toast.success('FAQ created successfully');
      }
      handleCancelEdit();
      fetchFaqs();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await faqApi.delete(id);
      toast.success('FAQ deleted successfully');
      fetchFaqs();
    } catch (err) {
      toast.error(err.message || 'Failed to delete FAQ');
    }
  };

  const handleMove = async (index, direction) => {
    const updated = [...faqs];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    // Swap order values
    const tempOrder = updated[index].order;
    updated[index].order = updated[targetIdx].order;
    updated[targetIdx].order = tempOrder;

    // Reorder locally
    const items = [
      { id: updated[index]._id, order: updated[index].order },
      { id: updated[targetIdx]._id, order: updated[targetIdx].order }
    ];

    try {
      await faqApi.reorder(items);
      fetchFaqs();
    } catch (err) {
      toast.error('Failed to reorder items');
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* FAQ list */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-poppins font-bold text-dark text-lg">Frequently Asked Questions</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              No FAQs found. Create one now.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {faqs.map((faq, idx) => (
                <div key={faq._id} className="p-6 flex items-start justify-between hover:bg-gray-50/50 transition-colors gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary-500 font-poppins">{faq.category}</span>
                    <h4 className="font-poppins font-bold text-dark text-base">{faq.question}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed pt-1">{faq.answer}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col gap-1 border-r border-gray-100 pr-2">
                      <button
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-dark disabled:opacity-30"
                      >
                        <FiArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === faqs.length - 1}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-dark disabled:opacity-30"
                      >
                        <FiArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleEditClick(faq)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary-500 transition-colors"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card sticky top-28 space-y-6">
          <h3 className="font-poppins font-bold text-dark text-lg border-b border-gray-50 pb-3">
            {editingId ? 'Edit FAQ' : 'Create FAQ'}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Question *</label>
              <input
                type="text"
                {...register('question', { required: 'Question is required' })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm"
                placeholder="What is PeelKraft?"
              />
              {errors.question && <p className="text-red-500 text-xs mt-1">{errors.question.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Answer *</label>
              <textarea
                {...register('answer', { required: 'Answer is required' })}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm resize-none"
                placeholder="Enter answer detail..."
              />
              {errors.answer && <p className="text-red-500 text-xs mt-1">{errors.answer.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Category</label>
                <input
                  type="text"
                  {...register('category')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm"
                  placeholder="General"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 btn-primary py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
              >
                <FiSave /> {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Faqs;
