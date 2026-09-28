import { VStack } from '@astryxdesign/core/VStack';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import type { Lang } from '@/i18n/dictionaries';
import { withLang } from '@/i18n/dictionaries';
import { getProjects } from '@/lib/ghost';

export async function ProjectList({ lang }: { lang: Lang }) {
  const projects = await getProjects(lang);
  if (projects.length === 0) {
    return null;
  }
  return (
    <VStack gap={3}>
      {projects.map((p) => (
        <ClickableCard
          key={p.slug}
          label={p.title ?? p.slug}
          href={withLang(`/projekte/${p.slug}`, lang)}
          elevation="low"
        >
          <VStack gap={2}>
            <Heading level={2}>{p.title}</Heading>
            {(p.custom_excerpt || p.excerpt) && (
              <Text color="secondary">{p.custom_excerpt || p.excerpt}</Text>
            )}
          </VStack>
        </ClickableCard>
      ))}
    </VStack>
  );
}
