"use client"

import { useState, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { handleSupabaseError } from "@/lib/utils"

type MutationOptions<TVariables, TData> = {
  mutationFn: (variables: TVariables) => Promise<TData>
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: any, variables: TVariables) => void
  onSettled?: (data: TData | null, error: any | null, variables: TVariables) => void
}

export function useSupabaseMutation<TVariables, TData>({
  mutationFn,
  onSuccess,
  onError,
  onSettled,
}: MutationOptions<TVariables, TData>) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>(null)
  const [data, setData] = useState<TData | null>(null)
  const { toast } = useToast()

  // Use ref to prevent stale closures
  const isMounted = useRef(true)

  const mutate = async (variables: TVariables) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await mutationFn(variables)

      if (isMounted.current) {
        setData(result)
        setIsLoading(false)

        if (onSuccess) onSuccess(result, variables)
        if (onSettled) onSettled(result, null, variables)
      }

      return result
    } catch (err) {
      if (isMounted.current) {
        setError(err)
        setIsLoading(false)

        if (onError) {
          onError(err, variables)
        } else {
          toast({
            title: "Error",
            description: handleSupabaseError(err, "There was a problem with the operation."),
            variant: "destructive",
          })
        }

        if (onSettled) onSettled(null, err, variables)
      }

      throw err
    }
  }

  // Cleanup function to be called in useEffect
  const cleanup = () => {
    isMounted.current = false
  }

  return { mutate, isLoading, error, data, cleanup }
}
