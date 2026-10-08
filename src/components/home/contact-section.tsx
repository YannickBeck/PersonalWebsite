import { getDictionary, type Lang } from '@/i18n/dictionaries';
import { ContactBlock } from '@/components/contact-block';
import { HomeSection } from './home-section';

/**
 * 06 Kontakt (bzw. 05 ohne Erfolge): dieselbe Komposition wie /kontakt (contact-block.tsx) –
 * Formular mit echtem Versand und LinkedIn-Karte; Kartentitel als H3 unter der H2.
 */
export function ContactSection({ id, number, lang }: { id: string; number: string; lang: Lang }) {
  const h = getDictionary(lang).home;
  return (
    <HomeSection id={id} number={number} title={h.contactTitle} lede={h.contactLede}>
      <ContactBlock lang={lang} headingLevel={3} />
    </HomeSection>
  );
}
