import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { AboutContent } from '@/components/pages/about-content';

const meta = getDictionary('en').pages['ueber-mich'];
export const metadata: Metadata = pageMeta({
  lang: 'en',
  path: '/ueber-mich',
  title: meta.title,
  description: meta.lede,
});

const BIO = [
  'I have been building websites and web applications for over ten years — from the first static page to multilingual portals with their own design system.',
  'Technology should disappear into the background: fast pages, understandable copy, barriers removed wherever possible. This website is my showroom and my notebook.',
  'When I am not programming, I read specialist books, maintain my toolbox, or write — for example here on the blog.',
];

const WORKSTYLE = ['Workflow: small steps, visible progress, honest estimates.'];

export default function Page() {
  return <AboutContent lang="en" bio={BIO} workstyle={WORKSTYLE[0]} />;
}
