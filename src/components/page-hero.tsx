import type { ReactNode } from 'react';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';

/**
 * Seitenkopf der Unterseiten: H1 (fließend 31→39px), Lede in Lesebreite.
 * eyebrow: z. B. Zurück-Link auf Detailseiten; meta: Datum/Lesezeit als
 * supporting statt als große Lede (L5/V5).
 */
export function PageHero({
  title,
  lede,
  eyebrow,
  meta,
  display = false,
}: {
  title: string;
  lede?: string;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  display?: boolean;
}) {
  return (
    <Section paddingBlockEnd={0}>
      <VStack gap={4} maxWidth={760}>
        {eyebrow}
        <Heading level={1} type={display ? 'display-2' : undefined} textWrap="balance">
          {title}
        </Heading>
        {lede ? (
          <Text type="large" color="secondary" textWrap="pretty">
            {lede}
          </Text>
        ) : null}
        {meta}
      </VStack>
    </Section>
  );
}
