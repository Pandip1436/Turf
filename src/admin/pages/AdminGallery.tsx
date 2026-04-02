import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Upload, X, Image as ImageIcon, Search } from 'lucide-react';
import adminApi from '../utils/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

interface Turf {
  _id: string;
  turfId: string;
  name: string;
  sport: string;
}

interface GalleryItem {
  _id: string;
  turfId: string;
  turfName: string;
  sport: string;
  image: string;
  title: string;
  desc: string;
  category: string;
  date: string;
}

const CATEGORIES = ['field', 'night', 'facilities', 'tournament'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  field: 'Field', night: 'Night', facilities: 'Facilities', tournament: 'Tournament',
};
const CATEGORY_COLORS: Record<string, string> = {
  field: 'bg-green-100 text-green-800', night: 'bg-purple-100 text-purple-800',
  facilities: 'bg-blue-100 text-blue-800', tournament: 'bg-orange-100 text-orange-800',
};

const AdminGallery = () => {
  const { admin } = useAdminAuth();
  const isManager = admin?.role === 'turf_manager';
  const managerTurfId = admin?.assignedTurfId || '';

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState<GalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterTurf, setFilterTurf] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    turfId: '', title: '', desc: '', category: 'field', date: new Date().toISOString().split('T')[0], image: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const galleryUrl = isManager ? `/gallery?turfId=${managerTurfId}` : '/gallery';
      const [galRes, turfRes] = await Promise.all([
        adminApi.get(galleryUrl),
        adminApi.get('/turfs?active=true'),
      ]);
      setItems(galRes.data.images || []);
      const allTurfs = turfRes.data.turfs || [];
      // Manager only sees their assigned turf
      setTurfs(isManager ? allTurfs.filter((t: Turf) => t.turfId === managerTurfId) : allTurfs);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const selectedTurf = turfs.find(t => t.turfId === form.turfId);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await adminApi.post('/gallery/upload', fd);
      setForm(f => ({ ...f, image: res.data.url }));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Upload failed';
      alert(msg);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.turfId || !form.title || !form.image || !form.date) {
      alert('Please fill all required fields and upload an image');
      return;
    }
    setSaving(true);
    try {
      const turf = turfs.find(t => t.turfId === form.turfId);
      const payload = {
        ...form,
        turfName: turf?.name || '',
        sport: turf?.sport || '',
      };
      if (editing) {
        await adminApi.put(`/gallery/${editing._id}`, payload);
      } else {
        await adminApi.post('/gallery', payload);
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchData();
    } catch { alert('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await adminApi.delete(`/gallery/${deleting._id}`);
      setDeleting(null);
      fetchData();
    } catch { alert('Failed to delete'); }
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setForm({
      turfId: item.turfId, title: item.title, desc: item.desc,
      category: item.category, date: item.date, image: item.image,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({ turfId: isManager ? managerTurfId : '', title: '', desc: '', category: 'field', date: new Date().toISOString().split('T')[0], image: '' });
  };

  const filtered = items.filter(item => {
    if (filterTurf !== 'all' && item.turfId !== filterTurf) return false;
    if (filterCat !== 'all' && item.category !== filterCat) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.turfName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by turf
  const grouped = filtered.reduce<Record<string, GalleryItem[]>>((acc, item) => {
    const key = `${item.turfName} (${item.sport})`;
    (acc[key] ||= []).push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Gallery Management</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">{items.length} photos across {turfs.length} turfs</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or turf..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:border-green-500 outline-none" />
        </div>
        <div className="flex gap-3">
          <select value={filterTurf} onChange={e => setFilterTurf(e.target.value)}
            className="flex-1 sm:flex-none bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-green-500 outline-none">
            <option value="all">All Turfs</option>
            {turfs.map(t => <option key={t.turfId} value={t.turfId}>{t.name}</option>)}
          </select>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="flex-1 sm:flex-none bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-green-500 outline-none">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
      </div>

      {/* Gallery grid grouped by turf */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <ImageIcon className="w-14 h-14 mx-auto mb-4 opacity-50" />
          <p className="font-semibold text-lg">No photos found</p>
          <p className="text-sm mt-1">Add your first gallery photo</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([turfLabel, images]) => (
            <div key={turfLabel}>
              <h2 className="text-white font-bold text-sm sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
                <span className="truncate">{turfLabel}</span>
                <span className="text-gray-500 text-xs sm:text-sm font-normal shrink-0">({images.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                {images.map(item => (
                  <div key={item._id} className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 hover:border-gray-600 aspect-square transition-colors">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* category badge */}
                    <span className={`absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[item.category]}`}>
                      {CATEGORY_LABELS[item.category]}
                    </span>

                    {/* info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3.5">
                      <p className="text-white font-bold text-[11px] sm:text-sm truncate">{item.title}</p>
                      <p className="text-gray-400 text-[9px] sm:text-xs truncate hidden sm:block mt-0.5">{item.desc}</p>
                      <p className="text-gray-500 text-[9px] sm:text-[11px] mt-0.5 sm:mt-1">{item.date}</p>
                    </div>

                    {/* actions — always visible on mobile, hover on desktop */}
                    <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 flex gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(item)}
                        className="w-6 h-6 sm:w-8 sm:h-8 bg-white/90 hover:bg-white rounded-md sm:rounded-lg flex items-center justify-center text-gray-700 shadow-sm">
                        <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button onClick={() => setDeleting(item)}
                        className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500/90 hover:bg-red-500 rounded-md sm:rounded-lg flex items-center justify-center text-white shadow-sm">
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => { setShowModal(false); setEditing(null); }}>
          <div className="bg-gray-900 border-t sm:border border-gray-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg p-5 sm:p-6 max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Mobile drag handle */}
            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-white font-bold text-base sm:text-lg">{editing ? 'Edit Photo' : 'Add Photo'}</h2>
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Turf selection */}
              <div>
                <label className="text-gray-300 text-xs sm:text-sm font-semibold mb-1 block">Turf *</label>
                <select value={form.turfId} onChange={e => setForm(f => ({ ...f, turfId: e.target.value }))}
                  disabled={isManager}
                  className={`w-full bg-gray-800 border border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 text-sm text-white focus:border-green-500 outline-none ${isManager ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  <option value="">Select a turf</option>
                  {turfs.map(t => <option key={t.turfId} value={t.turfId}>{t.name} ({t.sport})</option>)}
                </select>
                {selectedTurf && (
                  <p className="text-xs text-gray-500 mt-1">Sport: {selectedTurf.sport}</p>
                )}
                {isManager && <p className="text-xs text-green-400 mt-1">Auto-assigned to your turf</p>}
              </div>

              {/* Image upload */}
              <div>
                <label className="text-gray-300 text-xs sm:text-sm font-semibold mb-1 block">Image *</label>
                {form.image ? (
                  <div className="relative rounded-xl overflow-hidden h-40 sm:h-48">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={() => setForm(f => ({ ...f, image: '' }))}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-lg p-1.5 hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-700 hover:border-green-500 rounded-xl p-6 sm:p-8 cursor-pointer transition-colors">
                    <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-gray-500" />
                    <span className="text-gray-400 text-xs sm:text-sm">{uploading ? 'Uploading...' : 'Tap to upload'}</span>
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="text-gray-300 text-xs sm:text-sm font-semibold mb-1 block">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Night match under floodlights"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-green-500 outline-none" />
              </div>

              {/* Description */}
              <div>
                <label className="text-gray-300 text-xs sm:text-sm font-semibold mb-1 block">Description</label>
                <input value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                  placeholder="Short description"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-green-500 outline-none" />
              </div>

              {/* Category + Date */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-gray-300 text-xs sm:text-sm font-semibold mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 text-sm text-white focus:border-green-500 outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 text-xs sm:text-sm font-semibold mb-1 block">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 text-sm text-white focus:border-green-500 outline-none" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 pb-2 sm:pb-0">
                <button onClick={() => { setShowModal(false); setEditing(null); }}
                  className="flex-1 border border-gray-700 text-gray-300 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add Photo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleting && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setDeleting(null)}>
          <div className="bg-gray-900 border-t sm:border border-gray-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 sm:p-6" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4 sm:hidden" />
            <h3 className="text-white font-bold text-base sm:text-lg mb-2">Delete Photo?</h3>
            <p className="text-gray-400 text-sm mb-5">
              Are you sure you want to delete "<strong>{deleting.title}</strong>"? This cannot be undone.
            </p>
            <div className="flex gap-3 pb-2 sm:pb-0">
              <button onClick={() => setDeleting(null)}
                className="flex-1 border border-gray-700 text-gray-300 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
