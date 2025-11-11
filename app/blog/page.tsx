"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Post } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Clock, Calendar } from "lucide-react"
import NewsletterSignup from "@/components/newsletter-signup"
import Image from "next/image"

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#000080] to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-white font-bold text-xl">
              Kejsan
            </Link>
            <Link href="/" className="text-white/80 hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-20">
        {/* Header */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center blog-header">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">SEO & Marketing Insights</h1>
            <p className="text-xl text-white/80 mb-8">
              Real-world strategies, case studies, and lessons learned from scaling digital presence for tech companies
              and e-commerce brands.
            </p>
            <div className="flex justify-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#54a09b] w-80"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="px-4 mb-16">
          <div className="max-w-4xl mx-auto">
            <NewsletterSignup
              title="Never Miss an SEO Insight"
              description="Get my latest strategies, case studies, and actionable tips delivered to your inbox. Join the 3200+ marketers who trust my insights to grow their digital presence."
            />
          </div>
        </section>

        {/* All Posts */}
        <section className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">All Articles</h2>
            {loading ? (
              <p className="text-white">Loading posts...</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`}>
                    <Card className="blog-post-card bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer h-full flex flex-col">
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <Image
                          src={post.featuredBanner || "/placeholder.svg"}
                          alt={post.title}
                          width={1200}
                          height={675}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-6 flex flex-col flex-grow">
                        <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 flex-grow">{post.title}</h3>
                        <p className="text-white/70 text-sm mb-4 line-clamp-3">{post.metaDescription}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1 text-white/60 text-xs">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-[#54a09b] hover:text-[#54a09b]/80 text-xs font-semibold">
                            Read →
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
