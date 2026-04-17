// components/account/mobile/ui/3ShopFeed.tsx
// Mobile account wrapper around the shared shop feed.
// The fetching and rendering logic lives in components/shared.

import SharedShopFeed from '../../../shared/ShopFeed';

interface ShopFeed3Props {
  onItemClick?: (item: any) => void;
}

export default function ShopFeed3({ onItemClick }: ShopFeed3Props) {
  return (
    <SharedShopFeed 
      sectionLabel="Shop" 
      savedLabel="Saved Items" 
      onItemClick={onItemClick}
    />
  );
}
