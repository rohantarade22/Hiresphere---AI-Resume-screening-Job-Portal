import Hero from "../../components/landing/Hero";
import TrustedBy from "../../components/landing/TrustedBy";
import Stats from "../../components/landing/Stats";
import Features from "../../components/landing/Features";
import HowItWorks from "../../components/landing/HowItWorks";
import Testimonials from "../../components/landing/Testimonials";
import Pricing from "../../components/landing/Pricing";
import FAQ from "../../components/landing/FAQ";
import Newsletter from "../../components/landing/Newsletter";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Newsletter />
    </>
  );
}
