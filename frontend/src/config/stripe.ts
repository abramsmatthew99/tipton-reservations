import { loadStripe } from '@stripe/stripe-js';

/**
 * Stripe Configuration
 *
 * Publishable key; safe to expose.
 */

// Your Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SmGoq7q5HQ1ekiCBMsC79HKXERAshzRjxi96WVS6xRhWZBKciAk6wCspqHJxO3udw7OWTFPCfnFxP3rvVoZrqIx00C90IX2Jb';

// Initialize Stripe
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);