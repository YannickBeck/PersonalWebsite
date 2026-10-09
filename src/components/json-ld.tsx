import type { Lang } from '@/i18n/dictionaries';
import { EDUCATION, FOCUS_LIST, INTRO, LANGUAGES, LINKEDIN_URL, PERSON, PHOTOS } from '@/content/profile';

const SITE = 'https://yannick-beck.de';

/**
 * Strukturierte Daten (JSON-LD, Next-Guide json-ld.md) für die Startseite: Person + WebSite.
 * Nur belegte Angaben aus dem Content-Modell; sameAs ausschließlich LinkedIn (Nutzerentscheidung,
 * kein GitHub), keine E-Mail. „<“ wird maskiert (XSS-Schutz laut Next-Doku).
 */
export function personJsonLd(lang: Lang) {
  const dhbw = EDUCATION.find((e) => e.id === 'dhbw-wi')!;
  const home = lang === 'en' ? `${SITE}/en` : `${SITE}/`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE}/#person`,
        name: PERSON.name,
        givenName: 'Yannick',
        familyName: 'Beck',
        url: home,
        image: `${SITE}${PHOTOS.avatar.src}`,
        jobTitle: PERSON.role.value[lang],
        description: INTRO.value[lang][0],
        worksFor: { '@type': 'Organization', name: PERSON.employer.value },
        address: {
          '@type': 'PostalAddress',
          addressLocality: PERSON.address.value.locality,
          addressRegion: PERSON.address.value.region,
          addressCountry: PERSON.address.value.country,
        },
        alumniOf: { '@type': 'CollegeOrUniversity', name: dhbw.school[lang] },
        knowsAbout: FOCUS_LIST.value,
        knowsLanguage: LANGUAGES.value.map((l) => l.code),
        sameAs: [LINKEDIN_URL],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: `${SITE}/`,
        name: PERSON.name,
        inLanguage: ['de', 'en'],
        author: { '@id': `${SITE}/#person` },
      },
    ],
  };
}

export function PersonJsonLd({ lang }: { lang: Lang }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(lang)).replace(/</g, '\\u003c') }}
    />
  );
}
