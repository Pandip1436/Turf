
import  { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from "../assets/logo.png";

function OfferBanner() {
  const location = useLocation();

  if (location.pathname !== "/") return null;

  return (
    <div className="bg-gradient-to-r from-green-600 to-blue-600 w-full h-20 text-white text-center py-5 text-lg font-bold tracking-wide">
      💰 Save More! Book consecutive hours for discounts: &nbsp;💰
      <br />
      <span>
        🌅 Morning (6AM–6PM): 2+ hours =
        <span className="font-extrabold"> ₹500/hr</span>
      </span>
      &nbsp;|&nbsp;
      <span>
        🌙 Evening (6PM–6AM): 2hrs =
        <span className="font-extrabold"> 10% off</span>, 3hrs =
        <span className="font-extrabold"> 20% off</span>
      </span>
    </div>
  );
}

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/booking', label: 'Book Now' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/contact', label: 'Contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 w-full  z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white shadow-lg'}`}>
      {/* Promo banner */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center font-bold gap-2">
            {/* <div className="w-9 h-9  rounded-lg flex items-center justify-center"> */}
               {/* Logo Image */}
              <img
                src={logo}
                alt="HyperGreen 360 Turf"
                className="w-20 h-20 object-contain"
              />
            {/* </div> */}
            <span className="font-display text-xl font-bold tracking-wider bg-gradient-to-r from-green-700 to-blue-600 bg-clip-text text-transparent">
              HyperGreen 360 Turf
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-lg font-semibold transition-colors ${
                  location.pathname === link.to
                    ? 'text-green-500'
                    : scrolled ? 'text-gray-700 hover:text-green-600' : 'text-gray-700 hover:text-green-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/my-bookings" className={`flex items-center gap-1 text-sm font-semibold ${scrolled ? 'text-gray-700' : 'text-gray-700'}`}>
                  <User className="w-4 h-4" /> {user?.name}
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-semibold">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className={`text-lg font-semibold px-6 ${scrolled ? 'text-green-700 hover:text-green-600' : 'text-green-700 hover:text-green-600'}`}>
                  Sign In
                </Link>
                <Link to="/booking" className="bg-gradient-to-r from-green-600 to-blue-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Book Now
                </Link>
              </>
            )}
          </div>
          

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className={`md:hidden p-2 ${scrolled ? 'text-gray-800' : 'text-white'}`}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="block py-2 text-gray-800 font-semibold hover:text-green-600">
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/my-bookings" className="block py-2 text-gray-800 font-semibold">My Bookings</Link>
                <button onClick={handleLogout} className="block py-2 text-red-500 font-semibold">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-800 font-semibold">Sign In</Link>
                <Link to="/register" className="block py-2 text-gray-800 font-semibold">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
       {/* Promo banner — sits below the navbar */}
      <OfferBanner />
    </nav>
  );
};

export default Navbar;