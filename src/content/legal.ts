/**
 * Rechtstexte (Impressum, Datenschutz) – EIN Modell für /impressum, /datenschutz (DE + EN) und
 * die Markdown-Fassungen (src/lib/markdown.ts). Redesign B4.
 *
 * Regeln
 * - Entwurf, keine Rechtsberatung. Beschrieben wird nur, was die Website technisch tatsächlich
 *   tut (Code in diesem Repo, docs/kontaktformular.md), was am Live-Betrieb gemessen ist oder
 *   was der Inhaber nachprüfbar selbst angegeben hat (Quellen unten). Hoster, Anbindung des
 *   Servers, Rechenzentrumsstandort, Auftragsverarbeitungsverträge, Log-Dauer und
 *   Rechtsgrundlagen sind nicht belegt und bleiben OFFEN, bis Yannick sie bestätigt bzw. sie
 *   rechtlich geprüft sind.
 * - Persönliche Pflichtangaben (Anschrift, E-Mail, verantwortliche Person nach MStV) stehen an
 *   EINER Stelle: LEGAL_PERSON unten. Impressum und Datenschutz (verantwortliche Stelle) lesen
 *   daraus; `null` erzeugt die OFFEN-Zeile. Nachtragen = dort eintragen (docs/content-guide.md).
 * - Fehlende Pflichtangaben (Anschrift, E-Mail, Rechtsgrundlagen, Fristen) sind `open` und
 *   erscheinen – anders als die übrigen Lücken – AUCH in Produktion als „OFFEN: …“
 *   (LegalOpen, src/components/pages/legal-content.tsx): Ein Rechtstext ohne diese Zeilen sähe
 *   vollständig aus, wäre es aber nicht. Gesamtliste: Lücken legal-imprint/legal-privacy.
 *
 * Quellen (alle abgerufen am 23.10.2026)
 * - Betroffenenrechte: Verordnung (EU) 2016/679 (DSGVO), amtlicher Text auf EUR-Lex, DE und EN,
 *   Art. 7 Abs. 3, 15, 16, 17, 18, 20, 21, 77:
 *   https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679
 *   https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679
 * - Aufsichtsbehörde: Impressum der Behörde (Name, Hausanschrift „Neue Adresse seit dem
 *   22.12.2025: Heilbronner Straße 35, 70191 Stuttgart“) und „Aufgaben und Zuständigkeiten“
 *   (Aufsichtsbehörde für die in Baden-Württemberg ansässigen nicht-öffentlichen Stellen):
 *   https://www.baden-wuerttemberg.datenschutz.de/impressum/
 *   https://www.baden-wuerttemberg.datenschutz.de/aufgaben-und-zustandigkeiten/
 *   https://www.baden-wuerttemberg.datenschutz.de/beschwerde/
 *   Ort Baden-Württemberg: LinkedIn-Export (Sandhausen). Liegt die Anschrift in LEGAL_PERSON in
 *   einem anderen Bundesland, die Behörde dieses Landes eintragen.
 * - Hoster und Anbindung an Cloudflare: NICHT belegt (Nachbesserung FAK1). „Hetzner“ und
 *   „Cloudflare-Tunnel“ stammten nur aus einer Workflow-Vorgabe („Nutzer-Notiz vom 23.10.2026“),
 *   die weder im Repo noch im Vault steht; messen lässt es sich nicht, die Antworten zeigen nur
 *   `server: cloudflare`. Der Vault-Steckbrief 20-privat/projekte/website-yannick-beck-de.md
 *   führt „Homelab oder externer Server?“ als OFFEN; homelab-architektur.md (Skizze 08/2024)
 *   zeigt Hetzner-Cloud-VMs UND einen lokalen Proxmox-Knoten hinter Cloudflare-Tunnel,
 *   docs/test-report.md (anderer Agent, 30.09.2026) spricht von „Tunnel-Hosts“ – Indizien, keine
 *   Bestätigung. Deshalb LEGAL_HOSTING unten: Bis Yannick bestätigt, nennt die Seite weder
 *   Hoster noch Tunnel und zeigt dafür eine OFFEN-Zeile. Vorbereitet ist HETZNER mit Name und
 *   Anschrift aus dem Impressum von Hetzner: https://www.hetzner.com/de/legal/legal-notice/
 * - Coolify: Vault-Steckbrief website-yannick-beck-de.md (Deploy über die Coolify-API, Website
 *   hinter Cloudflare).
 * - Cloudflare, gemessen per HTTP am 23.10.2026 (curl auf /, /impressum, /datenschutz, /en,
 *   /robots.txt, ein Skript unter /_next/static, eine 404; mit und ohne Browser-User-Agent):
 *   `server: cloudflare`, `cf-ray`, `cf-cache-status` DYNAMIC für Seiten, HIT für Skripte,
 *   `report-to`/`nel` mit `success_fraction 0.0` (Network Error Logging), kein `Set-Cookie`,
 *   keine von Cloudflare eingefügten Skripte (`/cdn-cgi/`, Web-Analytics-Beacon) im HTML.
 *   Erneut messen, wenn sich Cloudflare-Einstellungen ändern (Bot Fight Mode setzt `__cf_bm`,
 *   Challenges setzen `cf_clearance` – Doku unten).
 *   Anbieter und Anschrift: Datenschutzerklärung (gilt für Cloudflare, Inc.; sie benennt keine
 *   eigene Gesellschaft für EU-Nutzer) und Data Processing Addendum v6.4 (Auftragsverarbeiter
 *   Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, USA):
 *   https://www.cloudflare.com/privacypolicy/
 *   https://www.cloudflare.com/cloudflare-customer-dpa/
 *   Network Error Logging: https://developers.cloudflare.com/network-error-logging/
 *   IP-Weitergabe an den Server (CF-Connecting-IP):
 *   https://developers.cloudflare.com/fundamentals/reference/http-headers/
 *   Cookies: https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/
 *   Data Privacy Framework (Teilnehmerliste des US-Handelsministeriums, Cloudflare, Inc., ID 5666,
 *   EU-US: „Active - Re-certification under Review“):
 *   https://www.dataprivacyframework.gov/participant/5666
 *   Tunnel zwischen Cloudflare und Server: nicht messbar und nicht belegt (siehe Hoster, LEGAL_HOSTING).
 * - Normen aktuell: § 5 DDG (seit 14.05.2024 statt § 5 TMG), § 18 Abs. 2 MStV (statt § 55
 *   Abs. 2 RStV). Quellen (Sekundärquellen, Gesetzestext auf gesetze-im-internet.de prüfen):
 *   https://recht.dfn.de/wp-content/uploads/2024/05/Informationspflicht-beim-Betrieb-von-Telemediendiensten0524.pdf
 *   https://www.ihk-muenchen.de/de/Service/Recht-und-Steuern/Internetrecht/Impressum-im-Internet/
 * - Ton: Du-Ansprache, sachlich, wie die übrige Seite.
 * - An den Formular-Schalter gekoppelt (Fix-Runde 2, JURY1-1): Ohne `NEXT_PUBLIC_CONTACT_FORM=1`
 *   (CONTACT_FORM_ENABLED, src/lib/contact-flag.ts) nennt das Impressum nur LinkedIn, und die
 *   Datenschutzerklärung hat statt des Abschnitts „Kontaktformular“ (Übertragung, Resend,
 *   Spam-Schutz) nur einen kurzen Abschnitt „Kontakt“. /api/kontakt nimmt dann ebenfalls nichts
 *   an. Gilt für HTML und Markdown, beide lesen IMPRINT/PRIVACY von hier.
 */
