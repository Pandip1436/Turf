import  { useEffect, useState, useCallback } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, X, Clock, IndianRupee, User, Phone, Mail, Calendar } from 'lucide-react';
import adminApi from '../utils/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

interface Booking {
  _id:                string;
  userName:           string;
  userEmail:          string;
  userPhone:          string;
  sport:              string;
  turfId:             string;
  date:               string;
  timeSlots:          string[];
  duration:           number;
  baseAmount:         number;
  discountAmount:     number;
  totalAmount:        number;
  status:             string;
  paymentStatus:      string;
  bookingRef:         string;
  razorpayOrderId?:   string;
  razorpayPaymentId?: string;
  adminNotes?:        string;
  createdAt:          string;
}

// ── Detail modal ──────────────────────────────────────────────────────────────
const BookingDetailModal = ({
  booking, onClose, onStatusChange,
}: {
  booking: Booking;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}) => {
  const [upd, setUpd] = useState(false);

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-gray-800 last:border-0">
      <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide shrink-0">{label}</span>
      <span className="text-sm text-white text-right">{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Booking Details</div>
            <div className="font-mono text-green-400 font-bold text-lg">{booking.bookingRef}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-5">

          {/* Status badges */}
          <div className="flex gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${STATUS_COLORS[booking.status] || STATUS_COLORS['pending']}`}>
              {booking.status === 'confirmed' ? <CheckCircle className="w-3.5 h-3.5" /> :
               booking.status === 'cancelled' ? <XCircle className="w-3.5 h-3.5" /> :
               <AlertCircle className="w-3.5 h-3.5" />}
              {booking.status}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-700 bg-gray-800 capitalize ${PAY_COLORS[booking.paymentStatus] || 'text-gray-400'}`}>
              <IndianRupee className="w-3.5 h-3.5" />{booking.paymentStatus}
            </span>
          </div>

          {/* Customer */}
          <div className="bg-gray-800 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Customer</div>
            <div className="flex items-center gap-2 text-sm text-white"><User className="w-4 h-4 text-gray-500 shrink-0" />{booking.userName}</div>
            <div className="flex items-center gap-2 text-sm text-gray-300"><Mail className="w-4 h-4 text-gray-500 shrink-0" />{booking.userEmail}</div>
            <div className="flex items-center gap-2 text-sm text-gray-300"><Phone className="w-4 h-4 text-gray-500 shrink-0" />{booking.userPhone}</div>
          </div>

          {/* Booking info */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Booking Info</div>
            <Row label="Sport"    value={<span className="capitalize">{booking.sport}</span>} />
            <Row label="Turf"     value={<span className="font-mono text-xs text-gray-300">{booking.turfId || '—'}</span>} />
            <Row label="Date"     value={<span className="flex items-center gap-1.5 justify-end"><Calendar className="w-3.5 h-3.5 text-gray-500" />{booking.date}</span>} />
            <Row label="Duration" value={`${booking.duration} hr${booking.duration !== 1 ? 's' : ''}`} />
            <Row label="Slots"    value={
              <div className="flex flex-col items-end gap-1">
                {booking.timeSlots?.map((s, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs bg-gray-700 px-2 py-0.5 rounded-md text-gray-200">
                    <Clock className="w-3 h-3 text-gray-400" />{s}
                  </span>
                ))}
              </div>
            } />
          </div>

          {/* Payment */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Payment</div>
            {booking.baseAmount != null && booking.baseAmount !== booking.totalAmount && (
              <Row label="Base"       value={`₹${booking.baseAmount?.toLocaleString('en-IN')}`} />
            )}
            {booking.discountAmount > 0 && (
              <Row label="Discount"   value={<span className="text-green-400">−₹{booking.discountAmount?.toLocaleString('en-IN')}</span>} />
            )}
            <Row label="Total"        value={<span className="text-green-400 font-bold text-base">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>} />
            {booking.razorpayOrderId   && <Row label="Order ID"   value={<span className="font-mono text-xs text-gray-400">{booking.razorpayOrderId}</span>} />}
            {booking.razorpayPaymentId && <Row label="Payment ID" value={<span className="font-mono text-xs text-gray-400">{booking.razorpayPaymentId}</span>} />}
          </div>

          {/* Meta */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Meta</div>
            <Row label="Booked On" value={new Date(booking.createdAt).toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })} />
            <Row label="Ref"       value={<span className="font-mono text-green-400 text-xs">{booking.bookingRef}</span>} />
          </div>

          {booking.adminNotes && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="text-xs font-bold text-yellow-400 uppercase tracking-wide mb-1">Admin Notes</div>
              <p className="text-yellow-200 text-sm">{booking.adminNotes}</p>
            </div>
          )}

          {/* Update status */}
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Update Status</div>
            <div className="flex flex-wrap gap-2">
              {STATUSES.filter(Boolean).map(s => (
                <button key={s} disabled={upd || booking.status === s}
                  onClick={async () => { setUpd(true); await onStatusChange(booking._id, s); setUpd(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors disabled:opacity-50 capitalize ${
                    booking.status === s
                      ? 'bg-green-500/15 text-green-400 border-green-500/30'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TurfStat {
  _id:   string; // turfId slug
  count: number;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-500/15 text-green-400 border-green-500/20',
  pending:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
  completed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'no-show': 'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

const PAY_COLORS: Record<string, string> = {
  paid:    'text-green-400',
  pending: 'text-yellow-400',
  failed:  'text-red-400',
  refunded:'text-blue-400',
};

const STATUSES = ['', 'pending', 'confirmed', 'cancelled', 'completed', 'no-show'];

const AdminBookings = () => {
  const { admin } = useAdminAuth();
  const isTurfManager = admin?.role === 'turf_manager';
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [date, setDate]         = useState('');
  const [turfFilter, setTurfFilter] = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]       = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);
  const [turfStats, setTurfStats] = useState<TurfStat[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => {
    adminApi.get<{ stats: TurfStat[] }>('/admin/bookings/turf-stats')
      .then(res => setTurfStats(res.data.stats))
      .catch(() => {});
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search)     params.set('search', search);
      if (status)     params.set('status', status);
      if (date)       params.set('date', date);
      if (isTurfManager) {
        params.set('turfId', admin?.assignedTurfId || '');
      } else if (turfFilter) {
        params.set('turfId', turfFilter);
      }
      const res = await adminApi.get(`/admin/bookings?${params}`);
      setBookings(res.data.bookings);
      setTotalPages(res.data.pagination.pages);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, date, turfFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      await adminApi.patch(`/admin/bookings/${id}/status`, { status: newStatus });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
      setSelected(prev => prev?._id === id ? { ...prev, status: newStatus } : prev);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total bookings</p>
        </div>
      </div>

      {/* Turf-wise booking stats */}
      {isTurfManager ? (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold border bg-green-500/15 text-green-400 border-green-500/30">
            Your Branch: {admin?.assignedTurfId || 'unassigned'}
          </span>
        </div>
      ) : turfStats.length > 0 && (
        <div className="relative">
          <select
            value={turfFilter}
            onChange={e => { setTurfFilter(e.target.value); setPage(1); }}
            className="appearance-none bg-gray-800 border border-gray-700 rounded-xl pl-4 pr-9 py-2 text-sm text-white focus:border-green-500 outline-none cursor-pointer"
          >
            <option value="">All Turfs</option>
            {turfStats.map(s => (
              <option key={s._id} value={s._id}>{s._id || 'unknown'} ({s.count})</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">▾</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email, phone..."
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-green-500 placeholder-gray-600"
          />
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 cursor-pointer"
        >
          <option value="">All Status</option>
          {STATUSES.filter(Boolean).map(s => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
        <input
          type="date" value={date}
          onChange={e => { setDate(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500"
        />
        {(search || status || date) && (
          <button
            onClick={() => { setSearch(''); setStatus(''); setDate(''); setPage(1); }}
            className="flex items-center gap-1 text-gray-400 hover:text-white text-sm px-3 py-2.5 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-gray-600">No bookings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-800">
                  {['#', 'Ref', 'Customer', 'Turf', 'Date', 'Slots', 'Sport', 'Amount', 'Payment', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b._id} onClick={() => setSelected(b)} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors cursor-pointer">
                    <td className="px-4 py-4 text-gray-500 text-xs font-semibold">{(page - 1) * 15 + i + 1}</td>
                    <td className="px-4 py-4 font-mono text-green-400 text-xs font-bold">{b.bookingRef}</td>
                    <td className="px-4 py-4">
                      <div className="text-white font-semibold text-xs">{b.userName}</div>
                      <div className="text-gray-500 text-xs">{b.userPhone}</div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={e => { e.stopPropagation(); setTurfFilter(b.turfId || ''); setPage(1); }}
                        className="text-xs font-mono text-gray-400 hover:text-green-400 transition-colors"
                        title="Filter by this turf"
                      >
                        {b.turfId || '—'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-gray-300 text-xs whitespace-nowrap">{b.date}</td>
                    <td className="px-4 py-4 text-gray-400 text-xs">{b.timeSlots?.length} slot{b.timeSlots?.length !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-4 text-gray-300 text-xs capitalize">{b.sport}</td>
                    <td className="px-4 py-4 text-white font-bold text-xs">₹{b.totalAmount}</td>
                    <td className={`px-4 py-4 text-xs font-semibold capitalize ${PAY_COLORS[b.paymentStatus] || 'text-gray-400'}`}>
                      {b.paymentStatus}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[b.status] || STATUS_COLORS['pending']}`}>
                        {b.status === 'confirmed' ? <CheckCircle className="w-3 h-3" /> :
                         b.status === 'cancelled' ? <XCircle className="w-3 h-3" /> :
                         <AlertCircle className="w-3 h-3" />}
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <select
                        disabled={updating === b._id}
                        value={b.status}
                        onChange={e => updateStatus(b._id, e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-green-500 cursor-pointer disabled:opacity-50"
                      >
                        {STATUSES.filter(Boolean).map(s => (
                          <option key={s} value={s} className="capitalize">{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {selected && (
        <BookingDetailModal
          booking={selected}
          onClose={() => setSelected(null)}
          onStatusChange={updateStatus}
        />
      )}
    </div>
  );
};

export default AdminBookings;
