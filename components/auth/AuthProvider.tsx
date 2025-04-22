"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type {
  Session,
  User,
  OAuthResponse,
} from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: any }>
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: any }>
  // <-- Return the OAuthResponse that Supabase gives us
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
  const client = createClientComponentClient()

  useEffect(() => {
    // initial session check
    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // listen to auth events
    const { data: listener } =
      client.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
        if (_event === "SIGNED_IN") {
          // upsert profile if you like...
        }
      })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [client])

  const signUp = (email: string, password: string, fullName: string) =>
    client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

  const signIn = (email: string, password: string) =>
    client.auth.signInWithPassword({ email, password })

  // Correctly typed to return the OAuthResponse
  const signInWithGoogle = (): Promise<OAuthResponse> =>
    client.auth.signInWithOAuth({ provider: "google" })

  const signOut = async () => {
    await client.auth.signOut()
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
