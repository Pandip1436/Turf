import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Calendar, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from "../assets/logo.png";

function OfferBanner() {
  const location = useLocation();
  if (location.pathname !== "/") return null;
  return (
    <div className="bg-gradient-to-r from-green-600 to-blue-600 w-full text-white text-center px-3 py-3 sm:py-4 text-xs sm:text-sm md:text-base font-bold tracking-wide">
      <p className="leading-relaxed">💰 Save More! Book consecutive hours for discounts 💰</p>
      <p className="mt-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
        <span>🌅 Morning (6AM–6PM):<span className="font-extrabold"> 2+ hours = ₹500/hr</span></span>
        <span className="hidden sm:inline">|</span>
        <span>🌙 Evening (6PM–6AM):<span className="font-extrabold"> 2hrs = 10% off</span>,<span className="font-extrabold"> 3hrs = 20% off</span></span>
      </p>
    </div>
  );
}

const Navbar = () => {
  const [open,        setOpen]        = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); setDropdownOpen(false); }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { to: '/',        label: 'Home'     },
    { to: '/gallery', label: 'Gallery'  },
    { to: '/booking', label: 'Book Now' },
    { to: '/pricing', label: 'Pricing'  },
    { to: '/contact', label: 'Contact'  },
  ];

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  // Avatar initials
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white shadow-lg'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center font-bold gap-2">
            <img src={logo} alt="HyperGreen 360 Turf" className="w-20 h-20 object-contain" />
            <span className="font-display text-xl font-bold tracking-wider bg-gradient-to-r from-green-700 to-blue-600 bg-clip-text text-transparent">
              HyperGreen 360 Turf
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`text-lg font-semibold transition-colors ${
                  location.pathname === link.to ? 'text-green-500' : 'text-gray-700 hover:text-green-600'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              /* ── User dropdown ── */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {/* Avatar circle */}
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to="/booking"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-green-500" />
                        Book a Slot
                      </Link>
                      <Link
                        to="/my-bookings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <User className="w-4 h-4 text-blue-500" />
                        My Bookings
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-lg font-semibold px-6 text-green-700 hover:text-green-600">
                  Sign In
                </Link>
                <Link to="/booking" className="bg-gradient-to-r from-green-600 to-blue-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-800">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`block py-2.5 font-semibold transition-colors ${
                  location.pathname === link.to ? 'text-green-600' : 'text-gray-800 hover:text-green-600'
                }`}>
                {link.label}
              </Link>
            ))}

            <div className="border-t border-gray-100 pt-2 mt-2">
              {isAuthenticated ? (
                <>
                  {/* Mobile user info */}
                  <div className="flex items-center gap-2 py-2 mb-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Link to="/booking" className="flex items-center gap-2 py-2.5 text-gray-800 font-semibold hover:text-green-600">
                    <Calendar className="w-4 h-4 text-green-500" /> Book a Slot
                  </Link>
                  <Link to="/my-bookings" className="flex items-center gap-2 py-2.5 text-gray-800 font-semibold hover:text-green-600">
                    <User className="w-4 h-4 text-blue-500" /> My Bookings
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 py-2.5 text-red-500 font-semibold w-full">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"    className="block py-2.5 text-gray-800 font-semibold hover:text-green-600">Sign In</Link>
                  <Link to="/register" className="block py-2.5 text-gray-800 font-semibold hover:text-green-600">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Promo banner */}
      <OfferBanner />
    </nav>
  );
};

export default Navbar;