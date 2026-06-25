"use client";

import { Home as HomeIcon, Sparkles, Wrench, Phone } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { CinematicHero } from "@/components/ui/cinematic-hero";
import { WhyBaserSection } from "@/components/ui/why-baser";
import { BookingSection } from "@/components/ui/booking-section";
import { HowItWorksSection } from "@/components/ui/how-it-works";
import { PricingSection } from "@/components/ui/pricing-section";
import { BeforeAfterSection } from "@/components/ui/before-after-slider";
import { GoodToKnowSection } from "@/components/ui/good-to-know";
import { TestimonialsSection } from "@/components/ui/testimonials-section";
import { SectionNav } from "@/components/ui/section-nav";

const navItems = [
  { name: "Home", url: "#", icon: HomeIcon },
  { name: "Services", url: "#services", icon: Sparkles },
  { name: "Packages", url: "#packages", icon: Wrench },
  { name: "Contact", url: "#contact", icon: Phone },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <SectionNav />
      <NavBar items={navItems} />

      {/* PLACEHOLDER COPY — swap in real Baser Detailing wording later */}
      <CinematicHero
        brandName="Baser Detailing"
        tagline1="Showroom finish,"
        tagline2="in your driveway"
        cardHeading="Earn rewards with our loyalty program"
        cardDescription="Every detail earns you points. Redeem them for discounts on your next booking."
        metricValue={357}
        metricLabel="Your Rewards"
      />

      <div style={{ marginTop: "-100vh" }}>
        <WhyBaserSection />
      </div>
      <HowItWorksSection />
      <PricingSection />
      <BeforeAfterSection />
      <GoodToKnowSection />
      <TestimonialsSection />
      <BookingSection />
    </main>
  );
}
