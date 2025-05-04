import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, Calendar, Upload, ImageIcon, Save, Eye, GripVertical } from "lucide-react"

export default function BlogEditorPage({ params }: { params: { id: string } }) {
  const isNewPost = params.id === "new"
  const pageTitle = isNewPost ? "Create New Post" : "Edit Post"
  
  // Mock data for an existing post if not a new post
  const postData = isNewPost ? {
    title: "",
    subtitle: "",
    content: "",
    category: "",
    tags: [],
    coverImage: "",
    status: "draft",
    publishDate: "",
    seoTitle: "",
    seoDescription: "",
    allowComments: true,
    featured: false
  } : {
    title: "How to Create a Standout College Application",
    subtitle: "Expert strategies to make your application memorable and increase your chances of acceptance",
    content: `<h2>Introduction</h2>
      <p>College applications can be daunting, but with the right approach, you can create an application that truly stands out from the crowd.</p>
      
      <h2>Start Early and Plan Strategically</h2>
      <p>One of the most common mistakes students make is waiting until the last minute to begin their college applications.</p>
      
      <h2>Showcase Your Authentic Self</h2>
      <p>Admissions officers review thousands of applications each year, and they can quickly spot insincerity.</p>`,
    category: "College",
    tags: ["College Application", "Admissions", "Essays", "Planning"],
    coverImage: "/placeholder.svg",
    status: "published",
    publishDate: "2025-06-15",
    seoTitle: "How to Create a Standout College Application | EduFolio Blog",
    seoDescription: "Learn expert strategies to make your college application stand out from the crowd and increase your chances of acceptance to your dream school.",
    allowComments: true,
    featured: true
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/blog/admin" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground">
            {isNewPost ? "Create a new blog post" : "Edit an existing blog post"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button className="flex items-center gap-1">
            <Save className="h-4 w-4" />
            {postData.status === "published" ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
              <CardDescription>
                Write your blog post content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <FormLabel htmlFor="title">Title</FormLabel>
                <Input
                  id="title"
                  placeholder="Enter post title"
                  defaultValue={postData.title}
                />
                <FormDescription>
                  Make it compelling and descriptive
                </FormDescription>
              </div>
              
              <div className="space-y-2">
                <FormLabel htmlFor="subtitle">Subtitle</FormLabel>
                <Input
                  id="subtitle"
                  placeholder="Enter post subtitle or summary"
                  defaultValue={postData.subtitle}
                />
              </div>
              
              <div className="space-y-2">
                <FormLabel htmlFor="content">Content</FormLabel>
                <div className="border rounded-md">
                  <div className="border-b p-2">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">H1</Button>
                      <Button variant="ghost" size="sm">H2</Button>
                      <Button variant="ghost" size="sm">B</Button>
                      <Button variant="ghost" size="sm">I</Button>
                      <Button variant="ghost" size="sm">U</Button>
                      <Button variant="ghost" size="sm">Link</Button>
                      <Button variant="ghost" size="sm">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">List</Button>
                      <Button variant="ghost" size="sm">Quote</Button>
                    </div>
                  </div>
                  <Textarea
                    id="content"
                    placeholder="Write your post content here..."
                    className="min-h-[400px] border-0 focus-visible:ring-0 resize-none"
                    defaultValue={postData.content}
                  />
                </div>
                <FormDescription>
                  Use markdown or the editor tools to format your content
                </FormDescription>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your post for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <FormLabel htmlFor="seoTitle">SEO Title</FormLabel>
                <Input
                  id="seoTitle"
                  placeholder="Enter SEO title"
                  defaultValue={postData.seoTitle}
                />
                <FormDescription>
                  Keep it under 60 characters for optimal display in search results
                </FormDescription>
              </div>
              
              <div className="space-y-2">
                <FormLabel htmlFor="seoDescription">Meta Description</FormLabel>
                <Textarea
                  id="seoDescription"
                  placeholder="Enter meta description"
                  className="resize-none"
                  defaultValue={postData.seoDescription}
                />
                <FormDescription>
                  Keep it between 120-160 characters
                </FormDescription>
              </div>
              
              <div className="space-y-2">
                <FormLabel>Preview</FormLabel>
                <div className="border rounded-md p-4 bg-muted/30">
                  <p className="text-primary text-md font-medium line-clamp-1">
                    {postData.seoTitle || "SEO Title Will Appear Here"}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {postData.seoDescription || "Meta description will appear here. Make sure to write a compelling description that will encourage users to click on your article in search results."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publishing Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FormLabel htmlFor="status">Status</FormLabel>
                  <Select defaultValue={postData.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <FormLabel htmlFor="publishDate">Publish Date</FormLabel>
                  <div className="relative">
                    <Input
                      id="publishDate"
                      type="date"
                      defaultValue={postData.publishDate}
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="featured" defaultChecked={postData.featured} />
                    <label
                      htmlFor="featured"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Feature this post
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="allowComments" defaultChecked={postData.allowComments} />
                    <label
                      htmlFor="allowComments"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Allow comments
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Categories & Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FormLabel htmlFor="category">Category</FormLabel>
                  <Select defaultValue={postData.category || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="College">College</SelectItem>
                      <SelectItem value="Career">Career</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <FormLabel htmlFor="tags">Tags</FormLabel>
                  <Input
                    id="tags"
                    placeholder="Enter tags separated by commas"
                    defaultValue={postData.tags.join(", ")}
                  />
                  <FormDescription>
                    Add relevant tags to help users find your content
                  </FormDescription>
                </div>
                
                {postData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {postData.tags.map((tag, index) => (
                      <div key={index} className="bg-muted flex items-center rounded-md px-3 py-1 text-sm">
                        {tag}
                        <button className="ml-2 text-muted-foreground hover:text-foreground">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {postData.coverImage ? (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-md border bg-muted">
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      {/* This would be an actual image in the real implementation */}
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <ImageIcon className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop an image, or click to browse
                    </p>
                    <Button variant="outline" size="sm">
                      Upload Image
                    </Button>
                  </div>
                )}
                <FormDescription>
                  Recommended size: 1200 × 630 pixels
                </FormDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 