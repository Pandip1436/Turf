import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Check, AlertTriangle, Upload, ImageIcon, Search } from 'lucide-react';
import adminApi from '../utils/adminApi';

interface Turf {
  _id: string;
  turfId: string;
  name: string;
  sport: 'football' | 'cricket' | 'badminton';
  description: string;
  features: string[];
  priceDay: number;
  priceNight: number;
  image: string;
  isActive: boolean;
  order: number;
}

const SPORT_COLORS: Record<string, string> = {
  football:  'bg-green-100 text-green-700',
  cricket:   'bg-blue-100 text-blue-700',
  badminton: 'bg-purple-100 text-purple-700',
};

const SPORT_EMOJIS: Record<string, string> = {
  football: '⚽', cricket: '🏏', badminton: '🏸',
};

const DEFAULT_IMAGES: Record<string, string> = {
  football:  '/images/Turf.jpg',
  cricket:   '/images/hero3.jpg',
  badminton: '/images/field2.png',
};

const emptyForm = {
  name: '', sport: 'football' as Turf['sport'], description: '',
  featuresRaw: '', priceDay: 600, priceNight: 1000,
  image: '', isActive: true, order: 0, turfId: '',
};

const AdminTurfs = () => {
  const [turfs,   setTurfs]   = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const [showModal,  setShowModal]  = useState(false);
  const [editTarget, setEditTarget] = useState<Turf | null>(null);
  const [form,       setForm]       = useState(emptyForm);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState('');
  const [uploading,  setUploading]  = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteTarget,    setDeleteTarget]    = useState<Turf | null>(null);
  const [deleteConfirming, setDeleteConfirming] = useState(false);

  const [search,      setSearch]      = useState('');
  const [sportFilter, setSportFilter] = useState<'all' | Turf['sport']>('all');

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setFormError('');
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await adminApi.post<{ url: string }>('/turfs/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(f => ({ ...f, image: res.data.url }));
    } catch {
      setFormError('Image upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const fetchTurfs = async () => {
    setLoading(true); setError('');
    try {
      const res = await adminApi.get<{ turfs: Turf[] }>('/turfs');
      setTurfs(res.data.turfs);
    } catch {
      setError('Failed to load turfs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTurfs(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (t: Turf) => {
    setEditTarget(t);
    setForm({
      name: t.name, sport: t.sport, description: t.description,
      featuresRaw: t.features.join(', '),
      priceDay: t.priceDay, priceNight: t.priceNight,
      image: t.image, isActive: t.isActive, order: t.order, turfId: t.turfId,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    if (form.priceDay < 0 || form.priceNight < 0) { setFormError('Prices must be ≥ 0.'); return; }

    setSaving(true); setFormError('');
    const payload = {
      name:        form.name.trim(),
      sport:       form.sport,
      description: form.description.trim(),
      features:    form.featuresRaw.split(',').map(f => f.trim()).filter(Boolean),
      priceDay:    Number(form.priceDay),
      priceNight:  Number(form.priceNight),
      image:       form.image.trim() || DEFAULT_IMAGES[form.sport],
      isActive:    form.isActive,
      order:       Number(form.order),
      ...(editTarget ? {} : { turfId: form.turfId.trim() || undefined }),
    };

    try {
      if (editTarget) {
        await adminApi.put(`/turfs/${editTarget.turfId}`, payload);
      } else {
        await adminApi.post('/turfs', payload);
      }
      setShowModal(false);
      fetchTurfs();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg || 'Failed to save turf.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (t: Turf) => {
    try {
      await adminApi.put(`/turfs/${t.turfId}`, { isActive: !t.isActive });
      setTurfs(prev => prev.map(x => x._id === t._id ? { ...x, isActive: !t.isActive } : x));
    } catch {
      setError('Failed to update turf status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteConfirming(true);
    try {
      await adminApi.delete(`/turfs/${deleteTarget.turfId}`);
      setDeleteTarget(null);
      fetchTurfs();
    } catch {
      setError('Failed to delete turf.');
    } finally {
      setDeleteConfirming(false);
    }
  };

  const visibleTurfs = turfs.filter(t => {
    if (sportFilter !== 'all' && t.sport !== sportFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.turfId.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="p-4 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Turfs</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage all turfs available for booking</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Turf
        </button>
      </div>

      {/* Search + Sport filter */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-green-500 placeholder-gray-600"
          />
        </div>
        <div className="relative">
          <select
            value={sportFilter}
            onChange={e => setSportFilter(e.target.value as 'all' | 'football' | 'cricket' | 'badminton')}
            className="appearance-none bg-gray-900 border border-gray-700 rounded-xl pl-4 pr-9 py-2.5 text-sm text-white focus:border-green-500 outline-none cursor-pointer"
          >
            <option value="all">All Sports</option>
            {(['football', 'cricket', 'badminton'] as const).map(s => (
              <option key={s} value={s}>{SPORT_EMOJIS[s]} {s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">▾</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visibleTurfs.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-16 text-center">
          <div className="text-5xl mb-4">🏟️</div>
          <p className="text-gray-400 text-lg font-semibold">{turfs.length === 0 ? 'No turfs yet' : 'No turfs match your filter'}</p>
          <p className="text-gray-500 text-sm mt-1">{turfs.length === 0 ? 'Click "Add Turf" to create the first one.' : 'Try a different sport or search term.'}</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-5 py-3.5 text-left font-medium">#</th>
                <th className="px-5 py-3.5 text-left font-medium">Turf</th>
                <th className="px-5 py-3.5 text-left font-medium">Sport</th>
                <th className="px-5 py-3.5 text-left font-medium">Day Price</th>
                <th className="px-5 py-3.5 text-left font-medium">Night Price</th>
                <th className="px-5 py-3.5 text-left font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {visibleTurfs.map((t, i) => (
                <tr key={t._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4 text-gray-500 text-xs font-semibold">{i + 1}</td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="text-gray-500 text-xs font-mono mt-0.5">{t.turfId}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${SPORT_COLORS[t.sport]}`}>
                      {SPORT_EMOJIS[t.sport]} {t.sport}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-300">₹{t.priceDay}/hr</td>
                  <td className="px-5 py-4 text-gray-300">₹{t.priceNight}/hr</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggleActive(t)}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${t.isActive ? 'text-green-400 hover:text-green-300' : 'text-gray-500 hover:text-gray-400'}`}
                    >
                      {t.isActive
                        ? <><ToggleRight className="w-5 h-5" /> Active</>
                        : <><ToggleLeft  className="w-5 h-5" /> Inactive</>
                      }
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white">{editTarget ? 'Edit Turf' : 'Add New Turf'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Turf Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Thunder Arena"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Sport *</label>
                  <select
                    value={form.sport}
                    onChange={e => setForm(f => ({ ...f, sport: e.target.value as Turf['sport'] }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500"
                  >
                    <option value="football">⚽ Football</option>
                    <option value="cricket">🏏 Cricket</option>
                    <option value="badminton">🏸 Badminton</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Order</label>
                  <input
                    type="number" min={0}
                    value={form.order}
                    onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Day Price (₹/hr) *</label>
                  <input
                    type="number" min={0}
                    value={form.priceDay}
                    onChange={e => setForm(f => ({ ...f, priceDay: Number(e.target.value) }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Night Price (₹/hr) *</label>
                  <input
                    type="number" min={0}
                    value={form.priceNight}
                    onChange={e => setForm(f => ({ ...f, priceNight: Number(e.target.value) }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of the turf"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500 resize-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Features <span className="text-gray-600 normal-case font-normal">(comma-separated)</span></label>
                  <input
                    value={form.featuresRaw}
                    onChange={e => setForm(f => ({ ...f, featuresRaw: e.target.value }))}
                    placeholder="e.g. Floodlights, Parking, Changing rooms"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Turf Image</label>

                  {/* Preview */}
                  <div className="mb-2 w-full h-36 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_IMAGES[form.sport]; }}
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-gray-600" />
                    )}
                  </div>

                  {/* File picker */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 hover:border-green-500 rounded-xl px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-60"
                  >
                    {uploading
                      ? <><div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /> Uploading…</>
                      : <><Upload className="w-4 h-4" /> {form.image ? 'Replace Image' : 'Upload Image'}</>
                    }
                  </button>

                  {/* Optional URL fallback */}
                  <input
                    value={form.image}
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    placeholder={`or paste URL (default: ${DEFAULT_IMAGES[form.sport]})`}
                    className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-green-500"
                  />
                </div>

                {!editTarget && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                      Custom ID <span className="text-gray-600 normal-case font-normal">(optional — auto-generated from name)</span>
                    </label>
                    <input
                      value={form.turfId}
                      onChange={e => setForm(f => ({ ...f, turfId: e.target.value }))}
                      placeholder="e.g. thunder-arena"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-green-500"
                    />
                  </div>
                )}

                <div className="col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.isActive ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm text-gray-300 font-medium">Active (visible to users)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-800">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Check className="w-4 h-4" /> {editTarget ? 'Save Changes' : 'Create Turf'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Delete Turf?</h3>
            <p className="text-gray-400 text-sm mb-6">
              "<span className="text-white font-semibold">{deleteTarget.name}</span>" will be permanently removed. Existing bookings are unaffected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirming}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                {deleteConfirming
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Trash2 className="w-4 h-4" /> Delete</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTurfs;
