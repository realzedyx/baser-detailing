import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CursorTracker } from "@/components/cursor-tracker";
import { SmoothScroll } from "@/components/smooth-scroll";

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

export const metadata: Metadata = {
  title: "Baser Detailing | Mobile Car Detailing in Melbourne",
  description:
    "Premium mobile car detailing in Melbourne. We come to you. Showroom-quality results at your home or workplace.",
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SmoothScroll />
<CursorTracker />
        {children}
      </body>
    </html>
  );
}
