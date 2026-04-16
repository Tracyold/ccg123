// components/account/mobile/ui/3ShopFeed.tsx
// The shop feed shows items from the CCG shop.
// In production this data will come from Supabase products table.
// For now it renders placeholder tiles that match the mockup design.

const SHOP_ITEMS = [
  { id: 1, emoji: '💎', name: 'Blue Sapphire',      price: '$1,240' },
  { id: 2, emoji: '🟢', name: 'Tsavorite Garnet',   price: '$890'   },
  { id: 3, emoji: '🔴', name: 'Burmese Ruby',        price: '$2,100' },
  { id: 4, emoji: '💛', name: 'Yellow Tourmaline',   price: '$640'   },
  { id: 5, emoji: '🔵', name: 'Aquamarine',          price: '$480'   },
  { id: 6, emoji: '🟣', name: 'Amethyst',            price: '$320'   },
  { id: 7, emoji: '⬜', name: 'White Topaz',         price: '$210'   },
  { id: 8, emoji: '🟤', name: 'Smoky Quartz',        price: '$180'   },
];

export default function ShopFeed3() {
  return (
    <>
      {/* Divider */}
      <div className="fdiv" style={{ marginTop: 16 }}>
        <div className="fdiv-line" />
        <div className="fdiv-lbl">Shop</div>
        <div className="fdiv-line" />
      </div>

      {/* Grid */}
      <div className="shop-grid">
        {SHOP_ITEMS.map(item => (
          <div key={item.id} className="shop-thumb">
            <div className="shop-img">{item.emoji}</div>
            <div className="shop-info">
              <div className="shop-name">{item.name}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--text-muted)',
              }}>{item.price}</div>
            </div>
            <div className="buy-btn">Buy Now</div>
          </div>
        ))}
      </div>
    </>
  );
}