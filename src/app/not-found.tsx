import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { getDictionary } from '@/i18n/dictionaries';

/**
 * Sprachneutrale 404-Seite (DE+EN), vollständig serverseitig gerendert (Top-Level-404).
 * Der Sprachwechsel im Header führt hier auf die anderssprachige Startseite, nicht auf
 * eine weitere 404 (switchTarget, T6).
 */
export default function NotFound() {
  const de = getDictionary('de');
  const en = getDictionary('en');
  return (
    <Section>
      <VStack gap={8} maxWidth={680}>
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
        <VStack gap={3}>
          <Heading level={2}>{en.notFoundTitle}</Heading>
          <Text color="secondary">{en.notFoundText}</Text>
          <HStack gap={3} wrap="wrap">
            <Button label={en.notFoundHome} variant="secondary" href="/en" />
          </HStack>
        </VStack>
      </VStack>
    </Section>
  );
}
