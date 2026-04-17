import { supabase } from '../../../lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────
export interface ShopProduct {
  product_id:    string
  title:         string
  total_price:   number | null
  photo_url:     string | null
  product_state: string | null
  created_at:    string
}

// ── Pure helpers ───────────────────────────────────────────────────────────
export function formatPrice(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'Price on request'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

// ── Data fetching ──────────────────────────────────────────────────────────
export async function fetchAvailableProducts(): Promise<ShopProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('product_id, title, total_price, photo_url, product_state, created_at')
    .eq('product_state', 'available')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch shop products:', error)
    return []
  }
  return (data ?? []) as ShopProduct[]
}
