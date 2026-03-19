import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X, Zap, Lock, Calendar, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import logo from "../assets/logo.png";


// ── Google Identity Services type declarations
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void;
          renderButton: (el: HTMLElement, options: GoogleButtonOptions) => void;
          prompt: () => void;
          revoke: (hint: string, cb: () => void) => void;
        };
      };
    };
  }
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleButtonOptions {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: number;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

function parseJwt(token: string): Record<string, string> {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}

function loadGoogleScript(clientId: string, callback: (res: GoogleCredentialResponse) => void): void {
  if (document.getElementById('google-gis-script')) {
    initGoogleId(clientId, callback);
    return;
  }
  const script = document.createElement('script');
  script.id    = 'google-gis-script';
  script.src   = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => initGoogleId(clientId, callback);
  document.body.appendChild(script);
}

function initGoogleId(clientId: string, callback: (res: GoogleCredentialResponse) => void): void {
  window.google?.accounts.id.initialize({
    client_id:             clientId,
    callback,
    auto_select:           false,
    cancel_on_tap_outside: true,
  });
}

const features = [
  { icon: <Zap      className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Instant Booking', color: 'text-yellow-500' },
  { icon: <Lock     className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Secure Payment',  color: 'text-gray-700'   },
  { icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Flexible Slots',  color: 'text-gray-700'   },
  { icon: <Trophy   className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Premium Turf',    color: 'text-yellow-500' },
];

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

const LoginPage = () => {
  const [loading,       setLoading]       = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(!GOOGLE_CLIENT_ID);
  const [form,          setForm]          = useState({ email: '', password: '' });
  const [error,         setError]         = useState('');
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const modalRef     = useRef<HTMLDivElement>(null);

  // Redirect destination after login (supports BookingPage's { state: { from } })
  const from = (location.state as { from?: string })?.from || '/';

  // Lock body scroll on mobile
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Google button width — match container width responsively
  const getGoogleBtnWidth = () => {
    if (!googleBtnRef.current) return 320;
    return Math.min(googleBtnRef.current.offsetWidth || 320, 400);
  };

  // ── Initialize Google Identity Services & render button
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || showEmailForm) return;

    const handleGoogleCredential = async (res: GoogleCredentialResponse) => {
      setError('');
      setLoading(true);
      try {
        const payload = parseJwt(res.credential);
        const apiRes  = await api.post('/auth/google', {
          idToken:  res.credential,
          name:     payload.name || payload.given_name,
          email:    payload.email,
          googleId: payload.sub,
          avatar:   payload.picture,
        });
        login(apiRes.data.token, apiRes.data.user);
        navigate(from, { replace: true });
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        setError(e.response?.data?.message || 'Google sign-in failed. Please try email login.');
      } finally {
        setLoading(false);
      }
    };

    loadGoogleScript(GOOGLE_CLIENT_ID, handleGoogleCredential);

    const interval = setInterval(() => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        clearInterval(interval);
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme:         'outline',
          size:          'large',
          width:         getGoogleBtnWidth(),
          text:          'continue_with',
          shape:         'rectangular',
          logo_alignment:'left',
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [from, login, navigate, showEmailForm]);

  // ── Re-render Google button on window resize
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || showEmailForm) return;
    const handleResize = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme:          'outline',
          size:           'large',
          width:          getGoogleBtnWidth(),
          text:           'continue_with',
          shape:          'rectangular',
          logo_alignment: 'left',
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showEmailForm]);

  // ── Email/password login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => navigate('/');

  return (
    // Overlay — full viewport, accounts for mobile nav bar
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal
          - On mobile: slides up from bottom, full width, rounded only at top
          - On sm+:    centered card with rounded corners everywhere
      */}
      <div
        ref={modalRef}
        className="
          relative bg-white z-10 w-full
          rounded-t-3xl sm:rounded-3xl
          shadow-2xl
          max-h-[92dvh] sm:max-h-[90vh]
          sm:max-w-md
          overflow-y-auto
          overscroll-contain
        "
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="px-5 pt-3 pb-8 sm:px-8 sm:pt-6 sm:pb-8">
          {/* Logo */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <img
              src={logo}
              alt="HyperGreen 360 Turf"
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-1">
            Welcome to HyperGreen 360
          </h2>
          <p className="text-gray-500 text-center text-sm mb-4">
            {GOOGLE_CLIENT_ID
              ? 'Sign in with Google to book your turf'
              : 'Sign in to book your turf'}
          </p>

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4 flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {!showEmailForm ? (
            <>
              {/* Google sign-in section */}
              <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 mb-4 bg-gray-50">
                <p className="text-xs font-bold text-green-600 text-center mb-2 flex items-center justify-center gap-1.5">
                  <span className="text-base">✨</span> Quick & Secure Sign In
                </p>
                <p className="text-sm text-gray-600 text-center mb-4">
                  Use your Google account to access all features
                </p>

                {loading ? (
                  <div className="w-full flex items-center justify-center py-3 gap-2 text-gray-600 text-sm font-semibold">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in with Google...
                  </div>
                ) : (
                  // Google button container — full width so button fills it
                  <div
                    ref={googleBtnRef}
                    className="flex justify-center w-full overflow-hidden"
                  />
                )}

                {/* Fallback when GOOGLE_CLIENT_ID is missing */}
                {!GOOGLE_CLIENT_ID && (
                  <div className="text-center mt-3">
                    <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 mb-3">
                      ⚙️ Google Client ID not set. Add{' '}
                      <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> to your{' '}
                      <code>.env</code> file.
                    </p>
                    <button
                      onClick={() => setShowEmailForm(true)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 font-bold text-sm transition-colors"
                    >
                      Continue with Email
                    </button>
                  </div>
                )}
              </div>

              {/* Features grid — 2×2 on all sizes */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                {features.map(f => (
                  <div
                    key={f.label}
                    className="border border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-1.5 bg-gray-50"
                  >
                    <span className={f.color}>{f.icon}</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center leading-tight">
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider + email fallback */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button
                onClick={() => { setShowEmailForm(true); setError(''); }}
                className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-3 text-sm font-semibold transition-colors mb-4"
              >
                Sign in with Email & Password
              </button>
            </>
          ) : (
            /* ── Email form ── */
            <div className="mb-4">
              {GOOGLE_CLIENT_ID && (
                <button
                  onClick={() => { setShowEmailForm(false); setError(''); }}
                  className="flex items-center gap-1 text-sm text-green-600 font-semibold mb-4 hover:underline"
                >
                  ← Back to Google Sign In
                </button>
              )}

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password" required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 font-bold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Signing in...
                    </>
                  ) : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-4">
                Don't have an account?{' '}
                <Link to="/register" className="text-green-600 font-semibold hover:underline">
                  Register
                </Link>
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
            Need help?{' '}
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