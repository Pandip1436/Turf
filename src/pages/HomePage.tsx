import { Link } from 'react-router-dom';
import {
  Zap, Shield, Sun, Moon, Users, Trophy, Car,
  CheckCircle, Star, ChevronRight, Phone, MapPin, Mail, Clock, Navigation
} from 'lucide-react';
import { Calendar, CreditCard } from 'lucide-react';
import { useEffect, useState } from "react";

import hero1 from "../assets/hero/hero1.png";
import hero2 from "../assets/hero/hero2.png";
import hero3 from "../assets/hero/hero3.jpg";
import hero4 from "../assets/hero/hero4.jpg";


const steps = [
  { icon: <Calendar className="w-7 h-7 text-white" />, title: 'Step 1: Pick Date & Time', desc: 'Choose your preferred date and available time slot from the calendar' },
  { icon: <CreditCard className="w-7 h-7 text-white" />, title: 'Step 2: Confirm & Pay', desc: 'Scan the QR code or pay online and upload proof' },
  { icon: <Trophy className="w-7 h-7 text-white" />, title: 'Step 3: Play & Enjoy', desc: 'Show up and play! Field and equipment will be ready for you' },
];

const stats = [
  { value: '70K+', label: 'Happy Players' },
  { value: '9+', label: 'Sports Facilities' },
  { value: '800+', label: 'Monthly Bookings' },
  { value: '4.9★', label: 'Average Rating' },
];

const features = [
  { icon: <Zap className="w-6 h-6" />, color: 'bg-yellow-500', title: '360° Design', desc: 'Circular field layout with no dead corners – continuous play guaranteed' },
  { icon: <Users className="w-6 h-6" />, color: 'bg-purple-500', title: 'On-Field Subs', desc: 'Substitutes stay on the field with 3 players per side' },
  { icon: <Sun className="w-6 h-6" />, color: 'bg-orange-500', title: 'Pro Floodlights', desc: 'High-power LED lighting for crystal-clear night games' },
  { icon: <Shield className="w-6 h-6" />, color: 'bg-blue-500', title: '24/7 Security', desc: 'CCTV surveillance and on-site security guards round the clock' },
  { icon: <CheckCircle className="w-6 h-6" />, color: 'bg-green-500', title: 'Premium Turf', desc: 'Top-grade artificial grass suitable for football and cricket' },
  { icon: <Moon className="w-6 h-6" />, color: 'bg-indigo-500', title: 'Open 24 Hours', desc: 'Book any slot, day or night – we never close' },
  { icon: <Trophy className="w-6 h-6" />, color: 'bg-yellow-600', title: 'Tournaments', desc: 'Regular hosted tournaments with prizes and live scoring' },
  { icon: <Car className="w-6 h-6" />, color: 'bg-teal-500', title: 'Free Parking', desc: 'Spacious parking for cars and bikes right at the entrance' },
];

const amenities = [
  { icon: '🚗', label: 'Parking',Des:"Spacious parking area" },
  { icon: '👕', label: 'Changing Room ',Des:"Clean changing facilities" },
  { icon: '🏥', label: 'First Aid',Des:"Emergency medical kit" },
  { icon: '💧', label: 'Drinking Water' ,Des:"Pure drinking water"},
  { icon: '🚻', label: 'Washrooms' ,Des:"Clean & hygienic"},
  { icon: '🏏', label: 'Equipment Rental' ,Des:"Sports equipment available"},
];

const reviews = [
  { name: 'Arjun K.', rating: 5, text: 'Best turf in Sivakasi! Floodlights are superb and the surface is top quality.', avatar: 'AK' },
  { name: 'Priya M.', rating: 5, text: 'Booked online in 2 minutes. Smooth process and great facilities.', avatar: 'PM' },
  { name: 'Karthik R.', rating: 5, text: 'Organized a tournament here – staff was excellent and the field was perfect.', avatar: 'KR' },
];

const images = [hero1, hero2, hero3, hero4];

