import { Hero } from '@/components/home/Hero';
import { StoryScroll } from '@/components/home/StoryScroll';
import { Bento } from '@/components/home/Bento';
import { CompareToggle } from '@/components/home/CompareToggle';
import { BigNumbers } from '@/components/home/BigNumbers';
import { TrustBadges } from '@/components/home/TrustBadges';
import { FinalCTA } from '@/components/home/FinalCTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <StoryScroll />
      <Bento />
      <CompareToggle />
      <BigNumbers />
      <TrustBadges />
      <FinalCTA />
    </>
  );
}
