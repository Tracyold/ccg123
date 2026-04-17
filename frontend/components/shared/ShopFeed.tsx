import { useEffect, useMemo, useState } from 'react';
import { getPhotoUrl } from '../account/shared/utils/photoUrl';
import { ShopProduct, formatPrice, fetchAvailableProducts } from '../account/shared/1ShopList';

interface SharedShopFeedProps {
  sectionLabel?: string;
  savedLabel?: string;
  emptyLabel?: string;
}

function ShopTile({
  item,
  isFav,
  onFav,
}: {
  item: ShopProduct;
  isFav: boolean;
  onFav: (id: string) => void;
}) {
  const [tapped, setTapped] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleTap = () => {
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

      <div className="shop-info">
        <div className="shop-name">{item.title}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          {price}
        </div>
      </div>

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
          Tap again to view
        </div>
      </div>

      <button
        type="button"
        className="heart-btn"
        onClick={handleFav}
        style={{
          fontSize: 22,
          color: isFav ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
          transform: animating ? 'translateY(-20px) scale(1.3)' : 'none',
          opacity: animating ? 0 : 1,
          transition: animating
            ? 'transform 400ms ease, opacity 400ms ease'
            : 'color 120ms ease',
        }}
        aria-label={isFav ? 'Remove from saved items' : 'Add to saved items'}
      >
        {isFav ? '☻' : '☹︎'}
      </button>
    </div>
  );
}

export default function SharedShopFeed({
  sectionLabel = 'Shop',
  savedLabel = 'Saved Items',
  emptyLabel = 'No shop items available right now.',
}: SharedShopFeedProps) {
  const [items, setItems] = useState<ShopProduct[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const data = await fetchAvailableProducts();
      if (isMounted) {
        setItems(data);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

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

      {loading ? (
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
        <div className="shop-grid">
          {items.map(item => (
            <ShopTile
              key={item.product_id}
              item={item}
              isFav={favorites.includes(item.product_id)}
              onFav={toggleFav}
            />
          ))}
        </div>
      )}
    </>
  );
}
