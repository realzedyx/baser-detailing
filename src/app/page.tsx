"use client";

import { useEffect, useState } from "react";
import { Home as HomeIcon, Sparkles, Wrench, Phone } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { CinematicHero } from "@/components/ui/cinematic-hero";
import { supabase } from "@/lib/supabase";
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
  { name: "Levels", url: "#packages", icon: Wrench },
  { name: "Contact", url: "#contact", icon: Phone },
];

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsSignedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsSignedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

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
        ctaHref={isSignedIn ? "/account" : "/signup"}
        ctaLabel={isSignedIn ? "My Account" : "Create Account"}
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
