import AboutHero from "@/components/AboutHero";
import CompanyStory from "@/components/CompanyStory";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <AboutHero />
      <CompanyStory />
    </div>
  );
}
