import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createServiceClient } from '../../../lib/supabase';

// Disable Next.js body parsing — Stripe needs the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil' as any,
  });
  const supabaseAdmin = createServiceClient();

  // Read raw body for signature verification
  const rawBody = await getRawBody(req);

  // Verify Stripe webhook signature
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }
  } else {
    // In development/preview without webhook secret, parse the body directly
    try {
      event = JSON.parse(rawBody.toString()) as Stripe.Event;
      console.warn('WARNING: Processing webhook without signature verification (no STRIPE_WEBHOOK_SECRET set)');
    } catch (err) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only process successful payments
    if (session.payment_status !== 'paid') {
      console.log('Payment not completed, skipping invoice creation');
      return res.status(200).json({ received: true });
    }

    const metadata = session.metadata || {};

    const accountUserId = metadata.account_user_id;
    const stripeSessionId = session.id;
    const stripePaymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || null;

    // Parse frozen snapshots from metadata
    let lineItems: any[] = [];
    let accountSnapshot: any = {};
    let adminSnapshot: any = {};
    let totalAmountDollars: number = 0;

    try {
      lineItems = JSON.parse(metadata.line_items || '[]');
      accountSnapshot = JSON.parse(metadata.account_snapshot || '{}');
      adminSnapshot = JSON.parse(metadata.admin_snapshot || '{}');
      // Total from metadata (dollars) — or convert from Stripe cents
      totalAmountDollars = metadata.total_amount_dollars
        ? parseFloat(metadata.total_amount_dollars)
        : (session.amount_total ? session.amount_total / 100 : 0);
    } catch (parseErr) {
      console.error('Failed to parse metadata:', parseErr);
      return res.status(400).json({ error: 'Invalid metadata format' });
    }

    if (!accountUserId || !stripeSessionId) {
      console.error('Missing required fields: account_user_id or stripe_session_id');
      return res.status(400).json({ error: 'Missing required metadata' });
    }

    // Insert invoice using service role (bypasses RLS)
    // Idempotency: stripe_session_id is UNIQUE — conflict = already processed
    const { error: insertError } = await supabaseAdmin
      .from('invoices')
      .insert({
        account_user_id: accountUserId,
        stripe_session_id: stripeSessionId,
        stripe_payment_intent_id: stripePaymentIntentId,
        total_amount: totalAmountDollars,
        line_items: lineItems,
        account_snapshot: accountSnapshot,
        admin_snapshot: adminSnapshot,
        invoice_state: 'PAID',
      });

    if (insertError) {
      // Check for unique constraint violation (idempotency)
      if (insertError.code === '23505') {
        console.log('Invoice already exists for session:', stripeSessionId);
        return res.status(200).json({ received: true, note: 'already_processed' });
      }
      console.error('Invoice insert error:', insertError);
      return res.status(500).json({ error: 'Failed to create invoice' });
    }

    console.log('Invoice created for session:', stripeSessionId);
    // DB triggers handle:
    // - trigger_mark_products_sold → marks product INACTIVE
    // - user_notify_invoice → sends user notification
  }

  return res.status(200).json({ received: true });
}
