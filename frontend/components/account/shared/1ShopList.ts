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
// Uses the shop_active_products public view (same as the shop page) so that
// RLS on the products table does not silently block account-user reads.
// Falls back to a direct products query if the view is unavailable.
export async function fetchAvailableProducts(page: number = 0, pageSize: number = 12): Promise<ShopProduct[]> {
  const from = page * pageSize
  const to   = from + pageSize - 1

  // Primary: use the public view — no RLS issues for authenticated users
  const { data: viewData, error: viewError } = await supabase
    .from('shop_active_products')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (!viewError && viewData) {
    return viewData as ShopProduct[]
  }

  // Fallback: query the products table directly
  console.warn('shop_active_products view unavailable, falling back to products table:', viewError)
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('product_state', ['PUBLISHED', 'ACTIVE'])
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Failed to fetch shop products:', error)
    return []
  }
  return (data ?? []) as ShopProduct[]
}
