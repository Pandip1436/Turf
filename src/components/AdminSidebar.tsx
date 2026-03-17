import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, Users, MessageSquare,
  TrendingUp, Zap, LogOut, X
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

const navItems = [
  { to: '/admin/dashboard',  icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard'  },
  { to: '/admin/bookings',   icon: <CalendarCheck   className="w-5 h-5" />, label: 'Bookings'   },
  { to: '/admin/users',      icon: <Users           className="w-5 h-5" />, label: 'Users'      },
  { to: '/admin/contacts',   icon: <MessageSquare   className="w-5 h-5" />, label: 'Contacts'   },
  { to: '/admin/revenue',    icon: <TrendingUp      className="w-5 h-5" />, label: 'Revenue'    },
];

interface Props { onClose?: () => void; }

const AdminSidebar = ({ onClose }: Props) => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <aside className="h-full flex flex-col bg-gray-950 border-r border-gray-800 w-64">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="text-white font-black text-sm leading-tight">HyperGreen 360</div>
            <div className="text-green-400 text-xs font-semibold">Admin Panel</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
               ${isActive
                 ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                 : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {admin?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-semibold truncate">{admin?.name}</div>
            <div className="text-gray-500 text-xs truncate">{admin?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
