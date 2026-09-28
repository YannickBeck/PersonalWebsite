import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { getDictionary } from '@/i18n/dictionaries';
import { withLang, type Lang } from '@/i18n/dictionaries';

export function HomeContent({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  return (
    <Section>
      <VStack gap={4}>
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
    </Section>
  );
}

export default function Home() {
  return <HomeContent lang="de" />;
}
