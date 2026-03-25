import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
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

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-blue-100 text-blue-700',
  'no-show': 'bg-gray-100 text-gray-600',
};

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
      // Refresh list
      await fetchBookings(page);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  // ── Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="font-display text-3xl tracking-wider text-gray-900 mb-2">SIGN IN REQUIRED</h2>
          <p className="text-gray-500 mb-6">Please sign in to view your bookings</p>
          <Link to="/login" className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-5xl tracking-wider text-gray-900 mb-1">MY BOOKINGS</h1>
            <p className="text-gray-500">Welcome back, {user?.name}!</p>
          </div>
          <button onClick={() => fetchBookings(page)}
            className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Refresh">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => fetchBookings(page)} className="font-bold underline">Retry</button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">Book your first slot and start playing!</p>
            <Link to="/booking" className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold">
              Book Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b._id} className="bg-white rounded-2xl shadow-sm p-6">
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {/* Booking ref */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        {b.bookingRef}
                      </span>
                      <span className="text-gray-400 text-xs capitalize">
                        {b.sport === 'football' ? '⚽' : b.sport === 'cricket' ? '🏏' : '🏆'} {b.sport}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      🏟️ <span className="font-semibold text-gray-800">{b.turfName}</span>
                    </div>

                    {/* Date & slot */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(b.date + 'T00:00:00').toLocaleDateString('en-IN', {
                          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {b.timeSlots?.length === 1
                          ? b.timeSlots[0]
                          : `${b.timeSlots?.length} slots`}
                      </span>
                    </div>

                    {/* Multiple slots detail */}
                    {b.timeSlots?.length > 1 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {b.timeSlots.map(s => (
                          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${STATUS_STYLES[b.status] || STATUS_STYLES['pending']}`}>
                    {b.status === 'confirmed' || b.status === 'completed'
                      ? <CheckCircle className="w-3.5 h-3.5" />
                      : b.status === 'cancelled'
                      ? <XCircle className="w-3.5 h-3.5" />
                      : <AlertCircle className="w-3.5 h-3.5" />}
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </div>
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between border-t pt-4 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">
                      {b.duration} hr{b.duration > 1 ? 's' : ''} · <strong className="text-gray-800">₹{b.totalAmount}</strong>
                    </span>
                    {/* Payment badge */}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      b.paymentStatus === 'paid'   ? 'bg-green-100 text-green-700' :
                      b.paymentStatus === 'failed' ? 'bg-red-100 text-red-600'    :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {b.paymentStatus}
                    </span>
                  </div>

                  {/* Cancel button */}
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(b._id)}
                      disabled={cancelling === b._id}
                      className="text-red-500 hover:text-red-600 font-semibold text-xs disabled:opacity-50 flex items-center gap-1"
                    >
                      {cancelling === b._id ? (
                        <><svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg> Cancelling...</>
                      ) : 'Cancel Booking'}
                    </button>
                  )}
                </div>

                {/* Cancellation note */}
                {b.status === 'cancelled' && b.cancelledAt && (
                  <p className="text-xs text-gray-400 mt-2">
                    Cancelled on {new Date(b.cancelledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button onClick={() => fetchBookings(page - 1)} disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50">
                  ← Previous
                </button>
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <button onClick={() => fetchBookings(page + 1)} disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50">
                  Next →
                </button>
              </div>
            )}

            <div className="text-center pt-2">
              <Link to="/booking" className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold inline-block">
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