"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, ArrowLeft, Globe, Mail, School, GraduationCap, BookOpen } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SharedProfilePage() {
  const params = useParams<{ shareId: string }>()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Update document title when user data is loaded
  useEffect(() => {
    if (userData && userData.fullName) {
      document.title = `${userData.fullName}'s Profile | EduFolio`;
    }
  }, [userData]);

  useEffect(() => {
    const fetchSharedProfile = async () => {
      console.log("Fetching profile with share ID:", params.shareId);
      
      try {
        // Step 1: Get the shared link data
        const { data: linkData, error: linkError } = await supabase
          .from("shared_links")
          .select("*")
          .eq("share_id", params.shareId)
          .eq("content_type", "user_profile")
          .maybeSingle();
          
        if (linkError) {
          console.error("Error fetching shared link:", linkError);
          setError("This shared link is invalid or has expired");
          setLoading(false);
          return;
        }
        
        if (!linkData) {
          console.error("No shared link found");
          setError("This shared link does not exist");
          setLoading(false);
          return;
        }
        
        console.log("Found shared link:", linkData);
        
        // Check if link is public
        if (!linkData.is_public) {
          setError("This profile is not publicly shared");
          setLoading(false);
          return;
        }
        
        // Check for expiration
        if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
          setError("This shared link has expired");
          setLoading(false);
          return;
        }
        
        // Step 2: Get the user's profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", linkData.user_id)
          .maybeSingle();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setError("Could not load profile information");
          setLoading(false);
          return;
        }
        
        if (!profileData) {
          console.error("No profile found");
          setError("Profile not found");
          setLoading(false);
          return;
        }
        
        console.log("Found profile:", profileData);
        
        // Step 3: Process the data
        const userData = {
          fullName: typeof profileData.full_name === 'string' ? profileData.full_name : "User",
          email: profileData.privacy_settings?.showEmail ? profileData.email : null,
          bio: typeof profileData.bio === 'string' ? profileData.bio : "",
          gradYear: typeof profileData.grad_year === 'string' ? profileData.grad_year : "",
          school: typeof profileData.school === 'string' ? profileData.school : "",
          interests: typeof profileData.interests === 'string' ? profileData.interests : "",
          avatarUrl: typeof profileData.avatar_url === 'string' ? profileData.avatar_url : "",
        };
        
        console.log("Processed user data:", userData);
        setUserData(userData);
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("An error occurred while loading this profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSharedProfile();
  }, [params.shareId, supabase]);
  
  // Helper function to get user initials for avatar
  const getUserInitials = () => {
    if (!userData?.fullName) return "U";
    
    const names = userData.fullName.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <Link href="/" className="text-primary hover:underline inline-flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to EduFolio
        </Link>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
          <Avatar className="h-24 w-24">
            {/* Temporarily disabled avatar image in favor of initials
            <AvatarImage src={userData.avatarUrl || "/placeholder.svg"} alt={userData.fullName} />
            */}
            <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="text-3xl font-bold">{userData.fullName}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-muted-foreground">
              {userData.school && (
                <div className="flex items-center gap-1">
                  <School className="h-4 w-4" />
                  <span>{userData.school}</span>
                </div>
              )}
              
              {userData.gradYear && (
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span>Class of {userData.gradYear}</span>
                </div>
              )}
              
              {userData.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{userData.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {userData.bio && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{userData.bio}</p>
            </CardContent>
          </Card>
        )}
        
        {userData.interests && (
          <Card>
            <CardHeader>
              <CardTitle>Academic Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                <p>{userData.interests}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-center mt-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Globe className="h-4 w-4" /> Shared via EduFolio
          </p>
        </div>
      </div>
    </div>
  );
} 