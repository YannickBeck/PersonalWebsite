import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { PageHero } from '@/components/page-hero';
import { NewsletterForm } from '@/components/newsletter-form';
import { getDictionary, type Lang } from '@/i18n/dictionaries';

/** Newsletter (L8, M1/T3): schmales Formular (≤ 640px), kein seitlicher Überlauf. */
export function NewsletterContent({ lang }: { lang: Lang }) {
  const page = getDictionary(lang).pages.newsletter;
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section>
        <VStack maxWidth={640}>
          <NewsletterForm lang={lang} />
        </VStack>
      </Section>
    </>
  );
}
