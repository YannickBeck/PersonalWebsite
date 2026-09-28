import { PageHero } from '@/components/page-hero';
import { getDictionary } from '@/i18n/dictionaries';

export default function Page() {
  const page = getDictionary('en').pages.uses;
  return <PageHero title={page.title} lede={page.lede} />;
}
