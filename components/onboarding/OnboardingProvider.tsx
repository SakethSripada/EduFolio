"use client"

import { useState, useEffect } from 'react'
import { useUserSettings } from '@/hooks/useUserSettings'
import { useAuth } from '@/components/auth/AuthProvider'
import { WelcomeFlow } from './WelcomeFlow'

interface OnboardingProviderProps {
  children: React.ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  // Start with null to indicate "not yet decided" state
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null)
  const { settings, isLoading, refreshSettings, completeFirstLogin } = useUserSettings()
  const { user, isLoading: isLoadingAuth } = useAuth()
  
  useEffect(() => {
    // Only update the showWelcome state when we have definitive information
    if (!isLoadingAuth && !isLoading && user) {
      // Set showWelcome based on database value
      setShowWelcome(settings.isFirstLogin)
      
      // Debug logging
      if (settings.isFirstLogin) {
        console.log("First login detected, showing welcome flow")
      } else {
        console.log("Not first login, skipping welcome flow")
      }
    }
  }, [user, settings.isFirstLogin, isLoading, isLoadingAuth])

  const handleCompleteOnboarding = async () => {
    try {
      console.log("Completing onboarding flow...")
      
      // Immediately hide the welcome flow to prevent any flashing
      setShowWelcome(false)
      
      // Mark first login as completed in the database
      const success = await completeFirstLogin()
      
      if (success) {
        console.log("Successfully updated first login status in database")
      } else {
        console.error("Failed to update first login status in database")
      }
      
      // Refresh settings to ensure we have the latest values
      await refreshSettings()
    } catch (error) {
      console.error("Failed to complete onboarding:", error)
    }
  }

  return (
    <>
      {children}
      {/* Only render the welcome flow if showWelcome is explicitly true */}
      {showWelcome === true && <WelcomeFlow onComplete={handleCompleteOnboarding} />}
    </>
  )
} 