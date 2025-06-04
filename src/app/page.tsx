// src/app/page.tsx
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import DisclaimerBanner from "@/components/landing/DisclaimerBanner";
// import TestimonialsSection from "@/components/landing/TestimonialsSection"; // Placeholder
// import CallToActionSection from "@/components/landing/CallToActionSection"; // Placeholder

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
      <DisclaimerBanner />
    </div>
  );
}

