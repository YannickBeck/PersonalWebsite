import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { getDictionary } from '@/i18n/dictionaries';
import { AboutContent } from '@/components/pages/about-content';

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
  return <AboutContent lang="de" bio={BIO} workstyle={WORKSTYLE[0]} />;
}
