import Stripe from 'stripe';

// Server-side Stripe client — only use in API routes
export function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil' as any,
  });
}
