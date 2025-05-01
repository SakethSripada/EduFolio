"use client"

import { useState, useEffect } from "react"
import { User } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Copy, Check, Share2, Copy as CopyIcon } from "lucide-react"
import { createOrUpdateShareLink, ShareLinkType, ShareSettings, getShareLink, generateShareUrl } from "@/lib/share-utils"
import { useToast } from "@/components/ui/use-toast"
import { ensureSharedLinksTable } from "@/lib/db-migrate"

export interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contentType: ShareLinkType
  contentId?: string
  contentName?: string
  user: User | null
}

export function ShareModal({ open, onOpenChange, contentType, contentId, contentName, user }: ShareModalProps) {
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [shareLink, setShareLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [expiryOption, setExpiryOption] = useState<"never" | "date">("never")
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic")
  
  // Settings for visibility
  const [settings, setSettings] = useState<ShareSettings>({
    showExtracurriculars: true,
    showAcademics: true,
    showAwards: true,
    showEssays: true,
    showCourses: true,
    showTestScores: true,
  })

  // Fetch existing share link on component mount
  useEffect(() => {
    if (open && user) {
      setIsLoading(true)
      
      const fetchShareLinkData = async () => {
        try {        
          const { data: existingRecords, error } = await supabase
            .from("shared_links")
            .select("*")
            .eq("user_id", user.id)
            .eq("content_type", contentType)
            .eq("content_id", contentId || null);

          if (error) {
            console.error("Error fetching share link data:", error.message || error);
            toast({
              title: "Error",
              description: `Failed to fetch share link: ${error.message || 'Unknown error'}`,
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }

          if (existingRecords && existingRecords.length > 0) {
            // Handle potential duplicates
            if (existingRecords.length > 1) {
              // Removed console.log statement
              
              // Get the first record's ID to keep
              const firstRecordId = existingRecords[0].id;
              
              // Get all other record IDs to delete
              const idsToDelete = existingRecords.slice(1).map(record => record.id);
              
              // Delete duplicate records
              const { error: deleteError } = await supabase
                .from("shared_links")
                .delete()
                .in("id", idsToDelete);
                
              if (deleteError) {
                console.error("Error deleting duplicate share links:", deleteError);
              } else {
                // Removed console.log statement
              }
            }
            
            // Use the first record
            const data = existingRecords[0];
            
            // Existing share link found
            setIsPublic(data.is_public);
            
            // Set settings
            if (data.settings) {
              setSettings(data.settings as ShareSettings);
            }
            
            // Set expiry
            if (data.expires_at) {
              setExpiryOption("date");
              setExpiryDate(new Date(data.expires_at));
            } else {
              setExpiryOption("never");
              setExpiryDate(undefined);
            }
            
            // Generate share URL
            setShareLink(generateShareUrl(contentType, data.share_id, contentId));
          } else {
            // No existing share link, use defaults
            setIsPublic(true);
            setSettings({
              showExtracurriculars: true,
              showAcademics: true,
              showAwards: true,
              showEssays: true,
              showCourses: true,
              showTestScores: true,
            });
            setExpiryOption("never");
            setExpiryDate(undefined);
            setShareLink("");
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Error in fetchShareLinkData:", error);
          setIsLoading(false);
        }
      };

      fetchShareLinkData();
    }
  }, [open, user, contentType, contentId, toast, supabase])

  // Create or update share link
  const handleCreateShareLink = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a share link.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if we need to ensure the shared_links table exists
      try {
        await ensureSharedLinksTable();
      } catch (err) {
        console.error("Table setup error:", err);
        // Continue anyway, as table might already exist
      }
      
      // Calculate expiry date if needed
      let expiresAt = null;
      if (expiryOption === "date" && expiryDate) {
        expiresAt = expiryDate;
      }

      const response = await createOrUpdateShareLink({
        userId: user.id,
        contentType,
        contentId: contentId || null,
        isPublic,
        settings,
        expiresAt: expiresAt,
      });

      if (!response.success) {
        const errorMsg = response.error ? response.error : "Unknown error";
        console.error("Share link creation/update error:", errorMsg);
        toast({
          title: "Error",
          description: `Failed to create share link: ${errorMsg}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Update the share link if it was returned, or generate it if not
      if (response.shareLink) {
        setShareLink(response.shareLink);
      } else {
        setShareLink(generateShareUrl(contentType, response.shareId, contentId));
      }

      toast({
        title: "Share link updated",
        description: "Your share link has been created and is ready to use.",
      });
      
      // Copy to clipboard automatically
      const linkToCopy = response.shareLink || shareLink;
      navigator.clipboard.writeText(linkToCopy)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error("Failed to copy to clipboard:", err);
          // We still proceed since this is just a convenience feature
        });
    } catch (error: any) {
      console.error("Error creating/updating share link:", error.message || error);
      toast({
        title: "Error",
        description: `Failed to create share link: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Copy share link to clipboard
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Link copied",
      description: "Share link has been copied to your clipboard.",
    })
  }

  // Handle settings change
  const handleSettingChange = (key: keyof ShareSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const getContentTypeLabel = () => {
    switch (contentType) {
      case "college_application":
        return "College Application"
      case "college_profile":
        return contentName ? `${contentName} Profile` : "College Profile"
      case "portfolio":
        return "Portfolio"
      default:
        return "Content"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Share Your {getContentTypeLabel()}</DialogTitle>
          <DialogDescription>
            Create a shareable link that allows others to view your {getContentTypeLabel().toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading share settings...</span>
          </div>
        ) : (
          <>
            <Tabs defaultValue="basic" className="w-full" value={activeTab} onValueChange={(v) => setActiveTab(v as "basic" | "advanced")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Visibility</h3>
                    <p className="text-sm text-muted-foreground">
                      {isPublic ? "Anyone with the link can view your content" : "Your content is private"}
                    </p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
                
                {shareLink ? (
                  <div className="space-y-2">
                    <Label>Share Link</Label>
                    <div className="flex gap-2">
                      <Input value={shareLink} readOnly className="flex-grow" />
                      <Button variant="outline" size="icon" onClick={copyShareLink}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isPublic
                        ? "Copy this link to share with others"
                        : "Enable public visibility to share your content"}
                    </p>
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground">
                    Click "Generate Share Link" to create a shareable link
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-6 py-4">
                {/* Expiration Options */}
                <div className="space-y-3">
                  <Label>Link Expiration</Label>
                  <RadioGroup value={expiryOption} onValueChange={(v) => setExpiryOption(v as "never" | "date")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="never" id="never" />
                      <Label htmlFor="never">Never expires</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="date" id="date" />
                      <Label htmlFor="date">Expires on specific date</Label>
                    </div>
                  </RadioGroup>
                  
                  {expiryOption === "date" && (
                    <div className="pt-2">
                      <DatePicker
                        date={expiryDate}
                        setDate={setExpiryDate}
                        disabled={(date: Date) => date < new Date()}
                      />
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Content Visibility Settings */}
                <div className="space-y-3">
                  <Label>Content Visibility Settings</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="showAcademics"
                        checked={settings.showAcademics}
                        onCheckedChange={(checked) => 
                          handleSettingChange("showAcademics", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="showAcademics">Academics</Label>
                        <p className="text-xs text-muted-foreground">GPA, courses, etc.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="showExtracurriculars"
                        checked={settings.showExtracurriculars}
                        onCheckedChange={(checked) => 
                          handleSettingChange("showExtracurriculars", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="showExtracurriculars">Extracurriculars</Label>
                        <p className="text-xs text-muted-foreground">Activities, clubs, etc.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="showAwards"
                        checked={settings.showAwards}
                        onCheckedChange={(checked) => 
                          handleSettingChange("showAwards", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="showAwards">Awards</Label>
                        <p className="text-xs text-muted-foreground">Honors, recognitions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="showEssays"
                        checked={settings.showEssays}
                        onCheckedChange={(checked) => 
                          handleSettingChange("showEssays", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="showEssays">Essays</Label>
                        <p className="text-xs text-muted-foreground">Application essays</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="showCourses"
                        checked={settings.showCourses}
                        onCheckedChange={(checked) => 
                          handleSettingChange("showCourses", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="showCourses">Courses</Label>
                        <p className="text-xs text-muted-foreground">Class schedule, subjects</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="showTestScores"
                        checked={settings.showTestScores}
                        onCheckedChange={(checked) => 
                          handleSettingChange("showTestScores", checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="showTestScores">Test Scores</Label>
                        <p className="text-xs text-muted-foreground">SAT, ACT, AP scores</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab(activeTab === "basic" ? "advanced" : "basic")}
                className="sm:mr-auto order-2 sm:order-1"
              >
                {activeTab === "basic" ? "Show Advanced Options" : "Back to Basic Options"}
              </Button>
              <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                <Button
                  onClick={handleCreateShareLink}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : shareLink ? (
                    <>
                      <Share2 className="mr-2 h-4 w-4" />
                      Update Share Link
                    </>
                  ) : (
                    <>
                      <Share2 className="mr-2 h-4 w-4" />
                      Generate Share Link
                    </>
                  )}
                </Button>
                {shareLink && (
                  <Button variant="secondary" onClick={copyShareLink} className="flex-1 sm:flex-none">
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <CopyIcon className="mr-2 h-4 w-4" />
                        Copy Link
                      </>
                    )}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 