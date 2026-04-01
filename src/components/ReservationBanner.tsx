import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Timer, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

interface ActiveReservation {
  _id: string;
  bookingRef: string;
  turfName: string;
  sport: string;
  date: string;
  timeSlots: string[];
  totalAmount: number;
  reservedUntil: string;
}

const ReservationBanner = () => {
  const { isAuthenticated } = useAuth();
  const [reservation, setReservation] = useState<ActiveReservation | null>(null);
  const [countdown, setCountdown] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get<{ bookings: Array<ActiveReservation & { status: string }> }>('/bookings/my?limit=5')
      .then(res => {
        const now = Date.now();
        const active = (res.data.bookings || []).find(
          b => b.status === 'reserved' && new Date(b.reservedUntil).getTime() > now
        );
        setReservation(active || null);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!reservation) { setCountdown(''); return; }
    const deadline = new Date(reservation.reservedUntil).getTime();
    const tick = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) {
        setCountdown('');
        setReservation(null);
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [reservation]);

  if (!reservation || !countdown) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 flex items-center gap-3 sm:gap-4 mx-auto max-w-3xl">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 dark:bg-amber-800/30 rounded-xl flex items-center justify-center shrink-0">
        <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
          Reservation active — {reservation.turfName}
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 truncate">
          {reservation.timeSlots.length} slot{reservation.timeSlots.length > 1 ? 's' : ''} on {new Date(reservation.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ₹{reservation.totalAmount}
        </p>
      </div>
      <div className="text-right shrink-0 mr-1">
        <div className="font-mono font-black text-xl sm:text-2xl text-amber-800 dark:text-amber-300">{countdown}</div>
        <div className="text-[9px] sm:text-[10px] text-amber-600 dark:text-amber-500">remaining</div>
      </div>
      <Link to={`/booking?resume=${reservation._id}`}
        className="btn-primary px-3 sm:px-4 py-2 text-xs sm:text-sm flex items-center gap-1.5 shrink-0">
        <CreditCard className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Complete</span> Pay
      </Link>
    </div>
  );
};

export default ReservationBanner;
