import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiMail, FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';
import { userAuthApi } from '../../api';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';

const MyProfile = () => {
  const { user, token, logout, updateUser, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', label: 'home'
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
      setAddresses(user.addresses || []);
    }
  }, [user, token, navigate]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await userAuthApi.updateProfile(profileForm);
      updateUser(res.data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    try {
      const res = await userAuthApi.addAddress(addressForm);
      setAddresses(res.data.data);
      updateUser({ addresses: res.data.data });
      toast.success('Address added successfully!');
      setShowAddressForm(false);
      setAddressForm({
        fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', label: 'home'
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      const res = await userAuthApi.deleteAddress(addrId);
      setAddresses(res.data.data);
      updateUser({ addresses: res.data.data });
      toast.success('Address removed.');
    } catch (err) {
      toast.error('Failed to remove address.');
    }
  };

  if (!isAuthenticated) return null;

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition font-inter text-sm';

  return (
    <>
      <SEOHead title="My Profile" description="Manage your PeelKraft account profile and addresses." canonicalUrl="/my-profile" />
      <section className="pt-32 pb-8 bg-cream-50">
        <div className="container-custom">
          <Breadcrumbs items={[{ label: 'Profile' }]} />
          <h1 className="text-3xl font-poppins font-bold text-dark mt-4">My Account</h1>
        </div>
      </section>

      <section className="py-8 bg-cream-50 min-h-[60vh]">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sidebar navigation */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
                <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold font-poppins uppercase">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <h2 className="text-lg font-poppins font-bold text-dark">{user?.firstName} {user?.lastName}</h2>
                <p className="text-gray-500 text-sm font-inter">{user?.email}</p>
                <button
                  onClick={logout}
                  className="mt-6 w-full py-2.5 border border-red-200 text-red-500 hover:bg-red-50 font-semibold rounded-xl transition text-sm font-poppins"
                >
                  Logout
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
                <button
                  onClick={() => navigate('/my-orders')}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 font-semibold text-dark text-sm font-poppins transition"
                >
                  My Orders
                </button>
                <button
                  className="w-full text-left px-4 py-3 rounded-xl bg-primary-50 text-primary-600 font-semibold text-sm font-poppins transition"
                >
                  Profile & Addresses
                </button>
              </div>
            </div>

            {/* Profile fields and Addresses */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile details */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-poppins font-bold text-dark mb-4 flex items-center gap-2">
                  <FiUser className="text-primary-500" /> Account Details
                </h3>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 font-inter">First Name</label>
                      <input
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        required
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 font-inter">Last Name</label>
                      <input
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        required
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 font-inter">Phone Number</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition font-inter text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition font-poppins text-sm shadow-md shadow-primary-500/10 disabled:opacity-50"
                  >
                    {profileLoading ? 'Saving...' : 'Save Details'}
                  </button>
                </form>
              </motion.div>

              {/* Addresses section */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-poppins font-bold text-dark flex items-center gap-2">
                    <FiMapPin className="text-primary-500" /> Saved Addresses
                  </h3>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 font-semibold font-poppins text-sm transition"
                    >
                      <FiPlus /> Add New
                    </button>
                  )}
                </div>

                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="space-y-4 border border-gray-100 p-4 rounded-2xl mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-inter">Recipient Name *</label>
                        <input
                          value={addressForm.fullName}
                          onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                          required
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-inter">Phone *</label>
                        <input
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          required
                          className={inputCls}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-inter">Address Line 1 *</label>
                        <input
                          value={addressForm.addressLine1}
                          onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                          required
                          className={inputCls}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-inter">Address Line 2</label>
                        <input
                          value={addressForm.addressLine2}
                          onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-inter">City *</label>
                        <input
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          required
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-inter">State *</label>
                        <input
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          required
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-inter">Pincode *</label>
                        <input
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          required
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 font-inter">Label</label>
                        <select
                          value={addressForm.label}
                          onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                          className={inputCls}
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={addressLoading}
                        className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition font-poppins text-xs"
                      >
                        {addressLoading ? 'Adding...' : 'Add Address'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold rounded-xl transition font-poppins text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <p className="text-gray-400 text-sm font-inter">No saved addresses found.</p>
                  ) : (
                    addresses.map((addr) => (
                      <div key={addr._id} className="border border-gray-100 rounded-2xl p-4 flex justify-between items-start">
                        <div className="font-inter text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-dark">{addr.fullName}</span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] uppercase font-bold rounded-full">{addr.label}</span>
                          </div>
                          <p>{addr.phone}</p>
                          <p>{addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}{addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-red-400 hover:text-red-600 transition p-1.5"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MyProfile;
