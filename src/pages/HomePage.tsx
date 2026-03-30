import { Link } from 'react-router-dom';
import {
  Zap, Shield, Sun, Moon, Users, Trophy, Car,
  CheckCircle, Star, ChevronRight, Phone, MapPin, Mail, Clock, Navigation
} from 'lucide-react';
import { Calendar, CreditCard } from 'lucide-react';
import { useEffect, useState, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

import hero1 from "../assets/hero/hero1.png";
import hero2 from "../assets/hero/hero2.png";
import hero3 from "../assets/hero/hero3.jpg";
import hero4 from "../assets/hero/hero4.jpg";

/* ─── data ─── */
const steps = [
  { icon: <Calendar className="w-7 h-7 text-white" />, title: 'Pick Date & Time', desc: 'Choose your preferred date and available time slot from the calendar' },
  { icon: <CreditCard className="w-7 h-7 text-white" />, title: 'Confirm & Pay', desc: 'Scan the QR code or pay online and upload proof' },
  { icon: <Trophy className="w-7 h-7 text-white" />, title: 'Play & Enjoy', desc: 'Show up and play! Field and equipment will be ready for you' },
];

const stats = [
  { value: '70K+', label: 'Happy Players' },
  { value: '9+', label: 'Sports Facilities' },
  { value: '800+', label: 'Monthly Bookings' },
  { value: '4.9★', label: 'Average Rating' },
];

const features = [
  { icon: <Zap className="w-6 h-6" />, gradient: 'from-yellow-400 to-orange-500', title: '360° Design', desc: 'Circular field layout with no dead corners – continuous play guaranteed' },
  { icon: <Users className="w-6 h-6" />, gradient: 'from-purple-400 to-pink-500', title: 'On-Field Subs', desc: 'Substitutes stay on the field with 3 players per side' },
  { icon: <Sun className="w-6 h-6" />, gradient: 'from-orange-400 to-red-500', title: 'Pro Floodlights', desc: 'High-power LED lighting for crystal-clear night games' },
  { icon: <Shield className="w-6 h-6" />, gradient: 'from-blue-400 to-cyan-500', title: '24/7 Security', desc: 'CCTV surveillance and on-site security guards round the clock' },
  { icon: <CheckCircle className="w-6 h-6" />, gradient: 'from-green-400 to-emerald-500', title: 'Premium Turf', desc: 'Top-grade artificial grass suitable for football and cricket' },
  { icon: <Moon className="w-6 h-6" />, gradient: 'from-indigo-400 to-violet-500', title: 'Open 24 Hours', desc: 'Book any slot, day or night – we never close' },
  { icon: <Trophy className="w-6 h-6" />, gradient: 'from-amber-400 to-yellow-600', title: 'Tournaments', desc: 'Regular hosted tournaments with prizes and live scoring' },
  { icon: <Car className="w-6 h-6" />, gradient: 'from-teal-400 to-green-500', title: 'Free Parking', desc: 'Spacious parking for cars and bikes right at the entrance' },
];

const amenities = [
  { icon: '🚗', label: 'Parking', Des: 'Spacious parking area' },
  { icon: '👕', label: 'Changing Room', Des: 'Clean changing facilities' },
  { icon: '🏥', label: 'First Aid', Des: 'Emergency medical kit' },
  { icon: '💧', label: 'Drinking Water', Des: 'Pure drinking water' },
  { icon: '🚻', label: 'Washrooms', Des: 'Clean & hygienic' },
  { icon: '🏏', label: 'Equipment Rental', Des: 'Sports equipment available' },
];

const reviews = [
  { name: 'Arjun K.', rating: 5, text: 'Best turf in Sivakasi! Floodlights are superb and the surface is top quality.', avatar: 'AK', role: 'Football Enthusiast', gradient: 'from-green-400 to-emerald-500' },
  { name: 'Priya M.', rating: 5, text: 'Booked online in 2 minutes. Smooth process and great facilities.', avatar: 'PM', role: 'Regular Player', gradient: 'from-blue-400 to-cyan-500' },
  { name: 'Karthik R.', rating: 5, text: 'Organized a tournament here – staff was excellent and the field was perfect.', avatar: 'KR', role: 'Tournament Organizer', gradient: 'from-purple-400 to-pink-500' },
];

const images = [hero1, hero2, hero3, hero4];

/* ─── reusable scroll-reveal wrapper ─── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── floating particles background ─── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-green-400/20"
          style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        />
      ))}
    </div>
  );
}

/* ─── animated counter ─── */
function AnimatedStat({ value, label }: { value: string; label: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const numericPart = value.replace(/[^0-9.]/g, '');
  const suffix = value.replace(/[0-9.]/g, '');
  const [count, setCount] = useState(0);
  const target = parseFloat(numericPart) || 0;

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const duration = 2000;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
      className="text-center"
    >
      <div className="font-display text-5xl md:text-6xl tracking-wider bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
        {count}{suffix}
      </div>
      <div className="text-gray-500 text-md font-bold mt-2">{label}</div>
    </motion.div>
  );
}

/* ─── 3D review card ─── */
function Review3DCard({ review, index }: { review: typeof reviews[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  function handleMouse(e: ReactMouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateX.set((py - 0.5) * -15);
    rotateY.set((px - 0.5) * 15);
    glowX.set(px * 100);
    glowY.set(py * 100);
  }

  function handleLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: 10 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 800 }}
    >
      <motion.div
        onMouseMove={handleMouse}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="group relative rounded-3xl h-full"
      >
        {/* animated gradient border glow */}
        <motion.div
          className="absolute -inset-[1px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[2px]"
          style={{ background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }}
        >
          <div className={`w-full h-full rounded-3xl bg-gradient-to-br ${review.gradient} opacity-50`} />
        </motion.div>

        {/* card body */}
        <div className="relative bg-white rounded-3xl p-7 h-full border border-gray-100 group-hover:border-transparent transition-all duration-500 overflow-hidden">

          {/* mouse-following glow */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(34,197,94,0.06) 0%, transparent 60%)`,
            }}
          />

          {/* shimmer sweep */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-out rotate-12" />
          </div>

          {/* quote icon */}
          <motion.div
            className={`absolute top-5 right-5 text-5xl font-serif bg-gradient-to-br ${review.gradient} bg-clip-text text-transparent opacity-10 group-hover:opacity-25 transition-opacity duration-500`}
            style={{ transformStyle: 'preserve-3d', transform: 'translateZ(20px)' }}
          >
            "
          </motion.div>

          {/* stars with stagger */}
          <div className="flex gap-1.5 mb-4" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(25px)' }}>
            {Array.from({ length: review.rating }).map((_, j) => (
              <motion.div
                key={j}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                transition={{ delay: 0.5 + index * 0.15 + j * 0.08, type: 'spring', stiffness: 300 }}
              >
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
              </motion.div>
            ))}
          </div>

          {/* review text */}
          <div style={{ transformStyle: 'preserve-3d', transform: 'translateZ(30px)' }}>
            <p className="text-gray-600 text-[15px] mb-6 italic leading-relaxed">
              "{review.text}"
            </p>
          </div>

          {/* divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-5 group-hover:via-green-300 transition-colors duration-500" />

          {/* author */}
          <div className="flex items-center gap-4" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(35px)' }}>
            <motion.div
              className={`relative w-12 h-12 bg-gradient-to-br ${review.gradient} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg`}
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {review.avatar}
              {/* ring pulse */}
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${review.gradient}`}
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
              />
            </motion.div>
            <div>
              <span className="font-bold text-gray-900 text-sm block">{review.name}</span>
              <span className={`text-xs font-semibold bg-gradient-to-r ${review.gradient} bg-clip-text text-transparent`}>
                {review.role}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── 3D tilt card ─── */
function Feature3DCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  function handleMouse(e: ReactMouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateX.set((py - 0.5) * -20);
    rotateY.set((px - 0.5) * 20);
    glowX.set(px * 100);
    glowY.set(py * 100);
  }

  function handleLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: 15 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 800 }}
    >
      <motion.div
        onMouseMove={handleMouse}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="group relative rounded-3xl cursor-default h-full"
      >
        {/* animated gradient border */}
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-green-400/40 group-hover:via-blue-400/40 group-hover:to-purple-400/40 transition-all duration-500 blur-[1px]" />

        {/* card body */}
        <div className="relative bg-white rounded-3xl p-7 h-full border border-gray-100 group-hover:border-transparent transition-colors duration-500 overflow-hidden">

          {/* hover glow spotlight */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(34,197,94,0.08) 0%, transparent 60%)`,
            }}
          />

          {/* shimmer line */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-out rotate-12" />
          </div>

          {/* icon with 3D pop */}
          <motion.div
            className={`relative bg-gradient-to-br ${feature.gradient} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg`}
            style={{ transformStyle: 'preserve-3d', transform: 'translateZ(40px)' }}
            whileHover={{ scale: 1.15, rotate: 8 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {feature.icon}
            {/* icon glow ring */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500`} />
          </motion.div>

          {/* text with 3D depth */}
          <div style={{ transformStyle: 'preserve-3d', transform: 'translateZ(30px)' }}>
            <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300">
              {feature.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
          </div>

          {/* bottom accent bar */}
          <div className="mt-5 h-1 w-0 group-hover:w-full rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 transition-all duration-500 ease-out" />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── HERO ─── */
function Hero() {
  const [current, setCurrent] = useState(0);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  useEffect(() => {
    const slider = setInterval(() => setCurrent((prev) => (prev + 1) % images.length), 5000);
    return () => clearInterval(slider);
  }, []);

  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      {/* background images with crossfade */}
      <AnimatePresence mode="sync">
        <motion.img
          key={current}
          src={images[current]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
      </AnimatePresence>

      {/* gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <FloatingParticles />

      <motion.div
        className="relative max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center w-full"
        style={{ opacity: heroOpacity }}
      >
        {/* LEFT */}
        <div className="text-white">
          <motion.span
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 text-green-400 text-sm px-4 py-1.5 rounded-full font-semibold mb-6 backdrop-blur-sm"
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="w-3.5 h-3.5" />
            </motion.span>
            Premium Sports Facility — Sivakasi
          </motion.span>

          <motion.h1
            className="font-display text-6xl sm:text-8xl tracking-wider leading-none mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            HYPERGREEN
            <br />
            <motion.span
              className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% 200%' }}
            >
              360 TURF
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-gray-300 text-lg mb-8 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Football & Cricket with professional floodlights. Our unique 360° circular field delivers a playing experience unlike any other.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link
              to="/booking"
              className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-3.5 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Book Now
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ChevronRight className="w-5 h-5" />
                </motion.span>
              </span>
            </Link>

            <Link
              to="/gallery"
              className="border border-white/30 hover:border-green-400 text-gray-300 hover:text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all duration-300 backdrop-blur-sm hover:bg-white/5"
            >
              View Gallery
            </Link>
          </motion.div>
        </div>

        {/* RIGHT CARD */}
        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, x: 60, rotateY: 10 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-white shadow-2xl"
            whileHover={{ y: -5, boxShadow: '0 25px 60px rgba(34,197,94,0.15)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <motion.div
                className="text-5xl mb-2"
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                ⚽
              </motion.div>
              <h3 className="text-2xl bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent font-bold">
                NEXT AVAILABLE SLOT
              </h3>
            </div>

            <div className="space-y-3">
              {['6:00 PM – 7:00 PM ₹1000', '7:00 PM – 8:00 PM ₹1000', '8:00 PM – 9:00 PM ₹1000'].map((slot, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.15 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-center justify-between bg-green-500/15 border border-green-500/30 rounded-xl px-4 py-3 text-sm backdrop-blur-sm"
                >
                  <span>{slot}</span>
                  <motion.span
                    className="text-green-400 font-bold text-xs"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  >
                    AVAILABLE
                  </motion.span>
                </motion.div>
              ))}
            </div>

            <Link
              to="/booking"
              className="mt-5 block text-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl py-3 font-bold transition-all duration-300"
            >
              Check All Slots →
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
          <motion.div
            className="w-1.5 h-1.5 bg-green-400 rounded-full"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}

/* ─── MAIN PAGE ─── */
const HomePage = () => {
  return (
    <div>
      <Hero />

      {/* ═══ Stats ═══ */}
      <section className="relative bg-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-10 relative">
          {stats.map((s) => (
            <AnimatedStat key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* ambient blobs */}
        <motion.div
          className="absolute top-20 left-10 w-[500px] h-[500px] bg-green-400/[0.04] rounded-full blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-400/[0.04] rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/[0.03] rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="max-w-7xl mx-auto px-4 relative">
          <Reveal>
            <div className="text-center mb-16">
              <motion.span
                className="inline-block text-sm font-bold tracking-widest uppercase mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Why Choose Us
              </motion.span>
              <h2 className="font-display text-5xl md:text-6xl tracking-wider text-gray-900 mb-3">PREMIUM FEATURES</h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">Experience the revolution in sports facilities with our unique 360° design</p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Feature3DCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Amenities ═══ */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Reveal>
            <span className="text-sm font-bold text-green-600 tracking-widest uppercase mb-2 block">Facilities</span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wider text-gray-900 mb-2">ESSENTIAL AMENITIES</h2>
            <p className="text-gray-500 mb-12">Everything you need for a complete sports experience</p>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {amenities.map((a, i) => (
              <Reveal key={a.label} delay={i * 0.08}>
                <motion.div
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-gray-50 border border-gray-100"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgb(240 253 244)' }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="text-4xl"
                    whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {a.icon}
                  </motion.div>
                  <span className="text-sm font-bold text-gray-900">{a.label}</span>
                  <div className="text-xs text-gray-500">{a.Des}</div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)]" />

        <div className="max-w-5xl mx-auto px-4 relative">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-sm font-bold text-green-400 tracking-widest uppercase mb-2 block">Simple Process</span>
              <h2 className="font-display text-5xl md:text-6xl tracking-wider mb-3">BOOK IN 3 STEPS</h2>
              <p className="text-gray-400">Quick and hassle-free booking process</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-green-500/50 via-blue-500/50 to-purple-500/50" />

            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="text-center relative">
                  <motion.div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10"
                    style={{ background: `linear-gradient(140deg, ${['#22c55e', '#3b82f6', '#a855f7'][i]}, ${['#3b82f6', '#a855f7', '#ec4899'][i]})` }}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {step.icon}
                  </motion.div>
                  <span className="text-xs font-bold text-green-400 tracking-widest uppercase mb-1 block">Step {i + 1}</span>
                  <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Pricing ═══ */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto px-4 relative">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-sm font-bold text-green-600 tracking-widest uppercase mb-2 block">Affordable Rates</span>
              <h2 className="font-display text-5xl md:text-6xl tracking-wider text-gray-900 mb-3">SIMPLE PRICING</h2>
              <p className="text-gray-500">Transparent rates, no hidden charges</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Day */}
            <Reveal delay={0}>
              <motion.div
                className="border-2 border-gray-100 rounded-3xl p-8 text-center bg-white"
                whileHover={{ y: -8, borderColor: 'rgb(34 197 94 / 0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-3">☀️</div>
                <h3 className="font-bold text-xl mb-1">Day Time</h3>
                <p className="text-gray-400 text-sm mb-4">6:00 AM – 6:00 PM</p>
                <div className="mb-6">
                  <span className="text-gray-400 line-through text-sm">₹800</span>
                  <span className="font-display text-5xl text-gray-900 ml-2">₹600</span>
                  <span className="text-gray-400 text-sm">/hr</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-3 mb-8 text-left">
                  {['Natural lighting', 'Less crowded hours', 'Practice sessions', 'Free drinking water'].map(f => (
                    <li key={f} className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{f}</li>
                  ))}
                </ul>
                <Link to="/booking" className="block bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl py-3 font-bold transition-all duration-300 hover:shadow-lg">
                  Book Now
                </Link>
              </motion.div>
            </Reveal>

            {/* Night — featured */}
            <Reveal delay={0.1}>
              <motion.div
                className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-blue-600 rounded-3xl p-8 text-center text-white shadow-xl md:-mt-4"
                whileHover={{ y: -10, boxShadow: '0 30px 60px rgba(34,197,94,0.25)' }}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 text-xs font-bold px-5 py-1.5 rounded-full shadow-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  MOST POPULAR
                </motion.span>
                <div className="text-4xl mb-3">🌙</div>
                <h3 className="font-bold text-xl mb-1">Night Time</h3>
                <p className="text-green-200 text-sm mb-4">6:00 PM – 6:00 AM</p>
                <div className="mb-6">
                  <span className="text-green-300 line-through text-sm">₹1200</span>
                  <span className="font-display text-5xl ml-2">₹1000</span>
                  <span className="text-green-200 text-sm">/hr</span>
                </div>
                <ul className="text-sm text-green-100 space-y-3 mb-8 text-left">
                  {['LED floodlights', 'Prime playing hours', 'Perfect for matches', 'Free parking'].map(f => (
                    <li key={f} className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-300 shrink-0 mt-0.5" />{f}</li>
                  ))}
                </ul>
                <Link to="/booking" className="block bg-white text-green-700 rounded-xl py-3 font-bold transition-all duration-300 hover:bg-green-50 hover:shadow-lg">
                  Book Now
                </Link>
              </motion.div>
            </Reveal>

            {/* Tournament */}
            <Reveal delay={0.2}>
              <motion.div
                className="border-2 border-gray-100 rounded-3xl p-8 text-center bg-white"
                whileHover={{ y: -8, borderColor: 'rgb(34 197 94 / 0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="font-bold text-xl mb-1">Tournaments</h3>
                <p className="text-gray-400 text-sm mb-4">Sat 6 PM – Sun 3 AM</p>
                <div className="mb-6">
                  <span className="text-gray-400 line-through text-sm">₹1500</span>
                  <span className="font-display text-5xl text-gray-900 ml-2">₹1000</span>
                  <span className="text-gray-400 text-sm">/team</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-3 mb-8 text-left">
                  {['Dedicated referee', 'Trophy & cash prizes', 'Live scoreboard', 'Team photography'].map(f => (
                    <li key={f} className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{f}</li>
                  ))}
                </ul>
                <a href="tel:8056564775" className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl py-3 font-bold transition-all duration-300 hover:shadow-lg">
                  <Phone className="w-4 h-4" /> Call Us
                </a>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ Reviews ═══ */}
      <section className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* ambient blobs */}
        <motion.div
          className="absolute top-10 right-20 w-[400px] h-[400px] bg-purple-400/[0.04] rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 left-20 w-[400px] h-[400px] bg-green-400/[0.04] rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="max-w-5xl mx-auto px-4 relative">
          <Reveal>
            <div className="text-center mb-16">
              <motion.span
                className="inline-block text-sm font-bold tracking-widest uppercase mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Testimonials
              </motion.span>
              <h2 className="font-display text-5xl md:text-6xl tracking-wider text-gray-900 mb-3">WHAT PLAYERS SAY</h2>
              <p className="text-gray-500 text-lg max-w-md mx-auto">Trusted by thousands of players across Sivakasi</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-7">
            {reviews.map((r, i) => (
              <Review3DCard key={r.name} review={r} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-emerald-700 to-blue-700" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <Reveal>
            <motion.h2
              className="font-display text-5xl md:text-7xl tracking-wider text-white mb-5"
            >
              READY TO PLAY?
            </motion.h2>
            <p className="text-green-100 font-bold text-lg mb-10">
              Join 30,000+ players who trust HyperGreen 360 Turf for their sports needs.
              <br />Book your favourite Turf today!
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link
                to="/booking"
                className="group bg-white text-green-700 hover:bg-green-50 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-2"
              >
                Book Now
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ChevronRight className="w-5 h-5" />
                </motion.span>
              </Link>
              <a href="tel:8056564775" className="border-2 border-white/30 hover:border-white hover:bg-white/10 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-2">
                <Phone className="w-5 h-5" /> Call Us
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-white">
              {[
                { label: 'Instant Booking', sub: 'Confirm your slot in seconds' },
                { label: 'Best Prices', sub: 'Competitive rates guaranteed' },
                { label: '24/7 Support', sub: "We're always here to help" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                  whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <CheckCircle className="w-7 h-7 text-green-300 mx-auto mb-2" />
                  <span className="font-bold block">{item.label}</span>
                  <span className="text-sm text-green-100">{item.sub}</span>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ Find Us ═══ */}
      <section className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* ambient blobs */}
        <motion.div
          className="absolute top-20 left-10 w-[500px] h-[500px] bg-green-400/[0.04] rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-blue-400/[0.04] rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 25, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="max-w-7xl mx-auto px-4 relative">
          <Reveal>
            <div className="text-center mb-16">
              <motion.span
                className="inline-block text-sm font-bold tracking-widest uppercase mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Location
              </motion.span>
              <h2 className="font-display text-5xl md:text-6xl tracking-wider text-gray-900 mb-3">FIND US HERE</h2>
              <p className="text-gray-500 text-lg">Located in the heart of Sivakasi, easily accessible from all major areas</p>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* MAP — 3D card */}
            <Reveal>
              <motion.div
                className="group relative rounded-3xl"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                style={{ perspective: 800 }}
              >
                {/* gradient border glow */}
                <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-green-400/30 via-blue-400/20 to-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[2px]" />

                <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 group-hover:border-transparent transition-all duration-500 shadow-sm group-hover:shadow-2xl">
                  {/* shimmer */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-10">
                    <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-out rotate-12" />
                  </div>

                  <div className="relative overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3942.485!2d77.8042!3d9.4534!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b06cf5b3f6a1f9d%3A0x4a1f2e3b4c5d6e7f!2sSivakasi%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                      width="100%"
                      height="380"
                      style={{ border: 0, display: 'block' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="HyperGreen 360 Turf Location"
                    />
                  </div>

                  <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <MapPin className="w-4 h-4 text-green-500" />
                      </motion.div>
                      Housing Board, Sivakasi
                    </span>
                    <motion.a
                      href="https://maps.google.com/?q=9.4534,77.8042"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                      whileHover={{ x: 3 }}
                    >
                      <Navigation className="w-4 h-4 text-green-600" />
                      Open in Maps
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </Reveal>

            {/* CONTACT CARDS */}
            <div className="space-y-4">
              <Reveal>
                <h2 className="font-bold text-xl text-gray-900 mb-2 flex items-center gap-2">
                  Visit Our Facility
                  <motion.div
                    className="w-2 h-2 rounded-full bg-green-500"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </h2>
              </Reveal>

              {[
                { icon: <MapPin className="w-5 h-5" />, iconColor: 'text-green-600', gradient: 'from-green-400 to-emerald-500', bg: 'bg-green-50', title: 'Address', content: <><p className="text-gray-600 text-sm leading-relaxed">Housing Board, Near Water Tank,<br />Sivakasi – 626 123, Tamil Nadu, India</p><p className="text-xs text-gray-400 mt-2"><span className="font-semibold">Landmark:</span> Opposite Housing Board Police Station<br /><span className="font-semibold">Route:</span> Sivakasi to Srivilliputhur Main Road</p></> },
                { icon: <Phone className="w-5 h-5" />, iconColor: 'text-blue-600', gradient: 'from-blue-400 to-cyan-500', bg: 'bg-blue-50', title: 'Phone / WhatsApp', content: <><a href="tel:8056564775" className="text-green-600 font-semibold hover:underline text-sm">+91 80565 64775</a><p className="text-gray-400 text-xs mt-1">Available 24/7 for bookings & queries</p></> },
                { icon: <Mail className="w-5 h-5" />, iconColor: 'text-orange-600', gradient: 'from-orange-400 to-red-500', bg: 'bg-orange-50', title: 'Email', content: <><a href="mailto:info@hypergreen360.com" className="text-green-600 font-semibold hover:underline text-sm">info@hypergreen360.com</a><p className="text-gray-400 text-xs mt-1">We reply within 24 hours</p></> },
                { icon: <Clock className="w-5 h-5" />, iconColor: 'text-violet-600', gradient: 'from-violet-400 to-purple-500', bg: 'bg-violet-50', title: 'Operating Hours', content: <><p className="text-gray-600 text-sm font-semibold">Open 24 Hours · 7 Days a Week</p><p className="text-gray-400 text-xs mt-1">Book anytime — we're always ready</p></> },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 0.1}>
                  <motion.div
                    className="group/card relative rounded-2xl"
                    whileHover={{ x: 6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{ perspective: 600 }}
                  >
                    {/* gradient border on hover */}
                    <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r ${item.gradient} opacity-0 group-hover/card:opacity-30 transition-opacity duration-500 blur-[1px]`} />

                    <div className="relative bg-white rounded-2xl p-5 flex gap-4 items-start border border-gray-100 group-hover/card:border-transparent transition-all duration-500 overflow-hidden">
                      {/* shimmer */}
                      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover/card:opacity-100 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-all duration-700 ease-out rotate-12" />
                      </div>

                      {/* icon with glow */}
                      <motion.div
                        className={`relative w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center shrink-0 ${item.iconColor}`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {item.icon}
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover/card:opacity-20 blur-lg transition-opacity duration-500`} />
                      </motion.div>

                      <div className="relative">
                        <h4 className="font-bold text-gray-900 mb-1 group-hover/card:text-transparent group-hover/card:bg-gradient-to-r group-hover/card:from-gray-900 group-hover/card:to-gray-600 group-hover/card:bg-clip-text transition-all duration-300">{item.title}</h4>
                        {item.content}
                      </div>
                    </div>
                  </motion.div>
                </Reveal>
              ))}

              {/* Get Directions CTA */}
              <Reveal delay={0.4}>
                <motion.div
                  className="group/dir relative rounded-2xl"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 opacity-30 group-hover/dir:opacity-60 transition-opacity duration-500 blur-[1px]" />

                  <div className="relative bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-5 border border-green-100 group-hover/dir:border-transparent transition-all duration-500 overflow-hidden">
                    {/* shimmer */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover/dir:opacity-100 translate-x-[-100%] group-hover/dir:translate-x-[100%] transition-all duration-1000 ease-out rotate-12" />
                    </div>

                    <div className="flex items-center justify-between relative">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Ready to visit?</p>
                        <p className="text-gray-500 text-xs">Get turn-by-turn directions to our facility</p>
                      </div>
                      <motion.a
                        href="https://maps.google.com/?q=9.4534,77.8042"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Navigation className="w-4 h-4" />
                        Get Directions
                        <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                          <ChevronRight className="w-4 h-4" />
                        </motion.span>
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
