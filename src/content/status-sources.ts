import type { Lang } from '@/i18n/dictionaries';

/**
 * Quellen der veröffentlichten Angaben für /content-status (HTML und Markdown, nur im
 * Vorschau-Build: Arbeitsstand für Yannick, Abschluss-Fixes TEX2).
 */
export const STATUS_SOURCES: Record<Lang, { name: string; text: string }[]> = {
  de: [
    { name: 'LinkedIn-Export (Profile.pdf, 08.10.2026)', text: 'Headline, Ort, Zusammenfassung, Stationen, Ausbildung, Sprachen, Zertifikate, Top-Kenntnisse, Schwerpunkte, Bachelorarbeit.' },
    { name: 'GitHub: YannickBeck/Abgabe_Orbitalis, YannickBeck/OrbitalisTicketSystem', text: 'README und Eigenleistungen/SUMMARY.md: Ausgangslage, neu gebaute Teile, Ablauf und Ergebnis von Orbitalis.' },
    { name: 'Fotos (vom Inhaber, ohne Metadaten)', text: 'Porträt, freigestellte Fassung, Ausschnitte für Karte und Avatar.' },
    { name: 'Logos im Periodensystem (Simple Icons über Better Icons)', text: 'Nur PHP (Colin Viebrock, CC BY-SA 4.0, einfarbig angepasst) und FastAPI (Sebastián Ramírez, MIT). Alle anderen Fähigkeiten zeigen ihr Kürzel; die Begründung steht in docs/skill-logos.md.' },
    { name: 'Ghost (cms.yannick-beck.de)', text: 'Blogbeiträge aus dem Ghost-CMS; die Website zeigt nur, was dort veröffentlicht ist.' },
    { name: 'Rechtstexte (abgerufen bzw. gemessen am 23.10.2026)', text: 'Betroffenenrechte aus dem amtlichen DSGVO-Text (EUR-Lex); Aufsichtsbehörde von deren Website; Cloudflare per HTTP-Messung der Live-Seite, Anbieter aus Datenschutzerklärung und DPA von Cloudflare, Zertifizierung aus der Data-Privacy-Framework-Liste; Coolify laut Projekt-Steckbrief im Vault. Hoster und Anbindung an Cloudflare sind nicht belegt und stehen als OFFEN auf der Seite. Einzelnachweise im Kopf von src/content/legal.ts.' },
  ],
  en: [
    { name: 'LinkedIn export (Profile.pdf, 8 Oct 2026)', text: 'Headline, location, summary, positions, education, languages, certifications, top skills, focus list, bachelor’s thesis.' },
    { name: 'GitHub: YannickBeck/Abgabe_Orbitalis, YannickBeck/OrbitalisTicketSystem', text: 'README and Eigenleistungen/SUMMARY.md: starting point, added components, flow and outcome of Orbitalis.' },
    { name: 'Photos (supplied by the owner, metadata removed)', text: 'Portrait, cut-out version, crops for card and avatar.' },
    { name: 'Logos in the periodic table (Simple Icons via Better Icons)', text: 'Only PHP (Colin Viebrock, CC BY-SA 4.0, single-colour adaptation) and FastAPI (Sebastián Ramírez, MIT). All other skills show their symbol; the reasoning is in docs/skill-logos.md.' },
    { name: 'Ghost (cms.yannick-beck.de)', text: 'Blog posts from the Ghost CMS; the website only shows what is published there.' },
    { name: 'Legal pages (retrieved or measured on 23 Oct 2026)', text: 'Data subject rights from the official GDPR text (EUR-Lex); supervisory authority from its own website; Cloudflare from an HTTP measurement of the live site, provider from Cloudflare’s privacy policy and DPA, certification from the Data Privacy Framework list; Coolify from the project profile in the vault. The host and the connection to Cloudflare are not documented and are shown as OPEN on the page. Individual sources in the header of src/content/legal.ts.' },
  ],
};
