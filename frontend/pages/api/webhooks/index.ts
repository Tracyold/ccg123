import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createServiceClient } from '../../../lib/supabase';

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

  const rawBody = await getRawBody(req);

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  // ---------------------------
  // VERIFY STRIPE SIGNATURE
  // ---------------------------
  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature failed:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }
  } else {
    event = JSON.parse(rawBody.toString());
  }

  // ---------------------------
  // LOG: WEBHOOK RECEIVED
  // ---------------------------
  const session = event.data.object as any;

  await supabaseAdmin.from('event_log').insert({
    table_name: 'stripe_webhook',
    event_type: 'received',
    record_id: session?.id || null,
    payload: event,
  });

  // ---------------------------
  // ONLY HANDLE CHECKOUT EVENT
  // ---------------------------
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const stripeSessionId = session.id;

  if (session.payment_status !== 'paid') {
    return res.status(200).json({ received: true });
  }

  const metadata = session.metadata || {};

  const accountUserId = metadata.account_user_id;

  let lineItems: any[] = [];
  let accountSnapshot: any = {};
  let adminSnapshot: any = {};
  let totalAmountDollars = 0;

  try {
    lineItems = JSON.parse(metadata.line_items || '[]');
    accountSnapshot = JSON.parse(metadata.account_snapshot || '{}');
    adminSnapshot = JSON.parse(metadata.admin_snapshot || '{}');

    totalAmountDollars = metadata.total_amount_dollars
      ? parseFloat(metadata.total_amount_dollars)
      : session.amount_total / 100;
  } catch (err) {
    return res.status(400).json({ error: 'Bad metadata' });
  }

  // ---------------------------
  // TRY INSERT INVOICE (IDEMPOTENT GATE)
  // ---------------------------
  const { error } = await supabaseAdmin.from('invoices').insert({
    account_user_id: accountUserId,
    stripe_session_id: stripeSessionId,
    stripe_payment_intent_id: session.payment_intent,
    total_amount: totalAmountDollars,
    line_items: lineItems,
    account_snapshot: accountSnapshot,
    admin_snapshot: adminSnapshot,
    invoice_state: 'PAID',
  });

  // ---------------------------
  // DUPLICATE CASE
  // ---------------------------
  if (error) {
    if (error.code === '23505') {
      await supabaseAdmin.from('event_log').insert({
        table_name: 'invoices',
        event_type: 'duplicate_skipped',
        record_id: stripeSessionId,
        payload: { reason: 'unique_constraint' },
      });

      return res.status(200).json({ received: true, duplicate: true });
    }

    console.error(error);
    return res.status(500).json({ error: 'Insert failed' });
  }

  // ---------------------------
  // SUCCESS CASE
  // ---------------------------
  await supabaseAdmin.from('event_log').insert({
    table_name: 'invoices',
    event_type: 'created',
    record_id: stripeSessionId,
    payload: {
      account_user_id: accountUserId,
      total: totalAmountDollars,
    },
  });

  return res.status(200).json({ received: true });
}