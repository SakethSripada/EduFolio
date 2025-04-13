/**
 * Safely executes Supabase operations to prevent deadlocks when switching tabs
 *
 * This utility wraps Supabase calls in a setTimeout to make them non-blocking,
 * which prevents the "Maximum update depth exceeded" error that can occur
 * when switching browser tabs.
 *
 * @param operation - The Supabase operation to execute
 * @returns A promise that resolves with the result of the operation
 */
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
