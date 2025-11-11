"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, Share2, Linkedin, Twitter } from "lucide-react"
import Link from "next/link"
import NewsletterSignup from "@/components/newsletter-signup"
import Image from "next/image"
import { Post } from "@prisma/client"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"

export default function BlogPostClient({ post }: { post: Post | null }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [shareHref, setShareHref] = useState<string | null>(null)

  useEffect(() => {
    if (post) {
      // Load anime.js dynamically
      const loadAnime = async () => {
        try {
          const anime = (await import("animejs")).default as any

          anime({
            targets: ".blog-post-header",
            translateY: [50, 0],
            opacity: [0, 1],
            duration: 800,
            easing: "easeOutExpo",
          })

          anime({
            targets: ".blog-post-content",
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 600,
            delay: 200,
            easing: "easeOutExpo",
          })
        } catch (error) {
          console.log("Anime.js not available, using CSS animations as fallback")
        }
      }
      loadAnime()
    }
  }, [post])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareHref(window.location.href)
    }
  }, [])

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#000080] to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <Link href="/blog">
            <Button className="bg-[#54a09b] hover:bg-[#000080]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    image: post.featuredBanner || "",
    author: {
      "@type": "Person",
      name: "Kejsan",
    },
    publisher: {
      "@type": "Organization",
      name: "Kejsan",
      logo: {
        "@type": "ImageObject",
        url: "/placeholder-logo.svg",
      },
    },
    datePublished: new Date(post.publishedAt ?? post.createdAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
  };

  const shareText = post?.title || "Check out this article from Kejsan"
  const linkedinShare = shareHref
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareHref)}`
    : null
  const xShare = shareHref
    ? `https://x.com/intent/tweet?url=${encodeURIComponent(shareHref)}&text=${encodeURIComponent(shareText)}`
    : null

  const handleShare = () => {
    if (!shareHref) {
      return
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({ title: shareText, url: shareHref })
      return
    }
    if (xShare) {
      window.open(xShare, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#000080] to-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        key="post-jsonld"
      />
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-white font-bold text-xl">
              Kejsan
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/blog" className="text-white/80 hover:text-white transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>
              <Button
                size="sm"
                variant="ghost"
                className="text-white/80 hover:text-white"
                onClick={handleShare}
                aria-label="Share this article"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20">
        {/* Header */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto blog-post-header">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">{post.title}</h1>
              <p className="text-xl text-white/80 mb-8">{post.metaDescription}</p>
              <div className="flex items-center gap-6 text-white/60">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="aspect-video overflow-hidden rounded-lg mb-8">
              <Image
                src={post.featuredBanner || "/placeholder.svg"}
                alt={post.title}
                width={1200}
                height={675}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between py-4 border-y border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#54a09b] to-[#000080] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">K</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Kejsan</div>
                  <div className="text-white/60 text-sm">Digital Marketing Specialist</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {linkedinShare && (
                  <Button asChild size="sm" variant="ghost" className="text-white/80 hover:text-white">
                    <a href={linkedinShare} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {xShare && (
                  <Button asChild size="sm" variant="ghost" className="text-white/80 hover:text-white">
                    <a href={xShare} target="_blank" rel="noopener noreferrer" aria-label="Share on X">
                      <Twitter className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <div
              ref={contentRef}
              className="blog-post-content prose prose-lg prose-invert max-w-none"
              style={{
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {post.content || ""}
              </ReactMarkdown>
            </div>

            {/* Newsletter Signup */}
            <section className="px-4 py-12 border-t border-white/10 mt-12">
              <div className="max-w-4xl mx-auto">
                <NewsletterSignup
                  variant="sidebar"
                  title="Enjoyed this article?"
                  description="Get more insights like this delivered weekly. Join 3200+ marketers growing their digital presence."
                  className="max-w-md mx-auto"
                />
              </div>
            </section>

            {/* Related Articles Teaser */}
            <section className="px-4 pb-8">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-white mb-4">More SEO & Marketing Insights</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="text-white/70">
                      <h4 className="font-semibold text-white mb-2">📈 E-commerce SEO Guide</h4>
                      <p className="text-sm">How I optimized 3000+ category pages for maximum conversions</p>
                    </div>
                    <div className="text-white/70">
                      <h4 className="font-semibold text-white mb-2">🎙️ Podcast Marketing Strategy</h4>
                      <p className="text-sm">Complete guide to podcast SEO and multi-platform distribution</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href="/blog">
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                      >
                        View All Articles →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  )
}
