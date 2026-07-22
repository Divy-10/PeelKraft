import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiMail, FiMessageSquare, FiSend, FiTrash2, FiClock, FiCheck } from 'react-icons/fi';
import { contactApi } from '../../api';
import { formatDateShort } from '../../utils';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeContact, setActiveContact] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await contactApi.getAll({ page, limit: 10 });
      setContacts(res.data || []);
      setPagination(res.pagination || null);
    } catch (err) {
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page]);

  const selectContact = async (contact) => {
    try {
      const res = await contactApi.getById(contact._id);
      setActiveContact(res.data);
      // Mark as read in list
      setContacts(prev => prev.map(c => c._id === contact._id ? { ...c, status: 'read' } : c));
    } catch (err) {
      toast.error('Failed to load message details');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeContact) return;

    setSending(true);
    try {
      const res = await contactApi.reply(activeContact._id, { reply: replyText });
      toast.success('Reply sent successfully!');
      setReplyText('');
      // Reload contact details
      selectContact(activeContact);
      fetchContacts();
    } catch (err) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await contactApi.delete(id);
      toast.success('Message deleted successfully');
      setActiveContact(null);
      fetchContacts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete message');
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-8 h-[calc(100vh-12rem)]">
      {/* Inbox List */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-50 flex justify-between items-center shrink-0">
          <h3 className="font-poppins font-bold text-dark text-base">Inquiries Inbox</h3>
          <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded-full text-xs font-semibold">
            {contacts.filter(c => c.status === 'unread').length} Unread
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading && contacts.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-inter text-sm">
              Inbox is empty!
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact._id}
                onClick={() => selectContact(contact)}
                className={`w-full p-5 text-left transition-colors flex flex-col gap-1.5 ${
                  activeContact?._id === contact._id
                    ? 'bg-primary-50/40 border-l-4 border-primary-500'
                    : 'hover:bg-gray-50/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <h4 className={`font-poppins text-sm truncate max-w-[70%] ${
                    contact.status === 'unread' ? 'font-bold text-dark' : 'font-semibold text-gray-600'
                  }`}>
                    {contact.name}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-inter flex items-center gap-1 shrink-0">
                    <FiClock className="w-3 h-3" />
                    {formatDateShort(contact.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono truncate">{contact.subject}</p>
                <p className="text-sm text-gray-500 line-clamp-1 italic">"{contact.message}"</p>
                
                <div className="flex justify-between items-center pt-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    contact.status === 'unread'
                      ? 'bg-red-50 text-red-500'
                      : contact.status === 'replied'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {contact.status}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-50 flex justify-between items-center shrink-0">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 bg-gray-50 text-gray-600 rounded disabled:opacity-50 text-xs font-semibold"
            >
              Prev
            </button>
            <span className="text-xs text-gray-400">Page {page} of {pagination.pages}</span>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 bg-gray-50 text-gray-600 rounded disabled:opacity-50 text-xs font-semibold"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Message Detail View */}
      <div className="lg:col-span-3 bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden flex flex-col">
        {activeContact ? (
          <div className="flex flex-col h-full">
            {/* Header info */}
            <div className="p-6 border-b border-gray-50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-poppins font-bold text-dark text-lg leading-tight">{activeContact.subject}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  From: <span className="font-semibold text-gray-600">{activeContact.name}</span> ({activeContact.email})
                  {activeContact.phone && ` | Phone: ${activeContact.phone}`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(activeContact._id)}
                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-400 transition-colors"
                title="Delete Inquiry"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Message Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-cream-100/50 p-6 rounded-2xl border border-cream-200">
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider font-poppins mb-2">Customer Inquiry Message</p>
                <p className="text-gray-600 leading-relaxed font-inter text-sm whitespace-pre-line">
                  {activeContact.message}
                </p>
              </div>

              {activeContact.reply && (
                <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100 space-y-2">
                  <div className="flex justify-between items-center text-xs text-green-600 font-semibold uppercase tracking-wider font-poppins">
                    <span>Admin Reply</span>
                    {activeContact.repliedAt && (
                      <span className="font-inter text-gray-400 capitalize">{formatDateShort(activeContact.repliedAt)}</span>
                    )}
                  </div>
                  <p className="text-gray-600 leading-relaxed font-inter text-sm whitespace-pre-line">
                    {activeContact.reply}
                  </p>
                </div>
              )}
            </div>

            {/* Reply Input Form */}
            {activeContact.status !== 'replied' ? (
              <form onSubmit={handleReplySubmit} className="p-6 border-t border-gray-50 space-y-4 shrink-0 bg-gray-50/30">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase font-poppins">Reply via Email</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm resize-none bg-white font-inter"
                    placeholder="Type your response here. This message will be sent directly to the customer's email inbox..."
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sending}
                    className="btn-primary py-2.5 px-6 rounded-xl text-xs font-semibold text-white flex items-center gap-2 disabled:opacity-50"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiSend />
                    )}
                    Send Reply Email
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 border-t border-gray-50 flex items-center gap-2 text-green-600 bg-green-50/30 shrink-0">
                <FiCheck className="w-5 h-5 shrink-0" />
                <span className="text-sm font-semibold font-poppins">Replied and closed</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-20 text-gray-400 font-inter">
            <FiMail className="w-16 h-16 text-gray-200 mb-4 animate-bounce-soft" />
            <p className="text-sm">Select a message from the inbox to read and reply.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
