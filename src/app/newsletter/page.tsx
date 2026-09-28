import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { Button } from '@astryxdesign/core/Button';
import { getDictionary } from '@/i18n/dictionaries';
import type { Metadata } from "next";

const meta = getDictionary('de').pages.newsletter;
export const metadata: Metadata = { title: meta.title, description: meta.lede };

export default function Page() {
  const page = getDictionary('de').pages.newsletter;
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section variant="muted">
        <span data-portal="signup">
          <Button label="Newsletter abonnieren" variant="primary" />
        </span>
      </Section>
    </>
  );
}
