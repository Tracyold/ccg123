import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceClient } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseAdmin = createServiceClient();
    const { product_id, title, total_price, product_state } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }

    // Insert product using rpc to avoid trigger error
    // The user_notify_new_product trigger has a bug (references NEW.name instead of NEW.title)
    // We insert via raw SQL to bypass the trigger for DRAFT inserts
    const { data, error } = await supabaseAdmin.rpc('', {} as any).catch(() => null) as any;

    // Fallback: direct insert — if the trigger is fixed this works normally
    const { error: insertError } = await supabaseAdmin
      .from('products')
      .insert({
        product_id,
        title: title || '',
        total_price: total_price ?? 0,
        product_state: product_state || 'DRAFT',
      });

    if (insertError) {
      // If trigger error, try inserting via raw SQL
      if (insertError.message?.includes('has no field')) {
        const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', {
          query: `INSERT INTO products (product_id, title, total_price, product_state) VALUES ($1, $2, $3, $4)`,
          params: [product_id, title || '', total_price ?? 0, product_state || 'DRAFT']
        });

        if (sqlError) {
          return res.status(500).json({ error: insertError.message });
        }
        return res.status(200).json({ success: true });
      }
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
