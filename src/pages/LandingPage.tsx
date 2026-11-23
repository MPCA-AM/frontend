import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import MapPreviewSection from '@/components/landing/MapPreviewSection';
import AboutSection from '@/components/landing/AboutSection';
import RolesSection from '@/components/landing/RolesSection';
import GallerySection from '@/components/landing/GallerySection';
import CtaSection from '@/components/landing/CtaSection';
import FooterSection from '@/components/landing/FooterSection';

export { default as MadagascarMap } from '@/components/landing/MadagascarMap';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#070f1f] text-gray-900 dark:text-white overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <MapPreviewSection />
      <AboutSection />
      <RolesSection />
      <GallerySection />
      <CtaSection />
      <FooterSection />
    </div>
  );
}
