"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function TempShareViewsPage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Temporary Share Views</h1>
      <p className="text-muted-foreground mb-8">
        These links allow you to preview how shared content will appear to others.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shared College Application</CardTitle>
            <CardDescription>Preview how your college application will appear when shared with others.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/share/college-application/demo-id">View Shared College Application</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shared College Profile</CardTitle>
            <CardDescription>
              Preview how a specific college profile will appear when shared with others.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/share/college/stanford/demo-id">View Shared College Profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shared Portfolio</CardTitle>
            <CardDescription>Preview how your portfolio will appear when shared with others.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/share/portfolio/demo-id">View Shared Portfolio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
