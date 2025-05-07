"use client"

import React, { useEffect, useState } from "react"
import { AlertCircle, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine)
    
    // Event listeners for online/offline status changes
    const handleOnline = () => {
      setIsOnline(true)
      // Keep the "back online" message visible for 3 seconds
      setVisible(true)
      setTimeout(() => setVisible(false), 3000)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setVisible(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!visible) return null

  return (
    <div 
      className={cn(
        "w-full py-2 px-4 flex items-center justify-center text-sm font-medium transition-colors",
        isOnline 
          ? "bg-green-500/10 text-green-500 border-b border-green-500/20" 
          : "bg-destructive/10 text-destructive border-b border-destructive/20"
      )}
    >
      {isOnline ? (
        <>
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>Connection restored</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 mr-2" />
          <span>No internet connection. Some features may be unavailable.</span>
        </>
      )}
    </div>
  )
} 