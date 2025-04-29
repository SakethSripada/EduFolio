"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if user came from signup page with pending verification
    if (searchParams?.get('verified') === 'pending') {
      toast({
        title: "Verification Required",
        description: "Please check your email and verify your account before logging in.",
        duration: 6000,
      })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await signIn(email, password)
    setIsLoading(false)

    if (error) {
      if (error.code === "email_not_confirmed") {
        toast({
          title: "Email not verified",
          description: "Please check your email and click the verification link we sent you. Need a new link?",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                try {
                  setIsLoading(true)
                  const supabase = createClientComponentClient()
                  const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email,
                  })
                  if (error) throw error
                  toast({
                    title: "Verification email sent",
                    description: "We've sent a new verification email to your inbox.",
                  })
                } catch (err) {
                  toast({
                    title: "Error",
                    description: "Could not resend verification email. Please try again later.",
                    variant: "destructive",
                  })
                } finally {
                  setIsLoading(false)
                }
              }}
            >
              Resend
            </Button>
          ),
        })
      } else {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        })
      }
    } else {
      router.push("/college-application")
    }
  }

  return (
    <div className="container max-w-md py-8 md:py-24 px-4 sm:px-0">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* remember */}
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal">
                Remember me
              </Label>
            </div>

            {/* submit */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* or continue with */}
          <div className="mt-4 flex items-center justify-center">
            <Separator className="flex-grow" />
            <span className="mx-2 text-xs text-muted-foreground">
              OR CONTINUE WITH
            </span>
            <Separator className="flex-grow" />
          </div>

          {/* Google only */}
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signInWithGoogle()}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                {/* Google "G" SVG paths */}
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26
                    1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92
                    3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23
                    1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99
                    20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43
                    8.55 1 10.22 1 12s.43 3.45 1.18
                    4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21
                    1.64l3.15-3.15C17.45 2.09 14.97
                    1 12 1 7.7 1 3.99 3.47 2.18
                    7.07l3.66 2.84c.87-2.6 3.3-4.53
                    6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-md py-8 md:py-24 px-4 sm:px-0">
        <Card className="w-full p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
