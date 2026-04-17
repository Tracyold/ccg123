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
  const [tapped, setTapped] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleTap = () => {
    if (onClick) {
      onClick(item);
      return;
    }
    if (!tapped) {
      setTapped(true);
      return;
    }
    setTapped(false);
    window.location.href = '/shop';
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimating(true);
    onFav(item.product_id);
    window.setTimeout(() => setAnimating(false), 400);
  };

  const photoUrl = getPhotoUrl(item.photo_url);
  const price = formatPrice(item.total_price);

  return (
    <div
      className={`shop-thumb${tapped ? ' tapped' : ''}`}
      onClick={handleTap}
      style={{ position: 'relative' }}
    >
      <div className="shop-img">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          '💎'
        )}
      </div>

      <div className="shop-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="shop-name" style={{ flex: 1, marginRight: 8 }}>{item.title}</div>
        
        {/* Favorite icon moved to the bottom right of the card info area */}
        <button
          type="button"
          onClick={handleFav}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: 22,
            color: isFav ? 'var(--gold)' : 'var(--text-muted)',
            opacity: isFav ? 1 : 0.4,
            transform: animating ? 'translateY(-10px) scale(1.3)' : 'none',
            transition: animating
              ? 'transform 400ms ease, opacity 400ms ease'
              : 'color 120ms ease, opacity 120ms ease',
            cursor: 'pointer',
            flexShrink: 0
          }}
          aria-label={isFav ? 'Remove from saved items' : 'Add to saved items'}
        >
          {isFav ? '☻' : '☹︎'}
        </button>
      </div>

      {/* Price is hidden from the main card info as requested */}
      {/* <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{price}</div> */}

      <div className="inv-overlay" style={{ flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 16,
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
          }}
        >
          {price}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
          }}
        >
          Tap to view
        </div>
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

  // Track the next page to fetch. Using a ref avoids stale-closure issues
  // inside the IntersectionObserver callback.
  const nextPageRef = useRef(1);

  // Sentinel element observed for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Guard against concurrent fetches
  const fetchingRef = useRef(false);

  // ── Load more pages ──────────────────────────────────────────────────────
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

  // ── Initial load (page 0) ────────────────────────────────────────────────
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

  // ── Infinite scroll observer ─────────────────────────────────────────────
  // The observer is set up once after the initial load completes and is only
  // torn down when the component unmounts or there are no more pages.
  // We do NOT include `loading` or `hasMore` in the dep array to avoid
  // re-creating the observer on every state change (which can cause it to
  // miss the intersection event). Instead we read `hasMore` via a ref.
  const hasMoreRef = useRef(hasMore);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  useEffect(() => {
    if (loading) return; // wait until first batch is rendered

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreRef.current) {
          loadMore();
        }
      },
      { rootMargin: '400px' } // start loading well before the sentinel is visible
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]); // only re-run when loading transitions false→true (initial load done)

  const toggleFav = (id: string) => {
    setFavorites(prev => (prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]));
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
        <div
          style={{
            textAlign: 'center',
            padding: '16px 0 8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            opacity: 0.5,
          }}
        >
          Loading
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '16px 0 8px',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            color: 'var(--text-muted)',
            opacity: 0.8,
          }}
        >
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

          {/* Sentinel — observed by IntersectionObserver to trigger loadMore */}
          {hasMore && (
            <div ref={sentinelRef} style={{ height: 1, marginBottom: 8 }} />
          )}

          {/* Loading indicator shown while fetching additional pages */}
          {loadingMore && (
            <div
              style={{
                textAlign: 'center',
                padding: '12px 0 4px',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                opacity: 0.5,
              }}
            >
              Loading
            </div>
          )}

          <div style={{
            textAlign: 'center', padding: '16px 0 8px',
            fontFamily: 'var(--font-mono)', fontSize: 9,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--text-muted)', opacity: 0.5,
          }}>
            · · ·
          </div>
        </>
      )}
    </>
  );
}
