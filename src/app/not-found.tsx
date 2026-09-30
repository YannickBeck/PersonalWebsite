import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Button } from '@astryxdesign/core/Button';
import { getDictionary } from '@/i18n/dictionaries';

/**
 * Sprachneutrale 404-Seite (DE+EN): hilft in beiden Sprachen weiter.
 * Fehlende Übersetzungen verlinken hierher nie direkt — der Sprachwechsel
 * fällt auf die anderssprachige Startseite zurück (siehe switchTarget).
 */
export default function NotFound() {
  const de = getDictionary('de');
  const en = getDictionary('en');
  return (
    <>
      <PageHero title={de.notFoundTitle} lede={de.notFoundText} />
      <Section>
        <VStack gap={3}>
          <Button label={de.notFoundHome} variant="primary" href="/" />
          <Button label={en.notFoundHome} variant="secondary" href="/en" />
        </VStack>
      </Section>
    </>
  );
}
