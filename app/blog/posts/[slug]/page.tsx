import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, Calendar, Clock, Share2, BookmarkPlus, Twitter, Facebook, Linkedin } from "lucide-react"

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  // In a real implementation, you would fetch the post based on the slug
  // For now, we'll just use hardcoded data for demonstration
  const postData = {
    slug: params.slug,
    title: "How to Create a Standout College Application",
    subtitle: "Expert strategies to make your application memorable and increase your chances of acceptance",
    coverImage: "/placeholder.svg",
    author: {
      name: "Jane Doe",
      avatar: "/placeholder.svg",
      role: "Education Specialist",
    },
    date: "June 15, 2025",
    readingTime: "8 min read",
    category: "College",
    content: `
      <h2>Introduction</h2>
      <p>College applications can be daunting, but with the right approach, you can create an application that truly stands out from the crowd. In this comprehensive guide, we'll walk you through proven strategies to enhance your college application and maximize your chances of getting accepted to your dream school.</p>
      
      <p>The college application process is becoming more competitive each year. With more students applying to top schools, it's essential to find ways to differentiate yourself and showcase your unique strengths and accomplishments.</p>
      
      <h2>Start Early and Plan Strategically</h2>
      <p>One of the most common mistakes students make is waiting until the last minute to begin their college applications. Starting early gives you ample time to craft thoughtful essays, gather strong recommendation letters, and address any weaknesses in your application.</p>
      
      <p>Create a timeline that spans your junior and senior years of high school. Include deadlines for standardized tests, essay drafts, recommendation requests, and application submissions. Having a clear roadmap will reduce stress and ensure you don't miss any important deadlines.</p>
      
      <h2>Showcase Your Authentic Self</h2>
      <p>Admissions officers review thousands of applications each year, and they can quickly spot insincerity. Rather than trying to present yourself as the "perfect" candidate, focus on authentically sharing your genuine interests, experiences, and aspirations.</p>
      
      <p>Your unique perspective and personal journey are what will make your application memorable. Don't be afraid to share challenges you've overcome or mistakes you've learned from—these experiences often demonstrate growth, resilience, and character.</p>
      
      <h2>Craft a Compelling Personal Statement</h2>
      <p>Your personal statement is not just a summary of your accomplishments—it's an opportunity to tell your story and give admissions officers insight into who you are beyond your grades and test scores.</p>
      
      <p>Choose a topic that genuinely matters to you and tells something important about your identity, values, or goals. Use specific anecdotes and vivid details to bring your essay to life and make it memorable. Remember to revise and edit multiple times, seeking feedback from teachers, mentors, or counselors.</p>
      
      <h2>Demonstrate Intellectual Curiosity and Academic Passion</h2>
      <p>Colleges want students who are genuinely excited about learning and will contribute to the intellectual life of their campus. Demonstrate your academic passions by highlighting projects, research, or independent study you've undertaken beyond regular coursework.</p>
      
      <p>If you've pursued advanced courses in a particular subject, participated in academic competitions, or engaged in learning opportunities outside of school, make sure to highlight these experiences in your application.</p>
      
      <h2>Show Impact and Leadership</h2>
      <p>Rather than listing dozens of extracurricular activities, focus on a few where you've made a significant impact or demonstrated leadership. Colleges value quality over quantity when it comes to extracurriculars.</p>
      
      <p>Describe how you've grown through these experiences and the impact you've had on your school or community. Highlight specific accomplishments, skills you've developed, and lessons you've learned.</p>
      
      <h2>Conclusion</h2>
      <p>Creating a standout college application requires time, reflection, and careful planning. By starting early, being authentic, crafting compelling essays, demonstrating your academic passions, and highlighting your impact, you can create an application that truly represents your strengths and potential.</p>
      
      <p>Remember that the goal isn't just to get into college—it's to find a school where you'll thrive academically, socially, and personally. Focus on presenting your true self, and you'll maximize your chances of finding the right college match.</p>
    `,
    tags: ["College Application", "Admissions", "Essays", "Extracurriculars", "Planning"],
    relatedPosts: [
      { id: 1, title: "5 Common College Application Mistakes to Avoid", slug: "college-application-mistakes" },
      { id: 2, title: "How to Write a Compelling College Essay", slug: "compelling-college-essay" },
      { id: 3, title: "Building a Strong Academic Profile for College Admissions", slug: "strong-academic-profile" },
    ]
  }

  return (
    <article className="container py-12">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/blog" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Link 
              href={`/blog/categories/${postData.category.toLowerCase()}`}
              className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
            >
              {postData.category}
            </Link>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{postData.title}</h1>
          <p className="text-xl text-muted-foreground">{postData.subtitle}</p>
          
          <div className="flex items-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={postData.author.avatar} alt={postData.author.name} />
                <AvatarFallback>{postData.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{postData.author.name}</p>
                <p className="text-xs text-muted-foreground">{postData.author.role}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{postData.date}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{postData.readingTime}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative aspect-[21/9] mb-12 overflow-hidden rounded-lg">
        <Image
          src={postData.coverImage}
          alt={postData.title}
          fill
          className="object-cover"
          priority
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <div className="prose prose-lg dark:prose-invert max-w-none" 
               dangerouslySetInnerHTML={{ __html: postData.content }}>
          </div>
          
          <div className="mt-12">
            <div className="flex flex-wrap gap-2 mb-6">
              {postData.tags.map((tag, index) => (
                <Link 
                  key={index} 
                  href={`/blog/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full hover:bg-muted/80 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
            
            <div className="flex justify-between items-center py-6 border-y">
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <BookmarkPlus className="h-5 w-5" />
                  Save
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Share2 className="h-5 w-5" />
                  Share
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-10">
            <div className="bg-muted rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">About the Author</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={postData.author.avatar} alt={postData.author.name} />
                  <AvatarFallback>{postData.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{postData.author.name}</p>
                  <p className="text-sm text-muted-foreground">{postData.author.role}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Jane Doe is an education specialist with over 10 years of experience in college admissions and counseling. She has helped hundreds of students get accepted to their dream schools.
              </p>
              <Button variant="outline" className="w-full">View Profile</Button>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
              <div className="space-y-4">
                {postData.relatedPosts.map((post) => (
                  <Link key={post.id} href={`/blog/posts/${post.slug}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <p className="font-medium">{post.title}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="bg-primary/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Subscribe to our Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest educational insights and resources delivered to your inbox
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-10 px-3 rounded-md border bg-background"
                />
                <Button className="w-full">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <section className="mt-20">
        <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="overflow-hidden">
              <div className="relative aspect-[16/9]">
                <Image
                  src="/placeholder.svg"
                  alt={`Recommended post ${item}`}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>{item === 1 ? "Education" : item === 2 ? "College" : "Career"}</span>
                  <span>•</span>
                  <span>{item + 3} min read</span>
                </div>
                <CardTitle className="line-clamp-2">
                  <Link href={`/blog/posts/recommended-post-${item}`} className="hover:text-primary">
                    {item === 1 
                      ? "Finding Your Ideal College Match: Beyond Rankings" 
                      : item === 2 
                        ? "The Complete Guide to Financial Aid and Scholarships" 
                        : "Leveraging Extracurriculars for College Success"}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2">
                  {item === 1 
                    ? "Discover how to find colleges that align with your academic goals, learning style, and personal preferences."
                    : item === 2 
                      ? "Navigate the complex world of financial aid, scholarships, and grants to fund your college education."
                      : "Learn how to choose and excel in extracurricular activities that will boost your college applications."}
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted"></div>
                  <span className="text-sm">By {item === 1 ? "John Smith" : item === 2 ? "Emily Chen" : "David Lee"}</span>
                </div>
                <span className="text-sm text-muted-foreground">June {20 + item}, 2025</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </article>
  )
} 