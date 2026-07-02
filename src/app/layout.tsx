import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CursorTracker } from "@/components/cursor-tracker";
import { SmoothScroll } from "@/components/smooth-scroll";
import { AuthRecoveryHandler } from "@/components/auth-recovery-handler";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://baserdetailing.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Baser Detailing | Mobile Car Detailing in Melbourne",
    template: "%s | Baser Detailing",
  },
  description:
    "Premium mobile car detailing across metro Melbourne. One detailer, start to finish — showroom-quality interior, exterior and full details at your home or workplace.",
  keywords: [
    "car detailing Melbourne",
    "mobile car detailing",
    "interior detailing",
    "exterior detailing",
    "full detail",
    "paint decontamination",
    "mobile detailer Melbourne",
  ],
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: SITE_URL,
    siteName: "Baser Detailing",
    title: "Baser Detailing | Mobile Car Detailing in Melbourne",
    description:
      "Premium mobile car detailing across metro Melbourne. We come to you — showroom-quality results at your home or workplace.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Baser Detailing — mobile car detailing in Melbourne" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Baser Detailing | Mobile Car Detailing in Melbourne",
    description:
      "Premium mobile car detailing across metro Melbourne. We come to you — showroom-quality results.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Structured data so Google understands this is a local mobile detailing business.
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDetailing",
  name: "Baser Detailing",
  description:
    "Premium mobile car detailing across metro Melbourne. Interior, exterior and full details — one detailer, start to finish.",
  url: SITE_URL,
  telephone: "+61410532042",
  email: "support@baserdetailing.com",
  image: `${SITE_URL}/og.png`,
  priceRange: "$$",
  currenciesAccepted: "AUD",
  paymentAccepted: "Cash, PayID, Card",
  areaServed: { "@type": "City", name: "Melbourne", containedInPlace: { "@type": "State", name: "Victoria" } },
  address: { "@type": "PostalAddress", addressRegion: "VIC", addressCountry: "AU" },
  sameAs: ["https://www.instagram.com/baserdetailing"],
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Interior Detail" }, price: "149", priceCurrency: "AUD" },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Exterior Detail" }, price: "129", priceCurrency: "AUD" },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Full Detail" }, price: "219", priceCurrency: "AUD" },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow the page to extend under the iOS notch / home indicator so our
  // safe-area-inset padding (see globals.css) can position content correctly.
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
      </head>
      <body className="antialiased">
        <SmoothScroll />
        <AuthRecoveryHandler />
<CursorTracker />
        {children}
      </body>
    </html>
  );
}
