import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLayout      from './components/AdminLayout';
import AdminLogin       from './pages/AdminLogin';
import AdminDashboard   from './pages/AdminDashboard';
import AdminBookings    from './pages/AdminBookings';
import AdminUsers       from './pages/AdminUsers';
import AdminContacts    from './pages/AdminContacts';
import AdminRevenue     from './pages/AdminRevenue';
import AdminTournaments from './pages/AdminTournaments';
import AdminTurfs       from './pages/AdminTurfs';
import AdminStaff       from './pages/AdminStaff';

// Redirects turf_manager away from admin-only pages
const AdminOnly = ({ children }: { children: React.ReactNode }) => {
  const { admin } = useAdminAuth();
  if (admin?.role === 'turf_manager') return <Navigate to="/admin/bookings" replace />;
  return <>{children}</>;
};

const AdminApp = () => (
  <AdminAuthProvider>
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route path="/dashboard"   element={<AdminDashboard />} />
        <Route path="/bookings"    element={<AdminBookings />} />
        <Route path="/tournaments" element={<AdminTournaments />} />
        <Route path="/revenue"     element={<AdminRevenue />} />
        <Route path="/turfs"       element={<AdminOnly><AdminTurfs /></AdminOnly>} />
        <Route path="/users"       element={<AdminOnly><AdminUsers /></AdminOnly>} />
        <Route path="/contacts"    element={<AdminOnly><AdminContacts /></AdminOnly>} />
        <Route path="/staff"       element={<AdminOnly><AdminStaff /></AdminOnly>} />
        <Route index               element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  </AdminAuthProvider>
);

export default AdminApp;
