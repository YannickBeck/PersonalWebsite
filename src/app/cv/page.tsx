import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { getDictionary } from '@/i18n/dictionaries';
import type { Metadata } from "next";
const meta = getDictionary('de').pages.cv;
export const metadata: Metadata = { title: meta.title, description: meta.lede };


export default function Page() {
  const page = getDictionary('de').pages.cv;
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section variant="muted">
        <Card variant="muted">
          <Text>{page.placeholder}</Text>
        </Card>
      </Section>
    </>
  );
}
