import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { getDictionary } from '@/i18n/dictionaries';

export default function Page() {
  const page = getDictionary('en').pages.leistungen;
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section variant="muted">
        <VStack gap={3}>
          {page.items.map((item) => (
            <Card key={item}>
              <Heading level={2}>{item}</Heading>
            </Card>
          ))}
        </VStack>
      </Section>
    </>
  );
}
