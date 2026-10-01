import Image from 'next/image';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Banner } from '@astryxdesign/core/Banner';
import { Link } from '@astryxdesign/core/Link';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Avatar } from '@astryxdesign/core/Avatar';
import { getDictionary } from '@/i18n/dictionaries';
import { withLang, type Lang } from '@/i18n/dictionaries';
import { getPostCards, getProjectCards } from '@/lib/items';
import { servicesByLang } from '@/content/pages';
import { ItemCover } from '@/components/item-cover';
import { DemoBadge } from '@/components/demo-badge';

export async function HomeContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const [projects, posts] = await Promise.all([
    getProjectCards(lang),
    getPostCards(lang),
  ]);
  const topProjects = projects.slice(0, 3);
  const topPosts = posts.slice(0, 3);
  const services = servicesByLang(lang);

  return (
    <>
      <Section>
        <VStack gap={3}>
          <Banner
            status="warning"
            title={dict.demoBannerTitle}
            description={
              <>
                {dict.demoBannerText}{' '}
                <Link hasUnderline href={withLang('/content-status', lang)}>{dict.statusTitle}</Link>
              </>
            }
          />
        </VStack>
      </Section>
      <Section>
        <Grid columns={{ minWidth: 260 }} gap={4}>
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
          <VStack gap={2}>
            <Image
              src="/placeholders/portrait.svg"
              alt={dict.portraitAlt}
              width={800}
              height={1000}
              priority
              sizes="(max-width: 768px) 100vw, 440px"
              style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-container)' }}
            />
          </VStack>
        </Grid>
      </Section>

      {topProjects.length > 0 && (
        <Section variant="muted">
          <VStack gap={4}>
            <Heading level={2}>{dict.homeProjectsTitle}</Heading>
            <Grid columns={{ minWidth: 260 }} gap={3}>
              {topProjects.map((p) => (
                <ClickableCard
                  key={p.slug}
                  label={p.title}
                  href={p.href}
                  elevation="low"
                >
                  <VStack gap={2}>
                    <ItemCover src={p.image} alt={p.title} seed={p.slug} />
                    {p.demo && <DemoBadge lang={lang} />}
                    <Heading level={3}>{p.title}</Heading>
                    {p.excerpt && <Text color="secondary">{p.excerpt}</Text>}
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

      <Section>
        <VStack gap={4}>
          <Heading level={2}>{dict.homeServicesTitle}</Heading>
          <Text type="large">{dict.homeServicesLede}</Text>
          <Grid columns={{ minWidth: 260 }} gap={3}>
            {services.map((s) => (
              <Card key={s.slug}>
                <VStack gap={2}>
                  <Heading level={3}>{s.title}</Heading>
                  <Text color="secondary">{s.problem}</Text>
                </VStack>
              </Card>
            ))}
          </Grid>
        </VStack>
      </Section>

      <Section variant="muted">
        <Grid columns={{ minWidth: 260 }} gap={4}>
          <VStack gap={3}>
            <Heading level={2}>{dict.homeAboutTitle}</Heading>
            <Text>{dict.homeAboutLede}</Text>
            <HStack gap={2}>
              <Button
                label={dict.homeAboutCta}
                variant="secondary"
                href={withLang('/ueber-mich', lang)}
              />
            </HStack>
          </VStack>
          <VStack gap={2}>
            <Image
              src="/placeholders/portrait.svg"
              alt={dict.portraitAlt}
              width={800}
              height={1000}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 440px"
              style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-container)' }}
            />
          </VStack>
        </Grid>
      </Section>

      {topPosts.length > 0 && (
        <Section>
          <VStack gap={4}>
            <Heading level={2}>{dict.homePostsTitle}</Heading>
            <Grid columns={{ minWidth: 260 }} gap={3}>
              {topPosts.map((p) => (
                <ClickableCard
                  key={p.slug}
                  label={p.title}
                  href={p.href}
                  elevation="low"
                >
                  <VStack gap={2}>
                    <ItemCover src={p.image} alt={p.title} seed={p.slug} />
                    {p.demo && <DemoBadge lang={lang} />}
                    <Heading level={3}>{p.title}</Heading>
                    {p.excerpt && <Text color="secondary">{p.excerpt}</Text>}
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
