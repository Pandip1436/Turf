import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle, Navigation } from 'lucide-react';
import api from '../utils/api';

interface ContactForm {
  name:    string;
  email:   string;
  phone:   string;
  subject: string;
  message: string;
}

const ContactPage = () => {
  const [form, setForm] = useState<ContactForm>({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/contact', {
        name:    form.name,
        email:   form.email,
        phone:   form.phone    || undefined,
        subject: form.subject  || undefined,
        message: form.message,
      });
      setSent(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: { msg: string }[] } } };
      const msg =
        e.response?.data?.errors?.[0]?.msg ||
        e.response?.data?.message ||
        'Failed to send message. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSent(false);
    setError('');
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl tracking-wider text-gray-900 dark:text-white mb-2">CONTACT US</h1>
          <p className="text-gray-500 dark:text-gray-400">We're here to help. Reach out anytime!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* ── LEFT: Info + Map ── */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-5">Visit Our Facility</h2>
              <div className="space-y-4 text-sm">

                {/* Address */}
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Address</div>
                    <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                      Housing Board, Near Water Tank,<br />
                      Sivakasi – 626 123, Tamil Nadu
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Phone / WhatsApp</div>
                    <a href="tel:8056564775" className="text-green-600 hover:underline mt-0.5 block">
                      +91 80565 64775
                    </a>
                    <span className="text-gray-400 text-xs">Available 24/7</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Email</div>
                    <a href="mailto:info@hypergreen360.com" className="text-green-600 hover:underline mt-0.5 block">
                      info@hypergreen360.com
                    </a>
                    <span className="text-gray-400 text-xs">We reply within 24 hours</span>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Operating Hours</div>
                    <div className="text-gray-500 dark:text-gray-400 mt-0.5 font-semibold">Open 24 Hours · 7 Days a Week</div>
                    <span className="text-gray-400 text-xs">Book anytime – we never close</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map embed */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3942.3!2d77.804!3d9.452!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sSivakasi!5e0!3m2!1sen!2sin!4v1680000000"
                width="100%"
                height="240"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="HyperGreen 360 Turf Location"
              />
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-green-500" />
                  Sivakasi, Tamil Nadu · 9.4534, 77.8042
                </span>
                <a
                  href="https://maps.google.com/?q=9.4534,77.8042"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700"
                >
                  <Navigation className="w-4 h-4" />
                  Directions
                </a>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Form ── */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">

            {/* Success state */}
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-display text-3xl tracking-wider text-gray-900 dark:text-white mb-2">MESSAGE SENT!</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">We'll get back to you within 24 hours.</p>
                <button
                  onClick={reset}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-6">Send Us a Message</h2>

                {/* API error banner */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2">
                    <span className="text-base">⚠️</span> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 rounded-xl px-4 py-3 outline-none transition-colors dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 rounded-xl px-4 py-3 outline-none transition-colors dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Phone <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                      placeholder="10-digit mobile number"
                      className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 rounded-xl px-4 py-3 outline-none transition-colors dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Subject <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 rounded-xl px-4 py-3 outline-none transition-colors bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                    >
                      <option value="">Select a subject...</option>
                      <option value="Booking Enquiry">Booking Enquiry</option>
                      <option value="Tournament Registration">Tournament Registration</option>
                      <option value="Pricing Information">Pricing Information</option>
                      <option value="Cancellation / Refund">Cancellation / Refund</option>
                      <option value="Facility Feedback">Facility Feedback</option>
                      <option value="General Enquiry">General Enquiry</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      minLength={10}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="How can we help you?"
                      className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 rounded-xl px-4 py-3 outline-none resize-none transition-colors dark:bg-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {form.message.length} / 2000
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 text-white rounded-xl py-3 font-bold text-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;