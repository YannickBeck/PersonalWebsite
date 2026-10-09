import { Section } from '@astryxdesign/core/Section';
import { PageHero } from '@/components/page-hero';
import { ContactBlock } from '@/components/contact-block';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { contactPageLede } from '@/lib/contact-flag';

/**
 * Kontakt (Redesign B4): Kopf wie der Kontakt-Abschnitt der Startseite („Schreib mir.“),
 * darunter dieselbe Komposition (contact-block.tsx: Formular mit echtem Versand über
 * /api/kontakt bzw. LinkedIn als Hauptweg, dazu „Wer dir antwortet“ – seit Fix-Runde 3 Teil der
 * Komposition, auch auf der Startseite). Keine öffentliche E-Mail-Adresse (Nutzerentscheidung);
 * ohne Versand-Konfiguration zeigt das Formular den ehrlichen Zustand.
 */
export function ContactContent({ lang }: { lang: Lang }) {
  const page = getDictionary(lang).pages.kontakt;
  return (
    <>
      <PageHero kicker={page.title} title={getDictionary(lang).home.contactTitle} lede={contactPageLede(lang)} />
      <Section>
        <ContactBlock lang={lang} headingLevel={2} />
      </Section>
    </>
  );
}
