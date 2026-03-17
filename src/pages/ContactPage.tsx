import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-10 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl tracking-wider text-gray-900 mb-2">CONTACT US</h1>
          <p className="text-gray-500">We're here to help. Reach out anytime!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-xl text-gray-900 mb-5">Visit Our Facility</h2>
              <div className="space-y-4 text-sm">
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Address</div>
                    <div className="text-gray-500 mt-0.5">Housing Board, Near Water Tank,<br />Sivakasi – 626 123, Tamil Nadu</div>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Phone</div>
                    <a href="tel:8056564775" className="text-green-600 hover:underline mt-0.5 block">+91 80565 64775</a>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <a href="mailto:info@hypergreen360.com" className="text-green-600 hover:underline mt-0.5 block">info@hypergreen360.com</a>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Operating Hours</div>
                    <div className="text-gray-500 mt-0.5">Open 24 Hours / 7 Days</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map embed */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3942.3!2d77.804!3d9.452!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sSivakasi!5e0!3m2!1sen!2sin!4v1680000000"
                width="100%" height="240" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="HyperGreen 360 Turf Location"
              />
              <div className="p-4 text-sm text-gray-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500" />
                Sivakasi, Tamil Nadu · GPS: 9.4534, 77.8042
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-display text-3xl tracking-wider text-gray-900 mb-2">MESSAGE SENT!</h3>
                <p className="text-gray-500 mb-6">We'll get back to you within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold">
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-bold text-xl text-gray-900 mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="Your phone number"
                      className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="How can we help you?"
                      className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 outline-none resize-none" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl py-3 font-bold text-lg transition-colors disabled:opacity-70">
                    {loading ? 'Sending...' : 'Send Message'}
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