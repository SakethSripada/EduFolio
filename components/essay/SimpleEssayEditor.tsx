import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Save, History, Eye, EyeOff, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import DOMPurify from "dompurify"

interface SimpleEssayEditorProps {
  content: string
  onChange: (content: string) => void
  onSave: () => void
  onSaveAndExit?: () => void
  wordCount: number
  targetWordCount?: number | null
  showPreview?: boolean
  onShowHistory?: () => void
  className?: string
  autoSave?: boolean
  autoSaveDelay?: number
}

export default function SimpleEssayEditor({
  content,
  onChange,
  onSave,
  onSaveAndExit,
  wordCount,
  targetWordCount,
  showPreview = true,
  onShowHistory,
  className = "",
  autoSave = false,
  autoSaveDelay = 2000,
}: SimpleEssayEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [isInitialized, setIsInitialized] = useState(false)
  const [lastContent, setLastContent] = useState(content)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const savedStatusTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Reset save status to idle after a delay
  const resetSaveStatus = () => {
    if (savedStatusTimerRef.current) {
      clearTimeout(savedStatusTimerRef.current)
    }
    
    // After showing "Saved" for 3 seconds, clear the status
    savedStatusTimerRef.current = setTimeout(() => {
      setSaveStatus('idle')
    }, 3000)
  }

  const handleEditorChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      onChange(newContent)
      
      // Update last content
      setLastContent(newContent)
      
      // Set up auto-save if enabled
      if (autoSave) {
        // Clear any existing timer
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current)
        }
        
        // Show saving indicator immediately when typing starts
        setSaveStatus('saving')
        
        // Set new timer
        autoSaveTimerRef.current = setTimeout(() => {
          onSave()
          setSaveStatus('saved')
          resetSaveStatus()
        }, autoSaveDelay)
      }
    }
  }

  // Clean up auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
      if (savedStatusTimerRef.current) {
        clearTimeout(savedStatusTimerRef.current)
      }
    }
  }, [])

  // Initialize editor content on first render
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = DOMPurify.sanitize(content)
      setIsInitialized(true)
    }
  }, [content, isInitialized])

  // Update editor content when it changes (and not focused)
  useEffect(() => {
    if (isInitialized && editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = DOMPurify.sanitize(content)
    }
  }, [content, isInitialized])

  // Update preview content when content changes or preview mode is toggled
  useEffect(() => {
    if (previewRef.current) {
      // Safely set the content using sanitized HTML
      previewRef.current.innerHTML = DOMPurify.sanitize(content)
    }
  }, [content, isPreviewMode])

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  const handleSave = () => {
    // Show saving indicator
    setSaveStatus('saving')
    
    // Call the onSave callback
    onSave()
    
    // Show success indicator and toast
    setSaveStatus('saved')
    toast({
      title: "Essay saved",
      description: "Your changes have been saved successfully.",
    })
    
    // Reset status after a delay
    resetSaveStatus()
  }

  const handleSaveAndExit = () => {
    // Show saving indicator
    setSaveStatus('saving')
    
    // Call the onSaveAndExit callback (which will save and close the editor)
    if (onSaveAndExit) {
      onSaveAndExit()
    }
    
    // No need to reset status as we're exiting the editor
  }

  // Function to handle editor focusing
  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  // Function to position cursor at end of content when first focusing
  const handleEditorClick = (e: React.MouseEvent) => {
    // Only handle if this is the first click (editor not already focused)
    if (editorRef.current && document.activeElement !== editorRef.current) {
      focusEditor()
      
      // Try to position cursor at end of content
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false); // collapse to end
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }

  // Ensure format commands work correctly
  const execCommand = (command: string, value?: string) => {
    focusEditor()
    document.execCommand(command, false, value)
    // Update content after executing a command
    handleEditorChange()
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
                onClick={togglePreviewMode}
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
            {/* Add saving status indicator */}
            <div className="text-xs flex items-center text-muted-foreground">
              {saveStatus === 'saving' && (
                <span className="flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" /> Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" /> All changes saved
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onShowHistory && (
              <Button variant="outline" size="sm" onClick={onShowHistory} className="gap-2">
                <History className="h-4 w-4" /> History
              </Button>
            )}
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSaveAndExit} 
              className="gap-2"
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save & Exit
                </>
              )}
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
              suppressContentEditableWarning
              className="p-4 min-h-[500px] focus:outline-none prose prose-sm max-w-none dark:text-slate-100 text-slate-900 dark:prose-invert"
              onInput={handleEditorChange}
              onPaste={handlePaste}
              onClick={handleEditorClick}
            />
          </TabsContent>
          <TabsContent value="preview" className="m-0">
            <div
              ref={previewRef}
              className="p-6 prose prose-sm max-w-none dark:text-slate-100 text-slate-900 dark:prose-invert"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 