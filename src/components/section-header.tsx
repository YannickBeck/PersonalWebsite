import type { ReactNode } from 'react';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';

/**
 * Einheitlicher Kopf jeder Inhalts-Section (LV3): H2 + optionale Lede links,
 * Weiterführung (z. B. „Alle Projekte“) rechts; bricht auf schmalen Breiten um.
 */
export function SectionHeader({
  title,
  lede,
  action,
  id,
}: {
  title: string;
  lede?: string;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <HStack gap={4} wrap="wrap" vAlign="end" justify="between">
      <VStack gap={2} maxWidth={640}>
        <Heading level={2} id={id} textWrap="balance">
          {title}
        </Heading>
        {lede ? (
          <Text color="secondary" textWrap="pretty">
            {lede}
          </Text>
        ) : null}
      </VStack>
      {action}
    </HStack>
  );
}
