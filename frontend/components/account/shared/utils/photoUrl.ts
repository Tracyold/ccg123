import { supabase } from '../../../../lib/supabase'

/**
 * Resolves a photo URL from either a full external URL or a Supabase storage path.
 * Used by MobileDashboard, MobileShopDrawer, and any desktop equivalents.
 *
 * @param url - Full URL or Supabase storage path
 * @param bucket - Supabase storage bucket name (default: 'products')
 * @returns Full public URL or null if no URL provided
 */
export function getPhotoUrl(url: string | null, bucket = 'products'): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  return supabase.storage.from(bucket).getPublicUrl(url).data.publicUrl
}