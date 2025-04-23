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

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
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
  const router = useRouter()
  const pathname = usePathname()
  const client = createClientComponentClient()

  // Function to refresh the session data
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session } } = await client.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
    } catch (error) {
      console.error("Error refreshing session:", error)
    } finally {
      setIsLoading(false)
    }
  }, [client])

  useEffect(() => {
    // Initial session check
    refreshSession()

    // Listen to auth events
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [client, refreshSession])

  // Ensure session is still valid when navigating between routes
  useEffect(() => {
    if (!isLoading && pathname !== '/login' && pathname !== '/signup') {
      refreshSession()
    }
  }, [pathname, refreshSession, isLoading])

  const signUp = (email: string, password: string, fullName: string) =>
    client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

  const signIn = (email: string, password: string) =>
    client.auth.signInWithPassword({ email, password })

  const signInWithGoogle = (): Promise<OAuthResponse> =>
    client.auth.signInWithOAuth({ 
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/college-application`
      }
    })

  const signOut = async () => {
    await client.auth.signOut()
    setUser(null)
    setSession(null)
    router.push("/login")
  }

  const resetPassword = (email: string) =>
    client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
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
