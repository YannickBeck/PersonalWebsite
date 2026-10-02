import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Link } from '@astryxdesign/core/Link';
import { PAGE_TOP } from '@/components/page-hero';
import { getDictionary } from '@/i18n/dictionaries';

/**
 * Sprachneutrale 404-Seite, vollständig serverseitig gerendert (Top-Level-404). Deutsch als
 * Hauptsprache; Englisch als EINE ruhige Zeile mit Link (VIS19) statt zweiter Überschrift
 * und zweitem Button-Set, ausgezeichnet mit lang="en" (A120).
 * Der Sprachwechsel im Header führt hier auf die anderssprachige Startseite (switchTarget, T6).
 */
export default function NotFound() {
  const de = getDictionary('de');
  const en = getDictionary('en');
  return (
    <Section className={PAGE_TOP}>
      <VStack gap={8} maxWidth={640}>
        <VStack gap={4}>
          <Text type="code" color="accent" weight="semibold">
            404
          </Text>
          <Heading level={1} textWrap="balance">
            {de.notFoundTitle}
          </Heading>
          <Text type="large" color="secondary" textWrap="pretty">
            {de.notFoundText}
          </Text>
        </VStack>
        <HStack gap={3} wrap="wrap">
          <Button label={de.notFoundHome} variant="primary" size="lg" href="/" />
          <Button label={de.pages.projekte.title} variant="secondary" size="lg" href="/projekte" />
          <Button label={de.pages.blog.title} variant="secondary" size="lg" href="/blog" />
        </HStack>
        {/* lang am <span>: Astryx-Text reicht lang nicht durch (BaseProps) */}
        <Text as="p" color="secondary">
          <span lang="en">
            {en.notFoundTitle} —{' '}
            <Link href="/en" hasUnderline color="primary">
              {en.otherLangHome}
            </Link>
          </span>
        </Text>
      </VStack>
    </Section>
  );
}
