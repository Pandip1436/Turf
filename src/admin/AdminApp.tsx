import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminLayout      from './components/AdminLayout';
import AdminLogin       from './pages/AdminLogin';
import AdminDashboard   from './pages/AdminDashboard';
import AdminBookings    from './pages/AdminBookings';
import AdminUsers       from './pages/AdminUsers';
import AdminContacts    from './pages/AdminContacts';
import AdminRevenue     from './pages/AdminRevenue';
import AdminTournaments from './pages/AdminTournaments';
import AdminTurfs       from './pages/AdminTurfs';

const AdminApp = () => (
  <AdminAuthProvider>
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route path="/dashboard"   element={<AdminDashboard />} />
        <Route path="/bookings"    element={<AdminBookings />} />
        <Route path="/tournaments" element={<AdminTournaments />} />
        <Route path="/turfs"       element={<AdminTurfs />} />
        <Route path="/users"       element={<AdminUsers />} />
        <Route path="/contacts"    element={<AdminContacts />} />
        <Route path="/revenue"     element={<AdminRevenue />} />
        <Route index               element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  </AdminAuthProvider>
);

export default AdminApp;
