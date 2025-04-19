"use client"

import { useState } from 'react';
import { useSubscription } from '@/components/subscription/SubscriptionProvider';
import { useAuth } from '@/components/auth/AuthProvider';
import { trackAIUsage } from '@/lib/subscription';

interface UseAIAccessProps {
  onSubscribe?: () => void;
}

export function useAIAccess({ onSubscribe }: UseAIAccessProps = {}) {
  const { user } = useAuth();
  const { hasUnlimitedAccess, remainingCredits, refreshSubscription } = useSubscription();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Check if user has access to AI features
  const checkAccess = async (): Promise<boolean> => {
    if (!user) {
      return false;
    }
    
    // Premium users have unlimited access
    if (hasUnlimitedAccess) {
      return true;
    }
    
    // Free users with remaining credits
    if (remainingCredits > 0) {
      return true;
    }
    
    // No access, show premium modal
    setShowPremiumModal(true);
    return false;
  };
  
  // Track AI feature usage
  const trackUsage = async (): Promise<boolean> => {
    if (!user) {
      return false;
    }
    
    setIsProcessing(true);
    try {
      // If user has unlimited access, don't track usage
      if (hasUnlimitedAccess) {
        return true;
      }
      
      // Track usage for free tier users
      const success = await trackAIUsage(user.id);
      if (success) {
        await refreshSubscription();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error tracking AI usage:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Combined function to check access and track usage
  const useAIFeature = async (): Promise<boolean> => {
    const hasAccess = await checkAccess();
    if (!hasAccess) {
      return false;
    }
    
    return await trackUsage();
  };
  
  // Handle premium modal actions
  const closePremiumModal = () => {
    setShowPremiumModal(false);
  };
  
  const handleUpgrade = () => {
    setShowPremiumModal(false);
    if (onSubscribe) {
      onSubscribe();
    }
  };
  
  return {
    hasAccess: hasUnlimitedAccess || remainingCredits > 0,
    remainingCredits,
    isUnlimited: hasUnlimitedAccess,
    isProcessing,
    showPremiumModal,
    closePremiumModal,
    handleUpgrade,
    checkAccess,
    trackUsage,
    useAIFeature
  };
} 