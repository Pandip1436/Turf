import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Shield, MapPin, Eye, EyeOff, UserCheck, UserX } from 'lucide-react';
import adminApi from '../utils/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

interface StaffUser {
  id:             string;
  name:           string;
  email:          string;
  role:           string;
  assignedTurfId?: string;
  isActive:       boolean;
  createdAt:      string;
}

interface Turf {
  turfId: string;
  name:   string;
}

// ── Add / Edit modal ────────────────────────────────────────────────────────
const StaffModal = ({
  editing,
  turfs,
  onClose,
  onSave,
}: {
  editing:  StaffUser | null;
  turfs:    Turf[];
  onClose:  () => void;
  onSave:   (data: StaffUser) => void;
}) => {
  const isEdit = !!editing;
  const [form, setForm] = useState({
    name:           editing?.name           ?? '',
    email:          editing?.email          ?? '',
    password:       '',
    role:           (editing?.role          ?? 'turf_manager') as 'admin' | 'turf_manager',
    assignedTurfId: editing?.assignedTurfId ?? '',
    isActive:       editing?.isActive       ?? true,
  });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isEdit && form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.role === 'turf_manager' && !form.assignedTurfId) {
      setError('Please select a turf branch for this manager');
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name:    form.name,
        role:    form.role,
        isActive: form.isActive,
        assignedTurfId: form.role === 'turf_manager' ? form.assignedTurfId : '',
      };
      if (!isEdit) {
        payload.email    = form.email;
        payload.password = form.password;
      }
      if (isEdit && form.password) payload.password = form.password;

      const res = isEdit
        ? await adminApi.patch(`/admin/staff/${editing!.id}`, payload)
        : await adminApi.post('/admin/staff', payload);

      onSave(res.data.user);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to save staff user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg">{isEdit ? 'Edit Staff User' : 'Add Staff User'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Name</label>
            <input required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              className="w-full bg-gray-800 border border-gray-700 focus:border-green-500 text-white rounded-xl px-4 py-2.5 outline-none placeholder-gray-600 text-sm transition-colors"
            />
          </div>

          {/* Email (locked when editing) */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
            <input required={!isEdit} type="email" value={form.email} disabled={isEdit}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
              className="w-full bg-gray-800 border border-gray-700 focus:border-green-500 text-white rounded-xl px-4 py-2.5 outline-none placeholder-gray-600 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Password {isEdit && <span className="text-gray-600 normal-case">(leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required={!isEdit}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder={isEdit ? 'New password (optional)' : 'Min 6 characters'}
                className="w-full bg-gray-800 border border-gray-700 focus:border-green-500 text-white rounded-xl px-4 py-2.5 pr-12 outline-none placeholder-gray-600 text-sm transition-colors"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Role</label>
            <select value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value as 'admin' | 'turf_manager', assignedTurfId: '' })}
              className="w-full bg-gray-800 border border-gray-700 focus:border-green-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm cursor-pointer transition-colors"
            >
              <option value="turf_manager">Branch Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Assigned Turf (only for turf_manager) */}
          {form.role === 'turf_manager' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Assigned Branch (Turf)</label>
              {turfs.length > 0 ? (
                <select value={form.assignedTurfId}
                  onChange={e => setForm({ ...form, assignedTurfId: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 focus:border-green-500 text-white rounded-xl px-4 py-2.5 outline-none text-sm cursor-pointer transition-colors"
                >
                  <option value="">— Select turf —</option>
                  {turfs.map(t => (
                    <option key={t.turfId} value={t.turfId}>{t.name} ({t.turfId})</option>
                  ))}
                </select>
              ) : (
                <input value={form.assignedTurfId}
                  onChange={e => setForm({ ...form, assignedTurfId: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g. thunder-arena"
                  className="w-full bg-gray-800 border border-gray-700 focus:border-green-500 text-white rounded-xl px-4 py-2.5 outline-none placeholder-gray-600 text-sm transition-colors"
                />
              )}
            </div>
          )}

          {/* Active toggle (edit only) */}
          {isEdit && (
            <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-300 font-semibold">Account Active</span>
              <button type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={`w-12 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.isActive ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl py-2.5 text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-colors">
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main page ────────────────────────────────────────────────────────────────
const AdminStaff = () => {
  const { admin: currentAdmin } = useAdminAuth();
  const [staff, setStaff]         = useState<StaffUser[]>([]);
  const [turfs, setTurfs]         = useState<Turf[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<StaffUser | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [error, setError]         = useState('');

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/admin/staff');
      setStaff(res.data.staff);
    } catch {
      setError('Failed to load staff users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
    // Load turfs for the dropdown
    adminApi.get('/turfs').then(res => setTurfs(res.data.turfs || [])).catch(() => {});
  }, [fetchStaff]);

  const handleSave = (saved: StaffUser) => {
    setStaff(prev => {
      const idx = prev.findIndex(u => u.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [saved, ...prev];
    });
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this staff user? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await adminApi.delete(`/admin/staff/${id}`);
      setStaff(prev => prev.filter(u => u.id !== id));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (u: StaffUser) => { setEditing(u); setModalOpen(true); };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Admin Users</h1>
          <p className="text-gray-500 text-sm mt-1">{staff.length} staff account{staff.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white rounded-xl px-4 py-2.5 text-sm font-bold transition-colors">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-16 text-gray-600">No staff users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-800">
                  {['User', 'Role', 'Assigned Branch', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map(u => {
                  const isSelf = u.id === currentAdmin?.id;
                  return (
                    <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm flex items-center gap-1.5">
                              {u.name}
                              {isSelf && <span className="text-xs text-green-400 font-normal">(you)</span>}
                            </div>
                            <div className="text-gray-500 text-xs">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                            <MapPin className="w-3 h-3" /> Branch Manager
                          </span>
                        )}
                      </td>

                      {/* Assigned Branch */}
                      <td className="px-5 py-4">
                        {u.assignedTurfId ? (
                          <span className="font-mono text-xs text-gray-300 bg-gray-800 px-2.5 py-1 rounded-lg">{u.assignedTurfId}</span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400">
                            <UserCheck className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400">
                            <UserX className="w-3.5 h-3.5" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(u)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                            title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => handleDelete(u.id)}
                              disabled={deleting === u.id}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                              title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <StaffModal
          editing={editing}
          turfs={turfs}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminStaff;
