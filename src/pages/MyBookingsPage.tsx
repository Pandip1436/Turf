import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const mockBookings = [
  { _id: '1', date: '2025-03-20', timeSlot: '7:00 PM - 8:00 PM', sport: 'football', duration: 1, totalAmount: 1000, status: 'confirmed' },
  { _id: '2', date: '2025-03-15', timeSlot: '6:00 AM - 7:00 AM', sport: 'cricket', duration: 2, totalAmount: 1000, status: 'confirmed' },
  { _id: '3', date: '2025-03-10', timeSlot: '5:00 PM - 6:00 PM', sport: 'football', duration: 1, totalAmount: 600, status: 'cancelled' },
];

const MyBookingsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [bookings] = useState(mockBookings);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="font-display text-3xl tracking-wider text-gray-900 mb-2">SIGN IN REQUIRED</h2>
          <p className="text-gray-500 mb-6">Please sign in to view your bookings</p>
          <Link to="/login" className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-10 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-display text-5xl tracking-wider text-gray-900 mb-1">MY BOOKINGS</h1>
          <p className="text-gray-500">Welcome back, {user?.name}!</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">Book your first slot and start playing!</p>
            <Link to="/booking" className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold">Book Now</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b._id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg capitalize">{b.sport === 'football' ? '⚽' : '🏏'}</span>
                      <span className="font-bold text-gray-900 capitalize">{b.sport}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{b.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{b.timeSlot}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                    b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    b.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {b.status === 'confirmed' ? <CheckCircle className="w-3.5 h-3.5" /> :
                     b.status === 'cancelled' ? <XCircle className="w-3.5 h-3.5" /> :
                     <AlertCircle className="w-3.5 h-3.5" />}
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t pt-4 text-sm">
                  <span className="text-gray-500">{b.duration} hr{b.duration > 1 ? 's' : ''} · ₹{b.totalAmount} paid</span>
                  {b.status === 'confirmed' && (
                    <button className="text-red-500 hover:text-red-600 font-semibold text-xs">Cancel</button>
                  )}
                </div>
              </div>
            ))}

            <div className="text-center pt-4">
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