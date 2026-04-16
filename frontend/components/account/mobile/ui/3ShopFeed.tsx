// components/account/mobile/ui/3ShopFeed.tsx
// The shop feed shows items from the CCG shop.
// In production this data will come from Supabase products table.
// For now it renders placeholder tiles that match the mockup design.
// components/account/mobile/ui/3ShopFeed.tsx

import { useState, useEffect, useRef } from 'react';

const BASE_ITEMS = [
  { id: 1,  emoji: '💎', name: 'Blue Sapphire',       price: '$1,240' },
  { id: 2,  emoji: '🟢', name: 'Tsavorite Garnet',    price: '$890'   },
  { id: 3,  emoji: '🔴', name: 'Burmese Ruby',         price: '$2,100' },
  { id: 4,  emoji: '💛', name: 'Yellow Tourmaline',    price: '$640'   },
  { id: 5,  emoji: '🔵', name: 'Aquamarine',           price: '$480'   },
  { id: 6,  emoji: '🟣', name: 'Amethyst',             price: '$320'   },
  { id: 7,  emoji: '⬜', name: 'White Topaz',          price: '$210'   },
  { id: 8,  emoji: '🟤', name: 'Smoky Quartz',         price: '$180'   },
  { id: 9,  emoji: '🔶', name: 'Spessartite Garnet',   price: '$760'   },
  { id: 10, emoji: '🟦', name: 'Blue Zircon',          price: '$540'   },
  { id: 11, emoji: '🟩', name: 'Chrome Diopside',      price: '$290'   },
  { id: 12, emoji: '🔷', name: 'Aquamarine Emerald',   price: '$1,100' },
];

interface ShopItem {
  id:    number;
  emoji: string;
  name:  string;
  price: string;
}

// Individual shop tile with smiley face favoriting
function ShopTile({
  item,
  isFav,
  onFav,
}: {
  item:  ShopItem;
  isFav: boolean;
  onFav: (id: number) => void;
}) {
  const [tapped,    setTapped]    = useState(false);
  const [animating, setAnimating] = useState(false);

  // First tap: show gold overlay + buy button
  // Second tap on overlay: open shop drawer (stubbed)
  const handleTap = () => {
    if (!tapped) { setTapped(true); return; }
    // second tap — in production: open shop drawer
    setTapped(false);
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFav) return; // already favorited
    setAnimating(true);
    onFav(item.id);
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <div
      className={`shop-thumb${tapped ? ' tapped' : ''}`}
      onClick={handleTap}
      style={{ position: 'relative' }}
    >
      {/* Large emoji image */}
      <div className="shop-img">{item.emoji}</div>

      {/* Info bar at bottom */}
      <div className="shop-info">
        <div className="shop-name">{item.name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          {item.price}
        </div>
      </div>

      {/* Gold overlay — appears on first tap */}
      <div className="inv-overlay" style={{ flexDirection: 'column', gap: 6 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: '#fff',
        }}>{item.price}</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
        }}>Tap again to view</div>
      </div>

      {/* Smiley face favorite button — top-right corner
          ☹︎ = not favorited (sad face, white/muted)
          ☻ = favorited (happy face, gold)
          Animates upward when tapped to indicate it flew to favorites */}
      <button
        className="heart-btn"
        onClick={handleFav}
        style={{
          fontSize: 22,
          color: isFav ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
          transform: animating ? 'translateY(-20px) scale(1.3)' : 'none',
          opacity:   animating ? 0 : 1,
          transition: animating
            ? 'transform 400ms ease, opacity 400ms ease'
            : 'color 120ms ease',
        }}
        aria-label={isFav ? 'Favorited' : 'Add to favorites'}
      >
        {isFav ? '☻' : '☹︎'}
      </button>
    </div>
  );
}

export default function ShopFeed3() {
  const [items,     setItems]     = useState<ShopItem[]>(BASE_ITEMS);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [page,      setPage]      = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Endless scroll — when the sentinel div enters the viewport,
  // append another batch of items (cycling through BASE_ITEMS)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // When page increments, add another batch of items with unique IDs
  useEffect(() => {
    if (page === 1) return;
    const batch = BASE_ITEMS.map((item, i) => ({
      ...item,
      id: page * 100 + i, // unique ID per page
    }));
    setItems(prev => [...prev, ...batch]);
  }, [page]);

  const toggleFav = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const favItems = items.filter(item => favorites.includes(item.id));

  return (
    <>
      {/* ── Favorites section — only shown when something is favorited ── */}
      {favItems.length > 0 && (
        <>
          <div className="fdiv" style={{ marginTop: 16 }}>
            <div className="fdiv-line" />
            <div className="fdiv-lbl">Saved Items</div>
            <div className="fdiv-line" />
          </div>
          <div className="shop-grid">
            {favItems.map(item => (
              <ShopTile
                key={`fav-${item.id}`}
                item={item}
                isFav={true}
                onFav={toggleFav}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Shop divider ── */}
      <div className="fdiv" style={{ marginTop: 16 }}>
        <div className="fdiv-line" />
        <div className="fdiv-lbl">Shop</div>
        <div className="fdiv-line" />
      </div>

      {/* ── Shop grid — endless scroll ── */}
      <div className="shop-grid">
        {items.map(item => (
          <ShopTile
            key={item.id}
            item={item}
            isFav={favorites.includes(item.id)}
            onFav={toggleFav}
          />
        ))}
      </div>

      {/* ── Sentinel — IntersectionObserver watches this to trigger next page ── */}
      <div ref={sentinelRef} style={{ height: 1, marginBottom: 8 }} />

      {/* ── Loading indicator ── */}
      <div style={{
        textAlign: 'center', padding: '16px 0 8px',
        fontFamily: 'var(--font-mono)', fontSize: 9,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: 'var(--text-muted)', opacity: 0.5,
      }}>
        · · ·
      </div>
    </>
  );
}
