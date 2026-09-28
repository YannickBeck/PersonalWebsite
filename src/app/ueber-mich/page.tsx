import { PageHero } from '@/components/page-hero';
import { getDictionary } from '@/i18n/dictionaries';
import type { Metadata } from "next";
const meta = getDictionary('de').pages['ueber-mich'];
export const metadata: Metadata = { title: meta.title, description: meta.lede };


export default function Page() {
  const page = getDictionary('de').pages['ueber-mich'];
  return <PageHero title={page.title} lede={page.lede} />;
}
