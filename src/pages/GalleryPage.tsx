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

  // Turfs that have gallery images (show all turfs as filter options)
  const turfOptions = useMemo(() => {
    return turfs.map(t => ({ id: t.turfId, name: t.name }));
  }, [turfs]);

  // Unique categories from data
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20" onKeyDown={handleKeyDown} tabIndex={0}>

      {/* ── TOP BAR ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-[56px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <Camera className="w-5 h-5 text-green-600" />
          <h1 className="font-bold text-xl text-gray-900 dark:text-white">Photo Gallery</h1>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => setViewMode('list')} title="List view"
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-green-100 text-green-700' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <List className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode('grid')} title="Grid view"
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-green-100 text-green-700' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <Grid3X3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search + Filters row */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex items-center gap-3 flex-wrap">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search photos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 outline-none"
            />
          </div>

          {/* Turf filter dropdown */}
          <div className="relative">
            <select value={filterTurf} onChange={e => setFilterTurf(e.target.value)}
              className="appearance-none border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-9 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:border-green-500 outline-none cursor-pointer">
              <option value="all">All Turfs</option>
              {turfOptions.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none text-xs">▾</span>
          </div>

          {/* Category filter */}
          <div className="relative">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="appearance-none border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-9 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:border-green-500 outline-none cursor-pointer">
              <option value="all">All Categories</option>
              {categoryOptions.map(c => (
                <option key={c} value={c}>{BADGE_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none text-xs">▾</span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Showing <strong>{filtered.length}</strong> photo{filtered.length !== 1 ? 's' : ''}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400 dark:text-gray-500">
            <div className="text-5xl mb-4">📷</div>
            <p className="font-semibold text-lg">No photos found</p>
            <p className="text-sm mt-1">Try a different filter</p>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(([date, dateItems]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white">{fmtGroupDate(date)}</h2>
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    ({dateItems.length} photo{dateItems.length !== 1 ? 's' : ''})
                  </span>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {dateItems.map(item => (
                      <div key={item._id} onClick={() => setLightbox(item)}
                        className="relative rounded-2xl overflow-hidden aspect-square cursor-pointer group shadow-sm hover:shadow-xl transition-shadow">
                        {imgErrors.has(item._id) ? (
                          <div className={`w-full h-full bg-gradient-to-br ${FALLBACK_GRADIENTS[item.category] || FALLBACK_GRADIENTS.field} flex flex-col items-center justify-center text-white`}>
                            <span className="text-5xl mb-2">{BADGE_ICONS[item.category]}</span>
                            <span className="text-xs font-bold px-2 text-center">{item.title}</span>
                          </div>
                        ) : (
                          <img src={item.image} alt={item.title} onError={() => handleImgError(item._id)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className={`absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow ${BADGE_STYLES[item.category] || ''}`}>
                          {BADGE_ICONS[item.category]}
                          <span className="capitalize">{item.category}</span>
                        </div>
                        {/* Turf name badge */}
                        <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.turfName}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white font-bold text-xs leading-tight">{item.title}</p>
                          <p className="text-white/70 text-xs">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dateItems.map(item => (
                      <div key={item._id} onClick={() => setLightbox(item)}
                        className="flex gap-4 bg-white dark:bg-gray-800 rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow items-center">
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                          {imgErrors.has(item._id) ? (
                            <div className={`w-full h-full bg-gradient-to-br ${FALLBACK_GRADIENTS[item.category] || FALLBACK_GRADIENTS.field} flex items-center justify-center text-2xl`}>
                              {BADGE_ICONS[item.category]}
                            </div>
                          ) : (
                            <img src={item.image} alt={item.title} onError={() => handleImgError(item._id)} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BADGE_STYLES[item.category] || ''}`}>
                              {BADGE_ICONS[item.category]} <span className="capitalize">{item.category}</span>
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">{item.turfName}</span>
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.title}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{item.desc}</p>
                        </div>
                        <span className="text-gray-300 dark:text-gray-600 text-xl shrink-0">›</span>
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
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="relative w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)}
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="rounded-2xl overflow-hidden bg-gray-900">
              {imgErrors.has(lightbox._id) ? (
                <div className={`w-full aspect-video bg-gradient-to-br ${FALLBACK_GRADIENTS[lightbox.category] || FALLBACK_GRADIENTS.field} flex flex-col items-center justify-center text-white`}>
                  <span className="text-8xl mb-4">{BADGE_ICONS[lightbox.category]}</span>
                  <span className="text-xl font-bold">{lightbox.title}</span>
                </div>
              ) : (
                <img src={lightbox.image} alt={lightbox.title} onError={() => handleImgError(lightbox._id)}
                  className="w-full max-h-[70vh] object-contain" />
              )}
            </div>

            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${BADGE_STYLES[lightbox.category] || ''}`}>
                    {BADGE_ICONS[lightbox.category]} <span className="capitalize">{lightbox.category}</span>
                  </span>
                  <span className="text-gray-400 text-xs">{lightbox.turfName}</span>
                  <span className="text-gray-500 text-xs">·</span>
                  <span className="text-gray-400 text-xs">{fmtGroupDate(lightbox.date)}</span>
                </div>
                <p className="text-white font-bold">{lightbox.title}</p>
                <p className="text-white/60 text-sm">{lightbox.desc}</p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button onClick={prevPhoto} disabled={lightboxIndex === 0}
                  className="bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white rounded-xl px-4 py-2 font-bold transition-colors">
                  ‹
                </button>
                <button onClick={nextPhoto} disabled={lightboxIndex === filtered.length - 1}
                  className="bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white rounded-xl px-4 py-2 font-bold transition-colors">
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
