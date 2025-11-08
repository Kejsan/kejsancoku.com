import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Inter } from "next/font/google"
import "./globals.css"
import NewsletterPopup from "@/components/newsletter-popup"
import FooterSection from "@/components/sections/footer-section"
import prisma from "@/lib/prisma"
import { Prisma, type SiteSettings, type WebApp } from "@prisma/client"

const inter = Inter({ subsets: ["latin"] })

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Kejsan - Digital Marketing Specialist",
  description:
    "Digital Marketing Specialist specializing in SEO, content marketing, and growth strategies for tech companies and e-commerce brands.",
  generator: "v0.app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let settings: SiteSettings | null = null
  let apps: WebApp[] = []

  const [settingsResult, appsResult] = await Promise.allSettled([
    prisma.siteSettings.findFirst(),
    prisma.webApp.findMany(),
  ])

  if (settingsResult.status === "fulfilled") {
    settings = settingsResult.value
  } else if (
    !(
      settingsResult.reason instanceof Prisma.PrismaClientKnownRequestError &&
      settingsResult.reason.code === "P2021"
    )
  ) {
    throw settingsResult.reason
  }

  if (appsResult.status === "fulfilled") {
    apps = appsResult.value
  } else if (
    !(
      appsResult.reason instanceof Prisma.PrismaClientKnownRequestError &&
      appsResult.reason.code === "P2021"
    )
  ) {
    throw appsResult.reason
  }

  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta
          name="google-site-verification"
          content="KC6PoqVYWiXEM8dXU1tvOKZGJJ6_54HgawfPrcagADE"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MJFZL8BLMB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-MJFZL8BLMB');
          `}
        </Script>
      </head>
      <body>
        {children}
        <FooterSection settings={settings} apps={apps} />
        <NewsletterPopup />
      </body>
    </html>
  )
}
