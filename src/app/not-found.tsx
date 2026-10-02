import { NotFoundContent } from '@/components/pages/not-found-content';
import { NotFoundLangSwitch } from '@/components/pages/not-found-lang-switch';

/**
 * Top-Level-404 für alle unbekannten URLs – EIN statisch vorgerendertes HTML (Deutsch, mit
 * einer englischen Zeile). Auf /en/<unbekannt> schalten Inhalt, Header und Footer nach der
 * Hydration gemeinsam auf Englisch (src/i18n/route-lang.ts, JURY1-1) – ohne Hydration-Fehler.
 * Der Sprachwechsel im Header führt hier auf die anderssprachige Startseite (switchTarget, T6).
 */
export default function NotFound() {
  return <NotFoundLangSwitch de={<NotFoundContent lang="de" />} en={<NotFoundContent lang="en" />} />;
}
