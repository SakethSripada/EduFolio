"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, User, Mail, Key, Shield, LogOut, Camera, Trash2, GraduationCap } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { toast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

// Utility function to handle Supabase errors
const handleSupabaseError = (error: any, defaultMessage: string): string => {
  console.error("Supabase error:", error)
  return error?.message || error?.error_description || defaultMessage
}

// Utility function to perform database operations with loading and error handling
const performDatabaseOperation = async <T,>(
  operation: () => Promise<T>,
  setIsLoading: (isLoading: boolean) => void,
  onSuccess: (data: T) => void,
  onError: (error: any) => void
): Promise<void> => {
  setIsLoading(true)
  try {
    const data = await operation()
    onSuccess(data)
  } catch (error) {
    onError(error)
  } finally {
    setIsLoading(false)
  }
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClientComponentClient<Database>()

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    bio: "",
    avatarUrl: "",
    gradYear: "",
    school: "",
    interests: "",
    privacySettings: {
      publicProfile: false,
      showEmail: false,
    },
  })

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  // Add state for confirmation dialog
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState<boolean>(false)
  const [confirmSignOut, setConfirmSignOut] = useState<boolean>(false)

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      setIsLoading(true)

      setTimeout(async () => {
        try {
          const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()

          if (error) throw error

          if (data) {
            setProfile({
              fullName: data.full_name || user.user_metadata?.full_name || "",
              email: data.email || user.email || "",
              bio: data.bio || "",
              avatarUrl: data.avatar_url || user.user_metadata?.avatar_url || "",
              gradYear: data.grad_year || "",
              school: data.school || "",
              interests: data.interests || "",
              privacySettings: data.privacy_settings || {
                publicProfile: false,
                showEmail: false,
              },
            })
          } else {
            // If no profile exists, use auth metadata
            setProfile({
              fullName: user.user_metadata?.full_name || "",
              email: user.email || "",
              bio: "",
              avatarUrl: user.user_metadata?.avatar_url || "",
              gradYear: "",
              school: "",
              interests: "",
              privacySettings: {
                publicProfile: false,
                showEmail: false,
              },
            })

            // Create a profile asynchronously
            await supabase.from("profiles").insert({
              user_id: user.id,
              full_name: user.user_metadata?.full_name || "",
              email: user.email || "",
              avatar_url: user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              grad_year: "",
              school: "",
              interests: "",
              privacy_settings: { publicProfile: false, showEmail: false },
              updated_at: new Date().toISOString(),
            })
          }
        } catch (error) {
          console.error("Error loading profile:", error)
          toast({
            title: "Error loading profile",
            description: "There was a problem loading your profile data.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }, 0)
    }

    fetchProfile()
  }, [user])

  const updateProfile = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: profile.fullName },
      })

      if (authError) throw authError
      
      // Force refresh auth session to update UI elements that use user metadata
      await supabase.auth.refreshSession();

      // Update profile in database
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.fullName,
          bio: profile.bio,
          grad_year: profile.gradYear,
          school: profile.school,
          interests: profile.interests,
          privacy_settings: profile.privacySettings,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (profileError) throw profileError

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error updating profile",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updatePassword = async () => {
    if (!user) return

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      })
      return
    }

    if (passwords.new.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      })

      if (error) throw error

      setPasswords({
        current: "",
        new: "",
        confirm: "",
      })

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error updating password",
        description: "There was a problem updating your password.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    setIsLoading(true)

    try {
      // Delete user data from database
      const { error: deleteError } = await supabase.from("profiles").delete().eq("user_id", user.id)

      if (deleteError) throw deleteError

      // In a production app, you would use a server-side function to delete the auth user
      // For now, we'll just sign out
      await signOut()

      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error deleting account",
        description: "There was a problem deleting your account.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setConfirmDeleteAccount(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      })
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
      })
    } finally {
      setConfirmSignOut(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type and size
    const fileType = file.type.split("/")[0]
    if (fileType !== "image") {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      // Upload file to Supabase Storage
      const fileName = `avatar-${user.id}-${Date.now()}`
      const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName)

      const avatarUrl = urlData.publicUrl

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id)

      if (updateError) throw updateError

      // Update local state
      setProfile({
        ...profile,
        avatarUrl,
      })

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      })
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Error uploading avatar",
        description: "There was a problem uploading your profile picture.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeAvatar = async () => {
    if (!user || !profile.avatarUrl) return

    setIsUploading(true)
    try {
      // Update profile to remove avatar URL
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", user.id)

      if (updateError) throw updateError

      // Update local state
      setProfile({
        ...profile,
        avatarUrl: "",
      })

      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed.",
      })
    } catch (error) {
      console.error("Error removing avatar:", error)
      toast({
        title: "Error removing avatar",
        description: "There was a problem removing your profile picture.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!profile.fullName) return "U"

    const names = profile.fullName.split(" ")
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  // Current year for graduation year dropdown
  const currentYear = new Date().getFullYear()
  const graduationYears = Array.from({ length: 10 }, (_, i) => currentYear + i)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="academic" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Academic
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your account profile information and bio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        {/* Temporarily disabled avatar image in favor of initials
                        <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} alt={profile.fullName} />
                        */}
                        <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Profile Picture</h3>
                      <p className="text-sm text-muted-foreground">
                        Your profile picture will be shown across the application
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {/* Temporarily disabled avatar upload functionality
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          <Camera className="h-4 w-4 mr-1" /> Change
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleAvatarUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeAvatar}
                          disabled={isUploading || !profile.avatarUrl}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Remove
                        </Button>
                        */}
                        <p className="text-sm text-muted-foreground">Sorry! Avatar uploads are temporarily disabled.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="flex">
                          <div className="bg-muted flex items-center px-3 rounded-l-md border-y border-l">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            id="fullName"
                            value={profile.fullName}
                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                            className="rounded-l-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex">
                          <div className="bg-muted flex items-center px-3 rounded-l-md border-y border-l">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input id="email" value={profile.email} readOnly className="rounded-l-none bg-muted/50" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Your email cannot be changed. Contact support if you need to update it.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us a little about yourself"
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={updateProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="academic">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                  <CardDescription>Update your academic details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="school">School</Label>
                      <Input
                        id="school"
                        placeholder="Your high school name"
                        value={profile.school}
                        onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gradYear">Graduation Year</Label>
                      <Select
                        value={profile.gradYear}
                        onValueChange={(value) => setProfile({ ...profile, gradYear: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select graduation year" />
                        </SelectTrigger>
                        <SelectContent>
                          {graduationYears.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interests">Academic Interests</Label>
                    <Textarea
                      id="interests"
                      placeholder="What subjects or fields are you interested in?"
                      value={profile.interests}
                      onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={updateProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control who can see your information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="publicProfile">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">Allow others to view your profile information</p>
                    </div>
                    <Switch
                      id="publicProfile"
                      checked={profile.privacySettings.publicProfile}
                      onCheckedChange={(checked) =>
                        setProfile({
                          ...profile,
                          privacySettings: {
                            ...profile.privacySettings,
                            publicProfile: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showEmail">Show Email</Label>
                      <p className="text-sm text-muted-foreground">Display your email address on your public profile</p>
                    </div>
                    <Switch
                      id="showEmail"
                      checked={profile.privacySettings.showEmail}
                      onCheckedChange={(checked) =>
                        setProfile({
                          ...profile,
                          privacySettings: {
                            ...profile.privacySettings,
                            showEmail: checked,
                          },
                        })
                      }
                      disabled={!profile.privacySettings.publicProfile}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={updateProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="flex">
                        <div className="bg-muted flex items-center px-3 rounded-l-md border-y border-l">
                          <Key className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwords.current}
                          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="flex">
                        <div className="bg-muted flex items-center px-3 rounded-l-md border-y border-l">
                          <Key className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwords.new}
                          onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                          className="rounded-l-none"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="flex">
                        <div className="bg-muted flex items-center px-3 rounded-l-md border-y border-l">
                          <Key className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      onClick={updatePassword}
                      disabled={isSaving || !passwords.current || !passwords.new || !passwords.confirm}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                    <CardDescription>Manage your account settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-medium">Sign Out</h3>
                      <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
                      <div>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => setConfirmSignOut(true)}
                        >
                          <LogOut className="h-4 w-4" /> Sign Out
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-medium text-destructive">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground mt-2 mb-4">
                        Permanently delete your account and all of your data
                      </p>
                      <Button variant="destructive" onClick={() => setConfirmDeleteAccount(true)} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                          </>
                        ) : (
                          "Delete Account"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Confirmation dialogs */}
      <ConfirmationDialog
        open={confirmDeleteAccount}
        onOpenChange={setConfirmDeleteAccount}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data."
        confirmText="Delete Account"
        onConfirm={handleDeleteAccount}
        variant="destructive"
      />

      <ConfirmationDialog
        open={confirmSignOut}
        onOpenChange={setConfirmSignOut}
        title="Sign Out"
        description="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        onConfirm={handleSignOut}
      />
    </ProtectedRoute>
  )
}
