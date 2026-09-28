'use client';

import { usePathname } from 'next/navigation';
import { Section } from '@astryxdesign/core/Section';
import { Text } from '@astryxdesign/core/Text';
import { getDictionary, langFromPath } from '@/i18n/dictionaries';

export function SiteFooter() {
  const footer = getDictionary(langFromPath(usePathname())).footer;
  return (
    <Section variant="muted">
      <Text>{footer}</Text>
    </Section>
  );
}
