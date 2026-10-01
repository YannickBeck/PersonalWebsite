'use client';

import { usePathname } from 'next/navigation';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { getDictionary, langFromPath, withLang } from '@/i18n/dictionaries';

/**
 * Seitenweiter Demo-Hinweis (E1, L10/V2/T1/TV3): eine schlanke Textzeile statt eines
 * Warn-Banners pro Seite. Keine Live-Region (kein role="alert"), Link unterstrichen,
 * Text nicht doppelt. Kontraste: text-secondary auf background-muted (≥ 4.5:1 in beiden Modi).
 */
export function DemoNotice() {
  const pathname = usePathname();
  const lang = langFromPath(pathname);
  const dict = getDictionary(lang);
  const statusHref = withLang('/content-status', lang);
  return (
    <HStack gap={2} wrap="wrap" vAlign="center">
      <Text type="supporting" color="secondary">
        {dict.demoNoticeLine}
      </Text>
      {pathname !== statusHref && (
        <Link href={statusHref} hasUnderline size="sm" color="primary">
          {dict.statusTitle}
        </Link>
      )}
    </HStack>
  );
}
