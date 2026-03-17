import { useState, useMemo } from 'react';
import { X, Camera, List, Grid3X3, ChevronLeft, Calendar } from 'lucide-react';

const galleryItems = [
  {
    id: 1, category: 'field', date: '2025-09-24',
    image: '/images/Turf.jpg',
    title: 'Main Football Field', desc: '360° circular design',
  },
  {
    id: 2, category: 'field', date: '2025-09-24',
    image: '/images/field2.png',
    title: 'Cricket Pitch', desc: 'Premium artificial surface',
  },
  {
    id: 3, category: 'night', date: '2025-09-15',
    image: '/images/hero1.png',
    title: 'Night Floodlights', desc: 'Professional LED system',
  },
  {
    id: 4, category: 'night', date: '2025-09-15',
    image: '/images/hero2.png',
    title: 'Evening Match', desc: 'Bright as day',
  },
  {
    id: 5, category: 'facilities', date: '2025-08-10',
    image: '/images/hero3.jpg',
    title: 'Changing Rooms', desc: 'Clean & spacious',
  },
  {
    id: 6, category: 'facilities', date: '2025-08-10',
    image: '/images/hero4.jpg',
    title: 'Parking Area', desc: 'Free parking for all players',
  },
  {
    id: 7, category: 'tournament', date: '2025-08-18',
    image: '/images/hero2.png',
    title: 'Weekend Tournament', desc: 'Exciting matches',
  },
];

type Category = 'all' | 'field' | 'night' | 'facilities' | 'tournament';
type ViewMode = 'grid' | 'list';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all',        label: '🌐 All Photos'  },
  { key: 'field',      label: '⚽ Field'        },
  { key: 'night',      label: '🌙 Night'        },
  { key: 'facilities', label: '🏢 Facilities'   },
  { key: 'tournament', label: '🏆 Tournaments'  },
];

const BADGE_STYLES: Record<string, string> = {
  field:       'bg-green-100  text-green-800',
  facilities:  'bg-blue-100   text-blue-800',
  night:       'bg-purple-100 text-purple-800',
  tournament:  'bg-orange-100 text-orange-800',
};

const BADGE_ICONS: Record<string, string> = {
  field:       '⚽',
  facilities:  '🏢',
  night:       '🌙',
  tournament:  '🏆',
};

// Fallback gradient when image fails to load
const FALLBACK_GRADIENTS: Record<string, string> = {
  field:       'from-green-800 to-green-600',
  facilities:  'from-blue-700  to-cyan-600',
  night:       'from-gray-900  to-indigo-900',
  tournament:  'from-yellow-600 to-orange-600',
};

const ALL_MONTHS = [
  { value: 'all',     label: 'All Dates'        },
  { value: '2025-09', label: 'September 2025'   },
  { value: '2025-08', label: 'August 2025'      },
];

function fmtGroupDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

