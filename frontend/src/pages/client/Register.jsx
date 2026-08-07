import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiCalendar, FiUserCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';
import SEOHead from '../../components/seo/SEOHead';
import PhoneInput from '../../components/common/PhoneInput';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const Register = () => {
  const [form, setForm] = useState({ fullName: '', email: '', mobileNumber: '', country: 'IN', password: '', confirmPassword: '', gender: '', birthDate: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
    if (e.target.name === 'password' && errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Client-side validations
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    }

    // Mobile validation
    if (!form.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else {
      const phoneNumberObj = parsePhoneNumberFromString(form.mobileNumber, form.country);
      if (!phoneNumberObj || !phoneNumberObj.isValid()) {
        newErrors.mobileNumber = 'Please enter a valid phone number.';
      }
    }

    if (!form.gender) {
      newErrors.gender = 'Gender is required.';
    }

    // Birth Date validation
    if (!form.birthDate) {
      newErrors.birthDate = 'Birth date is required.';
    } else {
      const bDate = new Date(form.birthDate);
      if (isNaN(bDate.getTime())) {
        newErrors.birthDate = 'Please enter a valid birth date.';
      } else if (bDate > new Date()) {
        newErrors.birthDate = 'Birth date cannot be in the future.';
      }
    }

    if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email,
        mobileNumber: form.mobileNumber,
        country: form.country,
        gender: form.gender,
        birthDate: form.birthDate,
        password: form.password
      });
      toast.success('Registration successful! Verification code sent to your email.');
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      const errMsg = err.message || 'Registration failed.';
      const serverErrors = {};
      
      if (errMsg.toLowerCase().includes('email')) {
        serverErrors.email = errMsg;
      } else if (errMsg.toLowerCase().includes('password')) {
        serverErrors.password = errMsg;
      } else if (errMsg.toLowerCase().includes('mobile') || errMsg.toLowerCase().includes('phone')) {
        serverErrors.mobileNumber = errMsg;
      } else if (errMsg.toLowerCase().includes('name')) {
        serverErrors.fullName = errMsg;
      } else if (errMsg.toLowerCase().includes('gender')) {
        serverErrors.gender = errMsg;
      } else if (errMsg.toLowerCase().includes('birth')) {
        serverErrors.birthDate = errMsg;
      } else {
        serverErrors.general = errMsg;
      }
      
      setErrors(serverErrors);
      if (serverErrors.general) {
        toast.error(serverErrors.general);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Create Account" description="Create your PeelKraft account to shop organic products." canonicalUrl="/register" />
      <section className="min-h-screen flex items-center justify-center bg-cream-50 py-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-premium border border-cream-200/60 p-6 sm:p-8 md:p-10">
            <div className="text-center mb-8">
              <Link to="/"><img src="/images/logo.png" alt="PeelKraft" className="h-10 mx-auto mb-4" /></Link>
              <h1 className="text-2xl font-serif text-dark">Create Account</h1>
              <p className="text-gray-400 font-sans text-xs tracking-wide mt-1.5 font-medium">Join PeelKraft for healthy organic products</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-650 rounded-xl text-xs font-sans">
                  {errors.general}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 font-sans">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition font-sans text-xs ${
                      errors.fullName
                        ? 'border-red-550 focus:border-red-550'
                        : 'border-cream-200 focus:border-primary-500 bg-white'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-555 text-[10px] mt-1 font-sans">{errors.fullName}</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 font-sans">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition font-sans text-xs ${
                      errors.email
                        ? 'border-red-550 focus:border-red-550'
                        : 'border-cream-200 focus:border-primary-500 bg-white'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-555 text-[10px] mt-1 font-sans">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 font-sans">Mobile Number</label>
                <PhoneInput
                  value={form.mobileNumber}
                  country={form.country}
                  onChange={({ country, value }) => {
                    setForm({ ...form, country, mobileNumber: value });
                  }}
                  error={errors.mobileNumber}
                />
                {errors.mobileNumber && (
                  <p className="text-red-555 text-[10px] mt-1 font-sans">{errors.mobileNumber}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 font-sans">Gender</label>
                  <div className="relative">
                    <FiUserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 bg-transparent pointer-events-none" />
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition text-xs appearance-none bg-white ${
                        errors.gender
                          ? 'border-red-550 focus:border-red-550'
                          : 'border-cream-200 focus:border-primary-500 bg-white'
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  {errors.gender && (
                    <p className="text-red-555 text-[10px] mt-1 font-sans">{errors.gender}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 font-sans">Birth Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 bg-transparent pointer-events-none" />
                    <input
                      name="birthDate"
                      type="date"
                      value={form.birthDate}
                      onChange={handleChange}
                      required
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition text-xs bg-white ${
                        errors.birthDate
                          ? 'border-red-550 focus:border-red-550'
                          : 'border-cream-200 focus:border-primary-500 bg-white'
                      }`}
                    />
                  </div>
                  {errors.birthDate && (
                    <p className="text-red-555 text-[10px] mt-1 font-sans">{errors.birthDate}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 font-sans">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border outline-none transition font-sans text-xs ${
                      errors.password
                        ? 'border-red-550 focus:border-red-550'
                        : 'border-cream-200 focus:border-primary-500 bg-white'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-555 text-[10px] mt-1 font-sans">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 font-sans">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none transition font-sans text-xs ${
                    errors.confirmPassword
                      ? 'border-red-550 focus:border-red-550'
                      : 'border-cream-200 focus:border-primary-500 bg-white'
                  }`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-red-555 text-[10px] mt-1 font-sans">{errors.confirmPassword}</p>
                )}
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-dark hover:bg-green-800 text-white font-semibold rounded-full font-sans text-xs tracking-widest uppercase transition-all duration-300 shadow-premium disabled:opacity-50 mt-2">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-6 font-sans tracking-wide">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-500 hover:text-dark font-bold transition-colors">Sign In</Link>
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Register;
