import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { getPhotoUrl } from '../account/shared/utils/photoUrl';
import { ShopProduct, formatPrice, fetchAvailableProducts } from '../account/shared/1ShopList';

interface SharedShopFeedProps {
  sectionLabel?: string;
  savedLabel?: string;
  emptyLabel?: string;
  onItemClick?: (item: ShopProduct) => void;
}

function ShopTile({
  item,
  isFav,
  onFav,
  onClick,
}: {
  item: ShopProduct;
  isFav: boolean;
  onFav: (id: string) => void;
  onClick?: (item: ShopProduct) => void;
}) {
  const heartIconRef = useRef<HTMLSpanElement>(null);

  const handlePhotoClick = (e: React.MouseEvent) => {
    // We only trigger the drawer if the click is directly on the photo area
    if (onClick) {
      onClick(item);
    }
  };

  const handleFav = (e: React.MouseEvent) => {
    // CRITICAL: Stop the click from ever reaching any parent div
    e.preventDefault();
    e.stopPropagation();

    const icon = heartIconRef.current;
    if (icon) {
      icon.style.animation = 'none';
      void icon.offsetWidth;
      // Use the existing favPop animation
      icon.style.animation = 'favPop 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }

    // Toggle the favorite after the animation has been kicked off so the
    // clicked icon always visibly pops, regardless of which list is rerendering.
    onFav(item.product_id);
  };

  const photoUrl = getPhotoUrl(item.photo_url);
  const price = formatPrice(item.total_price);

  return (
    <div className="shop-thumb" style={{ position: 'relative' }}>
      {/* ── PHOTO AREA: Only this triggers the drawer ── */}
      <div 
        className="shop-img" 
        onClick={handlePhotoClick} 
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', fontSize: '40px' }}>💎</div>
        )}
        
        {/* Overlay only on the image */}
        <div className="inv-overlay" style={{ flexDirection: 'column', gap: 6 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: '#fff', textAlign: 'center' }}>
            {price}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
            Tap to view
          </div>
        </div>
      </div>

      {/* ── INFO AREA: Completely separate from the drawer trigger ── */}
      <div 
        className="shop-info" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pointerEvents: 'auto' // Ensure this area is interactive but doesn't trigger parent
        }}
        onClick={(e) => e.stopPropagation()} // Shield this entire area from parent clicks
      >
        <div className="shop-name" style={{ flex: 1, marginRight: 8 }}>{item.title}</div>
        
        {/* Favorite icon - explicitly handled to prevent any bubbling */}
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={handleFav}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            margin: '-8px',
            fontSize: 22,
            color: isFav ? 'var(--gold)' : 'var(--text-muted)',
            opacity: isFav ? 1 : 0.4,
            cursor: 'pointer',
            flexShrink: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            WebkitTapHighlightColor: 'transparent',
            transition: 'color 200ms ease, opacity 200ms ease'
          }}
          aria-label={isFav ? 'Remove from saved items' : 'Add to saved items'}
        >
          <span
            ref={heartIconRef}
            style={{
              display: 'inline-block',
              transform: 'none',
              pointerEvents: 'none'
            }}
          >
            {/* The smiley face icons: ☻ (filled) and ☺ (outline) */}
            {isFav ? '☻' : '☺'}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function SharedShopFeed({
  sectionLabel = 'Shop',
  savedLabel = 'Saved Items',
  emptyLabel = 'No shop items available right now.',
  onItemClick,
}: SharedShopFeedProps) {
  const [items,     setItems]     = useState<ShopProduct[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore,   setHasMore]   = useState(true);

  const nextPageRef = useRef(1);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (fetchingRef.current || !hasMore) return;
    fetchingRef.current = true;
    setLoadingMore(true);

    const page = nextPageRef.current;
    const data = await fetchAvailableProducts(page, 12);

    setItems(prev => {
      const existingIds = new Set(prev.map(p => p.product_id));
      const newItems = data.filter(p => !existingIds.has(p.product_id));
      return [...prev, ...newItems];
    });

    if (data.length < 12) setHasMore(false);
    nextPageRef.current = page + 1;
    setLoadingMore(false);
    fetchingRef.current = false;
  }, [hasMore]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const data = await fetchAvailableProducts(0, 12);
      if (!isMounted) return;
      setItems(data);
      setLoading(false);
      if (data.length < 12) setHasMore(false);
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const hasMoreRef = useRef(hasMore);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  useEffect(() => {
    if (loading) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreRef.current) {
          loadMore();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, loadMore]);

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const isAlreadyFav = prev.includes(id);
      if (isAlreadyFav) {
        return prev.filter(f => f !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const favoriteItems = useMemo(
    () => items.filter(item => favorites.includes(item.product_id)),
    [items, favorites]
  );

  return (
    <>
      {favoriteItems.length > 0 && (
        <>
          <div className="fdiv" style={{ marginTop: 16 }}>
            <div className="fdiv-line" />
            <div className="fdiv-lbl">{savedLabel}</div>
            <div className="fdiv-line" />
          </div>
          <div className="shop-grid">
            {favoriteItems.map(item => (
              <ShopTile
                key={`saved-${item.product_id}`}
                item={item}
                isFav={true}
                onFav={toggleFav}
                onClick={onItemClick}
              />
            ))}
          </div>
        </>
      )}

      <div className="fdiv" style={{ marginTop: 16 }}>
        <div className="fdiv-line" />
        <div className="fdiv-lbl">{sectionLabel}</div>
        <div className="fdiv-line" />
      </div>

      {loading && items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0 8px', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', opacity: 0.5 }}>
          Loading
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0 8px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)', opacity: 0.8 }}>
          {emptyLabel}
        </div>
      ) : (
        <>
          <div className="shop-grid">
            {items.map(item => (
              <ShopTile
                key={item.product_id}
                item={item}
                isFav={favorites.includes(item.product_id)}
                onFav={toggleFav}
                onClick={onItemClick}
              />
            ))}
          </div>
          {hasMore && <div ref={sentinelRef} style={{ height: 1, marginBottom: 8 }} />}
          {loadingMore && (
            <div style={{ textAlign: 'center', padding: '12px 0 4px', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', opacity: 0.5 }}>
              Loading
            </div>
          )}
          <div style={{ textAlign: 'center', padding: '16px 0 8px', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', opacity: 0.5 }}>
            · · ·
          </div>
        </>
      )}
    </>
  );
}
