/**
 * Utility functions for handling network-related operations
 */

/**
 * Wrapper function for fetch that handles network errors gracefully
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise with the response or error details
 */
export async function safeFetch(
  url: string,
  options?: RequestInit
): Promise<{ data: any | null; error: string | null }> {
  try {
    // Check if the browser is online before attempting fetch
    if (!navigator.onLine) {
      return {
        data: null,
        error: "No internet connection. Please check your network and try again."
      };
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Handle HTTP errors
      return {
        data: null,
        error: `Request failed with status: ${response.status}`
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    // Handle network errors or JSON parsing errors
    const errorMessage = 
      error instanceof Error 
        ? error.message 
        : "An unknown error occurred";
    
    return {
      data: null,
      error: errorMessage
    };
  }
}

/**
 * Check if an error is related to network connectivity
 * @param error - The error to check
 * @returns boolean indicating if it's a network error
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  // Convert error to string if it's an object
  const errorStr = typeof error === 'string' ? error : error.message || '';
  
  // Common network error patterns
  const networkErrorPatterns = [
    "network",
    "internet",
    "offline",
    "connection",
    "failed to fetch",
    "network request failed",
    "ERR_INTERNET_DISCONNECTED",
    "ERR_CONNECTION_REFUSED"
  ];
  
  return networkErrorPatterns.some(pattern => 
    errorStr.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Creates a user-friendly error message based on the error type
 * @param error - The original error
 * @returns A user-friendly error message
 */
export function getFriendlyErrorMessage(error: any): string {
  if (!error) return "An unknown error occurred";
  
  if (isNetworkError(error)) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return error.message || "An unexpected error occurred. Please try again later.";
} 