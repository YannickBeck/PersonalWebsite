import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Banner } from '@astryxdesign/core/Banner';
import { getDictionary } from '@/i18n/dictionaries';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';

const meta = getDictionary('de').pages.datenschutz;
export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/datenschutz',
  title: meta.title,
  description: meta.lede,
});

const SERVICES = [
  {
    name: 'Hosting & Auslieferung',
    text: 'Diese Website läuft auf einem eigenen Server (Hetzner, Deutschland), verwaltet mit Coolify. Der Abruf von Seiten übermittelt technisch bedingt IP-Adresse und Zeitpunkt (Server-Logs, 7 Tage).',
  },
  {
    name: 'Cloudflare (CDN, Schutz & Tunnel)',
    text: 'Der Datenverkehr läuft über Cloudflare (Edge- und Tunnel-Dienste) zum Schutz vor Missbrauch und zur Auslieferung. Dabei werden Verbindungsdaten auf Cloudflare-Systemen verarbeitet.',
  },
  {
    name: 'Ghost (CMS auf cms.yannick-beck.de)',
    text: 'Inhalte und Newsletter-Anmeldungen werden im selbst betriebenen Ghost-CMS verarbeitet. Die Newsletter-Anmeldung ist derzeit nur auf Einladung möglich.',
  },
  {
    name: 'CDN-Bibliotheken (jsDelivr)',
    text: 'Das Ghost-Portal-Skript wurde zeitweise über jsDelivr geladen (derzeit deaktiviert). Bei Reaktivierung: IP-Adresse an jsDelivr.',
  },
  {
    name: 'Analyse',
    text: 'Derzeit ist kein Analyse-Dienst aktiv (Platzhalter für Cloudflare Web Analytics vorgesehen). Es werden keine Tracking-Cookies gesetzt. [Stand prüfen und ergänzen]',
  },
  {
    name: 'Kontaktformular',
    text: 'Das Formular versendet derzeit nichts und speichert nichts — Eingaben bleiben im Browser. [Bei Anbindung: Auftragsverarbeitung und Speicherdauer ergänzen]',
  },
];

export default function Page() {
  const page = getDictionary('de').pages.datenschutz;
  const dict = getDictionary('de');
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section>
        <VStack gap={8} maxWidth={640}>
          <Banner
            status="note"
            title={dict.demoNoticeTitle}
            description="Redaktionelle Vorlage — keine Rechtsberatung. Verantwortliche Stelle, Rechtsgrundlagen und Fristen in eckigen Klammern ergänzen."
          />
          <VStack gap={2}>
            <Heading level={2}>Verantwortliche Stelle</Heading>
            <Text type="code" color="secondary">[Name, Anschrift und E-Mail-Adresse ergänzen]</Text>
          </VStack>
          <VStack gap={2}>
            <Heading level={2}>Eingesetzte Dienste (tatsächlicher Stand)</Heading>
            {SERVICES.map((s) => (
              <VStack key={s.name} gap={1}>
                <Heading level={3}>{s.name}</Heading>
                <Text>{s.text}</Text>
              </VStack>
            ))}
          </VStack>
          <VStack gap={2}>
            <Heading level={2}>Deine Rechte</Heading>
            <Text type="code" color="secondary">[Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch und Beschwerderecht bei der Aufsichtsbehörde beschreiben — Textbaustein ergänzen]</Text>
          </VStack>
        </VStack>
      </Section>
    </>
  );
}
