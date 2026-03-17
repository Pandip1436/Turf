/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShieldCheck, Zap, Lock, Calendar, Trophy, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const GOOGLE_ACCOUNTS = [
  { name: 'Muthu Pandi', email: 'pandip1436@gmail.com', avatar: 'MP', color: 'bg-blue-500' },
  { name: 'Add another account', email: '', avatar: '+', color: 'bg-gray-400' },
];

const features = [
  { icon: <Zap className="w-7 h-7" />, label: 'Instant Booking', color: 'text-yellow-500' },
  { icon: <Lock className="w-7 h-7" />, label: 'Secure Payment', color: 'text-gray-700' },
  { icon: <Calendar className="w-7 h-7" />, label: 'Flexible Slots', color: 'text-gray-700' },
  { icon: <Trophy className="w-7 h-7" />, label: 'Premium Turf', color: 'text-yellow-500' },
];

const LoginPage = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(GOOGLE_ACCOUNTS[0]);
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleGoogleSignIn = async () => {
    if (!selectedAccount.email) {
      setShowEmailForm(true);
      return;
    }
    setLoading(true);
    // Simulate Google OAuth — in production integrate real Google OAuth
    await new Promise(r => setTimeout(r, 1200));
    login('demo_google_token', {
      id: 'g_001',
      name: selectedAccount.name,
      email: selectedAccount.email,
    });
    setLoading(false);
    navigate('/');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => navigate(-1);

  return (
    /* ── BACKDROP ── */
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ paddingTop: '56px' }}>
      {/* Blurred bg */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* ── MODAL ── */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto z-10 overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>

        {/* Close button */}
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
            Welcome to HyperGreen 360
          </h2>
          <p className="text-gray-500 text-center text-sm mb-7">
            Sign in with Google to book your turf
          </p>

          {!showEmailForm ? (
            <>
              {/* Google sign-in box */}
              <div className="border border-gray-200 rounded-2xl p-5 mb-5 bg-gray-50">
                <p className="text-xs font-bold text-green-600 text-center mb-3 flex items-center justify-center gap-1.5">
                  <span className="text-base">✨</span> Quick & Secure Sign In
                </p>
                <p className="text-sm text-gray-600 text-center mb-4">
                  Use your Google account to access all features
                </p>

                {/* Account selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full flex items-center justify-between gap-3 border border-gray-300 bg-white rounded-xl px-4 py-3 hover:border-gray-400 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${selectedAccount.color} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {selectedAccount.avatar}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">{selectedAccount.email ? `Sign in as ${selectedAccount.name}` : 'Add another account'}</div>
                        {selectedAccount.email && <div className="text-xs text-gray-500">{selectedAccount.email}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                      {/* Google G */}
                      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                  </button>

                  {/* Dropdown */}
                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                      {GOOGLE_ACCOUNTS.map((acc, i) => (
                        <button
                          key={i}
                          onClick={() => { setSelectedAccount(acc); setShowDropdown(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className={`w-8 h-8 ${acc.color} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                            {acc.avatar}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{acc.name}</div>
                            {acc.email && <div className="text-xs text-gray-500">{acc.email}</div>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sign in button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full mt-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl py-3 font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>
              </div>

              {/* Features 2×2 grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {features.map(f => (
                  <div key={f.label} className="border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 bg-gray-50">
                    <span className={f.color}>{f.icon}</span>
                    <span className="text-sm font-semibold text-gray-700">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* Divider + email option */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-3 text-sm font-semibold transition-colors mb-5"
              >
                Sign in with Email & Password
              </button>
            </>
          ) : (
            /* ── EMAIL FORM ── */
            <div className="mb-5">
              <button
                onClick={() => { setShowEmailForm(false); setError(''); }}
                className="flex items-center gap-1 text-sm text-green-600 font-semibold mb-5 hover:underline"
              >
                ← Back to Google Sign In
              </button>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
              )}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 font-bold transition-colors disabled:opacity-70">
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-4">
                Don't have an account?{' '}
                <Link to="/register" className="text-green-600 font-semibold hover:underline">Register</Link>
              </p>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 leading-relaxed">
            By signing in, you agree to our{' '}
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

export default LoginPage;