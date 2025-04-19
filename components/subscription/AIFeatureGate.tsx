"use client"

import { ReactNode } from 'react';
import { useAIAccess } from '@/hooks/use-ai-access';
import { PremiumModal } from './PremiumModal';
import { useRouter } from 'next/navigation';

interface AIFeatureGateProps {
  children: ReactNode | ((props: { startAIFeature: () => Promise<boolean>; isProcessing: boolean }) => ReactNode);
}

export function AIFeatureGate({ children }: AIFeatureGateProps) {
  const router = useRouter();
  const { 
    useAIFeature, 
    isProcessing, 
    showPremiumModal, 
    closePremiumModal, 
    handleUpgrade 
  } = useAIAccess({
    onSubscribe: () => router.push('/subscription')
  });

  // Function to start AI feature with access check
  const startAIFeature = async (): Promise<boolean> => {
    return await useAIFeature();
  };

  return (
    <>
      {typeof children === 'function' 
        ? children({ startAIFeature, isProcessing }) 
        : children}
        
      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={closePremiumModal} 
        onUpgrade={handleUpgrade} 
      />
    </>
  );
} 