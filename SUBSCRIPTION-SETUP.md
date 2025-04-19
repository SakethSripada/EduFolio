# EduFolio Premium Subscription Setup

This document provides instructions for setting up the premium subscription system for EduFolio.

## Overview

EduFolio uses a freemium model where all features are free except AI usage. The subscription system is implemented with:

- Stripe for payment processing
- Supabase for user and subscription management
- Free tier with limited AI credits
- Premium tier with unlimited AI access

## Database Setup

1. Run the SQL script in `sql/subscriptions.sql` to create the subscriptions table in your Supabase database:

```bash
# Execute the SQL script through Supabase dashboard or CLI
```

2. The script creates:
   - `subscriptions` table to track user subscription status
   - Row-level security policies
   - Functions for subscription management

## Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Stripe API Keys
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Premium Plan Price ID (from Stripe dashboard)
NEXT_PUBLIC_PREMIUM_PRICE_ID=price_your_premium_plan_id
```

## Stripe Configuration

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create a subscription product with the following configuration:
   - Name: "EduFolio Premium"
   - Price: $9.99/month
   - Billing period: Monthly
   - Set up tax rates if applicable

3. Set up a webhook in the Stripe dashboard with the following events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

4. Point the webhook URL to your application's webhook endpoint:
   ```
   https://your-domain.com/api/stripe/webhook
   ```

5. Get your webhook secret from the Stripe dashboard and add it to your environment variables.

## Implementation Notes

The subscription system consists of several components:

1. **Subscription Data Model**:
   - `lib/subscription.ts` - Core subscription utilities
   - `sql/subscriptions.sql` - Database schema

2. **React Components**:
   - `components/subscription/SubscriptionProvider.tsx` - Context provider for subscription state
   - `components/subscription/PremiumModal.tsx` - Modal for subscription upsell
   - `components/subscription/AIFeatureGate.tsx` - Component that gates AI features

3. **API Routes**:
   - `app/api/stripe/create-checkout/route.ts` - Creates Stripe checkout sessions
   - `app/api/stripe/webhook/route.ts` - Handles Stripe webhook events
   - `app/api/ai/route.ts` - Checks subscription status before processing AI requests

4. **Pages**:
   - `app/subscription/page.tsx` - Subscription management page

## Testing the Integration

1. Use Stripe's test cards to test the subscription flow:
   - Test successful payment: `4242 4242 4242 4242`
   - Test failed payment: `4000 0000 0000 9995`

2. Test the subscription management features:
   - Creating a new subscription
   - Viewing subscription details
   - Cancelling a subscription

3. Test the AI access with different subscription tiers:
   - Free tier with limited credits
   - Premium tier with unlimited access

## Deployment

When deploying to production:

1. Update your environment variables with production Stripe API keys
2. Update the webhook endpoint URL in the Stripe dashboard
3. Test the end-to-end flow in the production environment

## Troubleshooting

- Check Stripe dashboard for payment and webhook events
- Verify Supabase database for subscription records
- Check application logs for errors related to Stripe API calls

For any questions or issues, please contact the development team. 