import { notFound } from 'next/navigation';
import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { GhostHtml } from '@/components/ghost-html';
import { Text } from '@astryxdesign/core/Text';
import type { Lang } from '@/i18n/dictionaries';
import type { GhostItem } from '@/lib/ghost';

const DATE_LOCALE: Record<Lang, string> = { de: 'de-DE', en: 'en-GB' };

export function DetailBody({ lang, item }: { lang: Lang; item: GhostItem }) {
  const date = item.published_at
    ? new Intl.DateTimeFormat(DATE_LOCALE[lang], {
        dateStyle: 'long',
      }).format(new Date(item.published_at))
    : null;
  return (
    <>
      <PageHero title={item.title ?? item.slug} lede={date ?? ''} />
      <Section>
        {date && (
          <Text color="secondary" type="supporting">
            {date}
          </Text>
        )}
        {item.html && <GhostHtml html={item.html} />}
      </Section>
    </>
  );
}

export async function detailOr404(
  item: GhostItem | undefined,
  lang: Lang,
) {
  if (!item) {
    notFound();
  }
  return <DetailBody lang={lang} item={item} />;
}
