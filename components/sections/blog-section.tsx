"use client"

import { forwardRef, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Post } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const BlogSection = forwardRef<HTMLDivElement>(function BlogSection(_, ref) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function loadPosts() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/posts", { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`Failed to load posts: ${response.statusText}`)
        }

        const data: Post[] = await response.json()
        if (!isMounted) {
          return
        }

        const now = new Date()
        const filteredPosts = data.filter((post) => {
          if (post.status !== "PUBLISHED") {
            return false
          }

          if (!post.publishedAt) {
            return true
          }

          const publishedAt = new Date(post.publishedAt)
          return publishedAt <= now
        })

        setPosts(filteredPosts)
      } catch (err) {
        if (!isMounted) {
          return
        }

        if (err instanceof Error && err.name === "AbortError") {
          return
        }

        console.error("Unable to load blog posts", err)
        setError("We're unable to load blog posts right now. Please try again later.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadPosts()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  const displayedPosts = posts.slice(0, 3)

  return (
    <section id="blog" ref={ref} className="blog-section py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-16">Latest Insights</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {isLoading ? (
            <Card className="blog-card bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="h-48 w-full rounded-lg bg-white/10 animate-pulse mb-6" />
                <div className="space-y-3">
                  <div className="h-4 bg-white/10 rounded w-1/3 animate-pulse" />
                  <div className="h-6 bg-white/10 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                  <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="blog-card bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-white mb-3">Latest insights unavailable</h3>
                <p className="text-white/70 mb-4">{error}</p>
                <Button asChild size="sm" variant="ghost" className="text-[#fb6163] hover:text-[#fb6163]/80">
                  <Link href="/blog">Visit the blog</Link>
                </Button>
              </CardContent>
            </Card>
          ) : displayedPosts.length > 0 ? (
            displayedPosts.map((post) => {
              const publishedDate = new Date(post.publishedAt ?? post.createdAt)

              return (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <Card className="blog-card bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <Image
                        src={post.featuredBanner || "/placeholder.svg"}
                        alt={post.title}
                        width={1200}
                        height={675}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[#fb6163] text-sm">Article</span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/60 text-sm">{publishedDate.toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2">{post.title}</h3>
                      <p className="text-white/70 mb-4 line-clamp-3">{post.metaDescription ?? "Read the latest insights and strategies."}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Published {publishedDate.toLocaleDateString()}</span>
                        <Button size="sm" variant="ghost" className="text-[#fb6163] hover:text-[#fb6163]/80">
                          Read More →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          ) : (
            <Card className="blog-card bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-white mb-3">No articles published yet</h3>
                <p className="text-white/70 mb-4">
                  Check back soon for fresh insights on technical SEO, content strategy, and growth marketing.
                </p>
                <Button asChild size="sm" variant="ghost" className="text-[#fb6163] hover:text-[#fb6163]/80">
                  <Link href="/blog">Browse all articles</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="text-center">
          <Link href="/blog">
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              View All Articles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
})

export default BlogSection
