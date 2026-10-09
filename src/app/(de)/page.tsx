import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { HomeContent } from '@/components/home/home-content';

export const metadata: Metadata = {
  ...pageMeta({
    lang: 'de',
    path: '/',
    title: 'Yannick Beck – IT Consultant',
    description:
      'Yannick Beck, IT Consultant in Sandhausen (Baden-Württemberg): Microsoft Cloud & AI, Modern Workplace, Identity & Security. Werdegang, Projekte und Kontakt.',
    type: 'profile',
  }),
  // absolute (FUN10): sonst ergänzt das Template „%s · Yannick Beck“ den Namen doppelt
  title: { absolute: 'Yannick Beck – IT Consultant' },
};

export default function Home() {
  return <HomeContent lang="de" />;
}
