import { useEffect, useState, useCallback } from 'react';
import {
  Search, Filter, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight,
  X, Clock, IndianRupee, User, Phone, Mail, Calendar, List, LayoutGrid, CalendarDays,
} from 'lucide-react';
import adminApi from '../utils/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Booking {
  _id: string; userName: string; userEmail: string; userPhone: string;
  sport: string; turfId: string; turfName?: string; date: string;
  timeSlots: string[]; duration: number; baseAmount: number;
  discountAmount: number; totalAmount: number; status: string;
  paymentStatus: string; bookingRef: string;
  razorpayOrderId?: string; razorpayPaymentId?: string;
  adminNotes?: string; createdAt: string;
}

interface TurfStat { _id: string; count: number; }
interface TurfInfo { turfId: string; name: string; sport: string; }

type ViewMode = 'list' | 'calendar' | 'slots';

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-500/15 text-green-400 border-green-500/20',
  pending:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
  completed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'no-show': 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  reserved:  'bg-purple-500/15 text-purple-400 border-purple-500/20',
};

const PAY_COLORS: Record<string, string> = {
  paid: 'text-green-400', pending: 'text-yellow-400',
  failed: 'text-red-400', refunded: 'text-blue-400',
};

const STATUSES = ['', 'pending', 'confirmed', 'cancelled', 'completed', 'no-show'];

const STATUS_DOT: Record<string, string> = {
  confirmed: 'bg-green-400', pending: 'bg-yellow-400', cancelled: 'bg-red-400',
  completed: 'bg-blue-400', 'no-show': 'bg-gray-400', reserved: 'bg-purple-400',
};

const SLOT_HOURS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM',
];

