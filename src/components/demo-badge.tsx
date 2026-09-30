'use client';

import { HStack } from '@astryxdesign/core/HStack';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Text } from '@astryxdesign/core/Text';
import { getDictionary, type Lang } from '@/i18n/dictionaries';

/** Kennzeichnet ausdrücklich fiktive Demonstrationsinhalte. */
export function DemoBadge({ lang }: { lang: Lang }) {
  const label = getDictionary(lang).demoBadge;
  return (
    <HStack gap={1}>
      <StatusDot variant="warning" label={label} />
      <Text type="label" color="secondary">
        {label}
      </Text>
    </HStack>
  );
}
