import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import SEOHead from '../../components/seo/SEOHead';
import Breadcrumbs from '../../components/seo/Breadcrumbs';
import { contactApi } from '../../api';
import { useSettings } from '../../context/SettingsContext';

const Contact = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const { settings } = useSettings();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await contactApi.submit(data);
      toast.success(res.message || 'Message sent successfully!');
      reset();
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: FiMail, label: 'Email', value: settings.email, href: `mailto:${settings.email}` },
    { icon: FiPhone, label: 'Phone', value: settings.phone, href: `tel:${settings.phone}` },
    { icon: FiMapPin, label: 'Address', value: settings.address || 'JUICETAP GLOBAL PRIVATE LIMITED Plot 13-14, Nandini Farm, Tata Motors Lane, Bhatpore, Hazira, Surat, Gujarat 394510' },
  ];

  return (
    <>
      <SEOHead title="Contact Us" description="Get in touch with PeelKraft. We'd love to hear from you!" canonicalUrl="/contact" />

      <section className="pt-36 pb-12 bg-cream-50 border-b border-cream-200/30">
        <div className="container-custom w-full">
          <Breadcrumbs items={[{ label: 'Contact' }]} />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <h1 className="text-4xl md:text-5xl font-serif text-dark mb-4">Get in <span className="text-primary-500 italic font-normal">Touch</span></h1>
            <p className="text-gray-500 font-sans text-xs tracking-wide uppercase font-semibold max-w-2xl">We'd love to hear from you. Send us a message!</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <div className="space-y-6 mb-10">
                {contactInfo.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-cream-50 border border-cream-200/60 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary-500" />
                      </div>
                      <div className="font-sans text-xs">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-0.5">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-dark font-semibold hover:text-primary-500 transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-dark font-semibold whitespace-pre-line leading-relaxed">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* WhatsApp */}
              {settings.whatsapp && (
                <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#1ebd59] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all">
                  <FaWhatsapp className="w-4 h-4" /> Chat on WhatsApp
                </a>
              )}

              {/* Map */}
              <div className="mt-10 rounded-3xl overflow-hidden h-64 bg-cream-50 border border-cream-200/50 shadow-sm">
                <iframe
                  src="https://maps.google.com/maps?q=5Q82%2BVM,%20Surat,%20Gujarat,%20India&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="PeelKraft Location"
                />
              </div>
            </div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-3">
              <div className="bg-cream-50/20 border border-cream-200/50 rounded-3xl p-8 md:p-10">
                <h2 className="text-2xl font-serif text-dark mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-sans text-xs">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Full Name *</label>
                      <input {...register('name', { required: 'Name is required' })} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 focus:outline-none focus:border-primary-500 bg-white transition-colors" placeholder="John Doe" />
                      {errors.name && <p className="text-red-555 text-[10px] mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Email *</label>
                      <input type="email" {...register('email', { required: 'Email is required' })} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 focus:outline-none focus:border-primary-500 bg-white transition-colors" placeholder="john@example.com" />
                      {errors.email && <p className="text-red-555 text-[10px] mt-1">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Phone</label>
                      <input {...register('phone')} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 focus:outline-none focus:border-primary-500 bg-white transition-colors" placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Subject *</label>
                      <input {...register('subject', { required: 'Subject is required' })} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 focus:outline-none focus:border-primary-500 bg-white transition-colors" placeholder="Product inquiry" />
                      {errors.subject && <p className="text-red-555 text-[10px] mt-1">{errors.subject.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Message *</label>
                    <textarea {...register('message', { required: 'Message is required' })} rows={5} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 focus:outline-none focus:border-primary-500 bg-white resize-none transition-colors" placeholder="Tell us more..." />
                    {errors.message && <p className="text-red-555 text-[10px] mt-1">{errors.message.message}</p>}
                  </div>
                  <button type="submit" disabled={submitting} className="px-8 py-3.5 bg-dark hover:bg-green-800 text-white rounded-full text-xs font-semibold font-sans tracking-widest uppercase transition-all duration-300 shadow-premium flex items-center justify-center gap-2 disabled:opacity-50">
                    <FiSend className="w-3.5 h-3.5" /> {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
