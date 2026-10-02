import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { HomeContent } from '@/app/page';

export default function EnglishHome() {
  return <HomeContent lang="en" />;
}

// title absolute (FUN10): sonst ergänzt das Root-Template „%s · Yannick Beck“ den Namen doppelt
export const metadata: Metadata = {
  ...pageMeta({
    lang: 'en',
    path: '/',
    title: 'Yannick Beck',
    description: 'Personal website by Yannick Beck — projects, blog and contact.',
  }),
  title: { absolute: 'Yannick Beck' },
};
