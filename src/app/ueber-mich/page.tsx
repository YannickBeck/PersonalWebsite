import Image from 'next/image';
import { PageHero } from '@/components/page-hero';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Banner } from '@astryxdesign/core/Banner';
import { DemoBadge } from '@/components/demo-badge';
import { getDictionary } from '@/i18n/dictionaries';
import { skillsByLang } from '@/content/pages';
import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';

const meta = getDictionary('de').pages['ueber-mich'];
export const metadata: Metadata = pageMeta({
  lang: 'de',
  path: '/ueber-mich',
  title: meta.title,
  description: meta.lede,
});

const BIO = [
  'Demo-Bio (fiktiv): Ich entwickle seit über zehn Jahren Websites und Web-Anwendungen — vom ersten statischen Auftritt bis zu mehrsprachigen Portalen mit eigenem Design-System.',
  'Demo-Bio (fiktiv): Mir ist wichtig, dass Technik im Hintergrund verschwindet: schnelle Seiten, verständliche Texte, Barrieren wo immer möglich abgebaut. Diese Website ist mein Schaufenster und mein Notizbuch zugleich.',
  'Demo-Bio (fiktiv): Wenn ich nicht programmiere, lese ich Fachbücher, pflege meine Werkzeugkiste oder schreibe — zum Beispiel hier im Blog.',
];

const WORKSTYLE = ['Demo-Arbeitsweise: kleine Schritte, sichtbare Zwischenstände, ehrliche Schätzungen.'];

export default function Page() {
  const page = getDictionary('de').pages['ueber-mich'];
  const dict = getDictionary('de');
  return (
    <>
      <PageHero title={page.title} lede={page.lede} />
      <Section>
        <Grid columns={{ minWidth: 260 }} gap={4}>
          <VStack gap={2}>
            <Image
              src="/placeholders/portrait.svg"
              alt={dict.portraitAlt}
              width={800}
              height={1000}
              sizes="(max-width: 768px) 100vw, 440px"
              style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-container)' }}
            />
          </VStack>
          <VStack gap={3}>
            <DemoBadge lang="de" />
            {BIO.map((p, i) => (
              <Text key={i}>{p}</Text>
            ))}
            <Banner status="info" title={dict.demoNoticeTitle} description={WORKSTYLE[0]} />
          </VStack>
        </Grid>
      </Section>
      <Section variant="muted">
        <VStack gap={3}>
          <Heading level={2}>Kompetenzen (Demo)</Heading>
          {skillsByLang('de').map((s) => (
            <Text key={s}>• {s}</Text>
          ))}
        </VStack>
      </Section>
    </>
  );
}
