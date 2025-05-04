import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Mail, Globe, Twitter, Linkedin } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuthorPage({ params }: { params: { id: string } }) {
  // This would be fetched from a database in a real implementation
  const author = {
    id: params.id,
    name: "Jane Doe",
    role: "Education Specialist",
    avatar: "/placeholder.svg",
    bio: "Jane Doe is an education specialist with over 10 years of experience in college admissions and counseling. She has helped hundreds of students get accepted to their dream schools and is passionate about making education accessible to all students.",
    email: "jane.doe@example.com",
    website: "https://janedoe.com",
    twitter: "@janedoe",
    linkedin: "https://linkedin.com/in/janedoe",
    stats: {
      posts: 24,
      views: "103K+",
      comments: 528
    }
  }
  
  const posts = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    title: i % 3 === 0 
      ? `How to Create a Standout College Application` 
      : i % 3 === 1 
        ? `Finding Your Learning Style: A Guide for Students` 
        : `Building Your Professional Network While in College`,
    slug: `post-${i + 1}`,
    excerpt: i % 3 === 0 
      ? "Learn expert strategies to make your college application stand out from the crowd and increase your chances of acceptance." 
      : i % 3 === 1 
        ? "Discover your unique learning style and leverage it to improve your academic performance and make studying more effective." 
        : "Learn how to build a professional network during your college years that will benefit your future career path.",
    coverImage: "/placeholder.svg",
    date: `June ${10 + i}, 2025`,
    readingTime: `${Math.floor(Math.random() * 10) + 3} min read`,
    category: i % 3 === 0 ? "College" : i % 3 === 1 ? "Education" : "Career",
    views: Math.floor(Math.random() * 10000) + 1000,
    comments: Math.floor(Math.random() * 100) + 5
  }))

  return (
    <div className="container py-12">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/blog" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          Back to Blog
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        <div className="lg:col-span-1">
          <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
            <Image
              src={author.avatar}
              alt={author.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{author.name}</h1>
          <p className="text-lg text-muted-foreground mb-4">{author.role}</p>
          
          <p className="mb-6 max-w-3xl">
            {author.bio}
          </p>
          
          <div className="flex flex-wrap gap-3 mb-8">
            {author.email && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`mailto:${author.email}`} className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Link>
              </Button>
            )}
            
            {author.website && (
              <Button variant="outline" size="sm" asChild>
                <Link href={author.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </Link>
              </Button>
            )}
            
            {author.twitter && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`https://twitter.com/${author.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Link>
              </Button>
            )}
            
            {author.linkedin && (
              <Button variant="outline" size="sm" asChild>
                <Link href={author.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Link>
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4 max-w-md">
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{author.stats.posts}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{author.stats.views}</div>
              <div className="text-sm text-muted-foreground">Views</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{author.stats.comments}</div>
              <div className="text-sm text-muted-foreground">Comments</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="recent">Recent Posts</TabsTrigger>
          <TabsTrigger value="popular">Popular Posts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(0, 6).map((post) => (
              <Card key={post.id} className="overflow-hidden flex flex-col">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader className="flex-1 pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>{post.category}</span>
                    <span>•</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link href={`/blog/posts/${post.slug}`} className="hover:text-primary">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardContent>
                <CardFooter className="mt-auto flex justify-between items-center">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>👁️</span>
                      <span>{post.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>💬</span>
                      <span>{post.comments}</span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{post.date}</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="popular" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...posts].sort((a, b) => b.views - a.views).slice(0, 6).map((post) => (
              <Card key={post.id} className="overflow-hidden flex flex-col">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader className="flex-1 pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>{post.category}</span>
                    <span>•</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link href={`/blog/posts/${post.slug}`} className="hover:text-primary">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardContent>
                <CardFooter className="mt-auto flex justify-between items-center">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>👁️</span>
                      <span>{post.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>💬</span>
                      <span>{post.comments}</span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{post.date}</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center mt-12">
        <Button variant="outline">View All Posts</Button>
      </div>
    </div>
  )
} 