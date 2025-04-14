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

// Debounce function to limit how often a function is called
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Function to determine if content has changed significantly enough to warrant a new version
export function hasSignificantChanges(oldContent: string, newContent: string, threshold = 50): boolean {
  // If content length difference is substantial, consider it significant
  if (Math.abs(oldContent.length - newContent.length) > threshold) {
    return true
  }
  
  // Simple diff - could be replaced with more sophisticated diff algorithm if needed
  let differences = 0
  const minLength = Math.min(oldContent.length, newContent.length)
  
  for (let i = 0; i < minLength; i++) {
    if (oldContent[i] !== newContent[i]) {
      differences++
      if (differences > threshold) return true
    }
  }
  
  return differences > threshold
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
