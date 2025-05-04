import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

export default function BlogPage() {
  return (
    <div className="container pb-12">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              EduFolio <span className="text-primary">Blog</span>
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-[600px]">
              Expert insights, tips, and resources to help you navigate your educational journey and career path.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <div className="relative w-full max-w-sm">
                <Input
                  type="text"
                  placeholder="Search articles..."
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <Button className="w-full sm:w-auto">Search</Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src="/placeholder.svg"
              alt="Blog Hero"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-8">
        <h2 className="text-3xl font-bold mb-8">Featured Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="overflow-hidden">
              <div className="relative aspect-[16/9]">
                <Image
                  src="/placeholder.svg"
                  alt={`Featured post ${item}`}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>Education</span>
                  <span>•</span>
                  <span>5 min read</span>
                </div>
                <CardTitle className="line-clamp-2">
                  <Link href={`/blog/posts/featured-post-${item}`} className="hover:text-primary">
                    How to Create a Standout College Application
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2">
                  Learn the essential strategies to make your college application stand out from the crowd and increase your chances of acceptance.
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted"></div>
                  <span className="text-sm">By Jane Doe</span>
                </div>
                <span className="text-sm text-muted-foreground">June 15, 2025</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories Tabs */}
      <section className="py-12">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Latest Articles</h2>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="college">College</TabsTrigger>
              <TabsTrigger value="career">Career</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-8">
            {[1, 2, 3, 4, 5].map((item) => (
              <Card key={item} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="relative aspect-video md:aspect-square">
                    <Image
                      src="/placeholder.svg"
                      alt={`Post ${item}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="col-span-2 flex flex-col justify-between p-6 md:p-0 md:pr-6">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>{item % 3 === 0 ? "Education" : item % 3 === 1 ? "College" : "Career"}</span>
                        <span>•</span>
                        <span>{Math.floor(Math.random() * 10) + 3} min read</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        <Link href={`/blog/posts/post-${item}`} className="hover:text-primary">
                          {item % 3 === 0 
                            ? "Finding Your Learning Style: A Guide for Students" 
                            : item % 3 === 1 
                              ? "College Admission Essay Tips: What Works and What Doesn't" 
                              : "Building Your Professional Network While in College"}
                        </Link>
                      </h3>
                      <p className="text-muted-foreground line-clamp-2 md:line-clamp-3">
                        {item % 3 === 0 
                          ? "Discover your unique learning style and leverage it to improve your academic performance and make studying more effective." 
                          : item % 3 === 1 
                            ? "Get expert advice on crafting a compelling college admission essay that showcases your personality and achievements."
                            : "Learn how to build a professional network during your college years that will benefit your future career path."}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted"></div>
                        <span className="text-sm">By {item % 2 === 0 ? "John Smith" : "Emily Chen"}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">June {10 + item}, 2025</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <div className="flex justify-center mt-8">
              <Button variant="outline">Load More</Button>
            </div>
          </TabsContent>

          <TabsContent value="education" className="space-y-8">
            {/* Education category posts */}
            <div className="text-center py-8">
              <p className="text-muted-foreground">Education category content will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="college" className="space-y-8">
            {/* College category posts */}
            <div className="text-center py-8">
              <p className="text-muted-foreground">College category content will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="career" className="space-y-8">
            {/* Career category posts */}
            <div className="text-center py-8">
              <p className="text-muted-foreground">Career category content will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Newsletter */}
      <section className="py-12 bg-muted rounded-xl p-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold">Subscribe to our newsletter</h2>
            <p className="mt-2 text-muted-foreground">
              Get the latest articles, resources, and educational tips delivered directly to your inbox.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              className="w-full"
            />
            <Button className="w-full sm:w-auto">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  )
} 