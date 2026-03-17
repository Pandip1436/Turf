/* eslint-disable @typescript-eslint/no-explicit-any */
import  { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShieldCheck, Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const benefits = [
  { icon: '⚡', label: 'Instant Booking' },
  { icon: '🔒', label: 'Secure Payment' },
  { icon: '📅', label: 'Flexible Slots' },
  { icon: '🏆', label: 'Premium Turf' },
];

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = () => navigate(-1);

  // Password strength
  const pwStrength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: 'bg-red-400', width: '25%' };
    if (p.length < 8) return { label: 'Weak', color: 'bg-orange-400', width: '50%' };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: 'Strong', color: 'bg-green-500', width: '100%' };
    return { label: 'Medium', color: 'bg-yellow-400', width: '75%' };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* ── BACKDROP ── */
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ paddingTop: '56px' }}>
      {/* Blurred background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* ── MODAL ── */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto z-10"
        style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-8 pt-10">
          {/* Shield icon */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
            Create Your Account
          </h2>
          <p className="text-gray-500 text-center text-sm mb-6">
            Join HyperGreen 360 and start booking today
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2">
              <span className="text-lg">⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full border border-gray-300 focus:border-green-500 rounded-xl pl-10 pr-4 py-3 outline-none text-sm transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 focus:border-green-500 rounded-xl pl-10 pr-4 py-3 outline-none text-sm transition-colors"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  maxLength={10}
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="10-digit mobile number"
                  className="w-full border border-gray-300 focus:border-green-500 rounded-xl pl-10 pr-4 py-3 outline-none text-sm transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="w-full border border-gray-300 focus:border-green-500 rounded-xl pl-10 pr-11 py-3 outline-none text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {pwStrength && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${pwStrength.color}`}
                      style={{ width: pwStrength.width }}
                    />
                  </div>
                  <p className={`text-xs mt-1 font-semibold ${
                    pwStrength.label === 'Strong' ? 'text-green-600' :
                    pwStrength.label === 'Medium' ? 'text-yellow-600' :
                    pwStrength.label === 'Weak' ? 'text-orange-500' : 'text-red-500'
                  }`}>
                    {pwStrength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat your password"
                  className={`w-full border rounded-xl pl-10 pr-11 py-3 outline-none text-sm transition-colors ${
                    form.confirm && form.confirm !== form.password
                      ? 'border-red-400 focus:border-red-500'
                      : form.confirm && form.confirm === form.password
                      ? 'border-green-400 focus:border-green-500'
                      : 'border-gray-300 focus:border-green-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {/* Match tick */}
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-500 mt-1 font-semibold">Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white rounded-xl py-3.5 font-bold text-base transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Or divider + Google */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or sign up with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            type="button"
            className="w-full border border-gray-200 hover:bg-gray-50 rounded-xl py-3 text-sm font-semibold text-gray-700 flex items-center justify-center gap-3 transition-colors mb-5"
            onClick={() => navigate('/login')}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Benefits mini grid */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {benefits.map(b => (
              <div key={b.label} className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-xl p-2.5">
                <span className="text-xl">{b.icon}</span>
                <span className="text-xs font-semibold text-gray-600 text-center leading-tight">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-500 mb-4">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">Sign in</Link>
          </p>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 leading-relaxed">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-gray-600">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-1">
            Need help? Contact{' '}
            <a href="mailto:info@hypergreen360.com" className="text-green-600 hover:underline">
              info@hypergreen360.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;