'use client';

import { usePathname } from 'next/navigation';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { getDictionary, withLang } from '@/i18n/dictionaries';
import { useRouteLang } from '@/i18n/route-lang';

/**
 * Vorschau-Hinweiszeile (nur mit NEXT_PUBLIC_SHOW_GAPS=1, root-shell.tsx): sagt, dass offene
 * Angaben gestrichelt markiert sind, und verlinkt die Lückenliste. Ersetzt die frühere
 * Demo-Hinweiszeile (VIS1) – in Produktion gibt es weder Demo-Inhalte noch diesen Hinweis.
 * Eigene benannte Landmark (A118), Link unterstrichen, keine Live-Region.
 */
export function PreviewNotice() {
  const pathname = usePathname();
  const lang = useRouteLang();
  const dict = getDictionary(lang);
  const statusHref = withLang('/content-status', lang);
  return (
    <HStack as="aside" aria-label={dict.previewNoticeLabel} gap={2} wrap="wrap" vAlign="center">
      <Text type="supporting" color="secondary">
        {dict.previewNoticeLine}
      </Text>
      {pathname !== statusHref && (
        <Link href={statusHref} hasUnderline size="sm" color="primary" className="yb-target-min">
          {dict.statusTitle}
        </Link>
      )}
    </HStack>
  );
}
