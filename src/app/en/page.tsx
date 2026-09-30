import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { HomeContent } from '@/app/page';

export default function EnglishHome() {
  return <HomeContent lang="en" />;
}

export const metadata: Metadata = pageMeta({
  lang: 'en',
  path: '/',
  title: 'Yannick Beck',
  description: 'Personal website by Yannick Beck — projects, blog and contact.',
});