const GalleryPage = () => {
  const [filter,    setFilter]    = useState<Category>('all');
  const [month,     setMonth]     = useState('all');
  const [viewMode,  setViewMode]  = useState<ViewMode>('grid');
  const [lightbox,  setLightbox]  = useState<typeof galleryItems[0] | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const filtered = useMemo(() =>
    galleryItems.filter(item => {
      const matchCat   = filter === 'all' || item.category === filter;
      const matchMonth = month  === 'all' || item.date.startsWith(month);
      return matchCat && matchMonth;
    }),
  [filter, month]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof galleryItems>();
    filtered.forEach(item => {
      const arr = map.get(item.date) || [];
      arr.push(item);
      map.set(item.date, arr);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const handleImgError  = (id: number) =>
    setImgErrors(prev => new Set(prev).add(id));

  const lightboxIndex = lightbox ? filtered.findIndex(i => i.id === lightbox.id) : -1;
  const prevPhoto = () => lightboxIndex > 0 && setLightbox(filtered[lightboxIndex - 1]);
  const nextPhoto = () => lightboxIndex < filtered.length - 1 && setLightbox(filtered[lightboxIndex + 1]);

  // Keyboard nav in lightbox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!lightbox) return;
    if (e.key === 'ArrowLeft')  prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'Escape')     setLightbox(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20" onKeyDown={handleKeyDown} tabIndex={0}>

      {/* ── TOP BAR ── */}
      <div className="bg-white border-b border-gray-200 sticky top-[56px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-gray-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <Camera className="w-5 h-5 text-green-600" />
          <h1 className="font-bold text-xl text-gray-900">Photo Gallery</h1>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setViewMode('list')}
              title="List view"
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters row */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex items-center justify-between gap-4 flex-wrap">
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
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-6">
          Showing <strong>{filtered.length}</strong> photo{filtered.length !== 1 ? 's' : ''}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">📷</div>
            <p className="font-semibold text-lg">No photos found</p>
            <p className="text-sm mt-1">Try a different category or date</p>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(([date, items]) => (
              <div key={date}>
                {/* Date group header */}
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <h2 className="font-bold text-lg text-gray-900">{fmtGroupDate(date)}</h2>
                  <span className="text-sm text-gray-400">
                    ({items.length} photo{items.length !== 1 ? 's' : ''})
                  </span>
                </div>

                {viewMode === 'grid' ? (
                  /* ── GRID VIEW ── */
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {items.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setLightbox(item)}
                        className="relative rounded-2xl overflow-hidden aspect-square cursor-pointer group shadow-sm hover:shadow-xl transition-shadow"
                      >
                        {imgErrors.has(item.id) ? (
                          /* Fallback gradient tile */
                          <div className={`w-full h-full bg-gradient-to-br ${FALLBACK_GRADIENTS[item.category]} flex flex-col items-center justify-center text-white`}>
                            <span className="text-5xl mb-2">{BADGE_ICONS[item.category]}</span>
                            <span className="text-xs font-bold px-2 text-center">{item.title}</span>
                          </div>
                        ) : (
                          <img
                            src={item.image}
                            alt={item.title}
                            onError={() => handleImgError(item.id)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}

                        {/* Always-visible dark bottom overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Category badge top-left */}
                        <div className={`absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow ${BADGE_STYLES[item.category]}`}>
                          {BADGE_ICONS[item.category]}
                          <span className="capitalize">{item.category}</span>
                        </div>

                        {/* Title always shown at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white font-bold text-xs leading-tight">{item.title}</p>
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
                            <div className={`w-full h-full bg-gradient-to-br ${FALLBACK_GRADIENTS[item.category]} flex items-center justify-center text-2xl`}>
                              {BADGE_ICONS[item.category]}
                            </div>
                          ) : (
                            <img
                              src={item.image}
                              alt={item.title}
                              onError={() => handleImgError(item.id)}
                              className="w-full h-full object-cover"
                            />
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
                        <span className="text-gray-300 text-xl shrink-0">›</span>
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
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <div className="rounded-2xl overflow-hidden bg-gray-900">
              {imgErrors.has(lightbox.id) ? (
                <div className={`w-full aspect-video bg-gradient-to-br ${FALLBACK_GRADIENTS[lightbox.category]} flex flex-col items-center justify-center text-white`}>
                  <span className="text-8xl mb-4">{BADGE_ICONS[lightbox.category]}</span>
                  <span className="text-xl font-bold">{lightbox.title}</span>
                </div>
              ) : (
                <img
                  src={lightbox.image}
                  alt={lightbox.title}
                  onError={() => handleImgError(lightbox.id)}
                  className="w-full max-h-[70vh] object-contain"
                />
              )}
            </div>

            {/* Caption + nav */}
            <div className="mt-3 flex items-start justify-between gap-4">
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

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={prevPhoto}
                  disabled={lightboxIndex === 0}
                  className="bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white rounded-xl px-4 py-2 font-bold transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={nextPhoto}
                  disabled={lightboxIndex === filtered.length - 1}
                  className="bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white rounded-xl px-4 py-2 font-bold transition-colors"
                >
                  ›
                </button>
              </div>
            </div>

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