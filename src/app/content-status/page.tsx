import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import type { Metadata } from 'next';

interface Gap {
  where: string;
  need: string;
  format: string;
  state: string;
}

const GAPS_DE: Gap[] = [
  { where: 'Startseite, Über-mich-Seite', need: 'Eigenes Portraitfoto', format: 'JPG/PNG, min. 800 × 1000, dunkler Hintergrund', state: 'offen' },
  { where: 'Alle Projekt- und Artikel-Cards', need: 'Echte Coverbilder', format: '16:10, min. 1280 × 800', state: 'offen (Platzhalter aktiv)' },
  { where: 'Startseite, Über-mich-Seite', need: 'Bio, Positionierung, Claim (DE+EN)', format: 'Bio 3–4 Sätze, Claim 1 Zeile', state: 'offen (Demo-Texte aktiv)' },
  { where: 'CV-Seite', need: 'Echte Stationen, Skills, Talks', format: 'Pro Station: Zeitraum, Rolle, Organisation, 1 Satz', state: 'offen (Demo-Stationen aktiv)' },
  { where: 'Leistungen', need: 'Preise, Zielgruppen, Verfügbarkeiten', format: 'Pro Angebot klären und eintragen', state: 'offen (als „offen“ markiert)' },
  { where: 'Kontaktseite', need: 'Bestätigte E-Mail-Adresse', format: 'Adresse + Freigabe zur Veröffentlichung', state: 'offen (Hinweis aktiv)' },
  { where: 'Kontaktformular', need: 'Versand-Anbindung (z. B. Resend oder eigene API-Route)', format: 'API-Key + Zieladresse', state: 'offen (Demo-Modus aktiv)' },
  { where: 'Newsletter', need: 'Freischaltung in Ghost (derzeit nur Einladung)', format: 'Ghost-Einstellung members_signup_access', state: 'offen (Invite-Hinweis aktiv)' },
  { where: 'Impressum, Datenschutz', need: 'Name, Anschrift, Kontakt, Rechtsbausteine', format: 'Alle [eckigen Klammern] ersetzen', state: 'offen (Vorlage aktiv)' },
  { where: 'Ghost-CMS', need: 'Beispielinhalte durch echte ersetzen', format: 'Posts/Pages mit Tags project, #lang-de, #lang-en', state: 'offen' },
  { where: 'Analyse', need: 'Cloudflare-Web-Analytics-Token (optional)', format: 'NEXT_PUBLIC_CF_BEACON_TOKEN als Env', state: 'offen (inaktiv)' },
];

const GAPS_EN: Gap[] = [
  { where: 'Homepage, about page', need: 'Own portrait photo', format: 'JPG/PNG, min. 800 × 1000, dark background', state: 'open' },
  { where: 'All project and article cards', need: 'Real cover images', format: '16:10, min. 1280 × 800', state: 'open (placeholders active)' },
  { where: 'Homepage, about page', need: 'Bio, positioning, claim (DE+EN)', format: 'Bio 3–4 sentences, claim 1 line', state: 'open (demo texts active)' },
  { where: 'CV page', need: 'Real stations, skills, talks', format: 'Per station: period, role, org, 1 sentence', state: 'open (demo stations active)' },
  { where: 'Services', need: 'Pricing, audiences, availability', format: 'Clarify and enter per offer', state: 'open (marked “open”)' },
  { where: 'Contact page', need: 'Confirmed email address', format: 'Address + permission to publish', state: 'open (notice active)' },
  { where: 'Contact form', need: 'Delivery integration (e.g. Resend or own API route)', format: 'API key + target address', state: 'open (demo mode active)' },
  { where: 'Newsletter', need: 'Enablement in Ghost (currently invite-only)', format: 'Ghost setting members_signup_access', state: 'open (invite notice active)' },
  { where: 'Imprint, privacy', need: 'Name, address, contact, legal modules', format: 'Replace all [brackets]', state: 'open (template active)' },
  { where: 'Ghost CMS', need: 'Replace sample content with real content', format: 'Posts/pages with tags project, #lang-de, #lang-en', state: 'open' },
  { where: 'Analytics', need: 'Cloudflare Web Analytics token (optional)', format: 'NEXT_PUBLIC_CF_BEACON_TOKEN as env', state: 'open (inactive)' },
];

function StatusPage({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const gaps = lang === 'de' ? GAPS_DE : GAPS_EN;
  return (
    <>
      <PageHero title={dict.statusTitle} lede={dict.statusLede} />
      <Section>
        <VStack gap={3}>
          {gaps.map((g) => (
            <Card key={g.where + g.need}>
              <VStack gap={1}>
                <Heading level={3}>{g.need}</Heading>
                <Text color="secondary">
                  {dict.statusColWhere}: {g.where}
                </Text>
                <Text color="secondary">
                  {dict.statusColFormat}: {g.format}
                </Text>
                <Text weight="semibold">
                  {dict.statusColState}: {g.state}
                </Text>
              </VStack>
            </Card>
          ))}
        </VStack>
      </Section>
    </>
  );
}

export const metadata: Metadata = { robots: { index: false } };

export default function Page() {
  return <StatusPage lang="de" />;
}
