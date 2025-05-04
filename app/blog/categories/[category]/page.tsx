import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"

const categoryData = {
  "education": {
    title: "Education",
    description: "Expert insights and resources on educational topics, learning strategies, and academic success.",
    image: "/placeholder.svg",
    color: "blue"
  },
  "college": {
    title: "College",
    description: "Everything you need to know about college applications, admissions, essays, and campus life.",
    image: "/placeholder.svg",
    color: "purple"
  },
  "career": {
    title: "Career",
    description: "Guidance on career planning, professional development, and transitioning from education to work.",
    image: "/placeholder.svg",
    color: "green"
  }
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = params.category
  const data = categoryData[category as keyof typeof categoryData] || {
    title: category.charAt(0).toUpperCase() + category.slice(1),
    description: "Articles related to " + category,
    image: "/placeholder.svg",
    color: "gray"
  }

  // In a real implementation, you would fetch posts based on the category
  // For now, we'll just use hardcoded data
  const posts = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    title: i % 3 === 0 
      ? `Top ${i + 3} Study Strategies for Better Learning Outcomes` 
      : i % 3 === 1 
        ? `How to Navigate the College Application Process with Confidence` 
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

      <div className="relative rounded-xl overflow-hidden mb-12">
        <div className="relative aspect-[21/9]">
          <Image
            src={data.image}
            alt={data.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/30 flex items-center">
            <div className="container">
              <div className="max-w-2xl space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{data.title}</h1>
                <p className="text-xl text-muted-foreground">{data.description}</p>
              </div>
            </div>
          </div>
        </div>
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
                <span>{data.title}</span>
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