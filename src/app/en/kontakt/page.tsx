import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { Button } from '@astryxdesign/core/Button';
import { getDictionary } from '@/i18n/dictionaries';

export default function Page() {
  const page = getDictionary('en').pages.kontakt;
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section variant="muted">
        <Button label={page.cta} variant="primary" href="/newsletter" />
      </Section>
    </>
  );
}
