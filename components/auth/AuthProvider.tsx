"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const setData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    // Update the auth state change listener to use setTimeout
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      if (event === "SIGNED_IN") {
        // Create or update user profile using setTimeout to prevent deadlocks
        if (session?.user) {
          setTimeout(async () => {
            try {
              // First check if profile exists
              const { data: existingProfile, error: fetchError } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", session.user.id)
                .single()

              if (fetchError && fetchError.code !== "PGRST116") {
                console.error("Error checking profile:", fetchError)
                return
              }

              if (!existingProfile) {
                // Insert new profile
                const { error: insertError } = await supabase.from("profiles").insert({
                  user_id: session.user.id,
                  full_name: session.user.user_metadata.full_name || "",
                  email: session.user.email || "",
                  avatar_url: session.user.user_metadata.avatar_url || null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })

                if (insertError) {
                  console.error("Error creating profile:", insertError)
                }
              } else {
                // Update existing profile
                const { error: updateError } = await supabase
                  .from("profiles")
                  .update({
                    full_name: session.user.user_metadata.full_name || existingProfile.full_name,
                    avatar_url: session.user.user_metadata.avatar_url || existingProfile.avatar_url,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("user_id", session.user.id)

                if (updateError) {
                  console.error("Error updating profile:", updateError)
                }
              }
            } catch (error) {
              console.error("Error managing profile:", error)
            }
          }, 0)
        }
      }
    })

    setData()

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
