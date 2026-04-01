import { useState, useEffect, useMemo } from 'react';
import { X, Camera, List, Grid3X3, ChevronLeft, Calendar, Search } from 'lucide-react';
import api from '../utils/api';

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

type ViewMode = 'grid' | 'list';

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

const FALLBACK_GRADIENTS: Record<string, string> = {
  field:       'from-green-800 to-green-600',
  facilities:  'from-blue-700  to-cyan-600',
  night:       'from-gray-900  to-indigo-900',
  tournament:  'from-yellow-600 to-orange-600',
};

function fmtGroupDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function fmtGroupDateShort(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

const GalleryPage = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [turfs, setTurfs] = useState<{ turfId: string; name: string; sport: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTurf, setFilterTurf] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      api.get<{ success: boolean; images: GalleryItem[] }>('/gallery'),
      api.get<{ turfs: { turfId: string; name: string; sport: string }[] }>('/turfs?active=true'),
    ])
      .then(([galRes, turfRes]) => {
        setItems(galRes.data.images || []);
        setTurfs(turfRes.data.turfs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const turfOptions = useMemo(() => {
    return turfs.map(t => ({ id: t.turfId, name: t.name }));
  }, [turfs]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => set.add(i.category));
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter(item => {
      if (filterTurf !== 'all' && item.turfId !== filterTurf) return false;
      if (filterCat !== 'all' && item.category !== filterCat) return false;
      if (q && !item.title.toLowerCase().includes(q) && !item.turfName.toLowerCase().includes(q) && !item.desc.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, filterTurf, filterCat, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, GalleryItem[]>();
    filtered.forEach(item => {
      const arr = map.get(item.date) || [];
      arr.push(item);
      map.set(item.date, arr);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const handleImgError = (id: string) =>
    setImgErrors(prev => new Set(prev).add(id));

  const lightboxIndex = lightbox ? filtered.findIndex(i => i._id === lightbox._id) : -1;
  const prevPhoto = () => lightboxIndex > 0 && setLightbox(filtered[lightboxIndex - 1]);
  const nextPhoto = () => lightboxIndex < filtered.length - 1 && setLightbox(filtered[lightboxIndex + 1]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!lightbox) return;
    if (e.key === 'ArrowLeft')  prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'Escape')     setLightbox(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16 sm:pt-20" onKeyDown={handleKeyDown} tabIndex={0}>

      {/* ── TOP BAR ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-[56px] sm:top-[56px] z-30 shadow-sm">
        {/* Title row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
          <button onClick={() => window.history.back()} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
          <h1 className="font-bold text-base sm:text-xl text-gray-900 dark:text-white truncate">Photo Gallery</h1>
          <div className="flex gap-1.5 sm:gap-2 ml-auto shrink-0">
            <button onClick={() => setViewMode('list')} title="List view"
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-green-100 text-green-700' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <List className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button onClick={() => setViewMode('grid')} title="Grid view"
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-green-100 text-green-700' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-3 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search photos..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 outline-none"
            />
          </div>

          {/* Dropdowns row */}
          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-1 sm:flex-none">
              <select value={filterTurf} onChange={e => setFilterTurf(e.target.value)}
                className="w-full sm:w-auto appearance-none border border-gray-200 dark:border-gray-700 rounded-xl pl-3 sm:pl-4 pr-8 sm:pr-9 py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:border-green-500 outline-none cursor-pointer">
                <option value="all">All Turfs</option>
                {turfOptions.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <span className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none text-[10px] sm:text-xs">▾</span>
            </div>

            <div className="relative flex-1 sm:flex-none">
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                className="w-full sm:w-auto appearance-none border border-gray-200 dark:border-gray-700 rounded-xl pl-3 sm:pl-4 pr-8 sm:pr-9 py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:border-green-500 outline-none cursor-pointer">
                <option value="all">All Categories</option>
                {categoryOptions.map(c => (
                  <option key={c} value={c}>{BADGE_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <span className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none text-[10px] sm:text-xs">▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
          Showing <strong>{filtered.length}</strong> photo{filtered.length !== 1 ? 's' : ''}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 sm:py-24 text-gray-400 dark:text-gray-500">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📷</div>
            <p className="font-semibold text-base sm:text-lg">No photos found</p>
            <p className="text-xs sm:text-sm mt-1">Try a different filter</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-10">
            {grouped.map(([date, dateItems]) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                  <h2 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">
                    <span className="hidden sm:inline">{fmtGroupDate(date)}</span>
                    <span className="sm:hidden">{fmtGroupDateShort(date)}</span>
                  </h2>
                  <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                    ({dateItems.length})
                  </span>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {dateItems.map(item => (
                      <div key={item._id} onClick={() => setLightbox(item)}
                        className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-square cursor-pointer group shadow-sm hover:shadow-xl transition-shadow">
                        {imgErrors.has(item._id) ? (
                          <div className={`w-full h-full bg-gradient-to-br ${FALLBACK_GRADIENTS[item.category] || FALLBACK_GRADIENTS.field} flex flex-col items-center justify-center text-white`}>
                            <span className="text-3xl sm:text-5xl mb-1 sm:mb-2">{BADGE_ICONS[item.category]}</span>
                            <span className="text-[10px] sm:text-xs font-bold px-2 text-center">{item.title}</span>
                          </div>
                        ) : (
                          <img src={item.image} alt={item.title} onError={() => handleImgError(item._id)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Category badge */}
                        <div className={`absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold shadow ${BADGE_STYLES[item.category] || ''}`}>
                          {BADGE_ICONS[item.category]}
                          <span className="capitalize hidden sm:inline">{item.category}</span>
                        </div>

                        {/* Turf name badge */}
                        <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 bg-black/50 backdrop-blur text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full max-w-[45%] truncate">
                          {item.turfName}
                        </div>

                        {/* Bottom info */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                          <p className="text-white font-bold text-[10px] sm:text-xs leading-tight truncate">{item.title}</p>
                          <p className="text-white/70 text-[9px] sm:text-xs truncate hidden sm:block">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5 sm:space-y-2">
                    {dateItems.map(item => (
                      <div key={item._id} onClick={() => setLightbox(item)}
                        className="flex gap-3 sm:gap-4 bg-white dark:bg-gray-800 rounded-xl p-2.5 sm:p-3 cursor-pointer hover:shadow-md transition-shadow items-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden shrink-0">
                          {imgErrors.has(item._id) ? (
                            <div className={`w-full h-full bg-gradient-to-br ${FALLBACK_GRADIENTS[item.category] || FALLBACK_GRADIENTS.field} flex items-center justify-center text-xl sm:text-2xl`}>
                              {BADGE_ICONS[item.category]}
                            </div>
                          ) : (
                            <img src={item.image} alt={item.title} onError={() => handleImgError(item._id)} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                            <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${BADGE_STYLES[item.category] || ''}`}>
                              {BADGE_ICONS[item.category]} <span className="capitalize">{item.category}</span>
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 truncate">{item.turfName}</span>
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate">{item.title}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs mt-0.5 truncate">{item.desc}</p>
                        </div>
                        <span className="text-gray-300 dark:text-gray-600 text-lg sm:text-xl shrink-0">›</span>
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
        <div className="fixed inset-0 bg-black/90 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setLightbox(null)}>
          <div className="relative w-full sm:max-w-3xl" onClick={e => e.stopPropagation()}>
            {/* Close — positioned differently on mobile vs desktop */}
            <button onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 sm:-top-12 sm:right-0 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition-colors z-10">
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <div className="rounded-t-2xl sm:rounded-2xl overflow-hidden bg-gray-900">
              {imgErrors.has(lightbox._id) ? (
                <div className={`w-full aspect-video bg-gradient-to-br ${FALLBACK_GRADIENTS[lightbox.category] || FALLBACK_GRADIENTS.field} flex flex-col items-center justify-center text-white`}>
                  <span className="text-6xl sm:text-8xl mb-3 sm:mb-4">{BADGE_ICONS[lightbox.category]}</span>
                  <span className="text-base sm:text-xl font-bold">{lightbox.title}</span>
                </div>
              ) : (
                <img src={lightbox.image} alt={lightbox.title} onError={() => handleImgError(lightbox._id)}
                  className="w-full max-h-[55vh] sm:max-h-[70vh] object-contain" />
              )}
            </div>

            {/* Caption + nav */}
            <div className="bg-black/80 sm:bg-transparent p-4 sm:p-0 sm:mt-3 rounded-b-2xl sm:rounded-none">
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${BADGE_STYLES[lightbox.category] || ''}`}>
                      {BADGE_ICONS[lightbox.category]} <span className="capitalize">{lightbox.category}</span>
                    </span>
                    <span className="text-gray-400 text-[10px] sm:text-xs truncate">{lightbox.turfName}</span>
                    <span className="text-gray-500 text-[10px] sm:text-xs hidden sm:inline">·</span>
                    <span className="text-gray-400 text-[10px] sm:text-xs hidden sm:inline">{fmtGroupDate(lightbox.date)}</span>
                  </div>
                  <p className="text-white font-bold text-sm sm:text-base truncate">{lightbox.title}</p>
                  <p className="text-white/60 text-xs sm:text-sm truncate">{lightbox.desc}</p>
                </div>

                <div className="flex gap-1.5 sm:gap-2 shrink-0">
                  <button onClick={prevPhoto} disabled={lightboxIndex === 0}
                    className="bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 font-bold transition-colors text-sm sm:text-base">
                    ‹
                  </button>
                  <button onClick={nextPhoto} disabled={lightboxIndex === filtered.length - 1}
                    className="bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 font-bold transition-colors text-sm sm:text-base">
                    ›
                  </button>
                </div>
              </div>

              <p className="text-center text-white/40 text-[10px] sm:text-xs mt-2 pb-1 sm:pb-0">
                {lightboxIndex + 1} / {filtered.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
