import  { useEffect, useState, useCallback } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import adminApi from '../utils/adminApi';

interface Booking {
  _id:           string;
  userName:      string;
  userEmail:     string;
  userPhone:     string;
  sport:         string;
  date:          string;
  timeSlots:     string[];
  duration:      number;
  totalAmount:   number;
  status:        string;
  paymentStatus: string;
  bookingRef:    string;
  createdAt:     string;
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [date, setDate]         = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]       = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (date)   params.set('date', date);
      const res = await adminApi.get(`/admin/bookings?${params}`);
      setBookings(res.data.bookings);
      setTotalPages(res.data.pagination.pages);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, date]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      await adminApi.patch(`/admin/bookings/${id}/status`, { status: newStatus });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total bookings</p>
        </div>
      </div>

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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Ref', 'Customer', 'Date', 'Slots', 'Sport', 'Amount', 'Payment', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                    <td className="px-4 py-4 font-mono text-green-400 text-xs font-bold">{b.bookingRef}</td>
                    <td className="px-4 py-4">
                      <div className="text-white font-semibold text-xs">{b.userName}</div>
                      <div className="text-gray-500 text-xs">{b.userPhone}</div>
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
                    <td className="px-4 py-4">
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
    </div>
  );
};

export default AdminBookings;
