import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Inter } from "next/font/google"
import { PromoPlacement } from "@prisma/client"
import "./globals.css"
import NewsletterPopup from "@/components/newsletter-popup"
import StaticFooter from "@/components/layout/static-footer"
import { PromoBar, PromoCardGrid } from "@/components/layout/promo-sections"
import { getActivePromoSections, groupPromosByPlacement } from "@/lib/promos"

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
  const promoSections = await getActivePromoSections()
  const groupedPromos = groupPromosByPlacement(promoSections)

  const topPromo = groupedPromos[PromoPlacement.TOP_BAR][0] ?? null
  const bottomPromo = groupedPromos[PromoPlacement.BOTTOM_BAR][0] ?? null
  const preFooterPromos = groupedPromos[PromoPlacement.PRE_FOOTER_CARD]

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
      <body className="antialiased">
        {topPromo ? <PromoBar promo={topPromo} position="top" /> : null}
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
          <PromoCardGrid promos={preFooterPromos} />
          {bottomPromo ? <PromoBar promo={bottomPromo} position="bottom" /> : null}
          <StaticFooter />
        </div>
        <NewsletterPopup />
      </body>
    </html>
  )
}
