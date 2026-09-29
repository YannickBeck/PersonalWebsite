import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { CoverArt } from '@/components/cover-art';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Avatar } from '@astryxdesign/core/Avatar';
import { getDictionary } from '@/i18n/dictionaries';
import { withLang, type Lang } from '@/i18n/dictionaries';
import { getPosts, getProjects } from '@/lib/ghost';

export async function HomeContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const [projects, posts] = await Promise.all([
    getProjects(lang),
    getPosts(lang),
  ]);
  const topProjects = projects.slice(0, 2);
  const topPosts = posts.slice(0, 2);

  return (
    <>
      <Section>
        <VStack gap={4}>
          <HStack gap={2}>
            <Avatar name="Yannick Beck" size="md" tooltip={false} />
            <StatusDot variant="accent" label={dict.homeEyebrow} isPulsing />
            <Text type="label">{dict.homeEyebrow}</Text>
          </HStack>
          <Heading level={1} type="display-2">
            {dict.homeTitle}
          </Heading>
          <Text type="large">{dict.homeLede}</Text>
          <Card variant="muted" elevation="low">
            <VStack gap={1}>
              {dict.homeTerminal.map((line) => (
                <Text key={line} type="code">
                  {line}
                </Text>
              ))}
            </VStack>
          </Card>
          <Text type="supporting">{dict.homeStack}</Text>
          <HStack gap={2}>
            <Button
              label={dict.viewProjects}
              variant="primary"
              href={withLang('/projekte', lang)}
            />
            <Button
              label={dict.contact}
              variant="secondary"
              href={withLang('/kontakt', lang)}
            />
          </HStack>
        </VStack>
      </Section>

      {topProjects.length > 0 && (
        <Section variant="muted">
          <VStack gap={4}>
            <HStack gap={2}>
              <Heading level={2}>{dict.homeProjectsTitle}</Heading>
            </HStack>
            <Grid columns={{ minWidth: 320 }} gap={3}>
              {topProjects.map((p) => (
                <ClickableCard
                  key={p.slug}
                  label={p.title ?? p.slug}
                  href={withLang(`/projekte/${p.slug}`, lang)}
                  elevation="low"
                >
                  <VStack gap={2}>
                    <CoverArt seed={p.slug} />
                    <Heading level={3}>{p.title}</Heading>
                    {(p.custom_excerpt || p.excerpt) && (
                      <Text color="secondary">
                        {p.custom_excerpt || p.excerpt}
                      </Text>
                    )}
                  </VStack>
                </ClickableCard>
              ))}
            </Grid>
            <HStack gap={2}>
              <Button
                label={dict.homeAllProjects}
                variant="secondary"
                href={withLang('/projekte', lang)}
              />
            </HStack>
          </VStack>
        </Section>
      )}

      {topPosts.length > 0 && (
        <Section>
          <VStack gap={4}>
            <Heading level={2}>{dict.homePostsTitle}</Heading>
            <Grid columns={{ minWidth: 320 }} gap={3}>
              {topPosts.map((p) => (
                <ClickableCard
                  key={p.slug}
                  label={p.title ?? p.slug}
                  href={withLang(`/blog/${p.slug}`, lang)}
                  elevation="low"
                >
                  <VStack gap={2}>
                    <CoverArt seed={p.slug} />
                    <Heading level={3}>{p.title}</Heading>
                    {(p.custom_excerpt || p.excerpt) && (
                      <Text color="secondary">
                        {p.custom_excerpt || p.excerpt}
                      </Text>
                    )}
                  </VStack>
                </ClickableCard>
              ))}
            </Grid>
            <HStack gap={2}>
              <Button
                label={dict.homeAllPosts}
                variant="secondary"
                href={withLang('/blog', lang)}
              />
            </HStack>
          </VStack>
        </Section>
      )}

      <Section variant="muted">
        <Card elevation="low">
          <VStack gap={3}>
            <Heading level={2}>{dict.homeContactTitle}</Heading>
            <Text>{dict.homeContactLede}</Text>
            <HStack gap={2}>
              <Button
                label={dict.contact}
                variant="primary"
                href={withLang('/kontakt', lang)}
              />
            </HStack>
          </VStack>
        </Card>
      </Section>
    </>
  );
}

export default function Home() {
  return <HomeContent lang="de" />;
}
