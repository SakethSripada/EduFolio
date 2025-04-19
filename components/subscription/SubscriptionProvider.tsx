"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import {
  UserSubscription,
  getUserSubscription,
  createInitialSubscription,
  SubscriptionTier,
  FREE_AI_CREDITS
} from '@/lib/subscription';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  isLoading: boolean;
  remainingCredits: number;
  hasUnlimitedAccess: boolean;
  isPremium: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate remaining credits
  const remainingCredits = subscription 
    ? subscription.ai_credits - subscription.ai_credits_used 
    : 0;
    
  // Premium users with active subscription have unlimited access
  const hasUnlimitedAccess = subscription?.tier === 'premium' && subscription?.status === 'active';
  
  // Check if user is on premium plan
  const isPremium = subscription?.tier === 'premium';

  // Fetch subscription data
  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const subscriptionData = await getUserSubscription(user.id);
      
      if (!subscriptionData) {
        // Create initial subscription for new users
        await createInitialSubscription(user.id);
        // Fetch again to get the newly created subscription
        const newSubscription = await getUserSubscription(user.id);
        setSubscription(newSubscription);
      } else {
        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh subscription data
  const refreshSubscription = async () => {
    if (!user) return;
    
    setIsLoading(true);
    await fetchSubscription();
  };

  // Initialize subscription data when user is available
  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const value = {
    subscription,
    isLoading,
    remainingCredits,
    hasUnlimitedAccess,
    isPremium,
    refreshSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 