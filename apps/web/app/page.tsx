import {
  CTA,
  Features,
  Footer,
  Hero,
  HowItWorks,
  Navbar,
} from "@/components/landing";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  );
}
