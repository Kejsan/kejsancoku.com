"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface NewsletterSignupProps {
  variant?: "default" | "compact" | "sidebar" | "popup"
  title?: string
  description?: string
  placeholder?: string
  className?: string
  showNameFields?: boolean
}

export default function NewsletterSignup({
  variant = "default",
  title,
  description,
  placeholder = "Enter your email address",
  className = "",
  showNameFields = false,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setStatus("error")
      setMessage("Please enter a valid email address")
      return
    }

    setStatus("loading")

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message)
        setEmail("")
        setFirstName("")
        setLastName("")

        // Track successful subscription (Google Analytics, etc.)
        if (typeof window !== "undefined" && (window as any).gtag) {
          ;(window as any).gtag("event", "newsletter_signup", {
            event_category: "engagement",
            event_label: "blog_newsletter",
            value: 1,
          })
        }
      } else {
        setStatus("error")
        setMessage(data.message || "Something went wrong. Please try again.")
      }
    } catch (error) {
      console.error("Subscription error:", error)
      setStatus("error")
      setMessage("Network error. Please check your connection and try again.")
    }
  }

  const defaultTitle = "Get SEO & Marketing Insights"
  const defaultDescription = "Join 3200+ marketers getting weekly actionable strategies"

  if (variant === "compact") {
    return (
      <div className={`bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-5 h-5 text-[#fb6163]" />
          <h3 className="text-white font-semibold">{title || "Newsletter"}</h3>
        </div>
        <p className="text-white/70 text-sm mb-4">{description || "Get weekly SEO tips and insights"}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {showNameFields && (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:border-[#fb6163] text-sm"
                disabled={status === "loading"}
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:border-[#fb6163] text-sm"
                disabled={status === "loading"}
              />
            </div>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:border-[#fb6163] text-sm"
            disabled={status === "loading"}
            required
          />
          <Button
            type="submit"
            size="sm"
            className="w-full bg-[#fb6163] hover:bg-[#fb6163]/90 disabled:opacity-50"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              "Subscribe"
            )}
          </Button>
        </form>
        {status === "success" && (
          <div className="flex items-center gap-2 mt-3 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            {message}
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {message}
          </div>
        )}
      </div>
    )
  }

  if (variant === "sidebar") {
    return (
      <Card className={`bg-white/5 border-white/10 backdrop-blur-sm ${className}`}>
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#fb6163] to-[#000080] rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title || defaultTitle}</h3>
            <p className="text-white/70 text-sm">{description || defaultDescription}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {showNameFields && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fb6163]"
                  disabled={status === "loading"}
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fb6163]"
                  disabled={status === "loading"}
                />
              </div>
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fb6163]"
              disabled={status === "loading"}
              required
            />
            <Button
              type="submit"
              className="w-full bg-[#fb6163] hover:bg-[#fb6163]/90 disabled:opacity-50"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                "Subscribe Now"
              )}
            </Button>
          </form>
          <p className="text-white/60 text-xs mt-3 text-center">✓ Weekly insights ✓ No spam ✓ Unsubscribe anytime</p>
          {status === "success" && (
            <div className="flex items-center gap-2 mt-4 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              {message}
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 mt-4 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <div className={`text-center ${className}`}>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title || defaultTitle}</h2>
      <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
        {description ||
          "Join 3200+ marketers who get actionable SEO strategies, content marketing tips, and growth insights delivered weekly. No spam, just valuable content that helps you scale your digital presence."}
      </p>
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit}>
          {showNameFields && (
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fb6163] focus:bg-white/15"
                disabled={status === "loading"}
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fb6163] focus:bg-white/15"
                disabled={status === "loading"}
              />
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fb6163] focus:bg-white/15"
              disabled={status === "loading"}
              required
            />
            <Button
              type="submit"
              className="bg-[#fb6163] hover:bg-[#fb6163]/90 text-white px-6 py-3 whitespace-nowrap disabled:opacity-50"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                "Subscribe Now"
              )}
            </Button>
          </div>
        </form>
        <p className="text-white/60 text-sm">✓ Weekly insights ✓ No spam ✓ Unsubscribe anytime</p>
        {status === "success" && (
          <div className="flex items-center justify-center gap-2 mt-4 text-green-400">
            <CheckCircle className="w-5 h-5" />
            {message}
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center justify-center gap-2 mt-4 text-red-400">
            <AlertCircle className="w-5 h-5" />
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
