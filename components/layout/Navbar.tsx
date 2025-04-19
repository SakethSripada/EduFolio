"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
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
import { LogOut, User, Sparkles } from "lucide-react"
import { useSubscription } from "@/components/subscription/SubscriptionProvider"

export default function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme } = useTheme()
  const { user, signOut, isLoading } = useAuth()
  const { isPremium, remainingCredits } = useSubscription()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.user_metadata?.full_name) return "U"

    const fullName = user.user_metadata.full_name
    const names = fullName.split(" ")
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <header className="bg-background border-b">
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

        <div className="hidden md:flex items-center space-x-6">
          {user && (
            <>
              <Link
                href="/college-application"
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors",
                  pathname === "/college-application" && "text-primary",
                )}
              >
                College Applications
              </Link>
              <Link
                href="/portfolio"
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors",
                  pathname === "/portfolio" && "text-primary",
                )}
              >
                Portfolio
              </Link>
              <Link
                href="/profile"
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors",
                  pathname === "/profile" && "text-primary",
                )}
              >
                Profile
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <ModeToggle />

          {isLoading ? (
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  {isPremium && (
                    <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                      <Sparkles className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/subscription">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isPremium ? 'Premium Plan' : 'Subscription'}
                  </Link>
                </DropdownMenuItem>
                {!isPremium && (
                  <DropdownMenuItem asChild>
                    <Link href="/subscription" className="text-primary font-medium">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
