import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ReservationBanner from '../components/ReservationBanner';
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw,
  MapPin, Receipt, ChevronDown, ChevronUp, CreditCard, Tag, Timer, Users, Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

interface Booking {
  _id:           string;
  bookingRef:    string;
  date:          string;
  timeSlots:     string[];
  sport:         string;
  turfId:        string;
  turfName:      string;
  duration:      number;
  totalAmount:   number;
  status:        string;
  paymentStatus: string;
  cancelledAt?:  string;
}

const SPORT_EMOJI: Record<string, string> = { football: '⚽', cricket: '🏏', badminton: '🏸' };

const STATUS_CONFIG: Record<string, { bg: string; icon: typeof CheckCircle; label: string }> = {
  confirmed: { bg: 'bg-green-500/10 text-green-600 border border-green-500/20', icon: CheckCircle, label: 'Confirmed' },
  pending:   { bg: 'bg-amber-500/10 text-amber-600 border border-amber-500/20', icon: AlertCircle, label: 'Pending' },
  cancelled: { bg: 'bg-red-500/10 text-red-500 border border-red-500/20',       icon: XCircle,     label: 'Cancelled' },
  completed: { bg: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',    icon: CheckCircle, label: 'Completed' },
  'no-show': { bg: 'bg-gray-500/10 text-gray-500 border border-gray-500/20',    icon: AlertCircle, label: 'No Show' },
};

const PAYMENT_CONFIG: Record<string, string> = {
  paid:    'bg-green-500/10 text-green-600',
  failed:  'bg-red-500/10 text-red-500',
  pending: 'bg-amber-500/10 text-amber-600',
  refunded: 'bg-blue-500/10 text-blue-600',
};

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function fmtDateLong(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── Booking Card ────────────────────────────────────────────────────────────
const BookingCard = ({
  b, onCancel, cancelling,
}: { b: Booking; onCancel: (id: string) => void; cancelling: string | null }) => {
  const [expanded, setExpanded] = useState(false);
  const billRef = useRef<HTMLDivElement>(null);
  const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const pricePerSlot = b.totalAmount / (b.timeSlots?.length || 1);

  const downloadBill = () => {
    const slots = b.timeSlots || [];
    const discount = slots.length >= 3 ? '20%' : slots.length === 2 ? '10%' : '';
    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Booking Receipt - ${b.bookingRef}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background:#fff; color:#1a1a1a; padding:40px; max-width:600px; margin:0 auto; }
  .header { text-align:center; border-bottom:2px dashed #e5e7eb; padding-bottom:20px; margin-bottom:20px; }
  .header h1 { font-size:22px; letter-spacing:3px; font-weight:800; color:#111; }
  .header p { font-size:11px; color:#9ca3af; margin-top:4px; }
  .badge { display:inline-block; background:#f0fdf4; color:#16a34a; font-size:11px; font-weight:700; padding:4px 12px; border-radius:20px; border:1px solid #bbf7d0; margin-top:10px; }
  .section { margin-bottom:16px; }
  .row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; }
  .row .label { color:#6b7280; }
  .row .value { font-weight:600; color:#111; text-align:right; max-width:55%; }
  .divider { border-top:1px dashed #e5e7eb; margin:12px 0; }
  .divider-bold { border-top:2px solid #111; margin:12px 0; }
  .slot { display:flex; justify-content:space-between; padding:5px 0; font-size:13px; }
  .slot-num { display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; background:#f0fdf4; color:#16a34a; border-radius:4px; font-size:10px; font-weight:700; margin-right:8px; }
  .discount { color:#16a34a; font-size:12px; display:flex; justify-content:space-between; padding:4px 0; }
  .total { display:flex; justify-content:space-between; align-items:center; padding:10px 0; }
  .total .label { font-size:15px; font-weight:700; }
  .total .amount { font-size:24px; font-weight:900; }
  .footer { text-align:center; border-top:2px dashed #e5e7eb; padding-top:16px; margin-top:16px; }
  .footer p { font-size:10px; color:#9ca3af; }
  .footer .thanks { font-size:12px; color:#6b7280; margin-bottom:4px; }
  @media print { body { padding:20px; } }
</style>
</head><body>
<div class="header">
  <h1>HYPERGREEN 360 TURF</h1>
  <p>Housing Board, Sivakasi – 626 123, Tamil Nadu</p>
  <p>Phone: +91 80565 64775</p>
  <div class="badge">${b.status.toUpperCase()}</div>
</div>

<div class="section">
  <div class="row"><span class="label">Booking Ref</span><span class="value" style="font-family:monospace">${b.bookingRef}</span></div>
  <div class="row"><span class="label">Date</span><span class="value">${fmtDateLong(b.date)}</span></div>
  <div class="row"><span class="label">Turf</span><span class="value">${b.turfName}</span></div>
  <div class="row"><span class="label">Sport</span><span class="value">${b.sport?.charAt(0).toUpperCase() + b.sport?.slice(1)}</span></div>
  <div class="row"><span class="label">Duration</span><span class="value">${b.duration} hour${b.duration > 1 ? 's' : ''}</span></div>
</div>

<div class="divider"></div>

<div class="section">
  ${slots.map((s, i) => `<div class="slot"><span><span class="slot-num">${i + 1}</span>${s}</span><span style="font-weight:600">₹${Math.round(pricePerSlot)}</span></div>`).join('')}
</div>

${discount ? `<div class="discount"><span>Multi-slot discount (${discount})</span><span style="font-weight:600">Applied</span></div>` : ''}

<div class="divider-bold"></div>

<div class="total">
  <span class="label">Total Paid</span>
  <span class="amount">₹${b.totalAmount}</span>
</div>

<div class="divider"></div>

<div class="section">
  <div class="row"><span class="label">Payment Method</span><span class="value">Razorpay</span></div>
  <div class="row"><span class="label">Payment Status</span><span class="value" style="color:${b.paymentStatus === 'paid' ? '#16a34a' : '#ef4444'}">${b.paymentStatus?.toUpperCase()}</span></div>
</div>

<div class="footer">
  <p class="thanks">Thank you for booking with HyperGreen 360!</p>
  <p>Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
</div>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); }, 300);
    } else {
      // Fallback: download as HTML file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HG360-Receipt-${b.bookingRef}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* ── Top color bar ── */}
      <div className={`h-1 ${
        b.status === 'confirmed' ? 'bg-green-500' :
        b.status === 'completed' ? 'bg-blue-500' :
        b.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
      }`} />

      {/* ── Header ── */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            {/* Ref + Sport */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                #{b.bookingRef}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                {SPORT_EMOJI[b.sport] || '🏆'} {b.sport?.charAt(0).toUpperCase() + b.sport?.slice(1)}
              </span>
            </div>

            {/* Turf name */}
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-500 shrink-0" />
              {b.turfName}
            </h3>
          </div>

          {/* Status badge */}
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${status.bg}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </span>
        </div>

        {/* ── Info grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-[11px] mb-1">
              <Calendar className="w-3 h-3" /> Date
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{fmtDate(b.date)}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-[11px] mb-1">
              <Clock className="w-3 h-3" /> Time
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {b.timeSlots?.length === 1 ? b.timeSlots[0] : `${b.timeSlots?.length} slots`}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-[11px] mb-1">
              <Timer className="w-3 h-3" /> Duration
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{b.duration} hr{b.duration > 1 ? 's' : ''}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-[11px] mb-1">
              <CreditCard className="w-3 h-3" /> Payment
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PAYMENT_CONFIG[b.paymentStatus] || PAYMENT_CONFIG.pending}`}>
              {b.paymentStatus?.charAt(0).toUpperCase() + b.paymentStatus?.slice(1)}
            </span>
          </div>
        </div>

        {/* ── Time slots pills ── */}
        {b.timeSlots?.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {b.timeSlots.map(s => (
              <span key={s} className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-lg font-semibold border border-green-100 dark:border-green-800/30">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* ── Expand for bill + Download ── */}
        <div className="flex items-center gap-2 border-t dark:border-gray-800 pt-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between flex-1 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors py-2"
          >
            <span className="flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Booking Summary
            </span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={downloadBill}
            className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors shrink-0"
            title="Download Receipt"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>

        {/* ── Bill breakdown ── */}
        {expanded && (
          <div className="mt-2 bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 sm:p-5 space-y-3 border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-gray-200 dark:border-gray-700">
              <p className="font-display text-lg tracking-wider text-gray-900 dark:text-white">HYPERGREEN 360 TURF</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Sivakasi, Tamil Nadu</p>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Booking Ref</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{b.bookingRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Date</span>
                <span className="font-semibold text-gray-900 dark:text-white">{fmtDateLong(b.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Turf</span>
                <span className="font-semibold text-gray-900 dark:text-white">{b.turfName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Sport</span>
                <span className="font-semibold text-gray-900 dark:text-white">{SPORT_EMOJI[b.sport]} {b.sport?.charAt(0).toUpperCase() + b.sport?.slice(1)}</span>
              </div>
            </div>

            {/* Line items */}
            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-3 space-y-2 text-sm">
              {b.timeSlots?.map((slot, i) => (
                <div key={slot} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                    {slot}
                  </span>
                  <span className="text-gray-900 dark:text-white font-semibold">₹{Math.round(pricePerSlot)}</span>
                </div>
              ))}
            </div>

            {/* Discount if any */}
            {b.timeSlots?.length >= 2 && (
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Multi-slot discount ({b.timeSlots.length >= 3 ? '20%' : '10%'})
                </span>
                <span className="font-semibold">Applied</span>
              </div>
            )}

            {/* Total */}
            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-900 dark:text-white text-base">Total Paid</span>
              <span className="font-black text-xl text-gray-900 dark:text-white">₹{b.totalAmount}</span>
            </div>

            {/* Payment status */}
            <div className="flex justify-between text-xs pt-1">
              <span className="text-gray-400 dark:text-gray-500">Payment Method</span>
              <span className="text-gray-500 dark:text-gray-400 font-semibold">Razorpay</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 dark:text-gray-500">Status</span>
              <span className={`font-bold ${b.paymentStatus === 'paid' ? 'text-green-600' : b.paymentStatus === 'failed' ? 'text-red-500' : 'text-amber-600'}`}>
                {b.paymentStatus?.toUpperCase()}
              </span>
            </div>

            {/* Footer */}
            <div className="text-center pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-[10px] text-gray-400 dark:text-gray-500">Thank you for booking with HyperGreen 360!</p>
            </div>
          </div>
        )}

        {/* ── Cancel + Cancelled note ── */}
        {b.status === 'confirmed' && (
          <div className="flex justify-end mt-3">
            <button
              onClick={() => onCancel(b._id)}
              disabled={cancelling === b._id}
              className="text-red-500 hover:text-red-600 text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              {cancelling === b._id ? (
                <><svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg> Cancelling...</>
              ) : <><XCircle className="w-3.5 h-3.5" /> Cancel Booking</>}
            </button>
          </div>
        )}

        {b.status === 'cancelled' && b.cancelledAt && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Cancelled on {new Date(b.cancelledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────────────────────
const MyBookingsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [bookings,  setBookings]  = useState<Booking[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [page,      setPage]      = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/bookings/my?page=${p}&limit=10`);
      setBookings(res.data.bookings);
      setTotalPages(res.data.pagination?.pages || 1);
      setPage(p);
    } catch {
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
  }, [isAuthenticated]);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(id);
    try {
      await api.patch(`/bookings/${id}/cancel`);
      await fetchBookings(page);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="font-display text-3xl tracking-wider text-gray-900 dark:text-white mb-2">SIGN IN REQUIRED</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Please sign in to view your bookings</p>
          <Link to="/login" className="btn-primary px-8 py-3 inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">

        {/* ── Reservation Banner ── */}
        <div className="mb-6">
          <ReservationBanner />
        </div>

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl tracking-wider text-gray-900 dark:text-white mb-1">MY BOOKINGS</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              Welcome back, <span className="font-semibold text-gray-700 dark:text-gray-300">{user?.name}</span>
            </p>
          </div>
          <button onClick={() => fetchBookings(page)}
            className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-300 transition-all" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Stats bar */}
        {!loading && bookings.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Total', value: bookings.length, color: 'text-gray-900 dark:text-white' },
              { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: 'text-green-600' },
              { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: 'text-blue-600' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 text-center">
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</span>
            <button onClick={() => fetchBookings(page)} className="font-bold underline">Retry</button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          /* Empty state */
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">No bookings yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">Book your first slot and start playing at HyperGreen 360!</p>
            <Link to="/booking" className="btn-primary px-8 py-3 inline-block">
              Book Now
            </Link>
          </div>
        ) : (
          /* Booking list */
          <div className="space-y-4">
            {bookings.map(b => (
              <BookingCard key={b._id} b={b} onCancel={handleCancel} cancelling={cancelling} />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button onClick={() => fetchBookings(page - 1)} disabled={page === 1}
                  className="btn-outline-dark px-4 py-2 text-sm disabled:opacity-40">
                  ← Previous
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                  {page} / {totalPages}
                </span>
                <button onClick={() => fetchBookings(page + 1)} disabled={page === totalPages}
                  className="btn-outline-dark px-4 py-2 text-sm disabled:opacity-40">
                  Next →
                </button>
              </div>
            )}

            <div className="text-center pt-4">
              <Link to="/booking" className="btn-primary px-8 py-3 inline-block text-sm">
                + Book New Slot
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
