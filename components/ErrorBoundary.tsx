"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import { isNetworkError, getFriendlyErrorMessage } from "@/lib/network-utils"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to an error reporting service
    console.error("Uncaught error:", error, errorInfo)
    this.setState({ errorInfo })
  }

  private handleRetry = (): void => {
    // Reset the error boundary state
    this.setState({ hasError: false, error: null, errorInfo: null })
    
    // If it was a network error, we can trigger a refresh to retry
    if (this.state.error && isNetworkError(this.state.error)) {
      window.location.reload()
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      const networkError = this.state.error && isNetworkError(this.state.error)
      const errorMessage = this.state.error 
        ? getFriendlyErrorMessage(this.state.error)
        : "An unexpected error occurred"

      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center space-y-4">
          <div className="flex items-center text-destructive mb-2">
            <AlertCircle className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-semibold">
              {networkError ? "Connection Error" : "Something went wrong"}
            </h2>
          </div>
          
          <p className="text-muted-foreground max-w-md">
            {errorMessage}
          </p>
          
          <Button 
            variant="outline" 
            onClick={this.handleRetry}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {networkError ? "Check connection and retry" : "Retry"}
          </Button>
        </div>
      )
    }

    return this.props.children
  }
} 