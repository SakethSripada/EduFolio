import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

export async function performDatabaseOperation<T>(
  operation: () => Promise<T>,
  setIsLoading: (loading: boolean) => void,
  onSuccess?: (data: T) => void,
  onError?: (error: any) => void,
): Promise<T | null> {
  setIsLoading(true)
  try {
    const result = await operation()
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
