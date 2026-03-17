import React, { useEffect, useState } from 'react';
import {
  CalendarCheck, Users, TrendingUp, MessageSquare,
  IndianRupee, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import adminApi from '../utils/adminApi';

interface Stats {
  totalBookings:  number;
  todayBookings:  number;
  totalRevenue:   number;
  totalUsers:     number;
  pendingContacts:number;
}

interface RecentBooking {
  _id:         string;
  userName:    string;
  userEmail:   string;
  date:        string;
  timeSlots:   string[];
  totalAmount: number;
  status:      string;
  createdAt:   string;
}

const STATUS_BADGE: Record<string, string> = {
  confirmed: 'bg-green-500/15 text-green-400 border-green-500/20',
  pending:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
  completed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'no-show': 'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

const StatCard = ({
  icon, label, value, sub, color,
}: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${color}`}>
      {icon}
    </div>
    <div className="text-3xl font-black text-white mb-1">{value}</div>
    <div className="text-gray-400 text-sm font-medium">{label}</div>
    {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats]       = useState<Stats | null>(null);
  const [recent, setRecent]     = useState<RecentBooking[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    adminApi.get('/admin/dashboard')
      .then(res => {
        setStats(res.data.stats);
        setRecent(res.data.recentBookings || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CalendarCheck className="w-6 h-6 text-green-400" />}
          label="Total Bookings" value={stats?.totalBookings ?? 0}
          sub="All time confirmed" color="bg-green-500/15"
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-blue-400" />}
          label="Today's Bookings" value={stats?.todayBookings ?? 0}
          sub="Confirmed today" color="bg-blue-500/15"
        />
        <StatCard
          icon={<IndianRupee className="w-6 h-6 text-yellow-400" />}
          label="Total Revenue"
          value={`₹${((stats?.totalRevenue ?? 0) / 1000).toFixed(1)}K`}
          sub="Net earnings" color="bg-yellow-500/15"
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-purple-400" />}
          label="Total Users" value={stats?.totalUsers ?? 0}
          sub="Registered accounts" color="bg-purple-500/15"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/15 rounded-xl flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats?.pendingContacts ?? 0}</div>
            <div className="text-gray-400 text-sm">Pending Enquiries</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              ₹{stats?.totalRevenue?.toLocaleString('en-IN') ?? 0}
            </div>
            <div className="text-gray-400 text-sm">Total Revenue (exact)</div>
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-bold">Recent Bookings</h2>
          <a href="/admin/bookings" className="text-green-400 text-sm font-semibold hover:text-green-300">
            View all →
          </a>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No bookings yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Customer', 'Date', 'Slot', 'Amount', 'Status'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((b, i) => (
                  <tr key={b._id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${i === recent.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">{b.userName}</div>
                      <div className="text-gray-500 text-xs">{b.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{b.date}</td>
                    <td className="px-6 py-4 text-gray-300 text-xs">{b.timeSlots?.[0]}</td>
                    <td className="px-6 py-4 text-white font-bold">₹{b.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_BADGE[b.status] || STATUS_BADGE['pending']}`}>
                        {b.status === 'confirmed' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
