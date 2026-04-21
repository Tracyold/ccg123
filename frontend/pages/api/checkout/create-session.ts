import type { NextApiRequest, NextApiResponse } from 'next';
import { getStripe } from '../../../lib/stripe';
import { createServiceClient } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = getStripe();
    const supabaseAdmin = createServiceClient();

    const {
      product_id,
      guest,
      guest_info,
      account_user_id,
      admin_snapshot,
      account_snapshot,
      line_items: clientLineItems,
    } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }

    // Fetch product from DB to get authoritative price
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('product_id', product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Build line_items snapshot
    const frozenLineItems = [{
      product_id: product.product_id,
      title: product.title,
      gem_type: product.gem_type,
      shape: product.shape,
      weight: product.weight,
      color: product.color,
      origin: product.origin,
      treatment: product.treatment,
      description: product.description,
      price_per_carat: product.price_per_carat,
      total_price: product.total_price,
      gia_report_number: product.gia_report_number,
      gia_report_pdf_url: product.gia_report_pdf_url,
      photo_url: product.photo_url,
    }];

    // Determine buyer info for Stripe pre-fill
    const customerName = guest ? guest_info?.name : account_snapshot?.name;
    const customerEmail = guest ? guest_info?.email : account_snapshot?.email;
    const customerPhone = guest ? guest_info?.phone : account_snapshot?.phone;

    // Build account_snapshot for guest or authenticated user
    const finalAccountSnapshot = guest
      ? {
          name: guest_info?.name || '',
          email: guest_info?.email || '',
          phone: guest_info?.phone || '',
          shippingAddress: guest_info?.address || guest_info?.shippingAddress || '',
          businessName: null,
        }
      : account_snapshot || {};

    // The user ID for invoice: guest uses GUEST_ACCOUNT_USER_ID env var
    const invoiceUserId = guest
      ? process.env.NEXT_PUBLIC_GUEST_ACCOUNT_USER_ID
      : account_user_id;

    // DB price is in dollars — Stripe needs cents
    const unitAmountCents = Math.floor(
      Math.round(Number(product.total_price) * 100)
    );
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: unitAmountCents,
            product_data: {
              name: product.title,
              description: [
                product.gem_type,
                product.shape,
                product.weight ? `${product.weight} ct` : null,
                product.color,
              ].filter(Boolean).join(' \u00B7 '),
            },
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail || undefined,
      metadata: {
        product_id: product.product_id,
        account_user_id: invoiceUserId || '',
        is_guest: guest ? 'true' : 'false',
        line_items: JSON.stringify(frozenLineItems),
        account_snapshot: JSON.stringify(finalAccountSnapshot),
        admin_snapshot: JSON.stringify(admin_snapshot || {}),
        total_amount_dollars: String(product.total_price),
      },
      success_url: `${req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'https://gems-build.preview.emergentagent.com'}/shop?success=true`,
      cancel_url: `${req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'https://gems-build.preview.emergentagent.com'}/shop?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
