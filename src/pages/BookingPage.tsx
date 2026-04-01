/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle, ChevronLeft, CreditCard, Lightbulb, Calendar, Lock, Clock, Timer } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ReservationBanner from '../components/ReservationBanner';

declare global { interface Window { Razorpay: new (o: RazorpayOptions) => RazorpayInstance; } }
interface RazorpayOptions {
  key: string; amount: number; currency: string; name: string;
  description: string; order_id: string;
  prefill: { name: string; email: string; contact: string };
  notes: Record<string, string>;
  theme: { color: string };
  handler: (r: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
}
interface RazorpayInstance { open: () => void; on: (e: string, h: (r: unknown) => void) => void; }
interface RazorpayResponse { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; }
interface SlotInfo { slot: string; from: string; to: string; isNight: boolean; price: number; available: boolean; isYours: boolean; }
interface Sport    { id: string; label: string; emoji: string; color: string; bg: string; }
interface TurfInfo { id: string; name: string; sport: string; description: string; features: string[]; priceDay: number; priceNight: number; image: string; }

const SPORTS: Sport[] = [
  { id: 'football',  label: 'Football',  emoji: '⚽', color: 'text-green-700',  bg: 'bg-green-50  border-green-400'  },
  { id: 'cricket',   label: 'Cricket',   emoji: '🏏', color: 'text-blue-700',   bg: 'bg-blue-50   border-blue-400'   },
  { id: 'badminton', label: 'Badminton', emoji: '🏸', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-400' },
];

// Turfs are now loaded dynamically from the API (managed by admin).
// TurfInfo.id maps to the turfId slug stored in the database.

const ENV_RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
const STEP_LABELS = ['Sport', 'Turf', 'Slots', 'Details', 'Payment'];
const today = new Date().toISOString().split('T')[0];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const existing = document.getElementById('razorpay-script');
    if (existing) { resolve(true); return; }
    const s = document.createElement('script');
    s.id = 'razorpay-script'; s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.async = true;
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}
function getDatePills() {
  const now = new Date();
  const DN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() + i);
    return { label: i===0?'Today':DN[d.getDay()], date: d.getDate(), month: MN[d.getMonth()], iso: d.toISOString().split('T')[0] };
  });
}
function fmtDisplay(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const DN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${DN[d.getDay()]}, ${MN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function calcTotal(slots: SlotInfo[], selected: Set<string>): number {
  const base = slots.filter(s => selected.has(s.slot)).reduce((a, s) => a + s.price, 0);
  const n = selected.size;
  if (n === 2) return Math.round(base * 0.9);
  if (n >= 3)  return Math.round(base * 0.8);
  return base;
}

const BookingPage = () => {
  // ══════════════════════════════════════════════════════════════════════════
  // ALL HOOKS MUST BE AT THE TOP — no early returns before this block ends
  // ══════════════════════════════════════════════════════════════════════════
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step,         setStep]        = useState(0);
  const [sport,        setSport]       = useState<Sport | null>(null);
  const [turf,         setTurf]        = useState<TurfInfo | null>(null);
  const [date,         setDate]        = useState(today);
  const [slots,        setSlots]       = useState<SlotInfo[]>([]);
  const [slotsLoading, setSlotsLoading]= useState(false);
  const [slotsError,   setSlotsError]  = useState('');
  const [selected,     setSelected]    = useState<Set<string>>(new Set());
  const [form,         setForm]        = useState({ name: '', email: '', phone: '', teamSize: '' });
  const [confirmed,    setConfirmed]   = useState(false);
  const [bookingRef,   setBookingRef]  = useState('');
  const [bookingId,    setBookingId]   = useState('');
  const [turfs,        setTurfs]       = useState<TurfInfo[]>([]);
  const [turfsLoading, setTurfsLoading]= useState(false);
  const [loading,      setLoading]     = useState(false);
  const [payLoading,   setPayLoading]  = useState(false);
  const [bookingError, setBookingError]= useState('');
  const [payError,     setPayError]    = useState('');
  const [reserved,     setReserved]    = useState(false);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reservedUntil, setReservedUntil]   = useState<Date | null>(null);
  const [countdown,    setCountdown]   = useState('');
  const [resumeTotal,  setResumeTotal] = useState(0);
  const [resumeBase,   setResumeBase]  = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval>>(null);

  // Auto-select sport (and optionally turf) from URL query params
  // e.g. ?sport=football&turf=turf-slug-id
  useEffect(() => {
    const sp = searchParams.get('sport');
    if (sp && !sport) {
      const match = SPORTS.find(s => s.id === sp);
      if (match) { setSport(match); setStep(1); }
    }
  }, [searchParams]);

  // Auto-select turf once turfs are loaded and URL has ?turf= param
  useEffect(() => {
    const turfParam = searchParams.get('turf');
    if (turfParam && turfs.length > 0 && !turf && sport) {
      const match = turfs.find(t => t.id === turfParam && t.sport === sport.id);
      if (match) { setTurf(match); setStep(2); }
    }
  }, [searchParams, turfs, sport]);

  // Resume a reserved booking from ?resume=bookingId
  useEffect(() => {
    const resumeId = searchParams.get('resume');
    if (!resumeId || bookingId) return;
    api.get<{ booking: { _id: string; bookingRef: string; sport: string; turfId: string; turfName: string; date: string; timeSlots: string[]; baseAmount: number; totalAmount: number; status: string; reservedUntil: string; userName: string; userEmail: string; userPhone: string; teamSize?: number } }>(`/bookings/${resumeId}`)
      .then(res => {
        const b = res.data.booking;
        if (!b || b.status !== 'reserved' || new Date(b.reservedUntil).getTime() <= Date.now()) return;
        // Restore all state
        const matchSport = SPORTS.find(s => s.id === b.sport);
        if (matchSport) setSport(matchSport);
        setDate(b.date);
        setSelected(new Set(b.timeSlots));
        setForm({ name: b.userName || '', email: b.userEmail || '', phone: b.userPhone || '', teamSize: b.teamSize?.toString() || '' });
        setBookingId(b._id);
        setBookingRef(b.bookingRef);
        setReserved(true);
        setReservedUntil(new Date(b.reservedUntil));
        setResumeTotal(b.totalAmount);
        setResumeBase(b.baseAmount);
        setStep(4); // Jump to payment
        // Set turf after turfs load
        if (b.turfId) {
          const matchTurf = turfs.find(t => t.id === b.turfId);
          if (matchTurf) setTurf(matchTurf);
        }
      })
      .catch(() => {});
  }, [searchParams, turfs]);

  // Sync form name/email once user loads (only runs when user object becomes available)
  useEffect(() => {
    if (user) setForm(f => ({
      ...f,
      name:  f.name  || user.name  || '',
      email: f.email || user.email || '',
    }));
  }, [user]);

  const fetchSlots = useCallback(async (d: string, turfId: string) => {
    setSlotsLoading(true); setSlotsError('');
    try {
      const res = await api.get<{ success: boolean; slots: SlotInfo[] }>(
        `/bookings/slots?date=${d}&turfId=${turfId}`
      );
      setSlots(res.data.slots ?? []);
    } catch {
      setSlotsError('Failed to load slots. Please try again.');
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  // Fetch all active turfs from API once on mount
  useEffect(() => {
    setTurfsLoading(true);
    api.get<{ turfs: Array<{ turfId: string; name: string; sport: string; description: string; features: string[]; priceDay: number; priceNight: number; image: string }> }>('/turfs?active=true')
      .then(res => {
        const mapped: TurfInfo[] = res.data.turfs.map(t => ({
          id: t.turfId, name: t.name, sport: t.sport,
          description: t.description, features: t.features,
          priceDay: t.priceDay, priceNight: t.priceNight, image: t.image,
        }));
        setTurfs(mapped);
      })
      .catch(() => { /* non-fatal — show empty state */ })
      .finally(() => setTurfsLoading(false));
  }, []);

  useEffect(() => { if (step === 2 && turf) fetchSlots(date, turf.id); }, [date, step, turf]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step, confirmed]);
  useEffect(() => { if (step === 4) loadRazorpayScript(); }, [step]);

  // Countdown timer for reservation
  useEffect(() => {
    if (!reservedUntil) { setCountdown(''); return; }
    const tick = () => {
      const diff = reservedUntil.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown('00:00');
        setReserved(false);
        setReservedUntil(null);
        setBookingId('');
        setBookingRef('');
        setBookingError('Reservation expired. Slots released. Please try again.');
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (turf) fetchSlots(date, turf.id);
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    countdownRef.current = setInterval(tick, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [reservedUntil]);

  // ══════════════════════════════════════════════════════════════════════════
  // END OF HOOKS — safe to return early from here onwards
  // ══════════════════════════════════════════════════════════════════════════

  // Auth: still reading localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Auth: confirmed not logged in
  if (!isAuthenticated) {
    sessionStorage.setItem('hg360_redirect_after_login', '/booking');
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl dark:shadow-gray-950/50 p-10 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-display text-3xl tracking-wider text-gray-900 dark:text-white mb-2">SIGN IN REQUIRED</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">You need to be signed in to book a slot.</p>
          <div className="space-y-3">
            <button onClick={() => navigate('/login')}
              className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3.5 font-bold transition-colors">
              Sign In to Book
            </button>
            <Link to="/register"
              className="block w-full border-2 border-gray-200 dark:border-gray-700 hover:border-green-400 text-gray-700 dark:text-gray-300 rounded-xl py-3.5 font-bold transition-colors">
              Create Free Account
            </Link>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-400 mt-6">
            By continuing you agree to our <Link to="/terms" className="underline">Terms & Conditions</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Derived values (authenticated only) ────────────────────────────────────
  const pills = getDatePills();
  const calcedTotal = calcTotal(slots, selected);
  const total = calcedTotal > 0 ? calcedTotal : resumeTotal;
  const filteredTurfs = sport ? turfs.filter((t: TurfInfo) => t.sport === sport.id) : [];

  const toggleSlot = (slot: SlotInfo) => {
    if (!slot.available) return;
    const next = new Set(selected);
    if (next.has(slot.slot)) next.delete(slot.slot); else next.add(slot.slot);
    setSelected(next);
  };
  const slotClass = (slot: SlotInfo) => {
    if (!slot.available && !slot.isYours) return 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed opacity-60';
    if (slot.isYours)                     return 'bg-blue-100 border-2 border-blue-400 text-blue-700 cursor-default';
    if (selected.has(slot.slot))          return 'bg-green-600 border-2 border-green-700 text-white cursor-pointer';
    return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-green-400 hover:bg-green-50 dark:hover:bg-gray-700 cursor-pointer';
  };

  const handlePay = async () => {
    setBookingError(''); setPayError(''); setLoading(true);
    let bkId = bookingId;
    try {
      if (!bkId) {
        const bkRes = await api.post<{
          success: boolean; booking: { _id: string; bookingRef: string }; message: string;
        }>('/bookings', {
          userName:  form.name,
          userEmail: form.email,
          userPhone: form.phone,
          teamSize:  form.teamSize ? parseInt(form.teamSize) : undefined,
          sport:     sport?.id ?? 'football',
          turfId:    turf?.id   ?? null,
          turfName:  turf?.name ?? null,
          date,
          timeSlots: Array.from(selected),
        });
        if (!bkRes.data.success) { setBookingError(bkRes.data.message || 'Failed to create booking.'); setLoading(false); return; }
        bkId = bkRes.data.booking._id;
        setBookingId(bkId);
        setBookingRef(bkRes.data.booking.bookingRef);
      }

      const orderRes = await api.post<{
        success: boolean; orderId: string; keyId: string; amount: number; currency: string;
      }>('/payments/create-order', { bookingId: bkId, amount: total });

      if (!orderRes.data.success) { setPayError('Failed to create payment order. Please try again.'); setLoading(false); return; }
      const { orderId, keyId: backendKeyId, amount: paise } = orderRes.data;
      const razorpayKey = ENV_RAZORPAY_KEY || backendKeyId;
      if (!razorpayKey) { setPayError('Razorpay key not configured. Contact support.'); setLoading(false); return; }

      setLoading(false);
      const loaded = await loadRazorpayScript();
      if (!loaded) { setPayError('Razorpay SDK failed to load. Check your internet.'); return; }

      const rzp = new window.Razorpay({
        key: razorpayKey, amount: paise, currency: 'INR',
        name: import.meta.env.VITE_APP_NAME || 'HyperGreen 360 Turf',
        description: `${turf?.name ?? 'Turf'} – ${date}`,
        order_id: orderId,
        prefill: { name: form.name, email: form.email, contact: `+91${form.phone}` },
        notes: { bookingId: bkId, turfId: turf?.id||'', turfName: turf?.name||'', date, slots: Array.from(selected).join(', ') },
        theme: { color: '#22c55e' },
        handler: async (response: RazorpayResponse) => {
          setPayLoading(true);
          try {
            const verifyRes = await api.post<{ success: boolean; bookingRef: string; message: string }>(
              '/payments/verify', {
                bookingId:         bkId,
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }
            );
            if (verifyRes.data.success) {
              if (verifyRes.data.bookingRef) setBookingRef(verifyRes.data.bookingRef);
              setConfirmed(true);
            } else {
              setPayError(verifyRes.data.message || `Verification failed. Payment ID: ${response.razorpay_payment_id}`);
            }
          } catch {
            setPayError(`Verification failed. Payment ID: ${response.razorpay_payment_id}. Contact support.`);
          } finally { setPayLoading(false); }
        },
        modal: { ondismiss: () => setPayError('Payment cancelled. Slot held for 10 mins — click Pay to retry.') },
      });
      rzp.on('payment.failed', (r: unknown) => {
        const errDesc = (r as { error?: { description?: string } }).error?.description;
        setPayError(errDesc || 'Payment failed. Please try a different payment method.');
      });
      rzp.open();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; takenSlots?: string[] } } };
      setBookingError(e.response?.data?.message || 'Something went wrong. Please try again.');
      if (e.response?.data?.takenSlots) {
        setBookingId(''); setBookingRef(''); setSelected(new Set());
        if (turf) fetchSlots(date, turf.id);
        setStep(2);
      }
    } finally { setLoading(false); }
  };

  const handleReserve = async () => {
    setBookingError(''); setReserveLoading(true);
    try {
      const res = await api.post<{
        success: boolean; booking: { _id: string; bookingRef: string }; reservedUntil: string; message: string;
      }>('/bookings/reserve', {
        userName:  form.name,
        userEmail: form.email,
        userPhone: form.phone,
        teamSize:  form.teamSize ? parseInt(form.teamSize) : undefined,
        sport:     sport?.id ?? 'football',
        turfId:    turf?.id ?? null,
        turfName:  turf?.name ?? null,
        date,
        timeSlots: Array.from(selected),
      });
      if (res.data.success) {
        setBookingId(res.data.booking._id);
        setBookingRef(res.data.booking.bookingRef);
        setReserved(true);
        setReservedUntil(new Date(res.data.reservedUntil));
      } else {
        setBookingError(res.data.message || 'Failed to reserve.');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; takenSlots?: string[] } } };
      setBookingError(e.response?.data?.message || 'Failed to reserve. Please try again.');
      if (e.response?.data?.takenSlots) {
        setSelected(new Set());
        if (turf) fetchSlots(date, turf.id);
        setStep(2);
      }
    } finally { setReserveLoading(false); }
  };

  const resetAll = () => {
    setConfirmed(false); setStep(0); setSport(null); setTurf(null);
    setSelected(new Set()); setSlots([]);
    setForm({ name: user?.name||'', email: user?.email||'', phone: '', teamSize: '' });
    setBookingError(''); setPayError(''); setBookingId(''); setBookingRef('');
    setReserved(false); setReservedUntil(null); setResumeTotal(0); setResumeBase(0);
  };

  // ── CONFIRMED ─────────────────────────────────────────────────────────────
  if (confirmed) {
    const slotList = slots.filter(s => selected.has(s.slot));
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl dark:shadow-gray-950/50 p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-display text-4xl tracking-wider text-gray-900 dark:text-white mb-2">BOOKING CONFIRMED!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Payment successful. See you on the field! 🏆</p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-2xl p-5 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Booking ID</span><span className="font-bold text-green-700 dark:text-green-400">{bookingRef}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Sport</span><span className="font-semibold text-gray-900 dark:text-white">{sport?.emoji} {sport?.label}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Turf</span><span className="font-semibold text-gray-900 dark:text-white">{turf?.name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Name</span><span className="font-semibold text-gray-900 dark:text-white">{form.name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Date</span><span className="font-semibold text-gray-900 dark:text-white">{fmtDisplay(date)}</span></div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Slots</span>
              <span className="font-semibold text-gray-900 dark:text-white text-right text-xs max-w-[60%]">{slotList.map(s=>`${s.from} - ${s.to}`).join(', ')}</span>
            </div>
            {form.teamSize && <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Team Size</span><span className="font-semibold text-gray-900 dark:text-white">{form.teamSize}</span></div>}
            <div className="border-t border-green-200 dark:border-green-800/40 pt-2 flex justify-between font-bold text-green-700 dark:text-green-400 text-sm"><span>Total Paid</span><span>₹{total}</span></div>
          </div>
          <p className="text-sm text-gray-400 mb-6">Confirmation sent to <strong className="text-gray-600 dark:text-gray-300">{form.email}</strong></p>
          <div className="flex gap-3 justify-center">
            <button onClick={resetAll} className="btn-primary px-6 py-3">Book Another</button>
            <button onClick={() => navigate('/my-bookings')} className="border-2 border-green-500 dark:border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 px-6 py-3 rounded-xl font-bold transition-colors">My Bookings</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step bar ──────────────────────────────────────────────────────────────
  const StepBar = () => (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-[56px] z-30 shadow-sm">
      <button onClick={() => step > 0 ? setStep(step - 1) : window.history.back()}
        className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold text-sm">
        <ChevronLeft className="w-5 h-5" />
        {step === 0 ? 'Home' : step === 1 ? sport?.label : step === 2 ? turf?.name : 'Back'}
      </button>
      <div className="flex items-center gap-1">
        {STEP_LABELS.map((lbl, idx) => {
          const done = step > idx; const active = step === idx;
          return (
            <React.Fragment key={idx}>
              <div className={`flex items-center gap-1 ${idx > 0 ? 'hidden sm:flex' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${done?'bg-green-600 text-white':active?'bg-green-500 text-white ring-4 ring-green-100 dark:ring-green-900':'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {done ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span className={`text-xs font-semibold hidden md:block ${active?'text-green-600':done?'text-green-500':'text-gray-400'}`}>{lbl}</span>
              </div>
              {idx < STEP_LABELS.length - 1 && <div className={`h-0.5 w-5 sm:w-8 mx-0.5 ${done?'bg-green-500':'bg-gray-200 dark:bg-gray-700'}`} />}
            </React.Fragment>
          );
        })}
      </div>
      <div className="w-20" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-16">
      <StepBar />
      {step < 4 && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <ReservationBanner />
        </div>
      )}
      <div className="max-w-5xl mx-auto px-4 pt-6">

        {/* ══ STEP 0: Sport ══ */}
        {step === 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-display text-4xl tracking-wider text-gray-900 dark:text-white mb-2">BOOK A SLOT</h2>
              <p className="text-gray-500 dark:text-gray-400">Choose your sport to get started</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {SPORTS.map(s => (
                <button key={s.id} onClick={() => { setSport(s); setTurf(null); setSelected(new Set()); setSlots([]); setStep(1); }}
                  className={`bg-white dark:bg-gray-800 border-2 hover:shadow-lg rounded-2xl p-8 flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-100 ${s.bg}`}>
                  <span className="text-6xl">{s.emoji}</span>
                  <span className={`font-display text-2xl tracking-wider ${s.color}`}>{s.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{turfs.filter((t: TurfInfo)=>t.sport===s.id).length} turfs available</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ STEP 1: Turf ══ */}
        {step === 1 && sport && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-4xl mb-2">{sport.emoji}</div>
              <h2 className="font-display text-3xl tracking-wider text-gray-900 dark:text-white mb-1">SELECT {sport.label.toUpperCase()} TURF</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{filteredTurfs.length} turfs available in Sivakasi</p>
            </div>
            {turfsLoading && (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <div className="grid sm:grid-cols-3 gap-5">
              {!turfsLoading && filteredTurfs.map(t => (
                <button key={t.id} onClick={() => { setTurf(t); setSelected(new Set()); setSlots([]); setStep(2); }}
                  className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-green-400 hover:shadow-xl rounded-2xl overflow-hidden text-left transition-all group active:scale-[0.99]">
                  <div className="relative h-40 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { (e.target as HTMLImageElement).src = '/images/Turf.jpg'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4"><span className="text-white font-bold text-lg leading-tight">{t.name}</span></div>
                    <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">from ₹{t.priceDay}/hr</div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">{t.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.features.map(f => <span key={f} className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">{f}</span>)}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t.priceDay === t.priceNight
                          ? <><span className="font-semibold text-gray-800 dark:text-gray-200">₹{t.priceDay}/hr</span> flat</>
                          : <><span className="font-semibold text-gray-800 dark:text-gray-200">₹{t.priceDay}/hr</span> day · <span className="font-semibold text-gray-800 dark:text-gray-200">₹{t.priceNight}/hr</span> night</>}
                      </div>
                      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg group-hover:bg-green-600 transition-colors">Select →</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ STEP 2: Date + Slots ══ */}
        {step === 2 && turf && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-5">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img src={turf.image} alt={turf.name} className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = '/images/Turf.jpg'; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-lg">{sport?.emoji}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{turf.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{turf.description}</p>
                  <p className="text-xs text-green-700 font-semibold mt-0.5">
                    {turf.priceDay === turf.priceNight ? `₹${turf.priceDay}/hr flat` : `₹${turf.priceDay}/hr day · ₹${turf.priceNight}/hr night`}
                  </p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-green-600 font-bold hover:underline shrink-0">Change</button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Select Date</h2>
                <div className="grid grid-cols-7 gap-1.5 mb-4">
                  {pills.map(p => (
                    <button key={p.iso} onClick={() => { setDate(p.iso); setSelected(new Set()); }}
                      className={`rounded-xl py-2 px-1 text-center transition-all border-2 ${date===p.iso?'bg-green-600 border-green-600 text-white':'border-gray-200 dark:border-gray-700 hover:border-green-400 text-gray-700 dark:text-gray-300'}`}>
                      <div className="text-xs font-semibold">{p.label}</div>
                      <div className="text-base font-bold leading-tight">{p.date}</div>
                      <div className="text-xs">{p.month}</div>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  <Calendar className="w-4 h-4" /> Or pick a specific date
                </div>
                <input type="date" value={date} min={today}
                  max={new Date(Date.now() + 30*86400000).toISOString().split('T')[0]}
                  onChange={e => { setDate(e.target.value); setSelected(new Set()); }}
                  className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 rounded-xl px-4 py-2.5 outline-none text-sm dark:bg-gray-900 dark:text-gray-300" />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Available Time Slots</h2>
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 flex gap-2 items-start">
                  <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-green-800">
                    <strong>Save more!</strong> 2 slots = 10% off · 3+ slots = 20% off
                    {turf.priceDay !== turf.priceNight
                      ? <span className="block mt-0.5 text-green-700">Day (6AM–6PM): ₹{turf.priceDay}/hr · Night (6PM–6AM): ₹{turf.priceNight}/hr</span>
                      : <span className="block mt-0.5 text-green-700">Flat rate: ₹{turf.priceDay}/hr all hours</span>}
                  </div>
                </div>
                {slotsError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-3 flex justify-between">
                    {slotsError}<button onClick={() => fetchSlots(date, turf.id)} className="font-bold underline ml-2">Retry</button>
                  </div>
                )}
                {slotsLoading
                  ? <div className="flex items-center justify-center h-28"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>
                  : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-3">
                      {slots.map(slot => (
                        <button key={slot.slot} disabled={!slot.available && !slot.isYours} onClick={() => toggleSlot(slot)}
                          className={`rounded-xl p-2.5 text-center transition-all ${slotClass(slot)}`}>
                          <div className="text-xs font-bold leading-tight">{slot.from}</div>
                          <div className="text-xs opacity-70">to</div>
                          <div className="text-xs font-bold leading-tight">{slot.to}</div>
                          <div className={`text-xs mt-1 font-semibold ${selected.has(slot.slot)?'text-green-100':slot.isYours?'text-blue-500':slot.available?'text-gray-500':'text-gray-400'}`}>
                            {slot.isYours ? 'Yours' : `₹${slot.price}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-600 inline-block" /> Selected</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" /> Available</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-200 inline-block" /> Booked</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-200 inline-block" /> Yours</span>
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-[120px] self-start space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4">Booking Summary</h3>
                <div className="space-y-2.5 text-sm mb-4">
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Sport</span><span className="font-semibold">{sport?.emoji} {sport?.label}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Turf</span><span className="font-semibold text-xs text-right max-w-[55%]">{turf.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Date</span><span className="font-semibold text-xs">{fmtDisplay(date)}</span></div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500 shrink-0">Slots ({selected.size})</span>
                    <span className="font-semibold text-right text-xs ml-2">
                      {selected.size === 0
                        ? <span className="text-gray-400 italic">None</span>
                        : slots.filter(s=>selected.has(s.slot)).map(s=>`${s.from}-${s.to}`).join(', ')}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Base</span>
                    <span>₹{slots.filter(s=>selected.has(s.slot)).reduce((a,s)=>a+s.price,0)}</span>
                  </div>
                  {selected.size >= 2 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({selected.size >= 3 ? '20%' : '10%'})</span>
                      <span>-₹{slots.filter(s=>selected.has(s.slot)).reduce((a,s)=>a+s.price,0)-total}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-green-700 pt-1"><span>Total</span><span>₹{total}</span></div>
                </div>
                <button disabled={selected.size === 0 || slotsLoading} onClick={() => setStep(3)}
                  className="mt-4 w-full bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-bold transition-all text-sm">
                  Continue with {selected.size} slot{selected.size!==1?'s':''}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 3: Details ══ */}
        {step === 3 && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="font-bold text-2xl text-gray-900 dark:text-white mb-6">Your Details</h2>
              <div className="space-y-4 mb-8">
                <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                  <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name"
                    className="w-full border border-gray-300 dark:border-gray-700 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm dark:bg-gray-900 dark:text-gray-300" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                  <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"
                    className="w-full border border-gray-300 dark:border-gray-700 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm dark:bg-gray-900 dark:text-gray-300" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone (10 digits) *</label>
                  <input type="tel" maxLength={10} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value.replace(/\D/g,'')})}
                    placeholder="8056564775" className="w-full border border-gray-300 dark:border-gray-700 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm dark:bg-gray-900 dark:text-gray-300" />
                  <p className="text-xs text-gray-400 mt-1">Without country code</p></div>
                <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Team Size <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input type="number" min={1} max={22} value={form.teamSize} onChange={e=>setForm({...form,teamSize:e.target.value})}
                    placeholder="5" className="w-full border border-gray-300 dark:border-gray-700 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm dark:bg-gray-900 dark:text-gray-300" /></div>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(2)} className="flex-1 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl py-3.5 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Back</button>
                <button onClick={()=>setStep(4)} disabled={!form.name||!form.email||form.phone.length!==10}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3.5 font-bold transition-all">
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 4: Payment ══ */}
        {step === 4 && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white dark:bg-gray-800 w-full rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="font-bold text-2xl text-gray-900 dark:text-white mb-6">Complete Payment</h2>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-5 space-y-2 text-sm">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Booking Details</h3>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Sport</span><span className="font-semibold">{sport?.emoji} {sport?.label}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Turf</span><span className="font-semibold">{turf?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Date</span>
                  <span className="font-semibold">{new Date(date+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Slots</span><span className="font-semibold">{selected.size} slot{selected.size!==1?'s':''}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Name</span><span className="font-semibold">{form.name}</span></div>
                {form.teamSize && <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Team</span><span className="font-semibold">{form.teamSize} players</span></div>}
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-5 space-y-2 text-sm">
                {(() => {
                  const base = slots.filter(s=>selected.has(s.slot)).reduce((a,s)=>a+s.price,0) || resumeBase;
                  const discount = base - total;
                  return (<>
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Base Amount</span><span>₹{base}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({selected.size >= 3 ? '20%' : '10%'})</span>
                        <span>-₹{discount}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold text-base">
                      <span>Total</span><span className="text-green-600 text-xl">₹{total}</span>
                    </div>
                  </>);
                })()}
              </div>
              {bookingError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">⚠️ {bookingError}</div>}
              {payError     && <div className="bg-orange-50 border border-orange-200 text-orange-700 rounded-xl px-4 py-3 text-sm mb-4"><strong>Payment:</strong> {payError}</div>}

              {/* Reservation countdown banner */}
              {reserved && reservedUntil && countdown && (
                <div className={`rounded-xl p-4 mb-4 flex items-center gap-3 ${
                  countdown === '00:00' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
                }`}>
                  <Timer className={`w-5 h-5 shrink-0 ${countdown === '00:00' ? 'text-red-500' : 'text-amber-600'}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${countdown === '00:00' ? 'text-red-700' : 'text-amber-800'}`}>
                      {countdown === '00:00' ? 'Reservation expired!' : 'Slots reserved for you'}
                    </p>
                    <p className={`text-xs ${countdown === '00:00' ? 'text-red-600' : 'text-amber-700'}`}>
                      {countdown === '00:00' ? 'Please select slots again and try once more.' : 'Complete payment before the timer runs out.'}
                    </p>
                  </div>
                  {countdown !== '00:00' && (
                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-2xl text-amber-800">{countdown}</div>
                      <div className="text-[10px] text-amber-600">remaining</div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Two payment options ── */}
              <div className="space-y-3 mb-4">
                {/* Option 1: Pay Now with Razorpay */}
                <button onClick={handlePay} disabled={loading||payLoading||(reserved && countdown==='00:00')}
                  className="w-full btn-primary py-4 text-lg disabled:opacity-70 flex items-center justify-center gap-3">
                  {loading||payLoading
                    ? <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{payLoading?'Verifying...':'Opening Razorpay...'}</>
                    : <><CreditCard className="w-5 h-5"/> Pay ₹{total} Now</>}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">OR</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </div>

                {/* Option 2: Reserve Now (pay later within 30 mins) */}
                {!reserved ? (
                  <button onClick={handleReserve} disabled={reserveLoading||(reserved && countdown!=='00:00')}
                    className="w-full border-2 border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-xl py-4 font-bold text-lg disabled:opacity-70 flex items-center justify-center gap-3 transition-all">
                    {reserveLoading
                      ? <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Reserving...</>
                      : <><Clock className="w-5 h-5"/> Reserve Now · Pay Within 30 Mins</>}
                  </button>
                ) : countdown !== '00:00' ? (
                  <div className="border-2 border-green-400 bg-green-50 dark:bg-green-900/20 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-green-700 dark:text-green-400 font-bold text-sm">
                    <CheckCircle className="w-4 h-4" /> Slots reserved — complete payment above
                  </div>
                ) : null}
              </div>

              <p className="text-center text-xs text-gray-400 dark:text-gray-400 mb-4">🔒 Secured by Razorpay · UPI · Cards · Netbanking · Wallets</p>
              <div className="flex justify-center gap-2 mb-4 opacity-50">
                {['Visa','Mastercard','UPI','RuPay','PhonePe','GPay'].map(m=>(
                  <span key={m} className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded">{m}</span>
                ))}
              </div>

              {!reserved && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 mb-4">
                  <strong>Reserve Now:</strong> Hold your slots for 30 minutes while you arrange payment. Auto-cancelled if not paid within the deadline.
                </div>
              )}

              <button onClick={()=>setStep(3)} className="w-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl py-3 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Back to Details</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;