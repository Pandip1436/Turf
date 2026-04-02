import { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, Clock, MapPin, ChevronRight, X, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Player { name: string; age: string; position: string; }

interface Registration {
  teamName: string; captainName: string;
  players: number; paymentStatus: string;
  entryFee: number; tournament: string;
  date: string; time: string;
}

interface Tournament {
  _id: string;
  title: string;
  sport: 'football' | 'cricket' | 'badminton';
  turfId: string;
  turfName: string;
  description: string;
  format: string;
  banner: string;
  date: string;
  endDate?: string;
  time: string;
  prize: string;
  entryFee: number;
  maxTeams: number;
  minPlayers: number;
  maxPlayers: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registeredTeams: number;
  spotsLeft: number;
  rules: string[];
}


const SPORT_EMOJI: Record<string, string> = { football: '⚽', cricket: '🏏', badminton: '🏸' };
const SPORT_COLOR: Record<string, string> = {
  football:  'bg-green-100 text-green-700 border-green-300',
  cricket:   'bg-blue-100 text-blue-700 border-blue-300',
  badminton: 'bg-purple-100 text-purple-700 border-purple-300',
};
const STATUS_COLOR: Record<string, string> = {
  upcoming:  'bg-green-100 text-green-700',
  ongoing:   'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ── Registration modal ────────────────────────────────────────────────────────
const RegisterModal = ({
  tournament, onClose, onSuccess,
}: { tournament: Tournament; onClose: () => void; onSuccess: (r: Registration) => void }) => {
  const { user } = useAuth();
  const [teamName,      setTeamName]      = useState('');
  const [captainName,   setCaptainName]   = useState(user?.name || '');
  const [captainEmail,  setCaptainEmail]  = useState(user?.email || '');
  const [captainPhone,  setCaptainPhone]  = useState('');
  const [players,       setPlayers]       = useState<Player[]>(
    Array.from({ length: tournament.minPlayers }, () => ({ name: '', age: '', position: '' }))
  );
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const addPlayer = () => {
    if (players.length < tournament.maxPlayers)
      setPlayers([...players, { name: '', age: '', position: '' }]);
  };
  const removePlayer = (i: number) => {
    if (players.length > tournament.minPlayers)
      setPlayers(players.filter((_, idx) => idx !== i));
  };
  const updatePlayer = (i: number, field: keyof Player, val: string) => {
    const next = [...players];
    next[i] = { ...next[i], [field]: val };
    setPlayers(next);
  };

  const handleSubmit = async () => {
    setError('');
    if (!teamName.trim())     { setError('Team name is required'); return; }
    if (!captainName.trim())  { setError('Captain name is required'); return; }
    if (!captainEmail.trim()) { setError('Captain email is required'); return; }
    if (captainPhone.length !== 10) { setError('Enter a valid 10-digit phone number'); return; }
    if (players.some(p => !p.name.trim())) { setError('All player names are required'); return; }

    setLoading(true);
    try {
      const res = await api.post(`/tournaments/${tournament._id}/register`, {
        teamName, captainName, captainEmail, captainPhone,
        players: players.map(p => ({
          name: p.name.trim(),
          age:  p.age ? parseInt(p.age) : undefined,
          position: p.position.trim() || undefined,
        })),
      });
      onSuccess(res.data.registration);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="font-bold text-xl text-gray-900 dark:text-white">Register Your Team</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tournament.title}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Entry fee notice */}
          {tournament.entryFee > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800 text-sm">Entry Fee: ₹{tournament.entryFee} per team</p>
                <p className="text-yellow-700 text-xs mt-0.5">Payment details will be shared after registration. Pay at the facility before the event.</p>
              </div>
            </div>
          )}

          {/* Team info */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">Team Information</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Team Name *</label>
              <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Sivakasi Warriors"
                className="w-full border border-gray-300 focus:border-green-500 rounded-xl px-4 py-2.5 outline-none text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600" />
            </div>
          </div>

          {/* Captain info */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">Captain Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Captain Name *</label>
                <input value={captainName} onChange={e => setCaptainName(e.target.value)} placeholder="Full name"
                  className="w-full border border-gray-300 focus:border-green-500 rounded-xl px-4 py-2.5 outline-none text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone (10 digits) *</label>
                <input type="tel" maxLength={10} value={captainPhone}
                  onChange={e => setCaptainPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="8056564775"
                  className="w-full border border-gray-300 focus:border-green-500 rounded-xl px-4 py-2.5 outline-none text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                <input type="email" value={captainEmail} onChange={e => setCaptainEmail(e.target.value)} placeholder="captain@email.com"
                  className="w-full border border-gray-300 focus:border-green-500 rounded-xl px-4 py-2.5 outline-none text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600" />
              </div>
            </div>
          </div>

          {/* Players */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">
                Players ({players.length}/{tournament.maxPlayers})
              </h3>
              {players.length < tournament.maxPlayers && (
                <button onClick={addPlayer}
                  className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-semibold">
                  <Plus className="w-4 h-4" /> Add Player
                </button>
              )}
            </div>
            <div className="space-y-3">
              {players.map((p, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Player {i + 1}</span>
                    {players.length > tournament.minPlayers && (
                      <button onClick={() => removePlayer(i)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3 sm:col-span-1">
                      <input value={p.name} onChange={e => updatePlayer(i, 'name', e.target.value)}
                        placeholder="Name *"
                        className="w-full border border-gray-200 focus:border-green-400 rounded-lg px-3 py-2 text-sm outline-none bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                    </div>
                    <div>
                      <input value={p.age} onChange={e => updatePlayer(i, 'age', e.target.value)}
                        type="number" min={5} max={80} placeholder="Age"
                        className="w-full border border-gray-200 focus:border-green-400 rounded-lg px-3 py-2 text-sm outline-none bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                    </div>
                    <div>
                      <input value={p.position} onChange={e => updatePlayer(i, 'position', e.target.value)}
                        placeholder="Position"
                        className="w-full border border-gray-200 focus:border-green-400 rounded-lg px-3 py-2 text-sm outline-none bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">Min {tournament.minPlayers} · Max {tournament.maxPlayers} players</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 text-white rounded-xl py-4 font-bold text-base disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Registering...</>
              : <><Trophy className="w-5 h-5" /> Register Team</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Success modal ─────────────────────────────────────────────────────────────
const SuccessModal = ({ reg, onClose }: { reg: Registration; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h2 className="font-display text-3xl tracking-wider text-gray-900 dark:text-white mb-2">REGISTERED!</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Your team has been successfully registered.</p>
      <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-2xl p-4 text-left space-y-2 mb-6 text-sm">
        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Tournament</span><span className="font-semibold text-gray-900 dark:text-white text-right max-w-[55%]">{reg.tournament}</span></div>
        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Team</span><span className="font-bold text-green-700 dark:text-green-400">{reg.teamName}</span></div>
        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Captain</span><span className="font-semibold text-gray-900 dark:text-white">{reg.captainName}</span></div>
        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Players</span><span className="font-semibold text-gray-900 dark:text-white">{reg.players}</span></div>
        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Date</span><span className="font-semibold text-gray-900 dark:text-white">{fmtDate(reg.date)} · {reg.time}</span></div>
        {reg.entryFee > 0 && (
          <div className="border-t dark:border-green-800 pt-2 flex justify-between font-bold text-yellow-700 dark:text-yellow-400">
            <span>Entry Fee</span><span>₹{reg.entryFee} (pay at facility)</span>
          </div>
        )}
        {reg.entryFee === 0 && (
          <div className="border-t dark:border-green-800 pt-2 flex justify-between font-bold text-green-700 dark:text-green-400">
            <span>Entry Fee</span><span>Free 🎉</span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-6">See you on the field! Arrive 30 minutes before your match.</p>
      <button onClick={onClose} className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 font-bold transition-colors">
        Done
      </button>
    </div>
  </div>
);

// ── Tournament card ───────────────────────────────────────────────────────────
const TournamentCard = ({
  t, onRegister, onView,
}: { t: Tournament; onRegister: () => void; onView: () => void }) => {
  const full  = t.spotsLeft === 0;
  const pct   = Math.round((t.registeredTeams / t.maxTeams) * 100);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl transition-all group">
      {/* Banner */}
      <div className="relative h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <img src={t.banner} alt={t.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { (e.target as HTMLImageElement).src = '/images/Turf.jpg'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {/* Sport badge */}
        <div className={`absolute top-3 left-3 border rounded-full px-2.5 py-1 text-xs font-bold ${SPORT_COLOR[t.sport]}`}>
          {SPORT_EMOJI[t.sport]} {t.sport.charAt(0).toUpperCase() + t.sport.slice(1)}
        </div>
        {/* Status badge */}
        <div className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLOR[t.status]}`}>
          {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-white font-bold text-lg leading-tight">{t.title}</h3>
          <p className="text-green-300 text-xs font-semibold mt-0.5">{t.format}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-green-500 shrink-0" />
            <span className="truncate">{fmtDate(t.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Clock className="w-4 h-4 text-green-500 shrink-0" />
            <span>{t.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-green-500 shrink-0" />
            <span className="truncate">{t.turfName}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />
            <span className="truncate font-semibold text-gray-800 dark:text-gray-200">{t.prize}</span>
          </div>
        </div>

        {/* Teams fill bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.registeredTeams}/{t.maxTeams} teams</span>
            <span className={full ? 'text-red-500 font-bold' : 'text-green-600 font-semibold'}>
              {full ? 'Full' : `${t.spotsLeft} spots left`}
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${full ? 'bg-red-400' : pct > 70 ? 'bg-yellow-400' : 'bg-green-500'}`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500">Entry fee</span>
            <div className="font-bold text-gray-900 dark:text-white text-lg">
              {t.entryFee === 0 ? <span className="text-green-600">FREE</span> : `₹${t.entryFee}`}
              {t.entryFee > 0 && <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-1">/team</span>}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 dark:text-gray-500">Players</span>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.minPlayers}–{t.maxPlayers} per team</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onView}
            className="flex-1 border-2 border-gray-200 dark:border-gray-700 hover:border-green-400 text-gray-700 dark:text-gray-300 rounded-xl py-2.5 font-semibold text-sm transition-colors flex items-center justify-center gap-1">
            View Details <ChevronRight className="w-4 h-4" />
          </button>
          {t.status === 'upcoming' && !full && (
            <button onClick={onRegister}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl py-2.5 font-bold text-sm transition-all">
              Register
            </button>
          )}
          {(full || t.status !== 'upcoming') && (
            <button disabled
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-xl py-2.5 font-bold text-sm cursor-not-allowed">
              {full ? 'Full' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Detail drawer ─────────────────────────────────────────────────────────────
const DetailDrawer = ({
  t, onClose, onRegister,
}: { t: Tournament; onClose: () => void; onRegister: () => void }) => {
  const full = t.spotsLeft === 0;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-8 lg:p-12"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-2xl lg:max-w-3xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] sm:max-h-[88vh] overflow-y-auto">
        {/* Banner */}
        <div className="relative h-48 sm:h-56 lg:h-72 bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-t-3xl">
          <img src={t.banner} alt={t.title} className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = '/images/Turf.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <button onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="absolute bottom-4 left-5 right-5 sm:bottom-6 sm:left-8 sm:right-8 lg:bottom-8 lg:left-10 lg:right-10">
            <div className={`inline-flex items-center gap-1 border rounded-full px-2.5 py-0.5 text-xs font-bold mb-2 ${SPORT_COLOR[t.sport]}`}>
              {SPORT_EMOJI[t.sport]} {t.sport}
            </div>
            <h2 className="text-white font-display text-2xl sm:text-3xl lg:text-4xl tracking-wider leading-tight">{t.title}</h2>
            <p className="text-green-300 text-sm sm:text-base mt-1">{t.format}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8 lg:p-10 space-y-5 sm:space-y-7">
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">{t.description}</p>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: <Calendar className="w-4 h-4 text-green-500" />, label: 'Date', value: fmtDate(t.date) },
              { icon: <Clock className="w-4 h-4 text-green-500" />,    label: 'Time', value: t.time },
              { icon: <MapPin className="w-4 h-4 text-green-500" />,   label: 'Venue', value: t.turfName },
              { icon: <Trophy className="w-4 h-4 text-yellow-500" />,  label: 'Prize', value: t.prize },
              { icon: <Users className="w-4 h-4 text-blue-500" />,     label: 'Teams', value: `${t.registeredTeams}/${t.maxTeams} registered` },
              { icon: <Users className="w-4 h-4 text-purple-500" />,   label: 'Squad size', value: `${t.minPlayers}–${t.maxPlayers} players` },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 sm:p-4 flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{icon}</div>
                <div>
                  <div className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">{label}</div>
                  <div className="text-sm sm:text-[15px] font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Rules */}
          {t.rules.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 text-sm uppercase tracking-wide">Rules</h3>
              <ul className="space-y-2.5">
                {t.rules.map((r, i) => (
                  <li key={i} className="flex gap-3 text-sm sm:text-[15px] text-gray-600 dark:text-gray-300">
                    <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Entry fee + Register */}
          <div className="border-t dark:border-gray-700 pt-5 sm:pt-6 flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">Entry fee per team</div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-0.5">
                {t.entryFee === 0 ? <span className="text-green-600">FREE</span> : `₹${t.entryFee}`}
              </div>
            </div>
            {t.status === 'upcoming' && !full
              ? <button onClick={onRegister}
                  className="btn-primary px-8 sm:px-10 py-3 sm:py-3.5 text-sm sm:text-base">
                  Register Team
                </button>
              : <span className={`px-5 py-2.5 rounded-xl font-bold text-sm ${full?'bg-red-100 text-red-600':'bg-gray-100 text-gray-500'}`}>
                  {full ? 'Tournament Full' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </span>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const TournamentsPage = () => {
  const [tournaments,   setTournaments]  = useState<Tournament[]>([]);
  const [loading,       setLoading]      = useState(true);
  const [filterSport,   setFilterSport]  = useState<string>('all');
  const [filterStatus,  setFilterStatus] = useState<string>('upcoming');
  const [selected,      setSelected]     = useState<Tournament | null>(null);
  const [registering,   setRegistering]  = useState<Tournament | null>(null);
  const [successReg,    setSuccessReg]   = useState<Registration | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/tournaments');
        const data: Tournament[] = res.data.tournaments ?? [];
        setTournaments(data);
      } catch {
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = tournaments.filter(t => {
    if (filterSport  !== 'all' && t.sport  !== filterSport)  return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">

      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-14 px-4 mb-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="font-display text-5xl tracking-wider mb-3">TOURNAMENTS</h1>
          <p className="text-green-100 text-lg max-w-xl mx-auto">
            Compete. Win. Repeat. Join official tournaments at HyperGreen 360 Turf and claim glory.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
            {[
              { v: tournaments.filter(t=>t.status==='upcoming').length, l: 'Upcoming' },
              { v: tournaments.reduce((s,t)=>s+t.registeredTeams,0),   l: 'Teams Registered' },
              { v: tournaments.filter(t=>t.status==='completed').length,l: 'Completed' },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <div className="text-3xl font-black">{v}</div>
                <div className="text-green-200 text-xs uppercase tracking-wide">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative">
            <select value={filterSport} onChange={e => setFilterSport(e.target.value)}
              className="appearance-none border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-9 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 focus:border-green-500 outline-none cursor-pointer">
              <option value="all">All Sports</option>
              {['football','cricket','badminton'].map(s => (
                <option key={s} value={s}>{SPORT_EMOJI[s]} {s.charAt(0).toUpperCase()+s.slice(1)}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none text-xs">▾</span>
          </div>
          <div className="relative">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="appearance-none border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-9 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 focus:border-green-500 outline-none cursor-pointer">
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="all">All Status</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none text-xs">▾</span>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No tournaments found</p>
            <p className="text-sm mt-1">Try changing the filters above</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(t => (
              <TournamentCard key={t._id} t={t}
                onRegister={() => setRegistering(t)}
                onView={() => setSelected(t)} />
            ))}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-14 bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 text-white text-center">
          <h2 className="font-display text-3xl tracking-wider mb-2">HOST YOUR OWN TOURNAMENT</h2>
          <p className="text-green-100 mb-6">Want to organise a custom tournament for your group, company, or school? We'll handle the logistics.</p>
          <a href="tel:8056564775"
            className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors">
            📞 Call +91 80565 64775
          </a>
        </div>
      </div>

      {/* Modals */}
      {selected && !registering && (
        <DetailDrawer t={selected} onClose={() => setSelected(null)}
          onRegister={() => { setRegistering(selected); setSelected(null); }} />
      )}
      {registering && (
        <RegisterModal tournament={registering} onClose={() => setRegistering(null)}
          onSuccess={reg => { setRegistering(null); setSuccessReg(reg); }} />
      )}
      {successReg && (
        <SuccessModal reg={successReg} onClose={() => setSuccessReg(null)} />
      )}
    </div>
  );
};

export default TournamentsPage;