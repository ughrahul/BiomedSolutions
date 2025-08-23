import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import ConditionalLayout from "@/components/ConditionalLayout";
import DemoModeBanner from "@/components/DemoModeBanner";
import React from "react";
import { suppressMapsErrors } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://biomedsolutions.com.np"),
  title: "Biomed Solutions",
  description:
    "Biomed Solutions is Nepal's premier provider of advanced medical equipment and healthcare technology solutions. We supply, maintain, and support medical devices from globally recognized brands for hospitals and clinics in Maitighar, Kathmandu.",
  keywords:
    "medical equipment Nepal, healthcare technology, ECG machines, X-ray units, ultrasound scanners, defibrillators, medical devices Kathmandu, hospital equipment, Biomed Solutions, Maitighar",
  authors: [{ name: "Biomed Solutions" }],
  creator: "Biomed Solutions",
  publisher: "Biomed Solutions",
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
    url: "https://biomedsolutions.com.np",
    title: "Biomed Solutions",
    description:
      "Nepal's premier provider of advanced medical equipment and healthcare technology solutions. Professional medical devices for hospitals and clinics.",
    siteName: "Biomed Solutions",
    images: [
      {
        url: "/assets/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Biomed Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Biomed Solutions",
    description:
      "Nepal's premier provider of advanced medical equipment and healthcare technology solutions.",
    creator: "@biomedsolutions",
    images: ["/assets/images/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Suppress console errors for browser extensions and development tools
  if (typeof window !== 'undefined') {
    suppressMapsErrors();
  }
  
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <Providers>
          <DemoModeBanner />
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
