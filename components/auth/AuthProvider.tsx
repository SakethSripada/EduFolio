"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type {
  Session,
  User,
  OAuthResponse,
} from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import { isNetworkError, getFriendlyErrorMessage } from "@/lib/network-utils"
import { useToast } from "@/components/ui/use-toast"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  networkError: boolean
  refreshSession: () => Promise<void>
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: any }>
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<OAuthResponse>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [networkError, setNetworkError] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const client = createClientComponentClient()
  const { toast } = useToast()

  // Function to refresh the session data
  const refreshSession = useCallback(async () => {
    try {
      // Skip the refresh if we're offline
      if (typeof window !== 'undefined' && !navigator.onLine) {
        setNetworkError(true)
        setIsLoading(false)
        return
      }

      setNetworkError(false)
      const { data: { session } } = await client.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
    } catch (error) {
      console.error("Error refreshing session:", error)
      
      if (isNetworkError(error)) {
        setNetworkError(true)
        // Don't show toast for network errors as NetworkStatus component will handle this
      } else {
        toast({
          title: "Error refreshing session",
          description: getFriendlyErrorMessage(error),
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [client, toast])

  useEffect(() => {
    // Initial session check
    refreshSession()

    // Listen to auth events
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Add online/offline event listeners
    const handleOnline = () => {
      setNetworkError(false)
      refreshSession() // Refresh session when coming back online
    }
    
    const handleOffline = () => {
      setNetworkError(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      listener.subscription.unsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [client, refreshSession])

  // Ensure session is still valid when navigating between routes
  useEffect(() => {
    if (!isLoading && pathname !== '/login' && pathname !== '/signup') {
      refreshSession()
    }
  }, [pathname, refreshSession, isLoading])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      if (!navigator.onLine) {
        return { error: "No internet connection. Please check your network and try again." }
      }
      
      return await client.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
    } catch (error) {
      console.error("Sign up error:", error)
      return { error: getFriendlyErrorMessage(error) }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      if (!navigator.onLine) {
        return { error: "No internet connection. Please check your network and try again." }
      }
      
      return await client.auth.signInWithPassword({ email, password })
    } catch (error) {
      console.error("Sign in error:", error)
      return { error: getFriendlyErrorMessage(error) }
    }
  }

  const signInWithGoogle = (): Promise<OAuthResponse> =>
    client.auth.signInWithOAuth({ 
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/college-application`
      }
    })

  const signOut = async () => {
    try {
      await client.auth.signOut()
      setUser(null)
      setSession(null)
      router.push("/login")
    } catch (error) {
      console.error("Sign out error:", error)
      
      if (!isNetworkError(error)) {
        toast({
          title: "Error signing out",
          description: getFriendlyErrorMessage(error),
          variant: "destructive",
        })
      }
      
      // Force sign out locally even if the API call fails
      setUser(null)
      setSession(null)
      router.push("/login")
    }
  }

  const resetPassword = async (email: string) => {
    try {
      if (!navigator.onLine) {
        return { error: "No internet connection. Please check your network and try again." }
      }
      
      return await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
    } catch (error) {
      console.error("Reset password error:", error)
      return { error: getFriendlyErrorMessage(error) }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        networkError,
        refreshSession,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
