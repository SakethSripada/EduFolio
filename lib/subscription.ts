import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";

export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete';

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  ai_credits: number;
  ai_credits_used: number;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export const FREE_AI_CREDITS = 3; // Number of free AI credits for free tier users

// Function to check if user has an active subscription
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
  
  return data as UserSubscription;
}

// Check if user has available AI credits
export async function hasAvailableAICredits(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return false;
  }
  
  // Premium users with active subscription have unlimited access
  if (subscription.tier === 'premium' && subscription.status === 'active') {
    return true;
  }
  
  // For free tier, check if they have remaining credits
  return subscription.ai_credits > subscription.ai_credits_used;
}

// Track AI usage
export async function trackAIUsage(userId: string): Promise<boolean> {
  const supabase = createClientComponentClient();
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return false;
  }
  
  // Don't increment usage for premium users
  if (subscription.tier === 'premium' && subscription.status === 'active') {
    return true;
  }
  
  // For free tier, increment the usage counter
  const { error } = await supabase
    .from('subscriptions')
    .update({
      ai_credits_used: subscription.ai_credits_used + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', subscription.id);
  
  if (error) {
    console.error('Error tracking AI usage:', error);
    return false;
  }
  
  return true;
}

// Create initial subscription record for new users
export async function createInitialSubscription(userId: string): Promise<boolean> {
  const supabase = createClientComponentClient();
  
  // Check if subscription already exists
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .single();
  
  if (existingSubscription) {
    return true; // Already exists
  }
  
  // Create new subscription record
  const { error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      tier: 'free',
      status: 'active',
      ai_credits: FREE_AI_CREDITS,
      ai_credits_used: 0,
      cancel_at_period_end: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error creating initial subscription:', error);
    return false;
  }
  
  return true;
}

// Reset free credits (e.g., monthly reset)
export async function resetFreeCredits(userId: string): Promise<boolean> {
  const supabase = createClientComponentClient();
  const subscription = await getUserSubscription(userId);
  
  if (!subscription || subscription.tier !== 'free') {
    return false;
  }
  
  const { error } = await supabase
    .from('subscriptions')
    .update({
      ai_credits: FREE_AI_CREDITS,
      ai_credits_used: 0,
      updated_at: new Date().toISOString()
    })
    .eq('id', subscription.id);
  
  if (error) {
    console.error('Error resetting free credits:', error);
    return false;
  }
  
  return true;
} 