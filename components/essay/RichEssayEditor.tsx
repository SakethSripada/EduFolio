import { useState, useEffect } from "react"
import { Editor } from "@tinymce/tinymce-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Save, History, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface RichEssayEditorProps {
  content: string
  onChange: (content: string) => void
  onSave: () => void
  wordCount: number
  targetWordCount?: number | null
  showPreview?: boolean
  onShowHistory?: () => void
  className?: string
}

export default function RichEssayEditor({
  content,
  onChange,
  onSave,
  wordCount,
  targetWordCount,
  showPreview = true,
  onShowHistory,
  className = "",
}: RichEssayEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const { toast } = useToast()

  const handleEditorChange = (newContent: string) => {
    onChange(newContent)
  }

  const handleSave = () => {
    onSave()
    toast({
      title: "Essay saved",
      description: "Your changes have been saved successfully.",
    })
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={wordCount > (targetWordCount || 0) ? "destructive" : "secondary"}>
                {wordCount} words
              </Badge>
              {targetWordCount && (
                <span className="text-sm text-muted-foreground">/ {targetWordCount} target</span>
              )}
            </div>
            {showPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="gap-2"
              >
                {isPreviewMode ? (
                  <>
                    <EyeOff className="h-4 w-4" /> Edit Mode
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" /> Preview
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onShowHistory && (
              <Button variant="outline" size="sm" onClick={onShowHistory} className="gap-2">
                <History className="h-4 w-4" /> History
              </Button>
            )}
            <Button variant="default" size="sm" onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        </div>

        <Tabs value={isPreviewMode ? "preview" : "edit"} className="w-full">
          <TabsContent value="edit" className="m-0">
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
              value={content}
              onEditorChange={handleEditorChange}
              init={{
                height: 500,
                menubar: false,
                plugins: [
                  "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
                  "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
                  "insertdatetime", "media", "table", "code", "help", "wordcount"
                ],
                toolbar:
                  "undo redo | blocks | " +
                  "bold italic forecolor | alignleft aligncenter " +
                  "alignright alignjustify | bullist numlist outdent indent | " +
                  "removeformat | help",
                content_style: "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.6; }",
                statusbar: false,
                branding: false,
                promotion: false,
                paste_as_text: true,
                paste_word_valid_elements: "b,strong,i,em,h1,h2,h3,h4,h5,h6,p,br",
                paste_retain_style_properties: "none",
                wordcount: {
                  show_characters: true,
                  show_wordcount: true,
                  show_paragraphs: true,
                },
              }}
            />
          </TabsContent>
          <TabsContent value="preview" className="m-0">
            <div
              className="p-6 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 