function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const slider = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(slider);
  }, []);

  return (
    <section
      className="relative min-h-[90vh] mt-15 flex items-center bg-cover bg-center transition-all duration-1000"
      style={{ backgroundImage: `url(${images[current]})` }}
    >
      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/25"></div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT CONTENT */}
        <div className="text-white">
          <span className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 text-green-400 text-sm px-4 py-1.5 rounded-full font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" /> Premium Sports Facility — Sivakasi
          </span>

          <h1 className="font-display text-5xl sm:text-7xl tracking-wider leading-none mb-6">
            HYPERGREEN<br />
            <span className="text-green-400">360 TURF</span>
          </h1>

          <p className="text-gray-300 text-lg mb-8 max-w-md">
            Football & Cricket with professional floodlights. Our unique 360° circular field delivers a playing experience unlike any other.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/booking"
              className="bg-green-500 hover:bg-green-400 text-white px-8 py-3 rounded-xl font-bold text-lg"
            >
              Book Now
            </Link>

            <Link
              to="/gallery"
              className="border border-gray-500 hover:border-green-400 text-gray-300 hover:text-white px-8 py-3 rounded-xl font-bold text-lg"
            >
              View Gallery
            </Link>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="hidden md:block">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-white">

            <div className="text-center mb-6">
              <div className="text-4xl mb-2">⚽</div>
              <h3 className="text-2xl text-green-400 font-bold">
                NEXT AVAILABLE SLOT
              </h3>
            </div>

            <div className="space-y-3">
              {[
                "6:00 PM – 7:00 PM ₹1000",
                "7:00 PM – 8:00 PM ₹1000",
                "8:00 PM – 9:00 PM ₹1000",
              ].map((slot, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-green-500/20 border border-green-500/40 rounded-lg px-4 py-2 text-sm"
                >
                  <span>{slot}</span>
                  <span className="text-green-400 font-bold text-xs">
                    AVAILABLE
                  </span>
                </div>
              ))}
            </div>

            <Link
              to="/booking"
              className="mt-5 block text-center bg-green-500 hover:bg-green-400 text-white rounded-xl py-3 font-bold"
            >
              Check All Slots →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const HomePage = () => {
  return (
    <div className="pt-[72px]">
      {/* hero */}
      <Hero/>
    

      {/* Stats */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-10 text-center text-black">
          {stats.map(s => (
            <div key={s.label}>
              <div className="font-display text-5xl tracking-wider">{s.value}</div>
              <div className="text-gray-500 text-md font-bold mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-5xl tracking-wider text-gray-900 mb-3">PREMIUM FEATURES</h2>
            <p className="text-gray-500 text-lg">Experience the revolution in sports facilities with our unique 360° design</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 card-hover shadow-sm">
                <div className={`${f.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4`}>{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl tracking-wider text-gray-900 mb-2">ESSENTIAL AMENITIES</h2>
          <p className="text-gray-500 mb-10">Everything you need for a complete sports experience</p>
          <div className="grid grid-cols-2 md:grid-cols-6  gap-10">
            {amenities.map(a => (
              <div key={a.label} className="flex flex-col items-center gap-2">
                <div className="text-4xl">{a.icon}</div>
                <span className="text-md font-bold text-black-600 w-50  ">{a.label}</span>
                <div className="text-sm w-50">{a.Des}</div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-5xl tracking-wider text-gray-900 mb-3">BOOK IN 3 STEPS</h2>
            <p className="text-gray-500">Quick and hassle-free booking process</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(140deg, green, blue)' }}>
                  {step.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
                {i < 2 && <ChevronRight className="w-6 h-6 text-green-400 mx-auto mt-4 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-5xl tracking-wider text-gray-900 mb-3">SIMPLE PRICING</h2>
            <p className="text-gray-500">Transparent rates, no hidden charges</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border-2 border-gray-200 rounded-2xl p-8 text-center card-hover">
              <div className="text-4xl mb-3">☀️</div>
              <h3 className="font-bold text-xl mb-1">Day Time</h3>
              <p className="text-gray-400 text-sm mb-4">6:00 AM – 6:00 PM</p>
              <div className="mb-4">
                <span className="text-gray-400 line-through text-sm">₹800</span>
                <span className="font-display text-4xl text-gray-900 ml-2">₹600</span>
                <span className="text-gray-400 text-sm">/hour</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                {['Natural lighting', 'Less crowded hours', 'Practice sessions', 'Free drinking water'].map(f => (
                  <li key={f} className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <Link to="/booking" className="block bg-gradient-to-r from-green-500 to-blue-500 hover:bg-green-600 text-white rounded-xl py-3 font-bold transition-colors">Book Now</Link>
            </div>
            <div className="relative bg-gradient-to-r from-green-600 to-blue-500 rounded-2xl p-8 text-center text-white shadow-xl">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full">MOST POPULAR</span>
              <div className="text-4xl mb-3">🌙</div>
              <h3 className="font-bold text-xl mb-1">Night Time</h3>
              <p className="text-green-200 text-sm mb-4">6:00 PM – 6:00 AM</p>
              <div className="mb-4">
                <span className="text-green-300 line-through text-sm">₹1200</span>
                <span className="font-display text-4xl ml-2">₹1000</span>
                <span className="text-green-200 text-sm">/hour</span>
              </div>
              <ul className="text-sm text-green-100 space-y-2 mb-6 text-left">
                {['LED floodlights', 'Prime playing hours', 'Perfect for matches', 'Free parking'].map(f => (
                  <li key={f} className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-300 shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <Link to="/booking" className="block bg-white text-green-700 rounded-xl py-3 font-bold transition-colors hover:bg-green-50">Book Now</Link>
            </div>
            <div className="border-2 border-gray-200 rounded-2xl p-8 text-center card-hover">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-bold text-xl mb-1">Tournaments</h3>
              <p className="text-gray-400 text-sm mb-4">Sat 6 PM – Sun 3 AM</p>
              <div className="mb-4">
                <span className="text-gray-400 line-through text-sm">₹1500</span>
                <span className="font-display text-4xl text-gray-900 ml-2">₹1000</span>
                <span className="text-gray-400 text-sm">/team</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                {['Dedicated referee', 'Trophy & cash prizes', 'Live scoreboard', 'Team photography'].map(f => (
                  <li key={f} className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <a href="tel:8056564775" className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:bg-green-600 text-white rounded-xl py-3 font-bold transition-colors">
                <Phone className="w-4 h-4" /> Call Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-5xl tracking-wider text-gray-900 mb-3">WHAT PLAYERS SAY</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map(r => (
              <div key={r.name} className="bg-white rounded-2xl p-6 shadow-sm card-hover">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4 italic">"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{r.avatar}</div>
                  <span className="font-semibold text-gray-900 text-sm">{r.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-green-700 to-blue-700 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-5xl tracking-wider mb-4">READY TO PLAY?</h2>
          <p className="text-green-100 font-bold text-lg mb-8">
            Join 30,000+ players who trust HyperGreen 360 Turf for their sports needs.<br />
            Book your favourite Turf today!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/booking" className="bg-white text-green-700 hover:bg-green-50 px-8 py-3 rounded-xl font-bold text-lg transition-colors">
              Book Now
            </Link>
            <a href="tel:8056564775" className="border border-white hover:bg-white/10 text-white px-8 py-3 rounded-xl font-bold text-lg transition-colors flex items-center gap-2">
              <Phone className="w-5 h-5" /> Call Us
            </a>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-6 text-white">
            <div>
              <CheckCircle className="w-8 h-8 inline mr-1 text-green-300" />
              <span className="font-bold">Instant Booking</span><br />
              <span className="text-sm text-green-100">Confirm your slot in seconds</span>
            </div>
            <div>
              <CheckCircle className="w-8 h-8 inline mr-1 text-green-300" />
              <span className="font-bold">Best Prices</span><br />
              <span className="text-sm text-green-100">Competitive rates guaranteed</span>
            </div>
            <div>
              <CheckCircle className="w-8 h-8 inline mr-1 text-green-300" />
              <span className="font-bold">24/7 Support</span><br />
              <span className="text-sm text-green-100">We're always here to help</span>
            </div>
          </div>
        </div>
      </section>
      {/* ══════════════════════ FIND US HERE ══════════════════════ */}
      <section className="py-15 bg-white">
        <div className="max-w-10xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-5xl tracking-wider text-gray-900 mb-3">FIND US HERE</h2>
            <p className="text-gray-500 text-lg">Located in the heart of Sivakasi, easily accessible from all major areas</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start ">
            {/* ── MAP ── */}
            <div className="rounded-2xl px-5 overflow-hidden shadow-lg border border-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3942.485!2d77.8042!3d9.4534!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b06cf5b3f6a1f9d%3A0x4a1f2e3b4c5d6e7f!2sSivakasi%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="400"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="HyperGreen 360 Turf Location"
              />
              <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-t border-gray-100">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  Housing Board, Sivakasi
                </span>
                <a
                  href="https://maps.google.com/?q=9.4534,77.8042"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Open in Maps ↗
                </a>
              </div>
            </div>

            {/* ── CONTACT INFO ── */}
            <div className="space-y-0 px-5 ">
              {/* Address */}
              <h2 className="font-bold text-xl text-gray-900 mb-2">Visit Our Facility</h2>

              <div className="bg-gray-50 rounded-2xl p-6 flex gap-4 items-start card-hover">
                <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Address</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Housing Board, Near Water Tank,<br />
                    Sivakasi – 626 123, Tamil Nadu, India
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    <span className="font-semibold">Landmark:</span> Opposite Housing Board Police Station<br />
                    <span className="font-semibold">Route:</span> Sivakasi to Srivilliputhur Main Road
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-gray-50 rounded-2xl p-6 flex gap-4 items-start card-hover">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Phone / WhatsApp</h4>
                  <a href="tel:8056564775" className="text-green-600 font-semibold hover:underline text-sm">
                    +91 80565 64775
                  </a>
                  <p className="text-gray-400 text-xs mt-1">Available 24/7 for bookings & queries</p>
                </div>
              </div>

              {/* Email */}
              <div className="bg-gray-50 rounded-2xl p-6 flex gap-4 items-start card-hover">
                <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                  <a href="mailto:info@hypergreen360.com" className="text-green-600 font-semibold hover:underline text-sm">
                    info@hypergreen360.com
                  </a>
                  <p className="text-gray-400 text-xs mt-1">We reply within 24 hours</p>
                </div>
              </div>

              {/* Hours */}
              <div className="bg-gray-50 rounded-2xl p-6 flex gap-4 items-start card-hover">
                <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Operating Hours</h4>
                  <p className="text-gray-600 text-sm font-semibold">Open 24 Hours · 7 Days a Week</p>
                  <p className="text-gray-400 text-xs mt-1">Book anytime — we're always ready</p>
                </div>
              </div>

              {/* GPS + Directions */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wide">GPS Coordinates</span>
                  <p className="text-green-800 font-mono text-sm mt-0.5">9.4534°N, 77.8042°E</p>
                </div>
                <a
                  href="https://maps.google.com/?q=9.4534,77.8042"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;