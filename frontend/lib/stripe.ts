// lib/stripe.ts
import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-04-30.basil' as any,
    });
  }

  return stripe;
}