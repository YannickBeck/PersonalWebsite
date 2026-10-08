import { PERSON, PROJECTS, INTRO, FOCUS_LIST, LINKEDIN_URL } from '@/content/profile';
import { SITE } from '@/lib/markdown';

/**
 * llms.txt (llmstxt.org) – statisch beim Build aus dem Content-Modell. Enthält den von
 * Is-Agentic geforderten Abschnitt „Wann diese Seite nützlich ist“ (when-to-use).
 */
export const dynamic = 'force-static';

export function GET() {
  const body = `# ${PERSON.name}

> Persönliche Website von ${PERSON.name}, ${PERSON.role.value.de} (${PERSON.location.value.de}): ${PERSON.focusLine.value.de}. Deutsch und Englisch.

${INTRO.value.de[0]}

## Wann diese Seite nützlich ist

- Du suchst belegte Angaben zu ${PERSON.name}: Rolle, beruflicher Werdegang (Bechtle Mannheim seit 2020, GEBHARDT Fördertechnik 2018–2020), Ausbildung, Zertifikate und Sprachen.
- Du willst wissen, womit er arbeitet: ${FOCUS_LIST.value.join(', ')}.
- Du suchst seine Projekte: ${PROJECTS.map((p) => p.shortTitle.de).join(' und ')} (lokales KI-Ticketsystem mit RAG; Bachelorarbeit zu KI in der Angebotserstellung im Presales).
- Du willst Kontakt aufnehmen: Kontaktformular oder LinkedIn (keine öffentliche E-Mail-Adresse).
- Nicht geeignet für: Preise, Verfügbarkeiten, Kundenreferenzen – dazu steht hier nichts.

## So liest du die Seite

- Jede Seite liefert mit \`Accept: text/markdown\` eine Markdown-Fassung (sonst HTML).
- Startseite (DE): ${SITE}/ · Englisch: ${SITE}/en
- Sitemap: ${SITE}/sitemap.xml

## Seiten

- [Über mich](${SITE}/ueber-mich): ausführliche Vorstellung in eigenen Worten
- [Lebenslauf](${SITE}/cv): Stationen, Ausbildung, Zertifikate, Sprachen
- [Projekte](${SITE}/projekte): ${PROJECTS.map((p) => p.shortTitle.de).join(', ')}
${PROJECTS.map((p) => `- [${p.title.de}](${SITE}/projekte/${p.slug.de}): ${p.teaser.de}`).join('\n')}
- [Schwerpunkte](${SITE}/leistungen): Themen aus dem Profil (kein Leistungskatalog)
- [Kontakt](${SITE}/kontakt): Kontaktformular
- [Blog](${SITE}/blog): Artikel aus dem CMS
- [English version](${SITE}/en)

## Profile

- LinkedIn: ${LINKEDIN_URL}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
