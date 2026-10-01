import type { Metadata } from 'next';
import { ContentStatusContent } from '@/components/pages/content-status-content';

export const metadata: Metadata = { robots: { index: false } };

export default function Page() {
  return <ContentStatusContent lang="en" />;
}
