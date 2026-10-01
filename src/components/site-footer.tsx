'use client';

import { usePathname } from 'next/navigation';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { getDictionary, langFromPath, type Lang } from '@/i18n/dictionaries';

function Group({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <VStack gap={2}>
      <Heading level={3}>{title}</Heading>
      {links.map((l) => (
        <Link key={l.href} href={l.href}>
          {l.label}
        </Link>
      ))}
    </VStack>
  );
}

const GROUPS: Record<Lang, { title: string; links: { label: string; href: string }[] }[]> = {
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
  return (
    <Section variant="muted">
      <VStack gap={4}>
        <Grid columns={{ minWidth: 220 }} gap={4}>
          {GROUPS[lang].map((g) => (
            <Group key={g.title} title={g.title} links={g.links} />
          ))}
        </Grid>
        <Text type="supporting">{dict.footer}</Text>
      </VStack>
    </Section>
  );
}
