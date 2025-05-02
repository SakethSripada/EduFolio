"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/components/auth/AuthProvider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, Menu, X } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme } = useTheme()
  const { user, signOut, isLoading, refreshSession } = useAuth()
  const [userProfile, setUserProfile] = useState<any>(null)
  const supabase = createClientComponentClient()

  // Refresh session when the component mounts to ensure auth state is current
  useEffect(() => {
    if (!isLoading) {
      refreshSession()
    }
  }, [refreshSession, isLoading])

  // Fetch user profile from database to get the most up-to-date name
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", user.id)
          .single()
          
        if (!error && data) {
          setUserProfile(data)
        }
      }
      
      fetchProfile()
    }
  }, [user, supabase, pathname])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    // First try to get the name from the database profile (most up-to-date)
    if (userProfile?.full_name) {
      const fullName = userProfile.full_name
      const names = fullName.split(" ")
      if (names.length === 1) return names[0].charAt(0).toUpperCase()
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
    }
    
    // Fall back to user metadata if no profile was found
    if (!user || !user.user_metadata?.full_name) return "U"

    const fullName = user.user_metadata.full_name
    const names = fullName.split(" ")
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  // Handle navigation with refresh if needed
  const handleNavigation = (path: string) => {
    closeMenu()
    if (pathname === path) {
      // If we're already on this page, consider a refresh
      refreshSession()
    }
    router.push(path)
  }

  return (
    <header className="bg-background border-b sticky top-0 z-40">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/EduFolioLogo.png"
            alt="EduFolio Logo"
            width={52}
            height={52}
            className="rounded-sm mr-0"
          />
          <span className="text-2xl font-bold">EduFolio</span>
        </Link>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop navigation */}
        <div suppressHydrationWarning className="hidden md:flex items-center space-x-6">
          {user && (
            <>
              <Button
                variant="ghost"
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors",
                  pathname === "/college-application" && "text-primary font-medium",
                )}
                onClick={() => handleNavigation("/college-application")}
              >
                College Applications
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors",
                  pathname === "/portfolio" && "text-primary font-medium",
                )}
                onClick={() => handleNavigation("/portfolio")}
              >
                Portfolio
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors",
                  pathname === "/resume" && "text-primary font-medium",
                )}
                onClick={() => handleNavigation("/resume")}
              >
                Resume
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors",
                  pathname === "/planner" && "text-primary font-medium",
                )}
                onClick={() => handleNavigation("/planner")}
              >
                Planner
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors",
                  pathname === "/profile" && "text-primary font-medium",
                )}
                onClick={() => handleNavigation("/profile")}
              >
                Profile
              </Button>
            </>
          )}
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b shadow-lg p-4 md:hidden z-50">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start mb-2"
                  onClick={() => handleNavigation("/college-application")}
                >
                  College Applications
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start mb-2"
                  onClick={() => handleNavigation("/portfolio")}
                >
                  Portfolio
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start mb-2"
                  onClick={() => handleNavigation("/resume")}
                >
                  Resume
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start mb-2"
                  onClick={() => handleNavigation("/planner")}
                >
                  Planner
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start mb-2"
                  onClick={() => handleNavigation("/profile")}
                >
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500"
                  onClick={signOut}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => handleNavigation("/login")}
              >
                Log In
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center space-x-4" suppressHydrationWarning>
          <ModeToggle />

          {isLoading ? (
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" suppressHydrationWarning></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback suppressHydrationWarning>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigation("/profile")} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => handleNavigation("/login")} variant="outline">
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