function slotLabel(from: string): string {
  const h = parseInt(from);
  const isAM = from.includes('AM');
  const nextH = isAM && h === 11 ? 12 : (h % 12) + 1;
  const nextSuffix = (isAM && h === 11) ? 'PM' : (h === 12 && !isAM ? 'AM' : from.includes('AM') ? 'AM' : 'PM');
  return `${from} - ${nextH}:00 ${nextSuffix}`;
}

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// ── Detail Modal ──────────────────────────────────────────────────────────────
const BookingDetailModal = ({
  booking, onClose, onStatusChange,
}: {
  booking: Booking; onClose: () => void;
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
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-4 space-y-5">
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
          <div className="bg-gray-800 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Customer</div>
            <div className="flex items-center gap-2 text-sm text-white"><User className="w-4 h-4 text-gray-500 shrink-0" />{booking.userName}</div>
            <div className="flex items-center gap-2 text-sm text-gray-300"><Mail className="w-4 h-4 text-gray-500 shrink-0" />{booking.userEmail}</div>
            <div className="flex items-center gap-2 text-sm text-gray-300"><Phone className="w-4 h-4 text-gray-500 shrink-0" />{booking.userPhone}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Booking Info</div>
            <Row label="Sport" value={<span className="capitalize">{booking.sport}</span>} />
            <Row label="Turf" value={<span className="font-mono text-xs text-gray-300">{booking.turfName || booking.turfId || '—'}</span>} />
            <Row label="Date" value={<span className="flex items-center gap-1.5 justify-end"><Calendar className="w-3.5 h-3.5 text-gray-500" />{booking.date}</span>} />
            <Row label="Duration" value={`${booking.duration} hr${booking.duration !== 1 ? 's' : ''}`} />
            <Row label="Slots" value={
              <div className="flex flex-col items-end gap-1">
                {booking.timeSlots?.map((s, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs bg-gray-700 px-2 py-0.5 rounded-md text-gray-200">
                    <Clock className="w-3 h-3 text-gray-400" />{s}
                  </span>
                ))}
              </div>
            } />
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Payment</div>
            {booking.baseAmount != null && booking.baseAmount !== booking.totalAmount && (
              <Row label="Base" value={`₹${booking.baseAmount?.toLocaleString('en-IN')}`} />
            )}
            {booking.discountAmount > 0 && (
              <Row label="Discount" value={<span className="text-green-400">−₹{booking.discountAmount?.toLocaleString('en-IN')}</span>} />
            )}
            <Row label="Total" value={<span className="text-green-400 font-bold text-base">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>} />
            {booking.razorpayOrderId && <Row label="Order ID" value={<span className="font-mono text-xs text-gray-400">{booking.razorpayOrderId}</span>} />}
            {booking.razorpayPaymentId && <Row label="Payment ID" value={<span className="font-mono text-xs text-gray-400">{booking.razorpayPaymentId}</span>} />}
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Meta</div>
            <Row label="Booked On" value={new Date(booking.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
            <Row label="Ref" value={<span className="font-mono text-green-400 text-xs">{booking.bookingRef}</span>} />
          </div>
          {booking.adminNotes && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="text-xs font-bold text-yellow-400 uppercase tracking-wide mb-1">Admin Notes</div>
              <p className="text-yellow-200 text-sm">{booking.adminNotes}</p>
            </div>
          )}
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

// ══════════════════════════════════════════════════════════════════════════════
// Calendar View
// ══════════════════════════════════════════════════════════════════════════════
const CalendarView = ({
  onDateSelect, turfFilter, isTurfManager, assignedTurfId,
}: {
  onDateSelect: (date: string) => void;
  turfFilter: string; isTurfManager: boolean; assignedTurfId?: string;
}) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [monthBookings, setMonthBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const cells = getMonthDays(year, month);
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setLoading(true);
    const dateFrom = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const dateTo = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const params = new URLSearchParams({ dateFrom, dateTo, limit: '500' });
    if (isTurfManager && assignedTurfId) params.set('turfId', assignedTurfId);
    else if (turfFilter) params.set('turfId', turfFilter);
    adminApi.get(`/admin/bookings?${params}`)
      .then(res => setMonthBookings(res.data.bookings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year, month, turfFilter, isTurfManager, assignedTurfId]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  // Group bookings by date
  const byDate: Record<string, Booking[]> = {};
  monthBookings.forEach(b => {
    if (!byDate[b.date]) byDate[b.date] = [];
    byDate[b.date].push(b);
  });

  const dayBookings = selectedDay ? (byDate[selectedDay] || []) : [];

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-800">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-white font-bold text-base sm:text-lg">{MONTH_NAMES[month]} {year}</h3>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-1.5 sm:p-3 lg:p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide py-2 sm:py-2.5">
                  <span className="sm:hidden">{d}</span>
                  <span className="hidden sm:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</span>
                </div>
              ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7 border-t border-gray-800">
              {cells.map((day, i) => {
                if (day === null) return <div key={i} className="border-b border-r border-gray-800/50 min-h-[50px] sm:min-h-[80px]" />;
                const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayBks = byDate[iso] || [];
                const isToday = iso === todayStr;
                const isSelected = iso === selectedDay;
                const confirmed = dayBks.filter(b => b.status === 'confirmed').length;
                const pending = dayBks.filter(b => b.status === 'pending' || b.status === 'reserved').length;
                const total = dayBks.filter(b => b.status !== 'cancelled').length;

                return (
                  <button key={i} onClick={() => { setSelectedDay(iso); onDateSelect(iso); }}
                    className={`relative p-1.5 sm:p-2.5 min-h-[50px] sm:min-h-[80px] text-left transition-all border-b border-r border-gray-800/50 ${
                      isSelected ? 'bg-green-500/10 ring-1 ring-inset ring-green-500' :
                      isToday ? 'bg-green-500/5' :
                      'hover:bg-gray-800/40'
                    }`}>
                    <div className={`text-xs sm:text-sm font-bold leading-none ${
                      isToday ? 'w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-green-500 text-white flex items-center justify-center' :
                      isSelected ? 'text-green-400' : 'text-gray-400'
                    }`}>{day}</div>
                    {total > 0 && (
                      <div className="mt-1 sm:mt-1.5 space-y-0.5">
                        {/* Mobile: compact dots only */}
                        <div className="sm:hidden flex items-center gap-0.5 flex-wrap">
                          {confirmed > 0 && <div className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                          {pending > 0 && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                          <span className="text-[9px] text-gray-500 font-bold">{total}</span>
                        </div>
                        {/* Desktop: detailed counts */}
                        <div className="hidden sm:block space-y-0.5">
                          {confirmed > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                              <span className="text-[10px] text-green-400 font-semibold">{confirmed}</span>
                            </div>
                          )}
                          {pending > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                              <span className="text-[10px] text-yellow-400 font-semibold">{pending}</span>
                            </div>
                          )}
                          <div className="text-[10px] text-gray-500 font-medium">
                            ₹{dayBks.filter(b => b.status !== 'cancelled').reduce((a, b) => a + b.totalAmount, 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="px-4 sm:px-6 py-3 border-t border-gray-800 flex flex-wrap gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" /> Confirmed</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Pending/Reserved</span>
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h4 className="text-white font-bold text-sm sm:text-base truncate">
                {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
              </h4>
              <p className="text-gray-500 text-xs mt-0.5">{dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={() => setSelectedDay(null)} className="text-gray-500 hover:text-white shrink-0 p-1"><X className="w-4 h-4" /></button>
          </div>
          {dayBookings.length === 0 ? (
            <div className="py-12 text-center text-gray-600 text-sm">No bookings on this day</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {dayBookings.map(b => (
                <div key={b._id} className="px-3 sm:px-5 py-3 flex items-start sm:items-center gap-3 sm:gap-4 hover:bg-gray-800/40 transition-colors">
                  <div className={`w-1.5 sm:w-2 h-8 rounded-full shrink-0 mt-0.5 sm:mt-0 ${STATUS_DOT[b.status] || 'bg-gray-600'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-xs sm:text-sm truncate">{b.userName}</span>
                      <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border ${STATUS_COLORS[b.status] || STATUS_COLORS['pending']}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[10px] sm:text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 shrink-0" /><span className="truncate max-w-[120px] sm:max-w-none">{b.timeSlots?.join(', ')}</span></span>
                      <span className="capitalize">{b.sport}</span>
                      <span className="hidden sm:inline">{b.turfName || b.turfId}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-green-400 font-bold text-xs sm:text-sm">₹{b.totalAmount}</div>
                    <div className={`text-[9px] sm:text-[10px] font-semibold capitalize ${PAY_COLORS[b.paymentStatus] || 'text-gray-500'}`}>{b.paymentStatus}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// Slot View (daily schedule grid)
// ══════════════════════════════════════════════════════════════════════════════
const SlotView = ({
  turfFilter, turfs, isTurfManager, assignedTurfId, onBookingSelect,
}: {
  turfFilter: string; turfs: TurfInfo[];
  isTurfManager: boolean; assignedTurfId?: string;
  onBookingSelect: (b: Booking) => void;
}) => {
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTurf, setSelectedTurf] = useState(turfFilter || assignedTurfId || '');

  // Date pills (7 days)
  const pills = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    const DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return { label: i === 0 ? 'Today' : DN[d.getDay()], date: d.getDate(), iso: d.toISOString().split('T')[0] };
  });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ date: slotDate, limit: '200' });
    if (isTurfManager && assignedTurfId) params.set('turfId', assignedTurfId);
    else if (selectedTurf) params.set('turfId', selectedTurf);
    adminApi.get(`/admin/bookings?${params}`)
      .then(res => setDayBookings(res.data.bookings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slotDate, selectedTurf, isTurfManager, assignedTurfId]);

  // Determine which turfs to show columns for
  const visibleTurfs: TurfInfo[] = isTurfManager
    ? turfs.filter(t => t.turfId === assignedTurfId)
    : selectedTurf
      ? turfs.filter(t => t.turfId === selectedTurf)
      : turfs;

  // Build slot map: { turfId: { slotHour: Booking[] } }
  const slotMap: Record<string, Record<string, Booking[]>> = {};
  visibleTurfs.forEach(t => { slotMap[t.turfId] = {}; });
  dayBookings.forEach(b => {
    const tid = b.turfId || 'unknown';
    if (!slotMap[tid]) slotMap[tid] = {};
    b.timeSlots?.forEach(slot => {
      const hourKey = slot.split(' - ')[0]?.trim();
      if (!slotMap[tid][hourKey]) slotMap[tid][hourKey] = [];
      slotMap[tid][hourKey].push(b);
    });
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="space-y-3">
        {/* Date pills */}
        <div className="flex gap-1 sm:gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {pills.map(p => (
            <button key={p.iso} onClick={() => setSlotDate(p.iso)}
              className={`shrink-0 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-center transition-all border-2 ${
                slotDate === p.iso
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-gray-700 hover:border-green-500 text-gray-300'
              }`}>
              <div className="text-[9px] sm:text-[10px] font-semibold">{p.label}</div>
              <div className="text-xs sm:text-sm font-bold">{p.date}</div>
            </button>
          ))}
        </div>
        {/* Custom date & turf filter */}
        <div className="flex flex-wrap gap-2">
          <input type="date" value={slotDate} onChange={e => setSlotDate(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-green-500 flex-1 min-w-[140px] sm:flex-none" />
          {!isTurfManager && (
            <select value={selectedTurf} onChange={e => setSelectedTurf(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-green-500 cursor-pointer flex-1 min-w-[140px] sm:flex-none">
              <option value="">All Turfs</option>
              {turfs.map(t => <option key={t.turfId} value={t.turfId}>{t.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Slot grid */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-px">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-2 sm:px-4 py-2.5 sm:py-3 text-gray-500 font-semibold text-[10px] sm:text-xs uppercase tracking-wide w-20 sm:w-28 sticky left-0 bg-gray-900 z-10">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-0.5 sm:mr-1" />Time
                  </th>
                  {visibleTurfs.map(t => (
                    <th key={t.turfId} className="text-left px-2 sm:px-4 py-2.5 sm:py-3 text-gray-400 font-semibold text-[10px] sm:text-xs uppercase tracking-wide min-w-[140px] sm:min-w-[180px]">
                      <div className="truncate">{t.name}</div>
                      <div className="text-[9px] sm:text-[10px] text-gray-600 capitalize font-normal">{t.sport}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SLOT_HOURS.map((hour, idx) => {
                  const isNight = idx >= 12; // 6PM onwards
                  return (
                    <tr key={hour} className={`border-b border-gray-800/50 ${isNight ? 'bg-gray-800/20' : ''}`}>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 sticky left-0 bg-gray-900 z-10">
                        <div className="text-[10px] sm:text-xs font-bold text-gray-400 whitespace-nowrap">{hour}</div>
                        <div className="text-[9px] sm:text-[10px] text-gray-600 whitespace-nowrap">{slotLabel(hour).split(' - ')[1]}</div>
                      </td>
                      {visibleTurfs.map(t => {
                        const bookings = slotMap[t.turfId]?.[hour] || [];
                        if (bookings.length === 0) {
                          return (
                            <td key={t.turfId} className="px-2 sm:px-4 py-2 sm:py-3">
                              <div className="text-[10px] sm:text-xs text-gray-700 italic">Available</div>
                            </td>
                          );
                        }
                        return (
                          <td key={t.turfId} className="px-1.5 sm:px-2 py-1 sm:py-1.5">
                            {bookings.map(b => (
                              <button key={b._id} onClick={() => onBookingSelect(b)}
                                className={`w-full text-left rounded-md sm:rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 mb-1 last:mb-0 border transition-all hover:scale-[1.02] ${STATUS_COLORS[b.status] || STATUS_COLORS['pending']}`}>
                                <div className="flex items-center justify-between gap-1 sm:gap-2">
                                  <span className="font-semibold text-[10px] sm:text-xs truncate">{b.userName}</span>
                                  <span className="text-[9px] sm:text-[10px] font-bold shrink-0">₹{b.totalAmount}</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                                  <span className="text-[9px] sm:text-[10px] opacity-75 capitalize">{b.sport}</span>
                                  <span className={`text-[9px] sm:text-[10px] font-semibold capitalize ${PAY_COLORS[b.paymentStatus] || 'text-gray-500'}`}>{b.paymentStatus}</span>
                                </div>
                              </button>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-500">
        {Object.entries(STATUS_DOT).map(([s, c]) => (
          <span key={s} className="flex items-center gap-1 sm:gap-1.5 capitalize"><span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${c}`} />{s}</span>
        ))}
        <span className="flex items-center gap-1.5 sm:ml-auto"><span className="w-3 sm:w-4 h-1.5 sm:h-2 rounded bg-gray-800/40" /> Night (6PM+)</span>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════════════════════
const AdminBookings = () => {
  const { admin } = useAdminAuth();
  const isTurfManager = admin?.role === 'turf_manager';

  const [view, setView] = useState<ViewMode>('list');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [turfFilter, setTurfFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);
  const [turfStats, setTurfStats] = useState<TurfStat[]>([]);
  const [turfs, setTurfs] = useState<TurfInfo[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => {
    Promise.all([
      adminApi.get<{ stats: TurfStat[] }>('/admin/bookings/turf-stats'),
      adminApi.get<{ turfs: TurfInfo[] }>('/turfs?active=true'),
    ]).then(([statsRes, turfsRes]) => {
      setTurfStats(statsRes.data.stats);
      setTurfs(turfsRes.data.turfs.map(t => ({ turfId: (t as unknown as { turfId: string }).turfId, name: (t as unknown as { name: string }).name, sport: (t as unknown as { sport: string }).sport })));
    }).catch(() => {});
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (date) params.set('date', date);
      if (isTurfManager) params.set('turfId', admin?.assignedTurfId || '');
      else if (turfFilter) params.set('turfId', turfFilter);
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

  useEffect(() => { if (view === 'list') fetchBookings(); }, [fetchBookings, view]);

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
      {/* Header + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total bookings</p>
        </div>
        <div className="flex bg-gray-800 border border-gray-700 rounded-xl p-1 gap-0.5">
          {([
            { key: 'list', icon: List, label: 'List' },
            { key: 'calendar', icon: CalendarDays, label: 'Calendar' },
            { key: 'slots', icon: LayoutGrid, label: 'Slots' },
          ] as const).map(v => (
            <button key={v.key} onClick={() => setView(v.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                view === v.key ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}>
              <v.icon className="w-4 h-4" /><span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Turf filter (shared across views) */}
      {isTurfManager ? (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold border bg-green-500/15 text-green-400 border-green-500/30">
            Your Branch: {admin?.assignedTurfId || 'unassigned'}
          </span>
        </div>
      ) : view === 'list' && turfStats.length > 0 && (
        <div className="relative">
          <select value={turfFilter}
            onChange={e => { setTurfFilter(e.target.value); setPage(1); }}
            className="appearance-none bg-gray-800 border border-gray-700 rounded-xl pl-4 pr-9 py-2 text-sm text-white focus:border-green-500 outline-none cursor-pointer">
            <option value="">All Turfs</option>
            {turfStats.map(s => (
              <option key={s._id} value={s._id}>{s._id || 'unknown'} ({s.count})</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">▾</span>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search name, email, phone..."
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-green-500 placeholder-gray-600" />
            </div>
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="bg-gray-900 border border-gray-700 text-white rounded-xl px-3 sm:px-4 py-2.5 text-sm outline-none focus:border-green-500 cursor-pointer flex-1 sm:flex-none">
              <option value="">All Status</option>
              {STATUSES.filter(Boolean).map(s => (<option key={s} value={s} className="capitalize">{s}</option>))}
            </select>
            <input type="date" value={date} onChange={e => { setDate(e.target.value); setPage(1); }}
              className="bg-gray-900 border border-gray-700 text-white rounded-xl px-3 sm:px-4 py-2.5 text-sm outline-none focus:border-green-500 flex-1 sm:flex-none" />
            {(search || status || date) && (
              <button onClick={() => { setSearch(''); setStatus(''); setDate(''); setPage(1); }}
                className="flex items-center gap-1 text-gray-400 hover:text-white text-sm px-3 py-2.5 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
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
                        <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
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
                          <button onClick={e => { e.stopPropagation(); setTurfFilter(b.turfId || ''); setPage(1); }}
                            className="text-xs font-mono text-gray-400 hover:text-green-400 transition-colors" title="Filter by this turf">
                            {b.turfId || '—'}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-gray-300 text-xs whitespace-nowrap">{b.date}</td>
                        <td className="px-4 py-4 text-gray-400 text-xs">{b.timeSlots?.length} slot{b.timeSlots?.length !== 1 ? 's' : ''}</td>
                        <td className="px-4 py-4 text-gray-300 text-xs capitalize">{b.sport}</td>
                        <td className="px-4 py-4 text-white font-bold text-xs">₹{b.totalAmount}</td>
                        <td className={`px-4 py-4 text-xs font-semibold capitalize ${PAY_COLORS[b.paymentStatus] || 'text-gray-400'}`}>{b.paymentStatus}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[b.status] || STATUS_COLORS['pending']}`}>
                            {b.status === 'confirmed' ? <CheckCircle className="w-3 h-3" /> :
                             b.status === 'cancelled' ? <XCircle className="w-3 h-3" /> :
                             <AlertCircle className="w-3 h-3" />}
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                          <select disabled={updating === b._id} value={b.status}
                            onChange={e => updateStatus(b._id, e.target.value)}
                            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-green-500 cursor-pointer disabled:opacity-50">
                            {STATUSES.filter(Boolean).map(s => (<option key={s} value={s} className="capitalize">{s}</option>))}
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
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── CALENDAR VIEW ── */}
      {view === 'calendar' && (
        <CalendarView
          onDateSelect={d => { setDate(d); }}
          turfFilter={turfFilter}
          isTurfManager={isTurfManager}
          assignedTurfId={admin?.assignedTurfId}
        />
      )}

      {/* ── SLOT VIEW ── */}
      {view === 'slots' && (
        <SlotView
          turfFilter={turfFilter}
          turfs={turfs}
          isTurfManager={isTurfManager}
          assignedTurfId={admin?.assignedTurfId}
          onBookingSelect={b => setSelected(b)}
        />
      )}

      {/* Detail Modal */}
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
