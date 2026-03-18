/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, ChevronLeft, CreditCard, Lightbulb, Calendar } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string; amount: number; currency: string;
  name: string; description: string; order_id: string;
  prefill: { name: string; email: string; contact: string };
  notes: Record<string, string>;
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
}
interface RazorpayInstance { open: () => void; on: (event: string, handler: (r: unknown) => void) => void; }
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface SlotInfo {
  slot: string; from: string; to: string;
  isNight: boolean; price: number; available: boolean; isYours: boolean;
}

// Read Razorpay key from env — fallback to key returned by backend
const ENV_RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function getDatePills() {
  const now = new Date();
  const DN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() + i);
    return { label: i === 0 ? 'Today' : DN[d.getDay()], date: d.getDate(), month: MN[d.getMonth()], iso: d.toISOString().split('T')[0] };
  });
}

function fmtDisplay(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const DN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${DN[d.getDay()]}, ${MN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function calcTotal(slots: SlotInfo[] | undefined, selected: Set<string>): number {
  if (!slots || !Array.isArray(slots)) return 0;
  const base = slots.filter(s => selected.has(s.slot)).reduce((a, s) => a + s.price, 0);
  const n = selected.size;
  if (n === 2) return Math.round(base * 0.9);
  if (n >= 3)  return Math.round(base * 0.8);
  return base;
}

const BookingPage = () => {
  const today = new Date().toISOString().split('T')[0];
  const { user } = useAuth();

  const [step,          setStep]         = useState(1);
  const [date,          setDate]         = useState(today);
  const [slots,         setSlots]        = useState<SlotInfo[]>([]);
  const [slotsLoading,  setSlotsLoading] = useState(false);
  const [slotsError,    setSlotsError]   = useState('');
  const [selectedSlots, setSelected]     = useState<Set<string>>(new Set());
  const [form,          setForm]         = useState({
    name: user?.name || '', email: user?.email || '', phone: '', teamSize: '',
  });
  const [confirmed,    setConfirmed]    = useState(false);
  const [bookingRef,   setBookingRef]   = useState('');
  const [bookingId,    setBookingId]    = useState('');
  const [loading,      setLoading]      = useState(false);
  const [payLoading,   setPayLoading]   = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [payError,     setPayError]     = useState('');

  const pills = getDatePills();
  const total = calcTotal(slots, selectedSlots);

  const fetchSlots = useCallback(async (d: string) => {
    setSlotsLoading(true); setSlotsError('');
    try {
      const res = await api.get(`/bookings/slots?date=${d}`);
      setSlots(res.data.slots ?? []);
    } catch { setSlotsError('Failed to load slots. Please try again.'); }
    finally { setSlotsLoading(false); }
  }, []);

  useEffect(() => { fetchSlots(date); }, [date]);
  useEffect(() => { if (user) setForm(f => ({ ...f, name: user.name, email: user.email })); }, [user]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step, confirmed]);
  useEffect(() => { if (step === 3) loadRazorpayScript(); }, [step]);

  const toggleSlot = (slot: SlotInfo) => {
    if (!slot.available) return;
    const next = new Set(selectedSlots);
    if (next.has(slot.slot)) next.delete(slot.slot); else next.add(slot.slot);
    setSelected(next);
  };

  const slotClass = (slot: SlotInfo) => {
    if (!slot.available && !slot.isYours) return 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-60';
    if (slot.isYours)                     return 'bg-blue-100 border-2 border-blue-400 text-blue-700 cursor-default';
    if (selectedSlots.has(slot.slot))     return 'bg-green-600 border-2 border-green-700 text-white cursor-pointer';
    return 'bg-white border border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50 cursor-pointer';
  };

  const handlePay = async () => {
    setBookingError(''); setPayError(''); setLoading(true);
    let bkId = bookingId;

    try {
      // ── A: Create booking record
      if (!bkId) {
        const bkRes = await api.post('/bookings', {
          userName:  form.name,
          userEmail: form.email,
          userPhone: form.phone,
          teamSize:  form.teamSize ? parseInt(form.teamSize) : undefined,
          sport:     'football',
          date,
          timeSlots: Array.from(selectedSlots),
        });
        bkId = bkRes.data.booking._id;
        setBookingId(bkId);
        setBookingRef(bkRes.data.booking.bookingRef);
      }

      // ── B: Create Razorpay order (send rupees; backend converts to paise)
      const orderRes = await api.post('/payments/create-order', {
        bookingId: bkId,
        amount:    total,
      });
      const { orderId, keyId: backendKeyId, amount: paise } = orderRes.data;

      // ── Use env key first, fallback to key from backend response
      const razorpayKey = ENV_RAZORPAY_KEY || backendKeyId;

      if (!razorpayKey) {
        setPayError('Razorpay key not configured. Set VITE_RAZORPAY_KEY_ID in your .env.local file.');
        setLoading(false);
        return;
      }

      setLoading(false);

      // ── C: Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setPayError('Razorpay SDK failed to load. Check your internet connection.');
        return;
      }

      const options: RazorpayOptions = {
        key:         razorpayKey,
        amount:      paise,
        currency:    'INR',
        name:        import.meta.env.VITE_APP_NAME || 'HyperGreen 360 Turf',
        description: `Slot booking – ${date}`,
        order_id:    orderId,
        prefill: {
          name:    form.name,
          email:   form.email,
          contact: `+91${form.phone}`,
        },
        notes: {
          bookingId: bkId,
          date,
          slots: Array.from(selectedSlots).join(', '),
        },
        theme: { color: '#22c55e' },

        handler: async (response: RazorpayResponse) => {
          setPayLoading(true);
          try {
            await api.post('/payments/verify', {
              bookingId:          bkId,
              razorpayOrderId:    response.razorpay_order_id,
              razorpayPaymentId:  response.razorpay_payment_id,
              razorpaySignature:  response.razorpay_signature,
            });
            setConfirmed(true);
          } catch {
            setPayError(
              `Verification failed. Contact support with Payment ID: ${response.razorpay_payment_id}`
            );
          } finally {
            setPayLoading(false);
          }
        },

        modal: {
          ondismiss: () => setPayError('Payment cancelled. Slot is held for 10 minutes. Try again.'),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r: unknown) => {
        const err = (r as { error?: { description?: string } }).error;
        setPayError(err?.description || 'Payment failed. Try a different method.');
      });
      rzp.open();

    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; takenSlots?: string[] } } };
      setBookingError(e.response?.data?.message || 'Something went wrong. Please try again.');
      if (e.response?.data?.takenSlots) { fetchSlots(date); setStep(1); }
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setConfirmed(false); setStep(1); setSelected(new Set());
    setForm({ name: user?.name || '', email: user?.email || '', phone: '', teamSize: '' });
    setBookingError(''); setPayError(''); setBookingId(''); setBookingRef('');
  };

  /* ── CONFIRMED ── */
  if (confirmed) {
    const slotList = (slots ?? []).filter(s => selectedSlots.has(s.slot));
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-display text-4xl tracking-wider text-gray-900 mb-2">BOOKING CONFIRMED!</h2>
          <p className="text-gray-500 mb-6">Payment successful. See you on the field! 🏆</p>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Booking ID</span><span className="font-bold text-green-700">{bookingRef}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Name</span><span className="font-semibold">{form.name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-semibold">{fmtDisplay(date)}</span></div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Slots</span>
              <span className="font-semibold text-right text-xs max-w-[60%]">{slotList.map(s => `${s.from} - ${s.to}`).join(', ')}</span>
            </div>
            {form.teamSize && <div className="flex justify-between text-sm"><span className="text-gray-500">Team Size</span><span className="font-semibold">{form.teamSize}</span></div>}
            <div className="border-t pt-2 flex justify-between font-bold text-green-700 text-sm"><span>Total Paid</span><span>₹{total}</span></div>
          </div>
          <p className="text-sm text-gray-400 mb-6">Confirmation sent to <strong>{form.email}</strong></p>
          <button onClick={resetAll} className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold transition-colors">
            Book Another Slot
          </button>
        </div>
      </div>
    );
  }

  const stepLabels = ['Select Slot', 'Your Details', 'Payment'];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* TOP BAR */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-[56px] z-30 shadow-sm">
        <button onClick={() => step > 1 ? setStep(step - 1) : window.history.back()}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-semibold text-sm">
          <ChevronLeft className="w-5 h-5" /> Book Your Slot
        </button>
        <div className="flex items-center">
          {stepLabels.map((lbl, idx) => {
            const s = idx + 1; const done = step > s; const active = step === s;
            return (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${done ? 'bg-green-600 text-white' : active ? 'bg-green-500 text-white ring-4 ring-green-100' : 'bg-gray-200 text-gray-500'}`}>
                    {done ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  <span className={`text-sm font-semibold hidden sm:block ${active ? 'text-green-600' : done ? 'text-green-500' : 'text-gray-400'}`}>{lbl}</span>
                </div>
                {idx < 2 && <div className={`h-0.5 w-8 sm:w-16 mx-1 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </React.Fragment>
            );
          })}
        </div>
        <div className="w-24" />
      </div>

      <div className={`max-w-6xl mx-auto px-4 pt-6 ${step === 1 ? 'grid lg:grid-cols-[1fr_340px] gap-6' : 'max-w-2xl'}`}>

        {/* ══ STEP 1 ══ */}
        {step === 1 && (
          <>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-xl text-gray-900 mb-5">Select Date</h2>
                <p className="text-sm text-gray-500 mb-3 font-medium">Quick selection</p>
                <div className="grid grid-cols-7 gap-2 mb-5">
                  {pills.map(p => (
                    <button key={p.iso} onClick={() => { setDate(p.iso); setSelected(new Set()); }}
                      className={`rounded-xl py-2.5 px-1 text-center transition-all border-2 ${
                        date === p.iso ? 'bg-green-600 border-green-600 text-white' : 'border-gray-200 hover:border-green-400 text-gray-700'}`}>
                      <div className="text-xs font-semibold">{p.label}</div>
                      <div className="text-lg font-bold leading-tight">{p.date}</div>
                      <div className="text-xs">{p.month}</div>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mb-2 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Or select a specific date
                </p>
                <input type="date" value={date} min={today}
                  max={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}
                  onChange={e => { setDate(e.target.value); setSelected(new Set()); }}
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm" />
                <p className="text-xs text-gray-400 mt-2">Book up to 30 days in advance</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-xl text-gray-900 mb-4">Available Time Slots</h2>
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5 flex gap-2 items-start">
                  <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <strong>Save More!</strong> Book consecutive hours:
                    <ul className="mt-1 text-xs text-green-700 space-y-0.5">
                      <li>• Morning (6AM–6PM): 2+ hrs = ₹500/hr</li>
                      <li>• Evening (6PM–6AM): 2 hrs = 10% off, 3+ hrs = 20% off</li>
                    </ul>
                  </div>
                </div>
                {slotsError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4 flex justify-between">
                    {slotsError}
                    <button onClick={() => fetchSlots(date)} className="font-bold underline ml-2">Retry</button>
                  </div>
                )}
                {slotsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                    {slots.map(slot => (
                      <button key={slot.slot} disabled={!slot.available && !slot.isYours}
                        onClick={() => toggleSlot(slot)}
                        className={`rounded-xl p-2.5 text-center transition-all ${slotClass(slot)}`}>
                        <div className="text-xs font-bold leading-tight">{slot.from}</div>
                        <div className="text-xs opacity-70">to</div>
                        <div className="text-xs font-bold leading-tight">{slot.to}</div>
                        <div className={`text-xs mt-1 font-semibold ${
                          selectedSlots.has(slot.slot) ? 'text-green-100' :
                          slot.isYours ? 'text-blue-500' :
                          slot.available ? 'text-gray-500' : 'text-gray-400'}`}>
                          {slot.isYours ? 'Yours' : `₹${slot.price}`}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-600 inline-block" /> Selected</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" /> Available</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-200 inline-block" /> Booked</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-200 inline-block" /> Your Booking</span>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:sticky lg:top-[120px] space-y-4 self-start">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-5">Booking Summary</h3>
                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Facility</span>
                    <span className="font-semibold">{import.meta.env.VITE_APP_NAME || 'HyperGreen 360 Turf'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-semibold text-xs">{fmtDisplay(date)}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500 shrink-0">Slots ({selectedSlots.size})</span>
                    <span className="font-semibold text-right text-xs ml-2">
                      {selectedSlots.size === 0
                        ? <span className="text-gray-400 italic">None selected</span>
                        : slots.filter(s => selectedSlots.has(s.slot)).map(s => `${s.from} - ${s.to}`).join(', ')}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Base Amount</span>
                    <span>₹{slots.filter(s => selectedSlots.has(s.slot)).reduce((a, s) => a + s.price, 0)}</span>
                  </div>
                  {selectedSlots.size >= 2 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>- ₹{slots.filter(s => selectedSlots.has(s.slot)).reduce((a, s) => a + s.price, 0) - total}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base text-green-700 pt-1">
                    <span>Total</span><span>₹{total}</span>
                  </div>
                </div>
                <button disabled={selectedSlots.size === 0 || slotsLoading}
                  onClick={() => setStep(2)}
                  className="mt-5 w-full bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3.5 font-bold transition-all">
                  Continue with {selectedSlots.size} slot{selectedSlots.size !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ══ STEP 2 ══ */}
        {step === 2 && (
          <div className="w-full bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="font-bold text-2xl text-gray-900 mb-6">Your Details</h2>
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full border border-gray-300 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number (10 digits) *</label>
                <input type="tel" maxLength={10} value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="8056564775"
                  className="w-full border border-gray-300 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm" />
                <p className="text-xs text-gray-400 mt-1.5">Without country code</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Team Size <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input type="number" min={1} max={22} value={form.teamSize}
                  onChange={e => setForm({ ...form, teamSize: e.target.value })}
                  placeholder="5"
                  className="w-full border border-gray-300 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 border-2 border-gray-200 text-gray-600 rounded-xl py-3.5 font-bold hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button onClick={() => setStep(3)}
                disabled={!form.name || !form.email || form.phone.length !== 10}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3.5 font-bold transition-all">
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 3 ══ */}
        {step === 3 && (
          <div className="bg-white w-full rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="font-bold text-2xl text-gray-900 mb-6">Complete Payment</h2>

            <div className="bg-gray-50 rounded-xl p-5 mb-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Booking Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-semibold">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Slots</span>
                  <span className="font-semibold">{selectedSlots.size} slot{selectedSlots.size !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-semibold">{form.name}</span>
                </div>
                {form.teamSize && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Team Size</span>
                    <span className="font-semibold">{form.teamSize} players</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 mb-5 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Base Amount</span>
                <span>₹{slots.filter(s => selectedSlots.has(s.slot)).reduce((a, s) => a + s.price, 0)}</span>
              </div>
              {selectedSlots.size >= 2 && (
                <div className="flex justify-between text-green-600">
                  <span>Multi-slot discount</span>
                  <span>- ₹{slots.filter(s => selectedSlots.has(s.slot)).reduce((a, s) => a + s.price, 0) - total}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Total to Pay</span>
                <span className="text-green-600 text-xl">₹{total}</span>
              </div>
            </div>

            {bookingError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2">
                <span>⚠️</span> {bookingError}
              </div>
            )}
            {payError && (
              <div className="bg-orange-50 border border-orange-200 text-orange-700 rounded-xl px-4 py-3 text-sm mb-4">
                <strong>Payment Status:</strong> {payError}
              </div>
            )}

            <button onClick={handlePay} disabled={loading || payLoading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:opacity-90 text-white rounded-xl py-4 font-bold text-lg transition-all disabled:opacity-70 flex items-center justify-center gap-3 mb-3">
              {loading || payLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {payLoading ? 'Verifying...' : 'Opening Razorpay...'}
                </>
              ) : (
                <><CreditCard className="w-5 h-5" /> Pay ₹{total} with Razorpay</>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mb-4 flex items-center justify-center gap-2">
              <span>🔒 Secured by Razorpay</span><span>•</span><span>UPI · Cards · Netbanking · Wallets</span>
            </p>

            <div className="flex items-center justify-center gap-2 mb-5 opacity-50">
              {['Visa', 'Mastercard', 'UPI', 'RuPay', 'PhonePe', 'GPay'].map(m => (
                <span key={m} className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">{m}</span>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 mb-5">
              <strong>Note:</strong> Your slot is reserved once payment succeeds. Failed payments release the slot automatically.
            </div>

            <button onClick={() => setStep(2)}
              className="w-full border border-gray-200 text-gray-600 rounded-xl py-3.5 font-semibold hover:bg-gray-50 transition-colors">
              Back to Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;