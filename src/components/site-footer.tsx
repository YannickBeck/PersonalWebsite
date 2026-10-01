'use client';

import { usePathname } from 'next/navigation';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { BrandMark } from '@/components/brand-mark';
import { getDictionary, langFromPath, type Lang } from '@/i18n/dictionaries';
import styles from './site-footer.module.css';

type FooterGroup = { title: string; links: { label: string; href: string }[] };

/**
 * Linkgruppe als eigene <nav> mit Namen statt H3 (T9: keine Überschriften-Sprünge
 * h1 → h3 auf jeder Seite). Der sichtbare Gruppentitel ist ein Label.
 */
function Group({ group, isCurrent }: { group: FooterGroup; isCurrent: (href: string) => boolean }) {
  return (
    <VStack as="nav" aria-label={group.title} gap={2}>
      <Text type="label" color="secondary">
        {group.title}
      </Text>
      <VStack gap={0} as="ul" className={styles.list}>
        {group.links.map((l) => (
          <li key={l.href} className={styles.item}>
            <Link
              href={l.href}
              color={isCurrent(l.href) ? 'accent' : 'primary'}
              aria-current={isCurrent(l.href) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </VStack>
    </VStack>
  );
}

const GROUPS: Record<Lang, FooterGroup[]> = {
  de: [
    {
      title: 'Seiten',
      links: [
        { label: 'Über mich', href: '/ueber-mich' },
        { label: 'Leistungen', href: '/leistungen' },
        { label: 'CV', href: '/cv' },
        { label: 'Uses', href: '/uses' },
        { label: 'Kontakt', href: '/kontakt' },
      ],
    },
    {
      title: 'Inhalte',
      links: [
        { label: 'Projekte', href: '/projekte' },
        { label: 'Blog', href: '/blog' },
        { label: 'Newsletter', href: '/newsletter' },
      ],
    },
    {
      title: 'Rechtliches',
      links: [
        { label: 'Impressum', href: '/impressum' },
        { label: 'Datenschutz', href: '/datenschutz' },
      ],
    },
  ],
  en: [
    {
      title: 'Pages',
      links: [
        { label: 'About me', href: '/en/ueber-mich' },
        { label: 'Services', href: '/en/leistungen' },
        { label: 'CV', href: '/en/cv' },
        { label: 'Uses', href: '/en/uses' },
        { label: 'Contact', href: '/en/kontakt' },
      ],
    },
    {
      title: 'Content',
      links: [
        { label: 'Projects', href: '/en/projekte' },
        { label: 'Blog', href: '/en/blog' },
        { label: 'Newsletter', href: '/en/newsletter' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Imprint', href: '/en/impressum' },
        { label: 'Privacy', href: '/en/datenschutz' },
      ],
    },
  ],
};

export function SiteFooter() {
  const pathname = usePathname();
  const lang = langFromPath(pathname);
  const dict = getDictionary(lang);
  const isCurrent = (href: string) => pathname === href;
  return (
    <footer>
      <VStack gap={8} paddingBlockStart={6} paddingBlockEnd={2}>
        <Grid columns={{ minWidth: 150, max: 3 }} gap={6}>
          {GROUPS[lang].map((g) => (
            <Group key={g.title} group={g} isCurrent={isCurrent} />
          ))}
        </Grid>
        <HStack gap={3} wrap="wrap" vAlign="center" justify="between">
          <HStack gap={2} vAlign="center">
            <BrandMark />
            <Text type="supporting" color="secondary">
              {dict.footer}
            </Text>
          </HStack>
          <Text type="supporting" color="secondary">
            {dict.footerTagline}
          </Text>
        </HStack>
      </VStack>
    </footer>
  );
}
