"use client"

import type React from "react"

import { useAuth } from "@/components/auth/AuthProvider"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    // When auth state has finished loading, mark that we've checked auth
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      }
      setHasCheckedAuth(true)
    }
  }, [user, isLoading, router, pathname])

  // Show loading only on initial auth check, not on every route change
  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Don't render children until we've confirmed authentication
  if (!user) {
    return null
  }

  return <>{children}</>
}
