import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShieldCheck, Zap, Lock, Calendar, Trophy } from 'lucide-react';
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
  credential: string; // JWT id_token
  select_by: string;
}

// ── Parse JWT payload (no verification — backend verifies)
function parseJwt(token: string): Record<string, string> {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}

// ── Load Google Identity Services script
function loadGoogleScript(clientId: string, callback: (res: GoogleCredentialResponse) => void): void {
  if (document.getElementById('google-gis-script')) {
    initGoogleId(clientId, callback);
    return;
  }
  const script = document.createElement('script');
  script.id  = 'google-gis-script';
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => initGoogleId(clientId, callback);
  document.body.appendChild(script);
}

function initGoogleId(clientId: string, callback: (res: GoogleCredentialResponse) => void): void {
  window.google?.accounts.id.initialize({
    client_id:            clientId,
    callback,
    auto_select:          false,
    cancel_on_tap_outside: true,
  });
}

const features = [
  { icon: <Zap    className="w-7 h-7" />, label: 'Instant Booking', color: 'text-yellow-500' },
  { icon: <Lock   className="w-7 h-7" />, label: 'Secure Payment',  color: 'text-gray-700'   },
  { icon: <Calendar className="w-7 h-7" />, label: 'Flexible Slots', color: 'text-gray-700'  },
  { icon: <Trophy className="w-7 h-7" />, label: 'Premium Turf',    color: 'text-yellow-500' },
];

// ── Get Google Client ID from env (Vite)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

const LoginPage = () => {
  const [loading,       setLoading]       = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(!GOOGLE_CLIENT_ID);
  const [form,          setForm]          = useState({ email: '', password: '' });
  const [error,         setError]         = useState('');
  const { login } = useAuth();
  const navigate   = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Initialize Google Identity Services & render button
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || showEmailForm) return;

    const handleGoogleCredential = async (res: GoogleCredentialResponse) => {
      setError('');
      setLoading(true);
      try {
        const payload = parseJwt(res.credential);

        // Send id_token to backend for verification and login
        const apiRes = await api.post('/auth/google', {
          idToken:  res.credential,
          name:     payload.name     || payload.given_name,
          email:    payload.email,
          googleId: payload.sub,
          avatar:   payload.picture,
        });

        login(apiRes.data.token, apiRes.data.user);
        navigate('/');
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        setError(e.response?.data?.message || 'Google sign-in failed. Please try email login.');
      } finally {
        setLoading(false);
      }
    };

    loadGoogleScript(GOOGLE_CLIENT_ID, handleGoogleCredential);

    // Render the styled Google button into our container
    const interval = setInterval(() => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        clearInterval(interval);
        // Re-init with callback (needed after script already loaded)
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback:  handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme:         'outline',
          size:          'large',
          width:         384,
          text:          'continue_with',
          shape:         'rectangular',
          logo_alignment:'left',
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [GOOGLE_CLIENT_ID, showEmailForm]);

  // ── Email/password login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => navigate('/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ paddingTop: '56px' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto z-10 overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}
      >
        {/* Close */}
        <button onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10">
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-8 ">
          {/* Shield */}
          <div className="flex justify-center ">
            <div className="w-40 h-40  rounded-full flex ">
              {/* Logo Image */}
              <img
                src={logo}
                alt="HyperGreen 360 Turf"
                className="w-40 h-40 object-contain"
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Welcome to HyperGreen 360</h2>
          <p className="text-gray-500 text-center text-sm mb-3">
            {GOOGLE_CLIENT_ID ? 'Sign in with Google to book your turf' : 'Sign in to book your turf'}
          </p>

          {/* ── Error banner ── */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {!showEmailForm ? (
            <>
              {/* Google sign-in section */}
              <div className="border border-gray-200 rounded-2xl p-5 mb-5 bg-gray-50">
                <p className="text-xs font-bold text-green-600 text-center mb-3 flex items-center justify-center gap-1.5">
                  <span className="text-base">✨</span> Quick & Secure Sign In
                </p>
                <p className="text-sm text-gray-600 text-center mb-4">
                  Use your Google account to access all features
                </p>

                {/* Google renders its own button here */}
                {loading ? (
                  <div className="w-full flex items-center justify-center py-3 gap-2 text-gray-600 text-sm font-semibold">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in with Google...
                  </div>
                ) : (
                  <div ref={googleBtnRef} className="flex justify-center" />
                )}

                {/* Fallback if Google Client ID not configured */}
                {!GOOGLE_CLIENT_ID && (
                  <div className="text-center">
                    <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 mb-3">
                      ⚙️ Google Client ID not set. Add <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> to your <code>.env</code> file.
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

              {/* Features grid */}
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
                onClick={() => { setShowEmailForm(true); setError(''); }}
                className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-3 text-sm font-semibold transition-colors mb-5"
              >
                Sign in with Email & Password
              </button>
            </>
          ) : (
            /* ── Email form ── */
            <div className="mb-5">
              {GOOGLE_CLIENT_ID && (
                <button
                  onClick={() => { setShowEmailForm(false); setError(''); }}
                  className="flex items-center gap-1 text-sm text-green-600 font-semibold mb-5 hover:underline"
                >
                  ← Back to Google Sign In
                </button>
              )}

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
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
                  {loading
                    ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>Signing in...</>
                    : 'Sign In'
                  }
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