import { useEffect, useState, useCallback } from 'react';
import {
  Trophy, Plus, Users, Calendar, Clock, ChevronLeft, ChevronRight,
  Edit2, Trash2, X, Check, AlertCircle, Eye, ChevronDown,
} from 'lucide-react';
import adminApi from '../utils/adminApi';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Player        { name: string; age?: number; position?: string; }
interface Registration  {
  _id: string; teamName: string; captainName: string;
  captainEmail: string; captainPhone: string;
  players: Player[]; paymentStatus: 'pending' | 'paid' | 'waived';
  registeredAt: string;
}
interface Tournament {
  _id: string; title: string; sport: 'football' | 'cricket' | 'badminton';
  turfId: string; turfName: string; description: string; format: string;
  banner: string; date: string; endDate?: string; time: string;
  prize: string; entryFee: number; maxTeams: number;
  minPlayers: number; maxPlayers: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registrations: Registration[];
  registeredTeams: number; spotsLeft: number;
  rules: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SPORT_EMOJI: Record<string, string> = { football:'⚽', cricket:'🏏', badminton:'🏸' };

const STATUS_COLORS: Record<string, string> = {
  upcoming:  'bg-green-500/15 text-green-400 border border-green-500/20',
  ongoing:   'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  completed: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  cancelled: 'bg-red-500/15 text-red-400 border border-red-500/20',
};
const PAY_COLORS: Record<string, string> = {
  paid:    'text-green-400',
  pending: 'text-yellow-400',
  waived:  'text-blue-400',
};

interface TurfOption { id: string; name: string; sport: string; }

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ── Blank form ────────────────────────────────────────────────────────────────
const BLANK: Omit<Tournament, '_id' | 'registrations' | 'registeredTeams' | 'spotsLeft'> = {
  title: '', sport: 'football', turfId: '', turfName: '',
  description: '', format: '', banner: '/images/Turf.jpg',
  date: '', endDate: '', time: '6:00 PM', prize: '₹10,000 + Trophy',
  entryFee: 1000, maxTeams: 16, minPlayers: 5, maxPlayers: 8,
  status: 'upcoming', rules: [''],
};

// ── Create / Edit modal ───────────────────────────────────────────────────────
const TournamentFormModal = ({
  initial, onClose, onSaved,
}: {
  initial: typeof BLANK | Tournament;
  onClose: () => void;
  onSaved: (t: Tournament) => void;
}) => {
  const isEdit = '_id' in initial;
  const [form, setForm]     = useState({ ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [turfs, setTurfs]   = useState<TurfOption[]>([]);

  useEffect(() => {
    adminApi.get<{ turfs: Array<{ turfId: string; name: string; sport: string }> }>('/turfs')
      .then(res => {
        const opts: TurfOption[] = res.data.turfs.map(t => ({ id: t.turfId, name: t.name, sport: t.sport }));
        setTurfs(opts);
        // Auto-select first turf if form has none yet
        if (!form.turfId && opts.length > 0) {
          const first = opts.find(t => t.sport === form.sport) ?? opts[0];
          setForm(f => ({ ...f, turfId: first.id, turfName: first.name }));
        }
      })
      .catch(() => {});
  }, []);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const updateRule = (i: number, val: string) => {
    const next = [...(form.rules ?? [])];
    next[i] = val;
    set('rules', next);
  };
  const addRule    = () => set('rules', [...(form.rules ?? []), '']);
  const removeRule = (i: number) => set('rules', (form.rules ?? []).filter((_: string, idx: number) => idx !== i));

  const handleSportChange = (sport: string) => {
    set('sport', sport);
    const first = turfs.find(t => t.sport === sport);
    if (first) { set('turfId', first.id); set('turfName', first.name); }
    else        { set('turfId', ''); set('turfName', ''); }
  };
  const handleTurfChange = (turfId: string) => {
    const t = turfs.find(t => t.id === turfId);
    if (t) { set('turfId', t.id); set('turfName', t.name); }
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.date)          { setError('Date is required'); return; }
    if (!form.turfId)        { setError('Select a turf'); return; }

    const payload = { ...form, rules: (form.rules ?? []).filter((r: string) => r.trim()) };

    setLoading(true);
    try {
      const res = isEdit
        ? await adminApi.patch(`/tournaments/${(initial as Tournament)._id}`, payload)
        : await adminApi.post('/tournaments', payload);
      onSaved(res.data.tournament);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to save tournament');
    } finally {
      setLoading(false);
    }
  };

  const filteredTurfs = turfs.filter(t => t.sport === form.sport);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-white font-black text-lg">
            {isEdit ? '✏️ Edit Tournament' : '🏆 Create Tournament'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. HyperGreen Thunder Cup 2025"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>

          {/* Sport + Turf */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Sport *</label>
              <select value={form.sport} onChange={e => handleSportChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500">
                <option value="football">⚽ Football</option>
                <option value="cricket">🏏 Cricket</option>
                <option value="badminton">🏸 Badminton</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Turf *</label>
              <select value={form.turfId} onChange={e => handleTurfChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500">
                {filteredTurfs.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Format + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Format</label>
              <input value={form.format} onChange={e => set('format', e.target.value)}
                placeholder="e.g. 5-a-side Knockout"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500">
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Date + End date + Time */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Start Date *</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">End Date</label>
              <input type="date" value={form.endDate ?? ''} onChange={e => set('endDate', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Time</label>
              <input value={form.time} onChange={e => set('time', e.target.value)}
                placeholder="6:00 PM"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
            </div>
          </div>

          {/* Prize + Entry fee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Prize</label>
              <input value={form.prize} onChange={e => set('prize', e.target.value)}
                placeholder="₹10,000 + Trophy"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Entry Fee (₹)</label>
              <input type="number" min={0} value={form.entryFee} onChange={e => set('entryFee', parseInt(e.target.value)||0)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
            </div>
          </div>

          {/* Teams + Players */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Max Teams</label>
              <input type="number" min={2} value={form.maxTeams} onChange={e => set('maxTeams', parseInt(e.target.value)||2)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Min Players</label>
              <input type="number" min={1} value={form.minPlayers} onChange={e => set('minPlayers', parseInt(e.target.value)||1)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Max Players</label>
              <input type="number" min={1} value={form.maxPlayers} onChange={e => set('maxPlayers', parseInt(e.target.value)||1)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Describe the tournament..."
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 resize-none" />
          </div>

          {/* Banner image path */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Banner Image Path</label>
            <input value={form.banner} onChange={e => set('banner', e.target.value)}
              placeholder="/images/Turf.jpg"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>

          {/* Rules */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Rules</label>
              <button onClick={addRule} className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs font-semibold">
                <Plus className="w-3.5 h-3.5" /> Add Rule
              </button>
            </div>
            <div className="space-y-2">
              {(form.rules ?? ['']).map((rule: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <span className="w-6 h-9 flex items-center justify-center text-xs text-gray-500 font-bold shrink-0">{i+1}</span>
                  <input value={rule} onChange={e => updateRule(i, e.target.value)}
                    placeholder={`Rule ${i+1}`}
                    className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-green-500" />
                  {(form.rules ?? []).length > 1 && (
                    <button onClick={() => removeRule(i)} className="text-red-400 hover:text-red-300 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 border border-gray-700 text-gray-400 hover:text-white rounded-xl py-3 font-bold text-sm transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-400 text-white rounded-xl py-3 font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</>
                : <><Check className="w-4 h-4" />{isEdit ? 'Save Changes' : 'Create Tournament'}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Registrations drawer ──────────────────────────────────────────────────────
const RegistrationsDrawer = ({
  tournament, onClose, onRemove,
}: {
  tournament: Tournament;
  onClose: () => void;
  onRemove: (regId: string) => void;
}) => {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [removingId,   setRemovingId]   = useState<string | null>(null);
  const [updating,     setUpdating]     = useState<string | null>(null);

  const handlePayment = async (regId: string, status: 'paid' | 'pending' | 'waived') => {
    setUpdating(regId);
    try {
      await adminApi.patch(`/tournaments/${tournament._id}`, {
        // We update the full tournament; backend saves the whole doc.
        // A targeted sub-document patch endpoint would be cleaner for large datasets
        // but this works perfectly for the expected registration volumes (< 20 teams).
        registrations: tournament.registrations.map(r =>
          r._id === regId ? { ...r, paymentStatus: status } : r
        ),
      });
      // Update local state via parent refresh — onRemove triggers refetch
      onRemove('__refresh__');
    } catch {
      // silently ignore — table stays as-is
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (regId: string) => {
    if (!window.confirm('Remove this team from the tournament?')) return;
    setRemovingId(regId);
    try {
      await adminApi.delete(`/tournaments/${tournament._id}/registrations/${regId}`);
      onRemove(regId);
    } catch {
      // ignore
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-end"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-gray-900 border-l border-gray-800 h-full w-full max-w-lg overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-white font-black text-base">{tournament.title}</h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {tournament.registrations.length} / {tournament.maxTeams} teams registered
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fill bar */}
        <div className="px-5 py-3 border-b border-gray-800/50">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{tournament.registrations.length} teams</span>
            <span>{tournament.spotsLeft} spots left</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${Math.round((tournament.registrations.length / tournament.maxTeams) * 100)}%` }}
            />
          </div>
        </div>

        {/* Teams list */}
        <div className="flex-1 divide-y divide-gray-800/50">
          {tournament.registrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-600">
              <Users className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No teams registered yet</p>
            </div>
          ) : (
            tournament.registrations.map((reg, idx) => {
              const expanded = expandedTeam === reg._id;
              return (
                <div key={reg._id} className="px-5 py-4">
                  {/* Team header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-green-500/20 border border-green-500/20 rounded-full flex items-center justify-center text-green-400 font-black text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-bold text-sm truncate">{reg.teamName}</div>
                        <div className="text-gray-500 text-xs">
                          {reg.captainName} · {reg.players.length} players
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Payment toggle */}
                      <select
                        value={reg.paymentStatus}
                        disabled={updating === reg._id}
                        onChange={e => handlePayment(reg._id, e.target.value as 'paid'|'pending'|'waived')}
                        className={`text-xs font-bold rounded-lg px-2 py-1 bg-gray-800 border border-gray-700 outline-none cursor-pointer transition-colors ${PAY_COLORS[reg.paymentStatus]}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="waived">Waived</option>
                      </select>

                      {/* Expand players */}
                      <button
                        onClick={() => setExpandedTeam(expanded ? null : reg._id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                        title="View players"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemove(reg._id)}
                        disabled={removingId === reg._id}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove team"
                      >
                        {removingId === reg._id
                          ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Captain contact */}
                  <div className="mt-2 ml-11 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                    <span>{reg.captainEmail}</span>
                    <span>{reg.captainPhone}</span>
                    <span className="text-gray-600">
                      Registered {new Date(reg.registeredAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                    </span>
                  </div>

                  {/* Players expand */}
                  {expanded && (
                    <div className="mt-3 ml-11 bg-gray-800/50 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="px-3 py-2 text-left text-gray-500 font-semibold">#</th>
                            <th className="px-3 py-2 text-left text-gray-500 font-semibold">Name</th>
                            <th className="px-3 py-2 text-left text-gray-500 font-semibold">Age</th>
                            <th className="px-3 py-2 text-left text-gray-500 font-semibold">Position</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reg.players.map((p, pi) => (
                            <tr key={pi} className="border-b border-gray-700/50 last:border-0">
                              <td className="px-3 py-2 text-gray-500">{pi + 1}</td>
                              <td className="px-3 py-2 text-white font-medium">{p.name}</td>
                              <td className="px-3 py-2 text-gray-400">{p.age ?? '—'}</td>
                              <td className="px-3 py-2 text-gray-400">{p.position || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// ── Delete confirm ────────────────────────────────────────────────────────────
const DeleteConfirm = ({
  title, onCancel, onConfirm, loading,
}: { title: string; onCancel: () => void; onConfirm: () => void; loading: boolean }) => (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-7 max-w-sm w-full text-center">
      <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-6 h-6 text-red-400" />
      </div>
      <h3 className="text-white font-black text-lg mb-2">Delete Tournament?</h3>
      <p className="text-gray-400 text-sm mb-6">
        "<span className="text-white font-semibold">{title}</span>" and all its registrations will be permanently deleted.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 border border-gray-700 text-gray-400 hover:text-white rounded-xl py-2.5 font-bold text-sm transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 bg-red-500 hover:bg-red-400 text-white rounded-xl py-2.5 font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : null}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminTournaments = () => {
  const [tournaments,   setTournaments]  = useState<Tournament[]>([]);
  const [loading,       setLoading]      = useState(true);
  const [filterSport,   setFilterSport]  = useState('');
  const [filterStatus,  setFilterStatus] = useState('');
  const [creating,      setCreating]     = useState(false);
  const [editing,       setEditing]      = useState<Tournament | null>(null);
  const [viewRegs,      setViewRegs]     = useState<Tournament | null>(null);
  const [deleting,      setDeleting]     = useState<Tournament | null>(null);
  const [deleteLoading, setDeleteLoading]= useState(false);
  const [page,          setPage]         = useState(1);
  const PER_PAGE = 8;

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterSport)  params.set('sport',  filterSport);
      if (filterStatus) params.set('status', filterStatus);
      const res = await adminApi.get(`/tournaments?${params}`);
      setTournaments(res.data.tournaments ?? []);
      setPage(1);
    } catch {
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, [filterSport, filterStatus]);

  useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

  const handleSaved = (t: Tournament) => {
    setTournaments(prev => {
      const idx = prev.findIndex(x => x._id === t._id);
      return idx >= 0 ? prev.map(x => x._id === t._id ? t : x) : [t, ...prev];
    });
    setCreating(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await adminApi.patch(`/tournaments/${deleting._id}`, { status: 'cancelled' });
      setTournaments(prev => prev.map(t => t._id === deleting._id ? { ...t, status: 'cancelled' } : t));
      setDeleting(null);
    } catch {
      // ignore
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRegRemove = (regId: string) => {
    if (regId === '__refresh__') { fetchTournaments(); return; }
    if (!viewRegs) return;
    const updated = {
      ...viewRegs,
      registrations: viewRegs.registrations.filter(r => r._id !== regId),
      registeredTeams: viewRegs.registrations.length - 1,
      spotsLeft: viewRegs.spotsLeft + 1,
    };
    setViewRegs(updated);
    setTournaments(prev => prev.map(t => t._id === updated._id ? updated : t));
  };

  const quickStatusUpdate = async (t: Tournament, status: string) => {
    try {
      await adminApi.patch(`/tournaments/${t._id}`, { status });
      setTournaments(prev => prev.map(x => x._id === t._id ? { ...x, status: status as Tournament['status'] } : x));
    } catch { /* ignore */ }
  };

  // ── Stats bar ───────────────────────────────────────────────────────────────
  const stats = {
    total:     tournaments.length,
    upcoming:  tournaments.filter(t => t.status === 'upcoming').length,
    ongoing:   tournaments.filter(t => t.status === 'ongoing').length,
    teams:     tournaments.reduce((s, t) => s + t.registrations.length, 0),
  };

  // ── Pagination ───────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(tournaments.length / PER_PAGE);
  const pageData   = tournaments.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" /> Tournaments
          </h1>
          <p className="text-gray-500 text-sm mt-1">{stats.total} tournaments · {stats.teams} teams registered</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shrink-0">
          <Plus className="w-4 h-4" /> New Tournament
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',    value: stats.total,    color: 'text-white',        bg: 'bg-gray-800'          },
          { label: 'Upcoming', value: stats.upcoming,  color: 'text-green-400',    bg: 'bg-green-500/10'      },
          { label: 'Ongoing',  value: stats.ongoing,   color: 'text-yellow-400',   bg: 'bg-yellow-500/10'     },
          { label: 'Teams In', value: stats.teams,     color: 'text-blue-400',     bg: 'bg-blue-500/10'       },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-gray-800 rounded-2xl p-4`}>
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterSport} onChange={e => setFilterSport(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-green-500">
          <option value="">All Sports</option>
          <option value="football">⚽ Football</option>
          <option value="cricket">🏏 Cricket</option>
          <option value="badminton">🏸 Badminton</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-green-500">
          <option value="">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {(filterSport || filterStatus) && (
          <button onClick={() => { setFilterSport(''); setFilterStatus(''); }}
            className="text-gray-500 hover:text-white text-sm font-semibold flex items-center gap-1 transition-colors">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-600 gap-3">
            <Trophy className="w-10 h-10 opacity-20" />
            <p className="text-sm">No tournaments found</p>
            <button onClick={() => setCreating(true)}
              className="text-green-400 hover:text-green-300 text-sm font-semibold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Create the first one
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Tournament', 'Sport / Turf', 'Date', 'Teams', 'Entry', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map(t => {
                  const pct = Math.round((t.registrations.length / t.maxTeams) * 100);
                  return (
                    <tr key={t._id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">

                      {/* Tournament */}
                      <td className="px-5 py-4 max-w-[200px]">
                        <div className="text-white font-bold truncate">{t.title}</div>
                        <div className="text-gray-500 text-xs truncate">{t.format}</div>
                      </td>

                      {/* Sport / Turf */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-300 text-xs">
                          <span className="text-base">{SPORT_EMOJI[t.sport]}</span>
                          <span className="capitalize font-semibold">{t.sport}</span>
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">{t.turfName}</div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-300 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-green-400" />{fmtDate(t.date)}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                          <Clock className="w-3.5 h-3.5" />{t.time}
                        </div>
                      </td>

                      {/* Teams with fill bar */}
                      <td className="px-5 py-4">
                        <button onClick={() => setViewRegs(t)}
                          className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold text-sm transition-colors">
                          <Users className="w-3.5 h-3.5" />
                          {t.registrations.length}/{t.maxTeams}
                        </button>
                        <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full rounded-full ${pct >= 100 ? 'bg-red-400' : pct > 70 ? 'bg-yellow-400' : 'bg-green-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>

                      {/* Entry fee */}
                      <td className="px-5 py-4 whitespace-nowrap font-bold text-white">
                        {t.entryFee === 0 ? <span className="text-green-400">FREE</span> : `₹${t.entryFee}`}
                      </td>

                      {/* Status — inline dropdown */}
                      <td className="px-5 py-4">
                        <select
                          value={t.status}
                          onChange={e => quickStatusUpdate(t, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2 py-1 bg-transparent border cursor-pointer outline-none ${STATUS_COLORS[t.status]}`}
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setViewRegs(t)} title="View registrations"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditing(t)} title="Edit"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 hover:bg-green-500/10 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleting(t)} title="Cancel tournament"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {creating && (
        <TournamentFormModal initial={BLANK} onClose={() => setCreating(false)} onSaved={handleSaved} />
      )}
      {editing && (
        <TournamentFormModal initial={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}
      {viewRegs && (
        <RegistrationsDrawer tournament={viewRegs} onClose={() => setViewRegs(null)} onRemove={handleRegRemove} />
      )}
      {deleting && (
        <DeleteConfirm
          title={deleting.title}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default AdminTournaments;