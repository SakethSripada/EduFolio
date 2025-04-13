"use client"

import ProtectedRoute from "@/components/auth/ProtectedRoute"
import PortfolioContent from "@/components/portfolio/PortfolioContent"

export default function PortfolioPage() {
  return (
    <ProtectedRoute>
      <PortfolioContent />
    </ProtectedRoute>
  )
}
