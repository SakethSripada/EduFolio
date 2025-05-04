import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"

export default function TagPage({ params }: { params: { tag: string } }) {
  const tag = params.tag.replaceAll('-', ' ')
  
  // This would be fetched from a database in a real implementation
  const posts = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: i % 3 === 0 
      ? `Top Study Strategies for Better Learning Outcomes` 
      : i % 3 === 1 
        ? `How to Navigate the College Application Process` 
        : `Building a Strong Foundation for Your Future Career`,
    slug: `post-${i + 1}`,
    excerpt: i % 3 === 0 
      ? "Discover effective study techniques that can help you retain information better and improve your academic performance." 
      : i % 3 === 1 
        ? "A step-by-step guide to help you navigate the college application process with less stress and more success." 
        : "Learn how to develop essential skills and experiences during your education that will set you up for career success.",
    coverImage: "/placeholder.svg",
    date: `June ${10 + i}, 2025`,
    readingTime: `${Math.floor(Math.random() * 10) + 3} min read`,
    category: i % 3 === 0 ? "Education" : i % 3 === 1 ? "College" : "Career",
    author: {
      name: i % 2 === 0 ? "John Smith" : "Emily Chen",
      avatar: "/placeholder.svg"
    }
  }))

  return (
    <div className="container py-12">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/blog" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          Back to Blog
        </Link>
      </Button>

      <div className="mb-12">
        <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-md mb-4">
          Tag
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight capitalize mb-4">{tag}</h1>
        <p className="text-xl text-muted-foreground max-w-[800px]">
          Browse all articles tagged with "{tag}" to find relevant content for your educational journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted"></div>
                <span className="text-sm">{post.author.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{post.date}</span>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <Button variant="outline">Load More</Button>
      </div>
    </div>
  )
} 