import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { List, ListItem } from '@astryxdesign/core/List';
import { PageHero } from '@/components/page-hero';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { GAPS } from '@/content/profile';

const SOURCES: Record<Lang, { name: string; text: string }[]> = {
  de: [
    { name: 'LinkedIn-Export (Profile.pdf, 08.10.2026)', text: 'Headline, Ort, Zusammenfassung, Stationen, Ausbildung, Sprachen, Zertifikate, Top-Kenntnisse, Schwerpunkte, Bachelorarbeit.' },
    { name: 'GitHub: YannickBeck/Abgabe_Orbitalis, YannickBeck/OrbitalisTicketSystem', text: 'README und Eigenleistungen/SUMMARY.md – Ausgangslage, Beitrag und Ergebnis von Orbitalis.' },
    { name: 'Fotos (vom Inhaber, ohne Metadaten)', text: 'Porträt, freigestellte Fassung, Ausschnitte für Karte und Avatar.' },
    { name: 'Logos im Periodensystem (Simple Icons über Better Icons)', text: 'Nur PHP (Colin Viebrock, CC BY-SA 4.0, einfarbig angepasst) und FastAPI (Sebastián Ramírez, MIT). Alle anderen Fähigkeiten zeigen ihr Kürzel; die Begründung steht in docs/skill-logos.md.' },
  ],
  en: [
    { name: 'LinkedIn export (Profile.pdf, 8 Oct 2026)', text: 'Headline, location, summary, positions, education, languages, certifications, top skills, focus list, bachelor’s thesis.' },
    { name: 'GitHub: YannickBeck/Abgabe_Orbitalis, YannickBeck/OrbitalisTicketSystem', text: 'README and Eigenleistungen/SUMMARY.md – starting point, contribution and outcome of Orbitalis.' },
    { name: 'Photos (supplied by the owner, metadata removed)', text: 'Portrait, cut-out version, crops for card and avatar.' },
    { name: 'Logos in the periodic table (Simple Icons via Better Icons)', text: 'Only PHP (Colin Viebrock, CC BY-SA 4.0, single-colour adaptation) and FastAPI (Sebastián Ramírez, MIT). All other skills show their symbol; the reasoning is in docs/skill-logos.md.' },
  ],
};

/**
 * Content-Status (noindex): offene Angaben aus dem Content-Modell (GAPS) und die Quellen der
 * veröffentlichten Angaben. Zeilen statt Karte je Eintrag (L7).
 */
export function ContentStatusContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  return (
    <>
      <PageHero title={dict.statusTitle} lede={dict.statusLede} />
      <Section>
        <Card padding={2}>
          <List hasDividers density="spacious">
            {GAPS.map((g) => (
              <ListItem
                key={g.id}
                label={<Text weight="semibold">{g.label[lang]}</Text>}
                description={
                  <VStack gap={1}>
                    <Text color="secondary">
                      {dict.statusColWhere}: {g.where[lang]}
                    </Text>
                    <Text color="secondary">
                      {dict.statusColFormat}: {g.need[lang]}
                    </Text>
                  </VStack>
                }
              />
            ))}
          </List>
        </Card>
      </Section>
      <Section>
        <VStack gap={4} maxWidth={760}>
          <Heading level={2}>{dict.statusSources}</Heading>
          <List hasDividers density="spacious">
            {SOURCES[lang].map((s) => (
              <ListItem key={s.name} label={<Text weight="semibold">{s.name}</Text>} description={<Text color="secondary">{s.text}</Text>} />
            ))}
          </List>
        </VStack>
      </Section>
    </>
  );
}
