import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { Banner } from '@astryxdesign/core/Banner';
import { PageHero } from '@/components/page-hero';
import { Gap } from '@/components/gap';
import { InlineExternalArrow } from '@/components/icons';
import { getDictionary, withLang, type Lang } from '@/i18n/dictionaries';
import { IMPRINT, LEGAL_OPEN, PRIVACY, type LegalDoc } from '@/content/legal';
import type { GapId } from '@/content/profile';
import gapStyles from '@/components/gap.module.css';
import styles from './legal-content.module.css';

/**
 * Offene Pflichtangabe in Rechtstexten: gleiche Optik wie die Vorschau-Lücke (gestrichelt),
 * aber IMMER sichtbar (auch in Produktion) – Begründung in src/content/legal.ts.
 * data-yb-legal-open statt data-yb-gap: Das Gate zählt sie getrennt.
 */
function LegalOpen({ text, lang }: { text: string; lang: Lang }) {
  return (
    <Text as="p" type="supporting" color="secondary" className={`${gapStyles.gap} ${gapStyles.block}`} data-yb-legal-open="">
      <Text type="supporting" weight="semibold" color="inherit">
        {LEGAL_OPEN[lang]}:
      </Text>{' '}
      {text}
    </Text>
  );
}

const DOCS: Record<'impressum' | 'datenschutz', { doc: LegalDoc; gap: GapId }> = {
  impressum: { doc: IMPRINT, gap: 'legal-imprint' },
  datenschutz: { doc: PRIVACY, gap: 'legal-privacy' },
};

/**
 * Impressum und Datenschutz (Redesign B4): EIN Aufbau für beide Sprachen und beide Seiten aus
 * src/content/legal.ts. Kopf wie alle Unterseiten (Kennung „Rechtliches“, schlichte H1 ohne
 * Akzent-Wort), ein ruhiger Hinweis (Entwurf, keine Rechtsberatung), dann die Abschnitte als
 * H2 mit Anker (#kontaktformular – Ziel des Links im Formular). Lesebreite.
 */
export function LegalContent({ kind, lang }: { kind: 'impressum' | 'datenschutz'; lang: Lang }) {
  const dict = getDictionary(lang);
  const page = dict.pages[kind];
  const { doc, gap } = DOCS[kind];
  return (
    <>
      <PageHero kicker={dict.legalKicker} title={page.title} lede={page.lede} size="lg" meta={<Gap id={gap} lang={lang} block />} />
      <Section>
        <VStack gap={10} maxWidth={720}>
          <Banner status="note" title={dict.templateNoticeTitle} description={doc.notice[lang]} />
          {doc.blocks.map((block) => (
            <section key={block.id} id={block.id} aria-labelledby={`${block.id}-title`} className={styles.block}>
              <Heading level={2} id={`${block.id}-title`} className={styles.heading}>
                {block.heading[lang]}
              </Heading>
              <VStack gap={5}>
                {block.entries.map((entry, i) => (
                  <VStack key={i} gap={2}>
                    {entry.heading ? <Heading level={3}>{entry.heading[lang]}</Heading> : null}
                    {entry.text?.[lang].map((p) => (
                      <Text key={p.slice(0, 32)} as="p" textWrap="pretty" className={styles.text}>
                        {p}
                      </Text>
                    ))}
                    {entry.links ? (
                      <HStack gap={4} wrap="wrap">
                        {entry.links.map((l) =>
                          l.external ? (
                            <Link key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" color="primary" hasUnderline>
                              {l.label[lang]}
                        <InlineExternalArrow />
                            </Link>
                          ) : (
                            <Link key={l.href} href={withLang(l.href, lang)} color="primary" hasUnderline>
                              {l.label[lang]}
                            </Link>
                          ),
                        )}
                      </HStack>
                    ) : null}
                    {entry.open ? <LegalOpen text={entry.open[lang]} lang={lang} /> : null}
                  </VStack>
                ))}
              </VStack>
            </section>
          ))}
        </VStack>
      </Section>
    </>
  );
}
