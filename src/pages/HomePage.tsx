import { Link } from 'react-router-dom';
import {
  Zap, Shield, Sun, Moon,  Trophy, ChevronRight, Phone,
  MapPin, Mail, Clock, Navigation,ArrowRight,
  Calendar, CreditCard, Flame, Target, Award
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

import hero1 from '../assets/hero/hero1.png';
import hero2 from '../assets/hero/hero2.png';
import hero3 from '../assets/hero/hero3.jpg';
import hero4 from '../assets/hero/hero4.jpg';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
interface Turf {
  _id: string;
  turfId: string;
  name: string;
  sport: 'football' | 'cricket' | 'badminton';
  description: string;
  features: string[];
  priceDay: number;
  priceNight: number;
  image: string;
  isActive: boolean;
}

interface Tournament {
  _id: string;
  title: string;
  sport: 'football' | 'cricket' | 'badminton';
  turfName: string;
  banner: string;
  date: string;
  time: string;
  prize: string;
  entryFee: number;
  maxTeams: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registrations: { _id: string }[];
  format: string;
}

/* ═══════════════════════════════════════════════════════════════
   STATIC DATA
   ═══════════════════════════════════════════════════════════════ */
const heroImages = [hero1, hero2, hero3, hero4];

const sportEmoji: Record<string, string> = { football: '⚽', cricket: '🏏', badminton: '🏸' };

const stats = [
  { value: '70K+', label: 'Happy Players' },
  { value: '9+', label: 'Sports Turfs' },
  { value: '800+', label: 'Monthly Bookings' },
  { value: '4.9★', label: 'Average Rating' },
];

const games = [
  { sport: 'Football', emoji: '⚽', gradient: 'from-green-500 to-emerald-600', desc: '5-a-side, 7-a-side & full matches on premium artificial grass', features: ['LED Floodlights', '360° Field', 'Pro Goals'] },
  { sport: 'Cricket', emoji: '🏏', gradient: 'from-blue-500 to-cyan-600', desc: 'Box cricket & net practice with professional bowling machines', features: ['Practice Nets', 'Box Arena', 'Scoreboards'] },
  { sport: 'Badminton', emoji: '🏸', gradient: 'from-purple-500 to-pink-600', desc: 'Indoor courts with premium flooring and shuttle service', features: ['Indoor Court', 'Pro Flooring', 'Equipment'] },
];

const steps = [
  { icon: <Calendar className="w-7 h-7 text-white" />, title: 'Pick Your Turf', desc: 'Choose your sport, select a turf, and pick your preferred date & time', gradient: 'from-green-500 to-emerald-500' },
  { icon: <CreditCard className="w-7 h-7 text-white" />, title: 'Pay & Confirm', desc: 'Pay securely online via Razorpay — instant confirmation to your phone', gradient: 'from-blue-500 to-cyan-500' },
  { icon: <Trophy className="w-7 h-7 text-white" />, title: 'Play & Enjoy', desc: 'Show up and play! Field, equipment, and floodlights — all ready for you', gradient: 'from-purple-500 to-pink-500' },
];

const tweetColumns = [
  [
    { name: 'Arjun K.', handle: '@arjun_k', text: 'Best turf in Sivakasi! Floodlights are superb and the surface is top quality. Night games here are unreal 🔥', avatar: 'AK', gradient: 'from-green-400 to-emerald-500' },
    { name: 'Deepa S.', handle: '@deepa_s', text: 'Played badminton here for the first time. Courts are clean, equipment available on rent. Will come back for sure!', avatar: 'DS', gradient: 'from-purple-400 to-pink-500' },
    { name: 'Rahul M.', handle: '@rahul_m', text: 'Booked a slot at 11 PM and played till 1 AM. Love that this place is open 24/7. Perfect for night owls ⚽', avatar: 'RM', gradient: 'from-orange-400 to-red-500' },
    { name: 'Sneha V.', handle: '@sneha_v', text: 'Organized my company tournament here. Staff handled everything from setup to trophy distribution. 10/10 experience 🏆', avatar: 'SV', gradient: 'from-blue-400 to-cyan-500' },
  ],
  [
    { name: 'Priya M.', handle: '@priya_m', text: 'Booked online in 2 minutes. Smooth process and great facilities. The turf quality is premium compared to others in town.', avatar: 'PM', gradient: 'from-blue-400 to-cyan-500' },
    { name: 'Vikram R.', handle: '@vikram_r', text: 'Have shifted to hosting all my weekend games on @HyperGreen360. Lifesaver! WhatsApp groups were such a pain for organizing 9v9 matches.', avatar: 'VR', gradient: 'from-green-400 to-emerald-500' },
    { name: 'Anita P.', handle: '@anita_p', text: 'Love the simplicity of the booking system. It has made organising a game and gathering players a breeze! 🏏', avatar: 'AP', gradient: 'from-amber-400 to-yellow-600' },
    { name: 'Suresh K.', handle: '@suresh_k', text: 'Played a cricket box match here yesterday. The pitch is well maintained and floodlights are cinema quality 🎬', avatar: 'SK', gradient: 'from-teal-400 to-green-500' },
  ],
  [
    { name: 'Karthik R.', handle: '@karthik_r', text: 'Organized a tournament here – staff was excellent and the field was perfect. Prize distribution was super smooth.', avatar: 'KR', gradient: 'from-purple-400 to-pink-500' },
    { name: 'Naveen D.', handle: '@naveen_d', text: 'Played a public game on @HyperGreen360 today. Met a lot of new players. Enjoyed the experience! Highly recommend 👌', avatar: 'ND', gradient: 'from-indigo-400 to-violet-500' },
    { name: 'Meera J.', handle: '@meera_j', text: 'The parking is spacious, changing rooms are clean, and the turf itself is world-class. What more do you need? 💯', avatar: 'MJ', gradient: 'from-rose-400 to-pink-500' },
    { name: 'Arun T.', handle: '@arun_t', text: 'Splitting payments after a game was always a struggle. Tried out HyperGreen 360 today. Can never go back! Kudos team.', avatar: 'AT', gradient: 'from-cyan-400 to-blue-500' },
  ],
];

const amenities = [
  { icon: '🚗', label: 'Parking', desc: 'Spacious parking area' },
  { icon: '👕', label: 'Changing Room', desc: 'Clean facilities' },
  { icon: '🏥', label: 'First Aid', desc: 'Emergency medical kit' },
  { icon: '💧', label: 'Drinking Water', desc: 'Pure drinking water' },
  { icon: '🚻', label: 'Washrooms', desc: 'Clean & hygienic' },
  { icon: '🏏', label: 'Equipment', desc: 'Rental available' },
];

/* ═══════════════════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
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

function SectionLabel({ text, className = '' }: { text: string; className?: string }) {
  return (
    <motion.span
      className={`inline-block text-sm font-bold tracking-widest uppercase mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent ${className}`}
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{ duration: 4, repeat: Infinity }}
      style={{ backgroundSize: '200% 200%' }}
    >
      {text}
    </motion.span>
  );
}

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

/* ═══════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════ */
function Hero() {
  const [current, setCurrent] = useState(0);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);
  const contentY = useTransform(scrollY, [0, 500], [0, 80]);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(p => (p + 1) % heroImages.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const title1 = 'HYPERGREEN';
  const title2 = '360 TURF';

  return (
    <section className="relative h-screen flex mt-14 items-center overflow-hidden bg-black">
      {/* bg with parallax zoom */}
      <motion.div className="absolute inset-0" style={{ scale: heroScale }}>
        <AnimatePresence mode="sync">
          <motion.img
            key={current}
            src={heroImages[current]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        </AnimatePresence>
      </motion.div>

      {/* overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

      {/* ambient orbs */}
      <motion.div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]"
        animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]"
        animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* slide dots */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroImages.map((_, i) => (
          <motion.button key={i} onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'bg-green-400 w-8' : 'bg-white/30 w-4 hover:bg-white/50'}`}
            whileHover={{ scale: 1.3 }}
          />
        ))}
      </div>

      {/* content */}
      <motion.div className="relative max-w-7xl mx-auto px-4 pt-32 pb-28 grid md:grid-cols-2 gap-12 items-center w-full z-10"
        style={{ opacity: heroOpacity, y: contentY }}
      >
        {/* left */}
        <div className="text-white">
          <motion.div initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: 0.3 }}>
            <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-green-400 text-sm px-5 py-2 rounded-full font-semibold mb-5 backdrop-blur-md">
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
              </motion.span>
              Multiple Turfs &middot; Multiple Sports &middot; One Destination
            </span>
          </motion.div>

          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-wider leading-[0.9] mb-6">
            <span className="block overflow-hidden">
              {title1.split('').map((c, i) => (
                <motion.span key={i} className="inline-block"
                  initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                >{c}</motion.span>
              ))}
            </span>
            <span className="block overflow-hidden mt-1">
              {title2.split('').map((c, i) => (
                <motion.span key={i}
                  className="inline-block bg-gradient-to-r from-green-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent"
                  initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  style={{ backgroundSize: '200% 200%', animation: 'gradientShift 3s ease infinite' }}
                >{c === ' ' ? '\u00A0' : c}</motion.span>
              ))}
            </span>
          </h1>

          <motion.div className="h-1 rounded-full bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 mb-8"
            initial={{ width: 0 }} animate={{ width: '40%' }} transition={{ duration: 0.8, delay: 1.4 }}
          />

          <motion.p className="text-gray-300/90 text-base sm:text-lg mb-8 max-w-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.2 }}
          >
            Sivakasi's premier sports destination — <span className="text-green-400 font-semibold">Football, Cricket & Badminton</span> turfs
            with pro floodlights, online booking & exciting tournaments.
          </motion.p>

          <motion.div className="flex flex-wrap gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.5 }}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/booking" className="group relative bg-gradient-to-r from-green-500 to-emerald-500 text-white px-9 py-4 rounded-2xl font-bold text-lg overflow-hidden flex items-center gap-3 shadow-[0_0_30px_rgba(34,197,94,0.2)] hover:shadow-[0_0_50px_rgba(34,197,94,0.35)] transition-shadow duration-500">
                <span className="relative z-10">Book a Turf</span>
                <motion.span className="relative z-10" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ChevronRight className="w-5 h-5" />
                </motion.span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/tournaments" className="border border-white/20 hover:border-green-400/50 text-white px-9 py-4 rounded-2xl font-bold text-lg backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all duration-500">
                View Tournaments
              </Link>
            </motion.div>
          </motion.div>

          {/* sport pills */}
          <motion.div className="flex items-center gap-3 mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
            {games.map((g, i) => (
              <motion.span key={g.sport} className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.1 + i * 0.15 }}
              >
                <span>{g.emoji}</span> {g.sport}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* right — quick stats glass card */}
        <motion.div className="hidden md:block"
          initial={{ opacity: 0, y: 40, filter: 'blur(20px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 1 }}
        >
          <motion.div className="group relative" whileHover={{ rotateY: -3, rotateX: 2 }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }} style={{ perspective: 800, transformStyle: 'preserve-3d' }}
          >
            <motion.div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-cyan-500/20 blur-xl"
              animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="relative bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-6 text-white shadow-[0_8px_60px_rgba(0,0,0,0.3)] overflow-hidden">
              {/* shimmer */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <motion.div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent rotate-12"
                  animate={{ x: ['-100%', '100%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
                />
              </div>

              <div className="text-center mb-4">
                <h3 className="text-lg font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                  OUR SPORTS ARENA
                </h3>
                <p className="text-gray-400 text-xs mt-1">Multiple turfs, one booking</p>
              </div>

              {/* sport cards */}
              <div className="space-y-2.5">
                {games.map((g, i) => (
                  <motion.div key={g.sport}
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3 + i * 0.15 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 backdrop-blur-sm"
                  >
                    <span className="text-xl">{g.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-sm">{g.sport}</span>
                      <p className="text-gray-400 text-xs truncate">{g.features.join(' · ')}</p>
                    </div>
                    <motion.div className="w-2 h-2 rounded-full bg-green-400 shrink-0"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                    />
                  </motion.div>
                ))}
              </div>

              <Link to="/booking"
                className="mt-4 block text-center bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-xl py-3 font-bold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
              >
                <span className="flex items-center justify-center gap-2">
                  Book Now <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                </span>
              </Link>

              <div className="mt-4 pt-3 border-t border-white/[0.06] grid grid-cols-3 gap-2 text-center">
                {[{ v: '24/7', l: 'Open' }, { v: '₹600', l: 'Starting' }, { v: '4.9★', l: 'Rated' }].map(s => (
                  <div key={s.l}>
                    <div className="text-sm font-bold text-green-400">{s.v}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* scroll indicator */}
      <motion.div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
      >
        <motion.span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-semibold"
          animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
        >Scroll</motion.span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center pt-1.5">
            <motion.div className="w-1 h-1 bg-green-400 rounded-full"
              animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
const HomePage = () => {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [sportFilter, setSportFilter] = useState<string>('all');

  useEffect(() => {
    api.get('/turfs?active=true').then(r => setTurfs(r.data.turfs || [])).catch(() => {});
    api.get('/tournaments').then(r => {
      const all: Tournament[] = r.data.tournaments || [];
      setTournaments(all.filter(t => t.status === 'upcoming' || t.status === 'ongoing').slice(0, 4));
    }).catch(() => {});
  }, []);

  const filteredTurfs = sportFilter === 'all' ? turfs : turfs.filter(t => t.sport === sportFilter);

  return (
    <div>
      <Hero />

      {/* ═══ Stats ═══ */}
      <section className="relative bg-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-10 relative">
          {stats.map(s => <AnimatedStat key={s.label} value={s.value} label={s.label} />)}
        </div>
      </section>

      {/* ═══ Games / Sports ═══ */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 relative">
          <Reveal>
            <div className="text-center mb-16">
              <SectionLabel text="Sports We Offer" className="!from-green-400 !to-cyan-400" />
              <h2 className="font-display text-5xl md:text-6xl tracking-wider mb-3">CHOOSE YOUR GAME</h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">World-class facilities for every sport — pick your arena and start playing</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {games.map((g, i) => (
              <Reveal key={g.sport} delay={i * 0.12}>
                <motion.div
                  className="group relative rounded-3xl overflow-hidden"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* gradient bg */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${g.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />

                  <div className="relative bg-white/[0.05] backdrop-blur border border-white/10 rounded-3xl p-8 h-full group-hover:border-white/20 transition-all duration-500">
                    {/* shimmer */}
                    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-out rotate-12" />
                    </div>

                    <motion.div className="text-6xl mb-5" whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }}>
                      {g.emoji}
                    </motion.div>
                    <h3 className="font-display text-3xl tracking-wider mb-3">{g.sport.toUpperCase()}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-5">{g.desc}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {g.features.map(f => (
                        <span key={f} className="text-xs font-semibold bg-white/10 px-3 py-1 rounded-full border border-white/10">{f}</span>
                      ))}
                    </div>

                    <Link to="/booking" className={`inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r ${g.gradient} bg-clip-text text-transparent group-hover:underline`}>
                      Book {g.sport} <ArrowRight className="w-4 h-4 text-green-400" />
                    </Link>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Our Turfs (Dynamic) ═══ */}
      {turfs.length > 0 && (
        <section className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
          <motion.div className="absolute top-20 left-10 w-[500px] h-[500px] bg-green-400/[0.04] rounded-full blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="max-w-7xl mx-auto px-4 relative">
            <Reveal>
              <div className="text-center mb-10">
                <SectionLabel text="Our Turfs" />
                <h2 className="font-display text-5xl md:text-6xl tracking-wider text-gray-900 mb-3">EXPLORE OUR TURFS</h2>
                <p className="text-gray-500 text-lg max-w-xl mx-auto">Premium sports facilities designed for peak performance</p>
              </div>
            </Reveal>

            {/* sport filter */}
            <Reveal>
              <div className="flex justify-center gap-3 mb-12 flex-wrap">
                {['all', 'football', 'cricket', 'badminton'].map(s => (
                  <motion.button key={s} onClick={() => setSportFilter(s)}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                      sportFilter === s
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  >
                    {s === 'all' ? '🏟️ All Turfs' : `${sportEmoji[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
                  </motion.button>
                ))}
              </div>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredTurfs.map((turf, i) => (
                  <motion.div key={turf._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <motion.div className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm h-full"
                      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* image */}
                      <div className="relative h-52 overflow-hidden">
                        <img src={turf.image} alt={turf.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* sport badge */}
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          {sportEmoji[turf.sport]} {turf.sport.charAt(0).toUpperCase() + turf.sport.slice(1)}
                        </span>

                        {/* price */}
                        <div className="absolute bottom-3 right-3 bg-green-500/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">
                          From ₹{turf.priceDay}/hr
                        </div>
                      </div>

                      {/* content */}
                      <div className="p-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{turf.name}</h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{turf.description || 'Premium sports facility with professional equipment.'}</p>

                        {/* features */}
                        {turf.features.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {turf.features.slice(0, 3).map(f => (
                              <span key={f} className="text-[11px] font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-md">{f}</span>
                            ))}
                            {turf.features.length > 3 && (
                              <span className="text-[11px] text-gray-400">+{turf.features.length - 3} more</span>
                            )}
                          </div>
                        )}

                        {/* pricing row */}
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Sun className="w-4 h-4 text-yellow-500" /> ₹{turf.priceDay}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Moon className="w-4 h-4 text-indigo-500" /> ₹{turf.priceNight}
                          </div>
                        </div>

                        <Link to="/booking"
                          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-xl py-2.5 font-bold text-sm transition-all duration-300"
                        >
                          Book This Turf <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {turfs.length > 6 && (
              <div className="text-center mt-10">
                <Link to="/booking" className="inline-flex items-center gap-2 text-green-600 font-bold hover:underline text-lg">
                  View All Turfs <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══ Tournaments (Dynamic) ═══ */}
      {tournaments.length > 0 && (
        <section className="py-24 bg-white relative overflow-hidden">
          <motion.div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-400/[0.04] rounded-full blur-3xl"
            animate={{ x: [0, -30, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="max-w-7xl mx-auto px-4 relative">
            <Reveal>
              <div className="text-center mb-14">
                <SectionLabel text="Compete & Win" />
                <h2 className="font-display text-5xl md:text-6xl tracking-wider text-gray-900 mb-3">UPCOMING TOURNAMENTS</h2>
                <p className="text-gray-500 text-lg max-w-xl mx-auto">Register your team, compete with the best, and win exciting prizes</p>
              </div>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tournaments.map((t, i) => (
                <Reveal key={t._id} delay={i * 0.1}>
                  <motion.div className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm h-full"
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} transition={{ duration: 0.3 }}
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img src={t.banner} alt={t.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                      {/* status badge */}
                      <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full backdrop-blur ${
                        t.status === 'upcoming' ? 'bg-green-500/90 text-white' : 'bg-yellow-500/90 text-white'
                      }`}>
                        {t.status === 'upcoming' ? '🔥 Upcoming' : '🎮 Live'}
                      </span>

                      {/* sport */}
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-full">
                        {sportEmoji[t.sport]}
                      </span>

                      {/* prize on image */}
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                          <Award className="w-3.5 h-3.5" /> {t.prize}
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors line-clamp-1">{t.title}</h3>
                      <p className="text-gray-400 text-xs mb-3">{t.turfName} · {t.format}</p>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t.time}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs mb-4">
                        <span className="font-bold text-green-600">{t.entryFee > 0 ? `₹${t.entryFee}/team` : 'FREE'}</span>
                        <span className="text-gray-400">{t.registrations.length}/{t.maxTeams} teams</span>
                      </div>

                      <Link to="/tournaments"
                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl py-2 font-bold text-sm transition-all duration-300"
                      >
                        Register <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link to="/tournaments" className="inline-flex items-center gap-2 text-purple-600 font-bold hover:underline text-lg">
                View All Tournaments <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ How It Works ═══ */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 relative">
          <Reveal>
            <div className="text-center mb-16">
              <SectionLabel text="Simple Process" />
              <h2 className="font-display text-5xl md:text-6xl tracking-wider text-gray-900 mb-3">BOOK IN 3 STEPS</h2>
              <p className="text-gray-500">Quick and hassle-free booking process</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-green-500/30 via-blue-500/30 to-purple-500/30" />
            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="text-center relative">
                  <motion.div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mx-auto mb-5 relative z-10 shadow-lg`}
                    whileHover={{ scale: 1.15, rotate: 5 }} transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {step.icon}
                  </motion.div>
                  <span className="text-xs font-bold text-green-500 tracking-widest uppercase mb-1 block">Step {i + 1}</span>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Amenities ═══ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Reveal>
            <SectionLabel text="Facilities" />
            <h2 className="font-display text-4xl md:text-5xl tracking-wider text-gray-900 mb-2">ESSENTIAL AMENITIES</h2>
            <p className="text-gray-500 mb-12">Everything you need for a complete sports experience</p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {amenities.map((a, i) => (
              <Reveal key={a.label} delay={i * 0.08}>
                <motion.div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-gray-50 border border-gray-100"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgb(240 253 244)' }} transition={{ duration: 0.2 }}
                >
                  <motion.div className="text-4xl" whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }}>
                    {a.icon}
                  </motion.div>
                  <span className="text-sm font-bold text-gray-900">{a.label}</span>
                  <div className="text-xs text-gray-500">{a.desc}</div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Reviews — Twitter-style scrolling marquee ═══ */}
      <section className="py-24 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
        {/* ambient glows */}
        <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-green-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-[20%] w-[400px] h-[400px] bg-blue-500/[0.04] rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 relative">
          <Reveal>
            <div className="text-center mb-14">
              <SectionLabel text="Testimonials" className="!from-green-400 !to-cyan-400" />
              <h2 className="font-display text-5xl md:text-6xl tracking-wider text-white mb-3">WHAT PLAYERS SAY</h2>
              <p className="text-gray-500 text-lg max-w-lg mx-auto">Real feedback from real players who love playing at HyperGreen 360</p>
            </div>
          </Reveal>

          {/* scrolling columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-[520px] overflow-hidden relative">
            {/* fade edges */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-950 to-transparent z-10 pointer-events-none" />

            {tweetColumns.map((col, colIdx) => (
              <div key={colIdx} className="relative overflow-hidden h-full">
                <motion.div
                  className="flex flex-col gap-4"
                  animate={{ y: colIdx % 2 === 0 ? ['0%', '-50%'] : ['-50%', '0%'] }}
                  transition={{ duration: 25 + colIdx * 5, repeat: Infinity, ease: 'linear' }}
                >
                  {/* duplicate for seamless loop */}
                  {[...col, ...col].map((tweet, i) => (
                    <motion.div key={`${colIdx}-${i}`}
                      className="group bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300 cursor-default"
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${tweet.gradient} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0`}>
                          {tweet.avatar}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white text-sm block truncate">{tweet.name}</span>
                          <span className="text-gray-500 text-xs">{tweet.handle}</span>
                        </div>
                      </div>

                      {/* tweet text */}
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {tweet.text.split(/(@HyperGreen360)/g).map((part, pi) =>
                          part === '@HyperGreen360'
                            ? <span key={pi} className="text-green-400 font-semibold">{part}</span>
                            : part
                        )}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-emerald-700 to-blue-700" />
        <motion.div className="absolute inset-0"
          animate={{ background: ['radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)', 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)', 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <Reveal>
            <h2 className="font-display text-5xl md:text-7xl tracking-wider text-white mb-5">READY TO PLAY?</h2>
            <p className="text-green-100 font-bold text-lg mb-10">
              Multiple turfs, multiple sports, one destination.<br />Book your favourite turf today!
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/booking" className="bg-white text-green-700 hover:bg-green-50 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-2">
                  Book a Turf <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ChevronRight className="w-5 h-5" /></motion.span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/tournaments" className="border-2 border-white/30 hover:border-white hover:bg-white/10 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-2">
                  <Trophy className="w-5 h-5" /> Tournaments
                </Link>
              </motion.div>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-white">
              {[
                { icon: <Flame className="w-7 h-7 text-yellow-300" />, label: 'Instant Booking', sub: 'Confirm your slot in seconds' },
                { icon: <Target className="w-7 h-7 text-green-300" />, label: 'Multiple Turfs', sub: 'Football, Cricket & Badminton' },
                { icon: <Shield className="w-7 h-7 text-blue-300" />, label: '24/7 Support', sub: "We're always here to help" },
              ].map(item => (
                <motion.div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                  whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <div className="mx-auto mb-2">{item.icon}</div>
                  <span className="font-bold block">{item.label}</span>
                  <span className="text-sm text-green-100">{item.sub}</span>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ Contact & Location ═══ */}
      <section className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
        <motion.div className="absolute top-20 left-10 w-[500px] h-[500px] bg-green-400/[0.04] rounded-full blur-3xl"
          animate={{ x: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="max-w-7xl mx-auto px-4 relative">
          <Reveal>
            <div className="text-center mb-16">
              <SectionLabel text="Visit Us" />
              <h2 className="font-display text-5xl md:text-6xl tracking-wider text-gray-900 mb-3">FIND US HERE</h2>
              <p className="text-gray-500 text-lg">Located in the heart of Sivakasi, easily accessible from all major areas</p>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* map */}
            <Reveal>
              <motion.div className="group relative rounded-3xl" whileHover={{ y: -6 }} transition={{ duration: 0.3 }}>
                <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-green-400/30 via-blue-400/20 to-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[2px]" />
                <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 group-hover:border-transparent transition-all duration-500 shadow-sm group-hover:shadow-2xl">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3942.485!2d77.8042!3d9.4534!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b06cf5b3f6a1f9d%3A0x4a1f2e3b4c5d6e7f!2sSivakasi%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                    width="100%" height="380" style={{ border: 0, display: 'block' }}
                    allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                    title="HyperGreen 360 Turf Location"
                  />
                  <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-500" /> Housing Board, Sivakasi
                    </span>
                    <a href="https://maps.google.com/?q=9.4534,77.8042" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Navigation className="w-4 h-4" /> Open in Maps
                    </a>
                  </div>
                </div>
              </motion.div>
            </Reveal>

            {/* contact cards */}
            <div className="space-y-4">
              <Reveal><h2 className="font-bold text-xl text-gray-900 mb-2">Visit Our Facility</h2></Reveal>
              {[
                { icon: <MapPin className="w-5 h-5 text-green-600" />, bg: 'bg-green-50', title: 'Address', content: <><p className="text-gray-600 text-sm leading-relaxed">Housing Board, Near Water Tank,<br />Sivakasi – 626 123, Tamil Nadu, India</p><p className="text-xs text-gray-400 mt-2"><span className="font-semibold">Landmark:</span> Opposite Housing Board Police Station</p></> },
                { icon: <Phone className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', title: 'Phone / WhatsApp', content: <><a href="tel:8056564775" className="text-green-600 font-semibold hover:underline text-sm">+91 80565 64775</a><p className="text-gray-400 text-xs mt-1">Available 24/7 for bookings & queries</p></> },
                { icon: <Mail className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-50', title: 'Email', content: <><a href="mailto:info@hypergreen360.com" className="text-green-600 font-semibold hover:underline text-sm">info@hypergreen360.com</a><p className="text-gray-400 text-xs mt-1">We reply within 24 hours</p></> },
                { icon: <Clock className="w-5 h-5 text-violet-600" />, bg: 'bg-violet-50', title: 'Operating Hours', content: <><p className="text-gray-600 text-sm font-semibold">Open 24 Hours · 7 Days a Week</p><p className="text-gray-400 text-xs mt-1">Book anytime — we're always ready</p></> },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 0.1}>
                  <motion.div className="bg-white rounded-2xl p-5 flex gap-4 items-start border border-gray-100 shadow-sm"
                    whileHover={{ x: 6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                      {item.content}
                    </div>
                  </motion.div>
                </Reveal>
              ))}

              <Reveal delay={0.4}>
                <motion.a href="https://maps.google.com/?q=9.4534,77.8042" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:shadow-lg w-fit"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                >
                  <Navigation className="w-4 h-4" /> Get Directions
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <ChevronRight className="w-4 h-4" />
                  </motion.span>
                </motion.a>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
