import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Link } from '@astryxdesign/core/Link';
import { PAGE_TOP } from '@/components/page-hero';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';

/**
 * 404-Inhalt für notFound() innerhalb einer Sprache ((de)/not-found.tsx, en/not-found.tsx) –
 * im normalen Seitenrahmen der jeweiligen Sprache. Die andere Sprache als EINE ruhige Zeile mit
 * Link (VIS19), ausgezeichnet mit lang (A120). Unbekannte URLs ohne Route: global-not-found.tsx.
 */
export function NotFoundContent({ lang }: { lang: Lang }) {
  const otherLang: Lang = lang === 'en' ? 'de' : 'en';
  const dict = getDictionary(lang);
  const other = getDictionary(otherLang);
  return (
    <Section className={PAGE_TOP}>
      <VStack gap={8} maxWidth={640}>
        <VStack gap={4}>
          <Text type="code" color="accent" weight="semibold">
            404
          </Text>
          <Heading level={1} textWrap="balance">
            {dict.notFoundTitle}
          </Heading>
          <Text type="large" color="secondary" textWrap="pretty">
            {dict.notFoundText}
          </Text>
        </VStack>
        <HStack gap={3} wrap="wrap">
          <Button label={dict.notFoundHome} variant="primary" size="lg" href={withLang('/', lang)} />
          <Button label={dict.pages.projekte.title} variant="secondary" size="lg" href={withLang('/projekte', lang)} />
          <Button label={dict.pages.kontakt.title} variant="secondary" size="lg" href={withLang('/kontakt', lang)} />
        </HStack>
        {/* lang am <span>: Astryx-Text reicht lang nicht durch (BaseProps) */}
        <Text as="p" color="secondary">
          <span lang={otherLang}>
            {other.notFoundTitle} –{' '}
            <Link href={withLang('/', otherLang)} hasUnderline color="primary">
              {other.otherLangHome}
            </Link>
          </span>
        </Text>
      </VStack>
    </Section>
  );
}
