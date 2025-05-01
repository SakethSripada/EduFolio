"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserSettings, EnabledTools } from "@/hooks/useUserSettings"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { Book, Briefcase, FileText, Settings2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { settings, isLoading, updateToolVisibility } = useUserSettings()
  const [isSaving, setIsSaving] = useState(false)

  const handleToggleTool = async (toolName: keyof EnabledTools, checked: boolean) => {
    setIsSaving(true)
    try {
      console.log(`Toggling tool ${toolName} to ${checked}`)
      
      const success = await updateToolVisibility(toolName, checked)
      
      if (success) {
        console.log(`Successfully updated ${toolName} visibility to ${checked}`)
        
        toast({
          title: "Settings updated",
          description: `${toolName} visibility has been ${checked ? 'enabled' : 'disabled'}.`,
        })
      } else {
        console.error(`Failed to update ${toolName} visibility`)
        throw new Error("Failed to update settings")
      }
    } catch (error) {
      console.error('Error in handleToggleTool:', error)
      
      toast({
        title: "Error updating settings",
        description: "There was a problem updating your settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>

          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" /> Appearance
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize how EduFolio looks and feels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Appearance settings will be coming soon!
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools">
              <Card>
                <CardHeader>
                  <CardTitle>Tool Visibility</CardTitle>
                  <CardDescription>
                    Choose which tools are visible in your navigation bar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="flex items-center space-x-4 py-4">
                      <div className="w-full h-12 bg-muted animate-pulse rounded-md" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between space-x-4 py-4">
                        <div className="flex items-center space-x-4">
                          <Book className="h-6 w-6 text-primary" />
                          <div>
                            <Label htmlFor="college-app" className="text-base">College Application Manager</Label>
                            <p className="text-sm text-muted-foreground">
                              Manage your college applications, essays, and deadlines
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="college-app"
                          checked={settings.enabledTools.collegeApp}
                          onCheckedChange={(checked) => handleToggleTool("collegeApp", checked)}
                          disabled={isSaving}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-4 py-4 border-t">
                        <div className="flex items-center space-x-4">
                          <Briefcase className="h-6 w-6 text-primary" />
                          <div>
                            <Label htmlFor="portfolio" className="text-base">Portfolio</Label>
                            <p className="text-sm text-muted-foreground">
                              Showcase your projects and achievements
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="portfolio"
                          checked={settings.enabledTools.portfolio}
                          onCheckedChange={(checked) => handleToggleTool("portfolio", checked)}
                          disabled={isSaving}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-4 py-4 border-t">
                        <div className="flex items-center space-x-4">
                          <FileText className="h-6 w-6 text-primary" />
                          <div>
                            <Label htmlFor="resume" className="text-base">Resume</Label>
                            <p className="text-sm text-muted-foreground">
                              Build and manage your professional resume
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="resume"
                          checked={settings.enabledTools.resume}
                          onCheckedChange={(checked) => handleToggleTool("resume", checked)}
                          disabled={isSaving}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
} 