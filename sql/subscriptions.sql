-- Create a subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id text NULL,
    stripe_subscription_id text NULL,
    tier text NOT NULL DEFAULT 'free',
    status text NOT NULL DEFAULT 'active',
    ai_credits integer NOT NULL DEFAULT 3,
    ai_credits_used integer NOT NULL DEFAULT 0,
    current_period_start timestamp with time zone NULL,
    current_period_end timestamp with time zone NULL,
    cancel_at_period_end boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create a unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions (user_id);

-- Set up Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own subscription (only certain fields)
CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Service role policies for Stripe webhook handling
CREATE POLICY "Service role can insert subscriptions" ON public.subscriptions
    FOR INSERT TO service_role USING (true);

CREATE POLICY "Service role can update subscriptions" ON public.subscriptions
    FOR UPDATE TO service_role USING (true);

-- Grant permissions for Service role
GRANT ALL ON TABLE public.subscriptions TO service_role;

-- Grant read/update access to authenticated users
GRANT SELECT, UPDATE ON TABLE public.subscriptions TO authenticated;

-- Create function to reset AI credits on schedule (monthly)
CREATE OR REPLACE FUNCTION public.reset_free_ai_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.subscriptions
  SET 
    ai_credits = 3,
    ai_credits_used = 0,
    updated_at = now()
  WHERE 
    tier = 'free' AND
    status = 'active';
END;
$$;

-- Create a comment on the function
COMMENT ON FUNCTION public.reset_free_ai_credits() IS 'Resets the free AI credits for all active free-tier users';

-- Uncomment to create a scheduled job (requires pg_cron extension to be enabled)
-- SELECT cron.schedule(
--   'reset-free-ai-credits',
--   '0 0 1 * *',  -- At midnight on the 1st of every month
--   $$SELECT public.reset_free_ai_credits()$$
-- ); 