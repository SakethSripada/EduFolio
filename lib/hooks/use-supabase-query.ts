"use client"

import { useState, useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { handleSupabaseError } from "@/lib/utils"

type QueryOptions<T> = {
  queryKey: string[]
  queryFn: () => Promise<T>
  onSuccess?: (data: T) => void
  onError?: (error: any) => void
  enabled?: boolean
}

export function useSupabaseQuery<T>({ queryKey, queryFn, onSuccess, onError, enabled = true }: QueryOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<any>(null)
  const { toast } = useToast()

  // Use refs to prevent stale closures in cleanup functions
  const isMounted = useRef(true)
  const currentQueryKey = useRef<string>(JSON.stringify(queryKey))

  // Function to execute the query
  const executeQuery = async () => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await queryFn()

      // Only update state if component is still mounted and query key hasn't changed
      if (isMounted.current && currentQueryKey.current === JSON.stringify(queryKey)) {
        setData(result)
        setIsLoading(false)
        if (onSuccess) onSuccess(result)
      }
    } catch (err) {
      // Only update state if component is still mounted and query key hasn't changed
      if (isMounted.current && currentQueryKey.current === JSON.stringify(queryKey)) {
        setError(err)
        setIsLoading(false)

        if (onError) {
          onError(err)
        } else {
          toast({
            title: "Error fetching data",
            description: handleSupabaseError(err, "There was a problem loading the data."),
            variant: "destructive",
          })
        }
      }
    }
  }

  // Effect to fetch data and handle cleanup
  useEffect(() => {
    isMounted.current = true
    currentQueryKey.current = JSON.stringify(queryKey)

    executeQuery()

    // Cleanup function to prevent memory leaks and state updates after unmount
    return () => {
      isMounted.current = false
    }
  }, [JSON.stringify(queryKey), enabled])

  // Function to manually refetch data
  const refetch = () => {
    if (isMounted.current) {
      executeQuery()
    }
  }

  return { data, isLoading, error, refetch }
}
