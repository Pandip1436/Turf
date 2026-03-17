import React, { useState } from 'react';
import { CheckCircle, ChevronLeft, CreditCard, Lightbulb, Calendar } from 'lucide-react';

interface SlotInfo {
  label: string;
  from: string;
  to: string;
  isNight: boolean;
  price: number;
  available: boolean;
}

const TAKEN = new Set(['7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM', '10:00 AM - 11:00 AM']);

function buildSlots(): SlotInfo[] {
  const slots: SlotInfo[] = [];
  // 6 AM → midnight
  for (let h = 6; h < 24; h++) {
    const fmtHour = (hr: number) => {
      const h12 = hr % 12 === 0 ? 12 : hr % 12;
      return `${h12}:00 ${hr < 12 ? 'AM' : 'PM'}`;
    };
    const from = fmtHour(h);
    const to = fmtHour(h + 1);
    const key = `${from} - ${to}`;
    slots.push({
      label: key,
      from,
      to,
      isNight: h >= 18,
      price: h >= 18 ? 1000 : 600,
      available: !TAKEN.has(key),
    });
  }
  // midnight → 6 AM
  for (let h = 0; h < 6; h++) {
    const fmtHour = (hr: number) => {
      const h12 = hr % 12 === 0 ? 12 : hr % 12;
      return `${h12}:00 ${hr < 12 ? 'AM' : 'PM'}`;
    };
    const from = fmtHour(h);
    const to = fmtHour(h + 1);
    const key = `${from} - ${to}`;
    slots.push({ label: key, from, to, isNight: true, price: 1000, available: !TAKEN.has(key) });
  }
  return slots;
}

function getDatePills() {
  const pills = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    pills.push({
      label: i === 0 ? 'Today' : dayNames[d.getDay()],
      date: d.getDate(),
      month: monthNames[d.getMonth()],
      iso: d.toISOString().split('T')[0],
    });
  }
  return pills;
}

