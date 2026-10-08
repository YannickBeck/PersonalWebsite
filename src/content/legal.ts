/**
 * Rechtstexte (Impressum, Datenschutz) – EIN Modell für /impressum, /datenschutz (DE + EN) und
 * die Markdown-Fassungen (src/lib/markdown.ts). Redesign B4.
 *
 * Regeln
 * - Entwurf, keine Rechtsberatung. Beschrieben wird nur, was die Website technisch tatsächlich
 *   tut (Code in diesem Repo, docs/kontaktformular.md) bzw. was der Betrieb belegt
 *   (Coolify hinter Cloudflare, Ghost unter cms.yannick-beck.de).
 * - Fehlende Pflichtangaben (Anschrift, E-Mail, Rechtsgrundlagen, Fristen) sind `open` und
 *   erscheinen – anders als die übrigen Lücken – AUCH in Produktion als „OFFEN: …“
 *   (LegalOpen, src/components/pages/legal-content.tsx): Ein Rechtstext ohne diese Zeilen sähe
 *   vollständig aus, wäre es aber nicht. Gesamtliste: Lücken legal-imprint/legal-privacy.
 * - Normen aktuell: § 5 DDG (seit 14.05.2024 statt § 5 TMG), § 18 Abs. 2 MStV (statt § 55
 *   Abs. 2 RStV). Quellen (Sekundärquellen, Gesetzestext auf gesetze-im-internet.de prüfen):
 *   https://recht.dfn.de/wp-content/uploads/2024/05/Informationspflicht-beim-Betrieb-von-Telemediendiensten0524.pdf
 *   https://www.ihk-muenchen.de/de/Service/Recht-und-Steuern/Internetrecht/Impressum-im-Internet/
 * - Ton: Du-Ansprache, sachlich, wie die übrige Seite.
 */
import type { L } from '@/content/profile';
import { LINKEDIN_URL } from '@/content/links';

export interface LegalLink {
  label: L;
  /** Interner Pfad ohne Sprachpräfix oder externe URL. */
  href: string;
  external?: boolean;
}

export interface LegalEntry {
  /** Unterüberschrift (H3), z. B. ein Dienst. */
  heading?: L;
  text?: L<string[]>;
  links?: LegalLink[];
  /** Fehlende Angabe – sichtbar als „OFFEN: …“ (auch in Produktion). */
  open?: L;
}

export interface LegalBlock {
  id: string;
  heading: L;
  entries: LegalEntry[];
}

export interface LegalDoc {
  notice: L;
  blocks: LegalBlock[];
}

const NAME: L<string[]> = { de: ['Yannick Beck'], en: ['Yannick Beck'] };

export const IMPRINT: LegalDoc = {
  notice: {
    de: 'Keine Rechtsberatung. Mit „OFFEN“ markierte Angaben fehlen noch. Ob und in welchem Umfang eine Impressumspflicht besteht, ist rechtlich zu prüfen.',
    en: 'Not legal advice. Items marked “OPEN” are still missing. Whether and to what extent an imprint is required still has to be checked legally.',
  },
  blocks: [
    {
      id: 'anbieter',
      heading: { de: 'Angaben gemäß §\u00A05 DDG', en: 'Information pursuant to §\u00A05 DDG (German Digital Services Act)' },
      entries: [
        { text: NAME },
        { open: { de: 'Ladungsfähige Anschrift (Straße, Hausnummer, PLZ, Ort)', en: 'Postal address for service (street, number, postcode, town)' } },
      ],
    },
    {
      id: 'kontakt',
      heading: { de: 'Kontakt', en: 'Contact' },
      entries: [
        {
          text: {
            de: ['Du erreichst mich über das Kontaktformular oder auf LinkedIn.'],
            en: ['You can reach me via the contact form or on LinkedIn.'],
          },
          links: [
            { label: { de: 'Kontaktformular', en: 'Contact form' }, href: '/kontakt' },
            { label: { de: 'LinkedIn-Profil', en: 'LinkedIn profile' }, href: LINKEDIN_URL, external: true },
          ],
        },
        {
          open: {
            de: 'E-Mail-Adresse: §\u00A05 DDG verlangt eine Adresse für elektronische Post. Mit der Entscheidung „keine öffentliche E-Mail-Adresse“ abstimmen.',
            en: 'Email address: §\u00A05 DDG requires an address for electronic mail. Reconcile with the decision “no public email address”.',
          },
        },
      ],
    },
    {
      id: 'verantwortlich',
      heading: { de: 'Verantwortlich i.\u00A0S.\u00A0d. §\u00A018 Abs.\u00A02 MStV', en: 'Responsible under §\u00A018\u00A0(2) MStV (German Interstate Media Treaty)' },
      entries: [
        {
          open: {
            de: 'Name und Anschrift der verantwortlichen Person (nur nötig bei journalistisch-redaktionellen Inhalten wie dem Blog; rechtlich prüfen)',
            en: 'Name and address of the responsible person (only needed for journalistic-editorial content such as the blog; check legally)',
          },
        },
      ],
    },
  ],
};

