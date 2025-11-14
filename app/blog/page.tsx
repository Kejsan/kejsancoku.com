"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Post } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Calendar } from "lucide-react"
import NewsletterSignup from "@/components/newsletter-signup"
import Image from "next/image"
import PageLayout from "@/components/layout/page-layout"
import PageHero from "@/components/sections/page-hero"

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch posts:", err)
        setLoading(false)
      })
  }, [])

  return (
    <PageLayout>
      <PageHero
        title="SEO & Marketing Insights"
        description="Real-world strategies, case studies, and lessons learned from scaling digital presence for tech companies and e-commerce brands."
        actions={
          <div className="flex w-full justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full rounded-xl border border-border bg-background/80 px-10 py-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        }
      />

      <section className="px-4">
        <div className="mx-auto max-w-4xl">
          <NewsletterSignup
            title="Never Miss an SEO Insight"
            description="Get my latest strategies, case studies, and actionable tips delivered to your inbox. Join the 3200+ marketers who trust my insights to grow their digital presence."
          />
        </div>
      </section>

      <section className="px-4 pb-20 pt-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">All Articles</h2>
          <div className="mt-10">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading posts...</p>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`}>
                    <Card className="group flex h-full flex-col overflow-hidden border border-border/70 bg-card/90 shadow-sm transition-colors hover:border-primary/50">
                      <div className="aspect-video overflow-hidden">
                        <Image
                          src={post.featuredBanner || "/placeholder.svg"}
                          alt={post.title}
                          width={1200}
                          height={675}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <CardContent className="flex flex-1 flex-col p-6">
                        <h3 className="line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                          {post.title}
                        </h3>
                        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{post.metaDescription}</p>
                        <div className="mt-auto flex items-center justify-between pt-6 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString()}
                          </div>
                          <span className="font-medium text-primary transition-colors group-hover:text-primary/80">Read →</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
