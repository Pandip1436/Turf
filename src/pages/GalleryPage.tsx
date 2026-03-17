import  { useState } from 'react';
import { X } from 'lucide-react';

const galleryItems = [
  { id: 1, category: 'field', emoji: '⚽', title: 'Main Football Field', desc: '360° circular design', color: 'from-green-800 to-green-600' },
  { id: 2, category: 'field', emoji: '🏏', title: 'Cricket Pitch', desc: 'Premium artificial surface', color: 'from-emerald-700 to-green-500' },
  { id: 3, category: 'night', emoji: '🌙', title: 'Night Floodlights', desc: 'Pro LED system', color: 'from-gray-900 to-blue-900' },
  { id: 4, category: 'night', emoji: '💡', title: 'Evening Match', desc: 'Bright as day', color: 'from-slate-800 to-indigo-800' },
  { id: 5, category: 'facilities', emoji: '🚿', title: 'Changing Rooms', desc: 'Clean & spacious', color: 'from-blue-600 to-cyan-600' },
  { id: 6, category: 'facilities', emoji: '🚗', title: 'Parking Area', desc: 'Free for all players', color: 'from-gray-600 to-gray-800' },
  { id: 7, category: 'tournament', emoji: '🏆', title: 'Weekend Tournament', desc: 'Exciting matches', color: 'from-yellow-600 to-orange-600' },
  { id: 8, category: 'tournament', emoji: '🥇', title: 'Award Ceremony', desc: 'Trophy & cash prizes', color: 'from-amber-600 to-yellow-500' },
  { id: 9, category: 'field', emoji: '🌿', title: 'Turf Close-up', desc: 'High-quality artificial grass', color: 'from-green-600 to-lime-600' },
  { id: 10, category: 'night', emoji: '⭐', title: 'Late Night Game', desc: 'Open till 6 AM', color: 'from-purple-900 to-blue-900' },
  { id: 11, category: 'facilities', emoji: '💧', title: 'Drinking Water', desc: 'Pure & chilled', color: 'from-sky-500 to-blue-600' },
  { id: 12, category: 'tournament', emoji: '👥', title: 'Team Photo', desc: 'Post-match memories', color: 'from-green-700 to-teal-600' },
];

const categories = ['all', 'field', 'night', 'facilities', 'tournament'];

const GalleryPage = () => {
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState<typeof galleryItems[0] | null>(null);

  const filtered = filter === 'all' ? galleryItems : galleryItems.filter(g => g.category === filter);

  return (
    <div className="min-h-screen bg-gray-50 mt-10 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl tracking-wider text-gray-900 mb-2">GALLERY</h1>
          <p className="text-gray-500">Take a look at our world-class facility</p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${filter === cat ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-400'}`}>
              {cat === 'all' ? '🌐 All' : cat === 'field' ? '⚽ Field' : cat === 'night' ? '🌙 Night' : cat === 'facilities' ? '🏢 Facilities' : '🏆 Tournaments'}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => (
            <div key={item.id} onClick={() => setLightbox(item)}
              className={`bg-gradient-to-br ${item.color} rounded-2xl aspect-square flex flex-col items-center justify-center text-white cursor-pointer card-hover`}>
              <div className="text-5xl mb-3">{item.emoji}</div>
              <div className="text-center px-3">
                <div className="font-bold text-sm">{item.title}</div>
                <div className="text-xs opacity-75 mt-1">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
            <div className={`bg-gradient-to-br ${lightbox.color} rounded-3xl w-full max-w-md aspect-square flex flex-col items-center justify-center text-white relative`}
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 bg-white/20 rounded-full p-2 hover:bg-white/30">
                <X className="w-5 h-5" />
              </button>
              <div className="text-8xl mb-5">{lightbox.emoji}</div>
              <h3 className="font-display text-3xl tracking-wider mb-2">{lightbox.title}</h3>
              <p className="text-white/70">{lightbox.desc}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;