export const PRIVACY: LegalDoc = {
  notice: {
    de: 'Keine Rechtsberatung. Die Abschnitte beschreiben, was diese Website technisch tut. Mit „OFFEN“ markierte Angaben fehlen noch und sind rechtlich zu prüfen.',
    en: 'Not legal advice. The sections describe what this website does technically. Items marked “OPEN” are still missing and have to be checked legally.',
  },
  blocks: [
    {
      id: 'verantwortlich',
      heading: { de: 'Verantwortliche Stelle', en: 'Controller' },
      entries: [
        { text: NAME },
        { open: { de: 'Anschrift und E-Mail-Adresse der verantwortlichen Stelle', en: 'Address and email address of the controller' } },
      ],
    },
    {
      id: 'dienste',
      heading: { de: 'Eingesetzte Dienste (tatsächlicher Stand)', en: 'Services in use (actual state)' },
      entries: [
        {
          heading: { de: 'Hosting & Auslieferung', en: 'Hosting & delivery' },
          text: {
            de: ['Diese Website läuft auf einem eigenen Server (Hetzner, Deutschland), verwaltet mit Coolify. Der Abruf von Seiten übermittelt technisch bedingt IP-Adresse und Zeitpunkt (Server-Logs, 7 Tage).'],
            en: ['This website runs on its own server (Hetzner, Germany), managed with Coolify. Retrieving pages technically transmits IP address and time (server logs, 7 days).'],
          },
          open: {
            de: 'Hoster, Standort und Speicherdauer der Server-Logs bestätigen (Angaben aus dem Vorgänger-Entwurf)',
            en: 'Confirm host, location and retention of server logs (taken from the previous draft)',
          },
        },
        {
          heading: { de: 'Cloudflare (CDN, Schutz & Tunnel)', en: 'Cloudflare (CDN, protection & tunnel)' },
          text: {
            de: ['Der Datenverkehr läuft über Cloudflare (Edge- und Tunnel-Dienste) zum Schutz vor Missbrauch und zur Auslieferung. Dabei werden Verbindungsdaten auf Cloudflare-Systemen verarbeitet.'],
            en: ['Traffic passes through Cloudflare (edge and tunnel services) for abuse protection and delivery. Connection data is processed on Cloudflare systems.'],
          },
          open: {
            de: 'Anbieter, Rechtsgrundlage, Drittlandübermittlung und mögliche Cookies des Cloudflare-Schutzes ergänzen',
            en: 'Add provider, legal basis, third-country transfer and possible cookies of Cloudflare’s protection',
          },
        },
        {
          heading: { de: 'Ghost (CMS auf cms.yannick-beck.de)', en: 'Ghost (CMS at cms.yannick-beck.de)' },
          text: {
            de: ['Die Blogbeiträge kommen aus einem selbst betriebenen Ghost-CMS. Die Newsletter-Anmeldung ist dort derzeit nur auf Einladung möglich; diese Website nimmt keine Newsletter-Anmeldungen entgegen.'],
            en: ['Blog posts come from a self-operated Ghost CMS. Newsletter signup there is currently invite-only; this website does not accept newsletter signups.'],
          },
        },
        {
          heading: { de: 'Schriften', en: 'Fonts' },
          text: {
            de: ['Die Schriften liefert diese Website selbst aus. Dein Browser stellt dafür keine Verbindung zu Google oder anderen Schriftanbietern her.'],
            en: ['This website serves its fonts itself. Your browser does not connect to Google or any other font provider for them.'],
          },
        },
        {
          heading: { de: 'CDN-Bibliotheken (jsDelivr)', en: 'CDN libraries (jsDelivr)' },
          text: {
            de: ['Das Ghost-Portal-Skript wurde zeitweise über jsDelivr geladen (derzeit deaktiviert). Bei Reaktivierung: IP-Adresse an jsDelivr.'],
            en: ['The Ghost portal script was temporarily loaded via jsDelivr (currently disabled). On reactivation: IP address to jsDelivr.'],
          },
        },
        {
          heading: { de: 'Speicher im Browser', en: 'Storage in your browser' },
          text: {
            de: ['Wenn du das Farbschema umschaltest, merkt sich dein Browser die Wahl im lokalen Speicher (localStorage). Die Angabe bleibt auf deinem Gerät und wird nicht übertragen. Der Code dieser Website setzt keine Cookies.'],
            en: ['If you switch the colour scheme, your browser remembers the choice in local storage (localStorage). It stays on your device and is not transmitted. This website’s code sets no cookies.'],
          },
        },
        {
          heading: { de: 'Analyse', en: 'Analytics' },
          text: {
            de: ['Derzeit ist kein Analyse-Dienst aktiv. Vorbereitet ist Cloudflare Web Analytics (ohne Cookies); es lädt nur, wenn es in der Konfiguration eingeschaltet wird.'],
            en: ['No analytics service is active. Cloudflare Web Analytics (cookie-free) is prepared; it only loads if it is switched on in the configuration.'],
          },
          open: { de: 'Stand vor der Veröffentlichung prüfen', en: 'Verify the state before publishing' },
        },
      ],
    },
    {
      id: 'kontaktformular',
      heading: { de: 'Kontaktformular', en: 'Contact form' },
      entries: [
        {
          text: {
            de: ['Übertragen werden Name, E-Mail-Adresse, optional ein Anliegen, die Nachricht und deine Einwilligung. Die Angaben gehen verschlüsselt an den Server dieser Website und von dort als E-Mail an mich. Antworten gehen an die angegebene E-Mail-Adresse.'],
            en: ['The form transmits your name, email address, an optional subject, the message and your consent. The data is sent encrypted to this website’s server and from there to me as an email. Replies go to the email address you entered.'],
          },
        },
        {
          text: {
            de: ['Die E-Mail verschickt der Dienst Resend über seine Programmierschnittstelle.'],
            en: ['The email is sent by the Resend service via its API.'],
          },
          open: {
            de: 'Anbieter, Sitz, Auftragsverarbeitungsvertrag und ggf. Grundlage für die Übermittlung in ein Drittland',
            en: 'Provider, registered office, data processing agreement and, if applicable, the basis for transfers to a third country',
          },
        },
        {
          text: {
            de: ['Diese Website speichert keine Nachrichten und schreibt keine Inhalte, Namen oder Adressen in Protokolle. Die Nachricht liegt danach in meinem E-Mail-Postfach.'],
            en: ['This website stores no messages and writes no content, names or addresses to logs. The message then sits in my email inbox.'],
          },
          open: { de: 'Speicherdauer im Postfach und beim Versanddienst', en: 'Retention period in the inbox and at the delivery service' },
        },
        {
          text: {
            de: ['Gegen massenhaften Versand zählt der Server Anfragen je IP-Adresse. Die Adresse wird dafür nur als gesalzener Prüfwert (Hash) im Arbeitsspeicher gehalten, rund zehn Minuten lang, und nirgends gespeichert. Ein unsichtbares Feld und eine Mindest-Ausfüllzeit helfen zusätzlich gegen Bots.'],
            en: ['To slow down mass sending, the server counts requests per IP address. For this, the address is only kept in memory as a salted hash for about ten minutes and is never stored. A hidden field and a minimum fill-in time also help against bots.'],
          },
        },
        {
          text: {
            de: ['Grundlage der Verarbeitung ist deine Einwilligung im Formular; du kannst sie jederzeit widerrufen.'],
            en: ['The processing is based on your consent in the form; you can withdraw it at any time.'],
          },
          open: { de: 'Rechtsgrundlage und Widerrufsweg rechtlich prüfen lassen', en: 'Have the legal basis and the withdrawal route legally reviewed' },
        },
        {
          text: {
            de: ['Ohne Formular erreichst du mich über LinkedIn; dort gelten die Datenschutzbestimmungen von LinkedIn.'],
            en: ['Without the form, you can reach me on LinkedIn; LinkedIn’s privacy policy applies there.'],
          },
        },
      ],
    },
    {
      id: 'rechte',
      heading: { de: 'Deine Rechte', en: 'Your rights' },
      entries: [
        {
          open: {
            de: 'Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch und Beschwerderecht bei der Aufsichtsbehörde beschreiben (Textbaustein)',
            en: 'Describe access, rectification, erasure, restriction, portability, objection and the right to complain to the supervisory authority (text module)',
          },
        },
      ],
    },
  ],
};

/** Kennzeichnung offener Angaben in Rechtstexten (auch in Produktion sichtbar). */
export const LEGAL_OPEN: L = { de: 'OFFEN', en: 'OPEN' };