function fmtISOToDisplay(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function calcTotal(slots: SlotInfo[], selected: Set<string>): number {
  let total = 0;
  slots.forEach(s => { if (selected.has(s.label)) total += s.price; });
  // Multi-slot consecutive discount
  const count = selected.size;
  if (count === 2) total = Math.round(total * 0.9);
  if (count >= 3) total = Math.round(total * 0.8);
  return total;
}

const BookingPage = () => {
  const today = new Date().toISOString().split('T')[0];
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(today);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ name: '', email: '', phone: '', teamSize: '' });
  const [confirmed, setConfirmed] = useState(false);
  const [bookingId] = useState(`HG${Date.now().toString().slice(-6)}`);
  const [loading, setLoading] = useState(false);

  const allSlots = buildSlots();
  const pills = getDatePills();
  const total = calcTotal(allSlots, selectedSlots);

  const toggleSlot = (slot: SlotInfo) => {
    if (!slot.available) return;
    const next = new Set(selectedSlots);
    if (next.has(slot.label)) next.delete(slot.label);
    else next.add(slot.label);
    setSelectedSlots(next);
  };

  const slotClass = (slot: SlotInfo) => {
    if (!slot.available) return 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-60';
    if (selectedSlots.has(slot.label)) return 'bg-green-600 border-2 border-green-700 text-white cursor-pointer';
    return 'bg-white border border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50 cursor-pointer';
  };

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setConfirmed(true);
  };

  /* ── CONFIRMED ── */
  if (confirmed) {
    const slotList = allSlots.filter(s => selectedSlots.has(s.label));
    return (
      <div className="min-h-screen bg-gray-50 pt-24  pb-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-display text-4xl tracking-wider text-gray-900 mb-2">BOOKING CONFIRMED!</h2>
          <p className="text-gray-500 mb-6">Your slot has been reserved. See you on the field! 🏆</p>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Booking ID</span><span className="font-bold text-green-700">{bookingId}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Name</span><span className="font-semibold">{form.name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-semibold">{fmtISOToDisplay(date)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Slots</span>
              <span className="font-semibold text-right">
                {slotList.map(s => `${s.from} - ${s.to}`).join(', ')}
              </span>
            </div>
            {form.teamSize && <div className="flex justify-between text-sm"><span className="text-gray-500">Team Size</span><span className="font-semibold">{form.teamSize}</span></div>}
            <div className="border-t pt-2 flex justify-between font-bold text-green-700 text-sm"><span>Total Paid</span><span>₹{total}</span></div>
          </div>
          <p className="text-sm text-gray-400 mb-6">Confirmation sent to <strong>{form.email}</strong></p>
          <button
            onClick={() => { setConfirmed(false); setStep(1); setSelectedSlots(new Set()); setForm({ name: '', email: '', phone: '', teamSize: '' }); }}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold transition-colors"
          >
            Book Another Slot
          </button>
        </div>
      </div>
    );
  }

  /* ── STEP LABELS ── */
  const stepLabels = ['Select Slot', 'Your Details', 'Payment'];

  return (
    <div className="min-h-screen bg-gray-50  pt-20 pb-16">
      {/* ── TOP BAR ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-[56px] z-30 shadow-sm">
        <button onClick={() => step > 1 ? setStep(step - 1) : window.history.back()}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-semibold text-sm">
          <ChevronLeft className="w-5 h-5" /> Book Your Slot
        </button>
        {/* Progress stepper */}
        <div className="flex items-center gap-0">
          {stepLabels.map((lbl, idx) => {
            const s = idx + 1;
            const done = step > s;
            const active = step === s;
            return (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${done ? 'bg-green-600 text-white' : active ? 'bg-green-500 text-white ring-4 ring-green-100' : 'bg-gray-200 text-gray-500'}`}>
                    {done ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  <span className={`text-sm font-semibold hidden sm:block ${active ? 'text-green-600' : done ? 'text-green-500' : 'text-gray-400'}`}>{lbl}</span>
                </div>
                {idx < 2 && (
                  <div className={`h-0.5 w-8 sm:w-16 mx-1 transition-colors ${done ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="w-24" /> {/* spacer */}
      </div>

      {/* ── BODY ── */}
      <div className={`max-w-6xl mx-auto px-4 pt-6 ${step === 1 ? 'grid lg:grid-cols-[1fr_340px] gap-6' : 'max-w-2xl'}`}>

        {/* ══════════════════ STEP 1 ══════════════════ */}
        {step === 1 && (
          <>
            <div className="space-y-6">
              {/* Date picker */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-xl text-gray-900 mb-5">Select Date</h2>

                {/* Quick pills */}
                <p className="text-sm text-gray-500 mb-3 font-medium">Quick selection</p>
                <div className="grid grid-cols-7 gap-2 mb-5">
                  {pills.map(p => (
                    <button
                      key={p.iso}
                      onClick={() => { setDate(p.iso); setSelectedSlots(new Set()); }}
                      className={`rounded-xl py-2.5 px-1 text-center transition-all border-2 ${
                        date === p.iso
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-200 hover:border-green-400 text-gray-700'
                      }`}
                    >
                      <div className="text-xs font-semibold">{p.label}</div>
                      <div className="text-lg font-bold leading-tight">{p.date}</div>
                      <div className="text-xs">{p.month}</div>
                    </button>
                  ))}
                </div>

                {/* Specific date input */}
                <p className="text-sm text-gray-500 mb-2 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Or select a specific date
                </p>
                <input
                  type="date"
                  value={date}
                  min={today}
                  max={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}
                  onChange={e => { setDate(e.target.value); setSelectedSlots(new Set()); }}
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm"
                />
                <p className="text-xs text-gray-400 mt-2">You can book from today up to 30 days in advance</p>
              </div>

              {/* Time slots */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-xl text-gray-900 mb-4">Available Time Slots</h2>

                {/* Discount tip */}
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5 flex gap-2 items-start">
                  <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <strong>Save More!</strong> Book consecutive hours for discounts:
                    <ul className="mt-1 space-y-0.5 text-green-700">
                      <li>• Morning (6AM–6PM): 2+ hours = ₹500/hour</li>
                      <li>• Evening (6PM–6AM): 2 hours = 10% off, 3+ hours = 20% off</li>
                    </ul>
                  </div>
                </div>

                {/* Slot grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                  {allSlots.map(slot => (
                    <button
                      key={slot.label}
                      disabled={!slot.available}
                      onClick={() => toggleSlot(slot)}
                      className={`rounded-xl p-2.5 text-center transition-all ${slotClass(slot)}`}
                    >
                      <div className="text-xs font-bold leading-tight">{slot.from}</div>
                      <div className="text-xs text-current opacity-70">to</div>
                      <div className="text-xs font-bold leading-tight">{slot.to}</div>
                      <div className={`text-xs mt-1 font-semibold ${selectedSlots.has(slot.label) ? 'text-green-100' : slot.available ? 'text-gray-500' : 'text-gray-400'}`}>
                        ₹{slot.price}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-600 inline-block" /> Selected</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-400 inline-block" /> Consecutive (Discount)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" /> Available</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-200 inline-block" /> Booked</span>
                </div>
              </div>
            </div>

            {/* ── SIDEBAR SUMMARY ── */}
            <div className="lg:sticky lg:top-[120px] space-y-4 self-start">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-5">Booking Summary</h3>
                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Facility</span>
                    <span className="font-semibold text-right">HyperGreen 360 Turf</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-semibold text-right text-xs">{fmtISOToDisplay(date)}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500 shrink-0">Time Slots ({selectedSlots.size})</span>
                    <span className="font-semibold text-right text-xs ml-2">
                      {selectedSlots.size === 0
                        ? <span className="text-gray-400 italic">None selected</span>
                        : allSlots.filter(s => selectedSlots.has(s.label)).map(s => `${s.from} - ${s.to}`).join(', ')}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Base Amount</span>
                    <span>₹{allSlots.filter(s => selectedSlots.has(s.label)).reduce((a, s) => a + s.price, 0)}</span>
                  </div>
                  {selectedSlots.size >= 2 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Multi-slot discount</span>
                      <span>- ₹{allSlots.filter(s => selectedSlots.has(s.label)).reduce((a, s) => a + s.price, 0) - total}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base text-green-700 pt-1">
                    <span>Total Amount</span>
                    <span>₹{total}</span>
                  </div>
                </div>
                <button
                  disabled={selectedSlots.size === 0}
                  onClick={() => setStep(2)}
                  className="mt-5 w-full bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3.5 font-bold transition-all"
                >
                  Continue with {selectedSlots.size} slot{selectedSlots.size !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════ STEP 2 ══════════════════ */}
        {step === 2 && (
          <div className="w-full bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="font-bold text-2xl text-gray-900 mb-6">Your Details</h2>

            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Muthu Pandi"
                  className="w-full border border-gray-300 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number (10 digits)</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="8056564775"
                  className="w-full border border-gray-300 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm"
                />
                <p className="text-xs text-gray-400 mt-1.5">Enter 10-digit mobile number without country code</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Team Size <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input
                  type="number"
                  min={1}
                  max={22}
                  value={form.teamSize}
                  onChange={e => setForm({ ...form, teamSize: e.target.value })}
                  placeholder="5"
                  className="w-full border border-gray-300 focus:border-green-500 rounded-xl px-4 py-3 outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border-2 border-gray-200 text-gray-600 rounded-xl py-3.5 font-bold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!form.name || !form.email || form.phone.length !== 10}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3.5 font-bold transition-all"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════ STEP 3 ══════════════════ */}
        {step === 3 && (
          <<div className="bg-white w-full rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="font-bold text-2xl text-gray-900 mb-6">Complete Payment</h2>

            {/* Booking details */}
            <div className="bg-gray-50 rounded-xl p-5 mb-5">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Booking Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-semibold">{new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
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

            {/* Amount */}
            <div className="border border-gray-200 rounded-xl p-5 mb-5 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Base Amount</span>
                <span>₹{allSlots.filter(s => selectedSlots.has(s.label)).reduce((a, s) => a + s.price, 0)}</span>
              </div>
              {selectedSlots.size >= 2 && (
                <div className="flex justify-between text-green-600">
                  <span>Multi-slot discount</span>
                  <span>- ₹{allSlots.filter(s => selectedSlots.has(s.label)).reduce((a, s) => a + s.price, 0) - total}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Total to Pay</span>
                <span className="text-green-600 text-xl">₹{total}</span>
              </div>
            </div>

            {/* Pay button */}
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:opacity-90 text-white rounded-xl py-4 font-bold text-lg transition-all disabled:opacity-70 flex items-center justify-center gap-3 mb-3"
            >
              <CreditCard className="w-5 h-5" />
              {loading ? 'Processing...' : `Pay ₹${total} with Razorpay`}
            </button>
            <p className="text-center text-xs text-gray-400 mb-5 flex items-center justify-center gap-3">
              <span>🔒 Secure Payment</span>
              <span>•</span>
              <span>UPI, Cards, Netbanking</span>
            </p>

            {/* Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 mb-5">
              <strong>Note:</strong> Your slot will be reserved once you click pay. If payment fails, you can retry from My Bookings.
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full border border-gray-200 text-gray-600 rounded-xl py-3.5 font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;