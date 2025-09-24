import type { Metadata } from "next";
import { Inter, Poppins, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import ConditionalLayout from "@/components/ConditionalLayout";
import DemoModeBanner from "@/components/DemoModeBanner";
import ErrorBoundary from "@/components/ErrorBoundary";
import React from "react";

import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Optimized font loading with next/font (no manual <link> tags)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://biomedsolution.com.np"),
  title: {
    default: "Biomed Solution",
    template: "%s | Biomed Solution",
  },
  description:
    "Biomed Solution provides healthcare trading and services since 2015 under ANIAS.",
  keywords:
    "medical equipment Nepal, healthcare technology, ECG machines, X-ray units, ultrasound scanners, defibrillators, medical devices Kathmandu, hospital equipment, Biomed Solution, Maitighar",
  authors: [{ name: "Biomed Solution" }],
  creator: "Biomed Solution",
  publisher: "Biomed Solution",
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/assets/images/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/images/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/assets/images/logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://biomedsolution.com.np",
    title: "Biomed Solution",
    description:
      "Nepal's premier provider of advanced medical equipment and healthcare technology solutions. Professional medical devices for hospitals and clinics.",
    siteName: "Biomed Solution",
    images: [
      {
        url: "/assets/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Biomed Solution",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Biomed Solution",
    description:
      "Nepal's premier provider of advanced medical equipment and healthcare technology solutions.",
    creator: "@biomedsolution",
    images: ["/assets/images/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/logo.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/assets/images/logo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/assets/images/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/logo.png" />
        <meta name="theme-color" content="#0ea5e9" />

        {/* Preconnect for critical external domains (keep non-font domains if needed) */}
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link
          rel="preconnect"
          href="https://maps.googleapis.com"
          crossOrigin="anonymous"
        />

        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Biomed Solution",
              url: "https://biomedsolution.com.np",
              logo: {
                "@type": "ImageObject",
                url: "https://biomedsolution.com.np/assets/images/logo.png",
                width: 512,
                height: 512,
              },
              image: {
                "@type": "ImageObject",
                url: "https://biomedsolution.com.np/assets/images/logo.png",
                width: 1200,
                height: 630,
              },
              sameAs: [
                "https://www.facebook.com/biomedsolution",
                "https://www.linkedin.com/company/biomed-solution"
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${spaceGrotesk.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        <ErrorBoundary>
          <Providers>
            <DemoModeBanner />
            <ConditionalLayout>{children}</ConditionalLayout>
            {/* Titles and icons are handled via Next.js Metadata API per route */}
          </Providers>
          {/* Mount client-side dynamic head updater */}
          {/* eslint-disable-next-line @next/next/no-head-element */}

          <Analytics />
          <SpeedInsights />
        </ErrorBoundary>
      </body>
    </html>
  );
}
