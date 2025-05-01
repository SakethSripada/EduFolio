"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/components/auth/AuthProvider'
import type { Database } from '@/types/supabase'
import { toast } from '@/components/ui/use-toast'

export interface EnabledTools {
  collegeApp: boolean
  portfolio: boolean
  resume: boolean
}

export interface UserSettings {
  enabledTools: EnabledTools
  isFirstLogin: boolean
}

export const defaultSettings: UserSettings = {
  enabledTools: {
    collegeApp: true,
    portfolio: true,
    resume: true
  },
  isFirstLogin: true
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClientComponentClient<Database>()
  
  const fetchSettings = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      console.log(`Fetching settings for user ${user.id}...`)
      
      // Get settings from the database
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Database error when fetching settings:', error)
        throw error
      }

      if (data && data.settings) {
        console.log('Raw settings from DB:', data.settings)
        
        // Ensure we have all required properties by merging with defaults
        // but prioritize the stored values for top-level properties
        const mergedSettings: UserSettings = {
          ...defaultSettings,
          ...data.settings,
          // Explicitly handle nested objects to ensure proper merging
          enabledTools: {
            ...defaultSettings.enabledTools,
            ...(data.settings.enabledTools || {})
          }
        }
        
        console.log('Merged settings:', mergedSettings)
        setSettings(mergedSettings)
      } else {
        console.log('No settings found, creating defaults for user:', user.id)
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            settings: defaultSettings
          })

        if (insertError) {
          console.error('Error inserting default settings:', insertError)
          throw insertError
        }
        
        console.log('Default settings created successfully')
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
      // Fallback to default settings on error
      setSettings(defaultSettings)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user])

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    if (!user) return false

    try {
      console.log('Updating settings with:', newSettings)
      
      // Deep merge with existing settings to ensure nested objects are preserved
      const updatedSettings: UserSettings = {
        ...settings,
        ...newSettings,
        // Special handling for enabledTools to ensure proper merging
        enabledTools: newSettings.enabledTools 
          ? { 
              ...settings.enabledTools, 
              ...newSettings.enabledTools 
            }
          : settings.enabledTools
      }
      
      console.log('Merged settings to save:', updatedSettings)

      // Update in database
      const { error } = await supabase
        .from('user_settings')
        .update({
          settings: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Database error when updating settings:', error)
        throw error
      }

      console.log('Settings successfully saved to database')
      
      // Update local state immediately
      setSettings(updatedSettings)
      return true
    } catch (error) {
      console.error('Error updating user settings:', error)
      toast({
        title: "Settings Error",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }, [supabase, user, settings])

  // Update a specific tool's visibility
  const updateToolVisibility = useCallback(async (toolName: keyof EnabledTools, isEnabled: boolean) => {
    if (!user) return false

    try {
      console.log(`Updating tool visibility: ${toolName} => ${isEnabled}`)
      
      // Create a new object to avoid mutating the existing one
      const updatedTools = {
        ...settings.enabledTools,
        [toolName]: isEnabled
      }

      return await updateSettings({
        enabledTools: updatedTools
      })
    } catch (error) {
      console.error('Error updating tool visibility:', error)
      return false
    }
  }, [user, settings, updateSettings])

  // Mark first login as completed
  const completeFirstLogin = useCallback(async () => {
    if (!user) return false
    
    try {
      console.log('Marking first login as completed')
      const success = await updateSettings({ isFirstLogin: false })
      return success
    } catch (error) {
      console.error('Error marking first login as complete:', error)
      return false
    }
  }, [updateSettings, user])

  // Load settings on mount and when user changes
  useEffect(() => {
    if (user) {
      console.log('User authenticated, loading settings')
      fetchSettings()
    } else {
      console.log('No user, resetting to default settings')
      setSettings(defaultSettings)
      setIsLoading(false)
    }
  }, [fetchSettings, user])

  return {
    settings,
    isLoading,
    updateSettings,
    updateToolVisibility,
    completeFirstLogin,
    refreshSettings: fetchSettings
  }
} 