import type { L, Lang } from '@/content/profile';
import { LINKEDIN_URL } from '@/content/links';
import { CONTACT_FORM_ENABLED } from '@/lib/contact-flag';

export interface LegalLink {
  label: L;
  /** Interner Pfad ohne Sprachpräfix oder externe URL – je Sprache, wenn die Quelle zwei Fassungen hat. */
  href: string | L;
  external?: boolean;
}

/** Aufzählungspunkt (z. B. ein Betroffenenrecht): Begriff hervorgehoben, dann die Erläuterung. */
export interface LegalListItem {
  term: L;
  text: L;
}

export interface LegalEntry {
  /** Unterüberschrift (H3), z. B. ein Dienst. */
  heading?: L;
  text?: L<string[]>;
  list?: LegalListItem[];
  links?: LegalLink[];
  /** Fehlende Angabe(n) – je eine Zeile „OFFEN: …“ (auch in Produktion). */
  open?: L | L[];
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

export interface LegalPerson {
  name: string;
  /** Ladungsfähige Anschrift, eine Zeile je Eintrag, z. B. ['Straße Hausnummer', 'PLZ Ort']. */
  address: string[] | null;
  /** E-Mail-Adresse für das Impressum (§ 5 DDG) und für Datenschutzanfragen. */
  email: string | null;
  /**
   * Verantwortliche Person nach § 18 Abs. 2 MStV (Name und Anschrift).
   * null = noch offen (OFFEN-Zeile), false = nach rechtlicher Prüfung nicht nötig (Abschnitt entfällt).
   */
  mstv: { name: string; address: string[] } | null | false;
}

/**
 * Persönliche Pflichtangaben – die EINE Stelle zum Nachtragen (docs/content-guide.md).
 * Nur Werte eintragen, die Yannick selbst nennt; `null` lässt die OFFEN-Zeile stehen.
 * Die E-Mail-Adresse steht danach öffentlich im Impressum: mit der Regel „keine öffentliche
 * E-Mail“ abstimmen (Lücke legal-imprint).
 */
export const LEGAL_PERSON: LegalPerson = {
  name: 'Yannick Beck', // Quelle: LinkedIn-Export (Kopf)
  address: null,
  email: null,
  mstv: null,
};

export interface LegalHost {
  /** Kurzname für Überschrift und OFFEN-Zeilen, z. B. „Hetzner“. */
  short: string;
  /** Firma und Anschrift in einer Zeile (Land je Sprache). */
  line: L;
}

export interface LegalHosting {
  /**
   * Wer den Server betreibt. null = nicht bestätigt (OFFEN-Zeile, kein Name auf der Seite),
   * false = eigener Server ohne Hoster (keine Zeile zum Auftragsverarbeitungsvertrag), sonst der Hoster.
   */
  host: LegalHost | null | false;
  /** Server über einen Cloudflare-Tunnel angebunden: true/false nach Bestätigung, null = offen. */
  tunnel: boolean | null;
}

/**
 * Vorbereitet, Name und Anschrift aus dem Hetzner-Impressum (Quellen oben). Erst in
 * LEGAL_HOSTING.host eintragen, wenn Yannick Hetzner als Hoster bestätigt hat (FAK1).
 */
export const HETZNER: LegalHost = {
  short: 'Hetzner',
  line: {
    de: 'Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Deutschland',
    en: 'Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Germany',
  },
};

/**
 * Betrieb des Servers – die EINE Stelle zum Nachtragen (docs/content-guide.md, 2a). Nur
 * eintragen, was Yannick bestätigt hat, z. B. `{ host: HETZNER, tunnel: true }`; danach den
 * OFFEN-Punkt im Vault-Steckbrief mit Datum auflösen.
 */
export const LEGAL_HOSTING: LegalHosting = {
  host: null,
  tunnel: null,
};

/** Fehlende Angaben eines Eintrags als Liste (für HTML und Markdown). */
export function legalOpenLines(entry: LegalEntry): L[] {
  if (!entry.open) {
    return [];
  }
  return Array.isArray(entry.open) ? entry.open : [entry.open];
}

/** Ziel eines Links in der Sprache der Seite. */
export function legalHref(link: LegalLink, lang: Lang): string {
  return typeof link.href === 'string' ? link.href : link.href[lang];
}

const both = (lines: string[]): L<string[]> => ({ de: lines, en: lines });
const oneLine = (lines: string[]) => lines.join(', ');

/** Name und – falls eingetragen – Anschrift als ein Eintrag; fehlende Angaben als OFFEN-Zeilen. */
function personEntry(open: { address: L; email?: L }): LegalEntry {
  const p = LEGAL_PERSON;
  const missing: L[] = [];
  if (!p.address) {
    missing.push(open.address);
  }
  if (open.email && !p.email) {
    missing.push(open.email);
  }
  return {
    text: {
      de: [p.name, ...(p.address ? [oneLine(p.address)] : []), ...(open.email && p.email ? [`E-Mail: ${p.email}`] : [])],
      en: [p.name, ...(p.address ? [oneLine(p.address)] : []), ...(open.email && p.email ? [`Email: ${p.email}`] : [])],
    },
    ...(missing.length ? { open: missing } : {}),
  };
}

/**
 * Eintrag „Server“ aus LEGAL_HOSTING (FAK1): Hoster und Tunnel nur, wenn bestätigt; sonst
 * neutral beschrieben und als OFFEN-Zeile. Coolify und die IP-Weitergabe sind belegt (Quellen oben).
 */
function serverEntry(): LegalEntry {
  const { host, tunnel } = LEGAL_HOSTING;
  const runs: L = host
    ? { de: `Diese Website läuft auf einem Server der ${host.line.de}, verwaltet mit Coolify.`, en: `This website runs on a server provided by ${host.line.en}, managed with Coolify.` }
    : host === false
      ? { de: 'Diese Website läuft auf einem Server, den ich selbst betreibe, verwaltet mit Coolify.', en: 'This website runs on a server I operate myself, managed with Coolify.' }
      : { de: 'Diese Website läuft auf einem Server, verwaltet mit Coolify.', en: 'This website runs on a server managed with Coolify.' };
  const request: L = {
    de: 'Bei jedem Abruf erhält der Server technisch bedingt deine IP-Adresse, die Cloudflare weiterreicht, und den Zeitpunkt des Abrufs.',
    en: 'With every request the server receives, for technical reasons, your IP address, passed on by Cloudflare, and the time of the request.',
  };
  const open: L[] = [];
  if (host === null && tunnel === null) {
    open.push({
      de: 'Wer den Server betreibt (Hoster mit Anschrift oder eigener Server) und wie er an Cloudflare angebunden ist',
      en: 'Who operates the server (hosting provider with address, or own server) and how it is connected to Cloudflare',
    });
  } else if (host === null) {
    open.push({ de: 'Wer den Server betreibt (Hoster mit Anschrift oder eigener Server)', en: 'Who operates the server (hosting provider with address, or own server)' });
  } else if (tunnel === null) {
    open.push({ de: 'Wie der Server an Cloudflare angebunden ist', en: 'How the server is connected to Cloudflare' });
  }
  open.push(
    host
      ? { de: `Standort des Rechenzentrums (Land bzw. ${host.short}-Standort)`, en: `Data centre location (country or ${host.short} site)` }
      : { de: 'Standort des Servers (Land)', en: 'Server location (country)' },
  );
  if (host) {
    open.push({
      de: `Ob mit ${host.short} ein Auftragsverarbeitungsvertrag (Art. 28 DSGVO) abgeschlossen ist`,
      en: `Whether a data processing agreement (Art. 28 GDPR) has been concluded with ${host.short}`,
    });
  } else if (host === null) {
    open.push({
      de: 'Bei einem Hoster: ob mit ihm ein Auftragsverarbeitungsvertrag (Art. 28 DSGVO) abgeschlossen ist',
      en: 'If a hosting provider is used: whether a data processing agreement (Art. 28 GDPR) has been concluded with it',
    });
  }
  open.push({
    de: 'Ob und wie lange der Server Abrufe protokolliert (Speicherdauer der Server-Logs) und auf welcher Rechtsgrundlage',
    en: 'Whether and for how long the server logs requests (retention period of the server logs), and on which legal basis',
  });
  return {
    heading: host ? { de: `Server (${host.short})`, en: `Server (${host.short})` } : { de: 'Server', en: 'Server' },
    text: { de: [`${runs.de} ${request.de}`], en: [`${runs.en} ${request.en}`] },
    open,
  };
}

/** Halbsatz zur Weiterleitung an den Server – „über einen Cloudflare-Tunnel“ nur nach Bestätigung (FAK1). */
const TO_SERVER: L =
  LEGAL_HOSTING.tunnel === true
    ? { de: 'über einen Cloudflare-Tunnel an den Server weiter', en: 'to the server through a Cloudflare tunnel' }
    : { de: 'an den Server weiter', en: 'to the server' };

const LINKEDIN_LINK: LegalLink = { label: { de: 'LinkedIn-Profil', en: 'LinkedIn profile' }, href: LINKEDIN_URL, external: true };

/**
 * Datenschutz zum Kontaktformular – nur mit freigeschaltetem Formular (CONTACT_FORM_ENABLED).
 * id `kontaktformular` ist das Ziel des Links unter der Einwilligung im Formular.
 */
const CONTACT_FORM_BLOCK: LegalBlock = {
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
};

/** Ohne freigeschaltetes Formular (JURY1-1): kein Formular, kein Versanddienst – nur LinkedIn. */
const CONTACT_BLOCK: LegalBlock = {
  id: 'kontakt',
  heading: { de: 'Kontakt', en: 'Contact' },
  entries: [
    {
      text: {
        de: ['Diese Website hat derzeit kein Kontaktformular und nimmt keine Nachrichten entgegen. Du erreichst mich über LinkedIn; dort gelten die Datenschutzbestimmungen von LinkedIn.'],
        en: ['This website currently has no contact form and does not accept messages. You can reach me on LinkedIn; LinkedIn’s privacy policy applies there.'],
      },
    },
  ],
};

/** § 18 Abs. 2 MStV: OFFEN, eingetragen oder (nach rechtlicher Prüfung, `mstv: false`) entfallen. */
const MSTV_BLOCK: LegalBlock | null =
  LEGAL_PERSON.mstv === false
    ? null
    : {
        id: 'verantwortlich',
        heading: { de: 'Verantwortlich i. S. d. § 18 Abs. 2 MStV', en: 'Responsible under § 18 (2) MStV (German Interstate Media Treaty)' },
        entries: [
          LEGAL_PERSON.mstv
            ? { text: both([LEGAL_PERSON.mstv.name, oneLine(LEGAL_PERSON.mstv.address)]) }
            : {
                open: {
                  de: 'Name und Anschrift der verantwortlichen Person (nur nötig bei journalistisch-redaktionellen Inhalten wie dem Blog; rechtlich prüfen)',
                  en: 'Name and address of the responsible person (only needed for journalistic-editorial content such as the blog; check legally)',
                },
              },
        ],
      };

export const IMPRINT: LegalDoc = {
  notice: {
    de: 'Keine Rechtsberatung. Mit „OFFEN“ markierte Angaben fehlen noch. Ob und in welchem Umfang eine Impressumspflicht besteht, ist rechtlich zu prüfen.',
    en: 'Not legal advice. Items marked “OPEN” are still missing. Whether and to what extent an imprint is required still has to be checked legally.',
  },
  blocks: [
    {
      id: 'anbieter',
      heading: { de: 'Angaben gemäß § 5 DDG', en: 'Information pursuant to § 5 DDG (German Digital Services Act)' },
      entries: [
        personEntry({
          address: { de: 'Ladungsfähige Anschrift (Straße, Hausnummer, PLZ, Ort)', en: 'Postal address for service (street, number, postcode, town)' },
        }),
      ],
    },
    {
      id: 'kontakt',
      heading: { de: 'Kontakt', en: 'Contact' },
      entries: [
        CONTACT_FORM_ENABLED
          ? {
              text: {
                de: ['Du erreichst mich über das Kontaktformular oder auf LinkedIn.'],
                en: ['You can reach me via the contact form or on LinkedIn.'],
              },
              links: [
                { label: { de: 'Kontaktformular', en: 'Contact form' }, href: '/kontakt' },
                LINKEDIN_LINK,
              ],
            }
          : {
              // ohne freigeschaltetes Formular kein Verweis darauf (JURY1-1)
              text: { de: ['Du erreichst mich auf LinkedIn.'], en: ['You can reach me on LinkedIn.'] },
              links: [LINKEDIN_LINK],
            },
        LEGAL_PERSON.email
          ? { text: { de: [`E-Mail: ${LEGAL_PERSON.email}`], en: [`Email: ${LEGAL_PERSON.email}`] } }
          : {
              open: {
                // Begründung (Konflikt mit „keine öffentliche E-Mail“) nur in GAPS/content-status (TEX6)
                de: 'E-Mail-Adresse (§ 5 DDG)',
                en: 'Email address (§ 5 DDG)',
              },
            },
      ],
    },
    ...(MSTV_BLOCK ? [MSTV_BLOCK] : []),
  ],
};

/**
 * Betroffenenrechte, Wortlaut sinngemäß aus dem amtlichen DSGVO-Text (EUR-Lex, Quellen oben).
 * Art. 7 Abs. 3 nur, wenn die Website eine Einwilligung einholt – das tut nur das Kontaktformular.
 */
const RIGHTS: LegalListItem[] = [
  {
    term: { de: 'Auskunft (Art. 15 DSGVO)', en: 'Access (Art. 15 GDPR)' },
    text: {
      de: 'Du kannst eine Bestätigung verlangen, ob Daten über dich verarbeitet werden. Ist das der Fall, erhältst du Auskunft über diese Daten und unter anderem über Zwecke, Empfänger und geplante Speicherdauer, dazu eine Kopie der Daten.',
      en: 'You can ask for confirmation as to whether data about you is being processed. If so, you are entitled to access that data and to information on, among other things, the purposes, the recipients and the planned storage period, as well as to a copy of the data.',
    },
  },
  {
    term: { de: 'Berichtigung (Art. 16 DSGVO)', en: 'Rectification (Art. 16 GDPR)' },
    text: {
      de: 'Du kannst verlangen, dass unrichtige Daten über dich unverzüglich berichtigt und unvollständige vervollständigt werden.',
      en: 'You can ask for inaccurate data about you to be rectified without undue delay and for incomplete data to be completed.',
    },
  },
  {
    term: { de: 'Löschung (Art. 17 DSGVO)', en: 'Erasure (Art. 17 GDPR)' },
    text: {
      de: 'Du kannst verlangen, dass Daten über dich unverzüglich gelöscht werden, wenn einer der Gründe aus Art. 17 Abs. 1 vorliegt, zum Beispiel weil sie für ihren Zweck nicht mehr nötig sind oder unrechtmäßig verarbeitet wurden. Ausnahmen regelt Art. 17 Abs. 3.',
      en: 'You can ask for data about you to be erased without undue delay if one of the grounds in Art. 17(1) applies, for example because it is no longer necessary for its purpose or was processed unlawfully. Exceptions are set out in Art. 17(3).',
    },
  },
  {
    term: { de: 'Einschränkung der Verarbeitung (Art. 18 DSGVO)', en: 'Restriction of processing (Art. 18 GDPR)' },
    text: {
      de: 'In den Fällen des Art. 18 Abs. 1, etwa solange die Richtigkeit deiner Daten geprüft wird, kannst du verlangen, dass sie außer der Speicherung nur noch eingeschränkt verarbeitet werden.',
      en: 'In the cases listed in Art. 18(1), for example while the accuracy of your data is being verified, you can ask that, apart from storage, it is only processed to a limited extent.',
    },
  },
  {
    term: { de: 'Datenübertragbarkeit (Art. 20 DSGVO)', en: 'Data portability (Art. 20 GDPR)' },
    text: {
      de: 'Daten, die du selbst bereitgestellt hast, kannst du in einem strukturierten, gängigen und maschinenlesbaren Format erhalten und einer anderen Stelle übermitteln, soweit technisch machbar auch direkt. Das gilt, wenn die Verarbeitung auf deiner Einwilligung oder einem Vertrag beruht und automatisiert erfolgt.',
      en: 'You can receive data you have provided yourself in a structured, commonly used and machine-readable format and transmit it to another controller, directly where technically feasible. This applies if the processing is based on your consent or on a contract and is carried out by automated means.',
    },
  },
  {
    term: { de: 'Widerspruch (Art. 21 DSGVO)', en: 'Objection (Art. 21 GDPR)' },
    text: {
      de: 'Beruht eine Verarbeitung auf Art. 6 Abs. 1 Buchstabe e oder f DSGVO (öffentliches bzw. berechtigtes Interesse), kannst du ihr aus Gründen, die sich aus deiner besonderen Situation ergeben, jederzeit widersprechen.',
      en: 'If processing is based on point (e) or (f) of Art. 6(1) GDPR (public interest or legitimate interests), you can object to it at any time on grounds relating to your particular situation.',
    },
  },
  ...(CONTACT_FORM_ENABLED
    ? [
        {
          term: { de: 'Widerruf einer Einwilligung (Art. 7 Abs. 3 DSGVO)', en: 'Withdrawal of consent (Art. 7(3) GDPR)' },
          text: {
            de: 'Eine Einwilligung, etwa im Kontaktformular, kannst du jederzeit widerrufen. Die Rechtmäßigkeit der Verarbeitung bis zum Widerruf bleibt davon unberührt.',
            en: 'You can withdraw consent, for example given in the contact form, at any time. This does not affect the lawfulness of processing before the withdrawal.',
          },
        },
      ]
    : []),
  {
    term: { de: 'Beschwerde (Art. 77 DSGVO)', en: 'Complaint (Art. 77 GDPR)' },
    text: {
      de: 'Wenn du meinst, dass die Verarbeitung deiner Daten gegen die DSGVO verstößt, kannst du dich bei einer Aufsichtsbehörde beschweren, insbesondere in dem Mitgliedstaat deines Aufenthaltsorts, deines Arbeitsplatzes oder des mutmaßlichen Verstoßes.',
      en: 'If you consider that the processing of your data infringes the GDPR, you can lodge a complaint with a supervisory authority, in particular in the Member State of your habitual residence, your place of work or the place of the alleged infringement.',
    },
  },
];

const RIGHTS_BLOCK: LegalBlock = {
  id: 'rechte',
  heading: { de: 'Deine Rechte', en: 'Your rights' },
  entries: [
    {
      text: {
        de: ['Soweit diese Website personenbezogene Daten von dir verarbeitet, hast du nach der Datenschutz-Grundverordnung (DSGVO) die folgenden Rechte. Wende dich dafür an die verantwortliche Stelle (oben). Die genauen Voraussetzungen stehen in den genannten Artikeln.'],
        en: ['Where this website processes your personal data, the General Data Protection Regulation (GDPR) gives you the following rights. To exercise them, contact the controller (above). The exact conditions are set out in the articles named.'],
      },
      list: RIGHTS,
      links: [
        {
          label: { de: 'DSGVO im amtlichen Wortlaut (EUR-Lex)', en: 'Official text of the GDPR (EUR-Lex)' },
          href: {
            de: 'https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679',
            en: 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679',
          },
          external: true,
        },
      ],
    },
    {
      // Zuständigkeit laut Behörde: in Baden-Württemberg ansässige nicht-öffentliche Stellen (Quellen oben)
      heading: { de: 'Aufsichtsbehörde in Baden-Württemberg', en: 'Supervisory authority in Baden-Württemberg' },
      text: {
        de: [
          'Die Aufsicht über nicht-öffentliche Stellen in Baden-Württemberg führt:',
          'Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg',
          'Heilbronner Straße 35, 70191 Stuttgart',
        ],
        en: [
          'Supervision of non-public bodies in Baden-Württemberg lies with the state data protection commissioner:',
          'Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg',
          'Heilbronner Straße 35, 70191 Stuttgart, Germany',
        ],
      },
      links: [
        {
          label: { de: 'Beschwerde einreichen (Website der Behörde)', en: 'Lodge a complaint (authority’s website, in German)' },
          href: 'https://www.baden-wuerttemberg.datenschutz.de/beschwerde/',
          external: true,
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
        personEntry({
          address: { de: 'Anschrift der verantwortlichen Stelle', en: 'Postal address of the controller' },
          email: { de: 'E-Mail-Adresse für Datenschutzanfragen', en: 'Email address for data protection requests' },
        }),
      ],
    },
    {
      id: 'dienste',
      heading: { de: 'Eingesetzte Dienste (tatsächlicher Stand)', en: 'Services in use (actual state)' },
      entries: [
        // Hoster und Tunnel aus LEGAL_HOSTING, nur nach Bestätigung (FAK1)
        serverEntry(),
        {
          // Gemessen am 23.10.2026 (Quellen oben); Tunnel nur nach Bestätigung (LEGAL_HOSTING)
          heading: { de: 'Cloudflare (Auslieferung)', en: 'Cloudflare (delivery)' },
          text: {
            de: [
              `Alle Abrufe laufen über das Netz der Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA. Cloudflare nimmt die Verbindung deines Browsers an, hält Dateien wie Skripte und Stylesheets im Zwischenspeicher vor und leitet die übrigen Anfragen ${TO_SERVER.de}. Dabei verarbeitet Cloudflare Verbindungsdaten wie deine IP-Adresse.`,
              'Über einen Antwort-Header fordert Cloudflare deinen Browser auf, fehlgeschlagene Verbindungen an Cloudflare zu melden (Network Error Logging); erfolgreiche Abrufe werden nicht gemeldet. Nach Angaben von Cloudflare enthalten diese Berichte keine personenbezogenen Daten, und die IP-Adresse des meldenden Browsers wird nur während der Übermittlung im Arbeitsspeicher gehalten.',
              'Cookies hat Cloudflare beim Abruf dieser Website nicht gesetzt (geprüft am 23. Oktober 2026).',
              'Cloudflare, Inc. ist nach dem EU-US Data Privacy Framework zertifiziert (Teilnehmerliste des US-Handelsministeriums, Stand 23. Oktober 2026: aktiv, Rezertifizierung in Prüfung).',
            ],
            en: [
              `All requests pass through the network of Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA. Cloudflare accepts your browser’s connection, keeps files such as scripts and stylesheets in its cache and forwards the remaining requests ${TO_SERVER.en}. In doing so, Cloudflare processes connection data such as your IP address.`,
              'Via a response header, Cloudflare asks your browser to report failed connections to Cloudflare (Network Error Logging); successful requests are not reported. According to Cloudflare, these reports contain no personal data, and the reporting browser’s IP address is only kept in memory while the report is being transmitted.',
              'Cloudflare did not set any cookies when this website was accessed (checked on 23 October 2026).',
              'Cloudflare, Inc. is certified under the EU-U.S. Data Privacy Framework (participant list of the U.S. Department of Commerce, as of 23 October 2026: active, re-certification under review).',
            ],
          },
          links: [
            { label: { de: 'Eintrag im Data Privacy Framework', en: 'Data Privacy Framework entry' }, href: 'https://www.dataprivacyframework.gov/participant/5666', external: true },
            { label: { de: 'Datenschutzerklärung von Cloudflare', en: 'Cloudflare privacy policy' }, href: 'https://www.cloudflare.com/privacypolicy/', external: true },
          ],
          open: [
            {
              de: 'Rechtsgrundlage für die Auslieferung über Cloudflare und für die Übermittlung in die USA (rechtlich prüfen)',
              en: 'Legal basis for delivery via Cloudflare and for the transfer to the USA (check legally)',
            },
            {
              de: 'Ob der Auftragsverarbeitungsvertrag von Cloudflare (Data Processing Addendum) abgeschlossen ist',
              en: 'Whether Cloudflare’s data processing agreement (Data Processing Addendum) has been concluded',
            },
          ],
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
          // Belegt durch den Code: das HTML aller Seiten lädt keine Fremd-Skripte (TEX1)
          heading: { de: 'Externe Inhalte', en: 'External content' },
          text: {
            de: ['Diese Website bindet keine Skripte von fremden CDNs ein.'],
            en: ['This website does not load scripts from third-party CDNs.'],
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
    CONTACT_FORM_ENABLED ? CONTACT_FORM_BLOCK : CONTACT_BLOCK,
    RIGHTS_BLOCK,
  ],
};

/** Kennzeichnung offener Angaben in Rechtstexten (auch in Produktion sichtbar). */
export const LEGAL_OPEN: L = { de: 'OFFEN', en: 'OPEN' };
