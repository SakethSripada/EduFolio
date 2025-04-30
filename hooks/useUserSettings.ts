"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/components/auth/AuthProvider'
import type { Database } from '@/types/supabase'

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
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setSettings(data.settings as UserSettings)
      } else {
        // Create default settings if none exist
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            settings: defaultSettings
          })

        if (insertError) throw insertError
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user])

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    if (!user) return false

    try {
      // Merge with existing settings
      const updatedSettings = {
        ...settings,
        ...newSettings
      }

      // Update in database
      const { error } = await supabase
        .from('user_settings')
        .update({
          settings: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      setSettings(updatedSettings)
      return true
    } catch (error) {
      console.error('Error updating user settings:', error)
      return false
    }
  }, [supabase, user, settings])

  // Update a specific tool's visibility
  const updateToolVisibility = useCallback(async (toolName: keyof EnabledTools, isEnabled: boolean) => {
    if (!user) return false

    try {
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
    return await updateSettings({ isFirstLogin: false })
  }, [updateSettings])

  // Load settings on mount and when user changes
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return {
    settings,
    isLoading,
    updateSettings,
    updateToolVisibility,
    completeFirstLogin,
    refreshSettings: fetchSettings
  }
} 