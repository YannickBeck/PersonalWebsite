import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { HomeContent } from '@/components/home/home-content';

export default function EnglishHome() {
  return <HomeContent lang="en" />;
}

// title absolute (FUN10): sonst ergänzt das Root-Template „%s · Yannick Beck“ den Namen doppelt
export const metadata: Metadata = {
  ...pageMeta({
    lang: 'en',
    path: '/',
    title: 'Yannick Beck – IT Consultant',
    description:
      'Yannick Beck, IT consultant from Sandhausen, Germany: Microsoft Cloud & AI, Modern Workplace, identity & security. Career, projects and contact.',
    type: 'profile',
  }),
  title: { absolute: 'Yannick Beck – IT Consultant' },
};
