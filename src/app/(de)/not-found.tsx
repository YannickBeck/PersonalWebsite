import { NotFoundContent } from '@/components/pages/not-found-content';

/** 404 für notFound() in deutschen Routen (z. B. unbekannter Projekt-/Artikel-Slug). */
export default function NotFound() {
  return <NotFoundContent lang="de" />;
}
