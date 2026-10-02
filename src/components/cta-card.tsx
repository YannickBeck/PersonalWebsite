import { Section } from '@astryxdesign/core/Section';
import { Card } from '@astryxdesign/core/Card';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { ArrowRight } from '@/components/icons';

/** Ruhiger Abschluss mit einer Hauptaktion (Kontakt), gleich auf Startseite und Unterseiten. */
export function CtaCard({
  title,
  text,
  label,
  href,
}: {
  title: string;
  text: string;
  label: string;
  href: string;
}) {
  return (
    <Section>
      <Card variant="muted" padding={8} className="yb-reveal">
        <HStack gap={6} wrap="wrap" vAlign="center" justify="between">
          <VStack gap={2} maxWidth={560}>
            <Heading level={2}>{title}</Heading>
            <Text color="secondary">{text}</Text>
          </VStack>
          <Button
            label={label}
            variant="primary"
            size="lg"
            href={href}
            endContent={<ArrowRight />}
          />
        </HStack>
      </Card>
    </Section>
  );
}
