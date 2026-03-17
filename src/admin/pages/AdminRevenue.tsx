/* eslint-disable react-hooks/set-state-in-effect */
import  { useEffect, useState } from 'react';
import { IndianRupee, TrendingUp, CalendarCheck, BarChart3 } from 'lucide-react';
import adminApi from '../utils/adminApi';

interface DayRevenue {
  _id:          string;
  totalRevenue: number;
  bookingCount: number;
}

const AdminRevenue = () => {
  const [data, setData]           = useState<DayRevenue[]>([]);
  const [totalRevenue, setTotal]  = useState(0);
  const [loading, setLoading]     = useState(true);
  const [month, setMonth]         = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    setLoading(true);
    adminApi.get(`/admin/revenue?month=${month}`)
      .then(res => {
        setData(res.data.revenue);
        setTotal(res.data.totalRevenue);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [month]);

  const maxRevenue = Math.max(...data.map(d => d.totalRevenue), 1);
  const totalBookings = data.reduce((s, d) => s + d.bookingCount, 0);
  const avgPerDay = data.length ? Math.round(totalRevenue / data.length) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Revenue</h1>
          <p className="text-gray-500 text-sm mt-1">Monthly earnings breakdown</p>
        </div>
        <input
          type="month" value={month}
          onChange={e => setMonth(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="w-10 h-10 bg-green-500/15 rounded-xl flex items-center justify-center mb-3">
            <IndianRupee className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-black text-white">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="text-gray-400 text-sm mt-1">Total Revenue</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center mb-3">
            <CalendarCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalBookings}</div>
          <div className="text-gray-400 text-sm mt-1">Total Bookings</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="w-10 h-10 bg-yellow-500/15 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-white">₹{avgPerDay.toLocaleString('en-IN')}</div>
          <div className="text-gray-400 text-sm mt-1">Avg Revenue / Day</div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-green-400" />
          <h2 className="text-white font-bold">Daily Revenue — {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-gray-600">No revenue data for this month</div>
        ) : (
          <>
            {/* Bars */}
            <div className="flex items-end gap-1.5 h-48 overflow-x-auto pb-2">
              {data.map(d => {
                const pct = (d.totalRevenue / maxRevenue) * 100;
                return (
                  <div key={d._id} className="flex flex-col items-center gap-1 min-w-[32px] group">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap pointer-events-none absolute -translate-y-8">
                      ₹{d.totalRevenue} · {d.bookingCount} booking{d.bookingCount !== 1 ? 's' : ''}
                    </div>
                    <div
                      className="w-full bg-green-500 rounded-t-lg hover:bg-green-400 transition-colors relative"
                      style={{ height: `${Math.max(pct, 4)}%` }}
                      title={`₹${d.totalRevenue} (${d.bookingCount} bookings)`}
                    />
                    <span className="text-gray-600 text-xs">{d._id.split('-')[2]}</span>
                  </div>
                );
              })}
            </div>

            {/* Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase">Date</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase">Bookings</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-semibold text-xs uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(d => (
                    <tr key={d._id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                      <td className="py-2.5 px-3 text-gray-300 text-sm">{d._id}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">
                          {d.bookingCount}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-white font-bold">₹{d.totalRevenue.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-700">
                    <td className="py-3 px-3 text-white font-bold">Total</td>
                    <td className="py-3 px-3">
                      <span className="bg-green-500/20 text-green-300 text-xs font-bold px-2 py-0.5 rounded-full">{totalBookings}</span>
                    </td>
                    <td className="py-3 px-3 text-right text-green-400 font-black text-base">₹{totalRevenue.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminRevenue;
