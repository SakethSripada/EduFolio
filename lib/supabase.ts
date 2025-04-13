import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper function for error handling
export const handleSupabaseError = (error: any, fallbackMessage = "An unexpected error occurred") => {
  console.error("Supabase error:", error)

  if (error?.message) {
    return error.message
  }

  if (error?.error_description) {
    return error.error_description
  }

  return fallbackMessage
}

// Add a new function to handle database operations with proper loading state management

// Add the safeSupabaseCall utility to the exports
export function safeSupabaseCall<T>(operation: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const result = await operation()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }, 0)
  })
}

// Update the performDatabaseOperation function to use safeSupabaseCall
export async function performDatabaseOperation<T>(
  operation: () => Promise<T>,
  setIsLoading: (loading: boolean) => void,
  onSuccess?: (data: T) => void,
  onError?: (error: any) => void,
): Promise<T | null> {
  setIsLoading(true)
  try {
    const result = await safeSupabaseCall(operation)
    if (onSuccess) onSuccess(result)
    return result
  } catch (error) {
    console.error("Database operation error:", error)
    if (onError) onError(error)
    return null
  } finally {
    // Ensure loading state is always reset, even if there's an error
    setIsLoading(false)
  }
}
