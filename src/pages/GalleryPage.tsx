import { useState, useMemo } from 'react';
import { X, Camera, List, Grid3X3, ChevronLeft, Calendar } from 'lucide-react';

// ── Real turf photo URLs (Unsplash / free stock — replace with actual turf photos)
const galleryItems = [
  // ── Turf / Field
  {
    id: 1, category: 'turf', date: '2026-03-19',
    src: 'https://images.unsplash.com/photo-1551958219-acbc595d4a9d?w=600&q=80',
    title: 'Main Football Ground', desc: '360° circular field',
  },
  {
    id: 2, category: 'turf', date: '2026-03-19',
    src: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80',
    title: 'Aerial View – Turf', desc: 'Premium artificial grass',
  },
  {
    id: 3, category: 'turf', date: '2026-03-19',
    src: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&q=80',
    title: 'Cricket Pitch', desc: 'Floodlit pitch surface',
  },
  {
    id: 4, category: 'turf', date: '2026-03-19',
    src: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80',
    title: 'Field Corner View', desc: 'No dead corners – 360° design',
  },
  // ── Facilities
  {
    id: 5, category: 'facilities', date: '2026-03-19',
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    title: 'Floodlights at Dusk', desc: 'Pro LED floodlight system',
  },
  {
    id: 6, category: 'facilities', date: '2026-03-19',
    src: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80',
    title: 'Changing Rooms', desc: 'Clean & spacious facilities',
  },
  {
    id: 7, category: 'facilities', date: '2026-03-19',
    src: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80',
    title: 'Parking Area', desc: 'Ample free parking',
  },
  {
    id: 8, category: 'facilities', date: '2026-03-19',
    src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    title: 'Spectator Stand', desc: 'Comfortable seating area',
  },
  // ── Events
  {
    id: 9, category: 'events', date: '2026-03-19',
    src: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&q=80',
    title: 'Evening Match', desc: 'Night game under floodlights',
  },
  {
    id: 10, category: 'events', date: '2026-03-19',
    src: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=600&q=80',
    title: 'Team Warm-up', desc: 'Pre-match practice session',
  },
  {
    id: 11, category: 'events', date: '2026-03-19',
    src: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
    title: 'Friday Night League', desc: 'Weekly league matches',
  },
  // ── Tournaments
  {
    id: 12, category: 'tournaments', date: '2025-09-24',
    src: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&q=80',
    title: 'Champions Cup 2025', desc: 'Team photo with trophy',
  },
  {
    id: 13, category: 'tournaments', date: '2025-09-24',
    src: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=600&q=80',
    title: 'Finals Day', desc: 'Match in progress',
  },
  {
    id: 14, category: 'tournaments', date: '2025-09-24',
    src: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80',
    title: 'Award Ceremony', desc: 'Trophy presentation',
  },
  {
    id: 15, category: 'tournaments', date: '2026-03-19',
    src: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
    title: 'August League', desc: 'Inter-company tournament',
  },
];

type Category = 'all' | 'turf' | 'facilities' | 'events' | 'tournaments';
type ViewMode = 'grid' | 'list';

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: 'all',         label: 'All Photos',  icon: '📷' },
  { key: 'turf',        label: 'Turf',        icon: '⚽' },
  { key: 'facilities',  label: 'Facilities',  icon: '🏢' },
  { key: 'events',      label: 'Events',      icon: '🌙' },
  { key: 'tournaments', label: 'Tournaments', icon: '🏆' },
];

const BADGE_STYLES: Record<string, string> = {
  turf:        'bg-green-100  text-green-800',
  facilities:  'bg-blue-100   text-blue-800',
  events:      'bg-purple-100 text-purple-800',
  tournaments: 'bg-orange-100 text-orange-800',
};

const BADGE_ICONS: Record<string, string> = {
  turf:        '⚽',
  facilities:  '📷',
  events:      '🌙',
  tournaments: '🏆',
};

// All unique months in data for the date dropdown
const ALL_MONTHS = [
  { value: 'all',     label: 'All Dates' },
  { value: '2025-09', label: 'September 2025' },
  { value: '2025-08', label: 'August 2025' },
  { value: '2025-07', label: 'July 2025' },
  { value: '2025-06', label: 'June 2025' },
];

function fmtGroupDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const GalleryPage = () => {
  const [filter,   setFilter]   = useState<Category>('all');
  const [month,    setMonth]    = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [lightbox, setLightbox] = useState<typeof galleryItems[0] | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  // ── Filter
  const filtered = useMemo(() => {
    return galleryItems.filter(item => {
      const matchCat   = filter === 'all' || item.category === filter;
      const matchMonth = month  === 'all' || item.date.startsWith(month);
      return matchCat && matchMonth;
    });
  }, [filter, month]);

  // ── Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, typeof galleryItems>();
    filtered.forEach(item => {
      const arr = map.get(item.date) || [];
      arr.push(item);
      map.set(item.date, arr);
    });
    // Sort dates descending
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const handleImgError = (id: number) => setImgErrors(prev => new Set(prev).add(id));

  // ── Lightbox nav
  const lightboxIndex = lightbox ? filtered.findIndex(i => i.id === lightbox.id) : -1;
  const prevPhoto = () => lightboxIndex > 0 && setLightbox(filtered[lightboxIndex - 1]);
  const nextPhoto = () => lightboxIndex < filtered.length - 1 && setLightbox(filtered[lightboxIndex + 1]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* ── TOP BAR ── */}
      <div className="bg-white border-b border-gray-200 sticky top-[56px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="text-gray-500 hover:text-gray-800 mr-1">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <Camera className="w-5 h-5 text-green-600" />
          <h1 className="font-bold text-xl text-gray-900">Photo Gallery</h1>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── FILTER TABS + DATE SELECT ── */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex items-center justify-between gap-4 flex-wrap">
          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  filter === cat.key
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Date dropdown */}
          <div className="relative">
            <select
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="appearance-none border border-gray-200 rounded-xl pl-4 pr-9 py-2 text-sm font-semibold text-gray-700 bg-white focus:border-green-500 outline-none cursor-pointer"
            >
              {ALL_MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Photo count */}
        <p className="text-sm text-gray-500 mb-6">
          Showing <strong>{filtered.length}</strong> photo{filtered.length !== 1 ? 's' : ''}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">📷</div>
            <p className="font-semibold text-lg">No photos found</p>
            <p className="text-sm mt-1">Try a different category or date filter</p>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(([date, items]) => (
              <div key={date}>
                {/* Date group header */}
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <h2 className="font-bold text-lg text-gray-900">{fmtGroupDate(date)}</h2>
                  <span className="text-sm text-gray-400 font-medium">({items.length} photo{items.length !== 1 ? 's' : ''})</span>
                </div>

                {viewMode === 'grid' ? (
                  /* ── GRID VIEW ── */
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {items.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setLightbox(item)}
                        className="relative rounded-2xl overflow-hidden aspect-square cursor-pointer group shadow-sm hover:shadow-lg transition-shadow"
                      >
                        {imgErrors.has(item.id) ? (
                          <div className="w-full h-full bg-gradient-to-br from-green-700 to-green-500 flex flex-col items-center justify-center text-white">
                            <span className="text-4xl mb-2">{BADGE_ICONS[item.category]}</span>
                            <span className="text-xs font-semibold px-2 text-center">{item.title}</span>
                          </div>
                        ) : (
                          <img
                            src={item.src}
                            alt={item.title}
                            onError={() => handleImgError(item.id)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        {/* Dark overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200" />
                        {/* Category badge */}
                        <div className={`absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${BADGE_STYLES[item.category]} shadow-sm`}>
                          <span>{BADGE_ICONS[item.category]}</span>
                          <span className="capitalize">{item.category}</span>
                        </div>
                        {/* Title on hover */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                          <p className="text-white text-xs font-bold">{item.title}</p>
                          <p className="text-white/70 text-xs">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* ── LIST VIEW ── */
                  <div className="space-y-2">
                    {items.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setLightbox(item)}
                        className="flex gap-4 bg-white rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow items-center"
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                          {imgErrors.has(item.id) ? (
                            <div className="w-full h-full bg-gradient-to-br from-green-700 to-green-500 flex items-center justify-center text-2xl">
                              {BADGE_ICONS[item.category]}
                            </div>
                          ) : (
                            <img src={item.src} alt={item.title} onError={() => handleImgError(item.id)} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BADGE_STYLES[item.category]}`}>
                              {BADGE_ICONS[item.category]} <span className="capitalize">{item.category}</span>
                            </span>
                          </div>
                          <p className="font-bold text-gray-900 text-sm truncate">{item.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <div className="rounded-2xl overflow-hidden bg-gray-900 aspect-video">
              {imgErrors.has(lightbox.id) ? (
                <div className="w-full h-full bg-gradient-to-br from-green-700 to-green-500 flex flex-col items-center justify-center text-white">
                  <span className="text-8xl mb-4">{BADGE_ICONS[lightbox.category]}</span>
                  <span className="text-xl font-bold">{lightbox.title}</span>
                </div>
              ) : (
                <img
                  src={lightbox.src}
                  alt={lightbox.title}
                  onError={() => handleImgError(lightbox.id)}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Caption + badge */}
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${BADGE_STYLES[lightbox.category]}`}>
                    {BADGE_ICONS[lightbox.category]} <span className="capitalize">{lightbox.category}</span>
                  </span>
                  <span className="text-gray-400 text-xs">{fmtGroupDate(lightbox.date)}</span>
                </div>
                <p className="text-white font-bold">{lightbox.title}</p>
                <p className="text-white/60 text-sm">{lightbox.desc}</p>
              </div>
              {/* Prev / Next */}
              <div className="flex gap-2">
                <button
                  onClick={prevPhoto}
                  disabled={lightboxIndex === 0}
                  className="bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white rounded-xl px-4 py-2 font-bold transition-colors"
                >
                  ‹ Prev
                </button>
                <button
                  onClick={nextPhoto}
                  disabled={lightboxIndex === filtered.length - 1}
                  className="bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white rounded-xl px-4 py-2 font-bold transition-colors"
                >
                  Next ›
                </button>
              </div>
            </div>

            {/* Counter */}
            <p className="text-center text-white/40 text-xs mt-2">
              {lightboxIndex + 1} / {filtered.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;