"use client"

import { useState, useEffect } from 'react'
import { useUserSettings } from '@/hooks/useUserSettings'
import { useAuth } from '@/components/auth/AuthProvider'
import { WelcomeFlow } from './WelcomeFlow'

interface OnboardingProviderProps {
  children: React.ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [showWelcome, setShowWelcome] = useState(false)
  const { settings, isLoading, refreshSettings } = useUserSettings()
  const { user, isLoading: isLoadingAuth } = useAuth()

  useEffect(() => {
    // Only check if the user is logged in and settings are loaded
    if (!isLoadingAuth && !isLoading && user && settings.isFirstLogin) {
      setShowWelcome(true)
    }
  }, [user, isLoading, isLoadingAuth, settings.isFirstLogin])

  const handleCompleteOnboarding = () => {
    setShowWelcome(false)
    refreshSettings() // Refresh settings to reflect changes
  }

  return (
    <>
      {children}
      {showWelcome && <WelcomeFlow onComplete={handleCompleteOnboarding} />}
    </>
  )
} 