import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Save, History, Eye, EyeOff, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SimpleEssayEditorProps {
  content: string
  onChange: (content: string) => void
  onSave: () => void
  wordCount: number
  targetWordCount?: number | null
  showPreview?: boolean
  onShowHistory?: () => void
  className?: string
}

export default function SimpleEssayEditor({
  content,
  onChange,
  onSave,
  wordCount,
  targetWordCount,
  showPreview = true,
  onShowHistory,
  className = "",
}: SimpleEssayEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const handleEditorChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleSave = () => {
    onSave()
    toast({
      title: "Essay saved",
      description: "Your changes have been saved successfully.",
    })
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
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
            <div className="border-b p-2 flex gap-1 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand("bold")}
                className="h-8 w-8 p-0"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand("italic")}
                className="h-8 w-8 p-0"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand("underline")}
                className="h-8 w-8 p-0"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <div className="w-px h-8 bg-border mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand("insertUnorderedList")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand("insertOrderedList")}
                className="h-8 w-8 p-0"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <div className="w-px h-8 bg-border mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand("justifyLeft")}
                className="h-8 w-8 p-0"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand("justifyCenter")}
                className="h-8 w-8 p-0"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand("justifyRight")}
                className="h-8 w-8 p-0"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
            <div
              ref={editorRef}
              contentEditable
              className="p-4 min-h-[500px] focus:outline-none prose prose-sm max-w-none"
              onInput={handleEditorChange}
              dangerouslySetInnerHTML={{ __html: content }}
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